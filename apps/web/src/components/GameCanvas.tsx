import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Edges, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { RotateCcw } from "lucide-react";
import gsap from "gsap";
import type { Group, MeshBasicMaterial, MeshStandardMaterial, PointLight } from "three";
import { AdditiveBlending, DoubleSide } from "three";

import type { LevelDefinition, RobotState, TraceFrame } from "@lumaloop/engine";

import type { RobotColorId } from "../features/game/robotColors";
import {
  ROBOT_VICTORY_BEAM_FADE_PORTION,
  ROBOT_VICTORY_BEAM_EXIT_DURATION_SECONDS,
  ROBOT_VICTORY_BEAM_EXIT_START_SECONDS,
  ROBOT_VICTORY_EMOTE_DELAY_MS,
  Robot,
} from "./Robot";

const TILE_SIZE = 2.4;
const BLOCK_HEIGHT = 1.1;
const DRAG_AZIMUTH_RADIANS_PER_PIXEL = (Math.PI / 2) / 260;
const DRAG_ELEVATION_RADIANS_PER_PIXEL = (Math.PI / 4) / 260;
const CAMERA_BASE_AZIMUTH = Math.PI / 4;
const CAMERA_BASE_ELEVATION = 0.68;
const CAMERA_MIN_ELEVATION = 0.34;
const CAMERA_MAX_ELEVATION = 1.12;
const FAILURE_BLINK_STEP_DURATION = 0.16;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getBoardMetrics(level: LevelDefinition) {
  const xs = level.board.map((tile) => tile.x);
  const ys = level.board.map((tile) => tile.y);
  const zs = level.board.map((tile) => tile.z);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const maxZ = Math.max(...zs);

  return {
    minX,
    maxX,
    minY,
    maxY,
    centerX: ((minX + maxX) / 2) * TILE_SIZE,
    centerZ: ((minY + maxY) / 2) * TILE_SIZE,
    maxHeight: (maxZ + 1) * BLOCK_HEIGHT,
    planeSize: Math.max((maxX - minX + 6) * TILE_SIZE, (maxY - minY + 6) * TILE_SIZE, 20),
  };
}

function CameraRig({
  elevation,
  level,
  orbitAngle,
}: {
  elevation: number;
  level: LevelDefinition;
  orbitAngle: number;
}) {
  const { camera } = useThree();

  useLayoutEffect(() => {
    const { maxHeight, planeSize } = getBoardMetrics(level);
    const targetY = maxHeight * 0.35;
    const radius = Math.max(29, planeSize * 1.34);
    const planarRadius = Math.cos(elevation) * radius;

    camera.position.set(
      Math.cos(orbitAngle) * planarRadius,
      targetY + Math.sin(elevation) * radius,
      Math.sin(orbitAngle) * planarRadius,
    );
    camera.lookAt(0, targetY, 0);
    camera.updateProjectionMatrix();
  }, [camera, elevation, level, orbitAngle]);

  return null;
}

function TileBlock({
  failureBlink,
  failurePulseToken,
  isActive,
  isLit,
  tile,
}: {
  failureBlink: boolean;
  failurePulseToken: object | null;
  isActive: boolean;
  isLit: boolean;
  tile: LevelDefinition["board"][number];
}) {
  const topMaterialRef = useRef<MeshStandardMaterial>(null);
  const stackCount = tile.z + 1;
  const topColor = isLit ? "#87ff6c" : tile.kind === "TARGET" ? "#4ca8ff" : tile.kind === "BLOCKED" ? "#98adbf" : "#dfe4ea";
  const sideColor = tile.kind === "BLOCKED" ? "#8597a9" : "#bcc5ce";
  const emissive = isLit ? "#66ff55" : tile.kind === "TARGET" ? "#3f8fff" : "#5f7b95";
  const baseEmissiveIntensity = isLit ? 1.3 : tile.kind === "TARGET" ? 0.48 : 0.14;

  useEffect(() => {
    const topMaterial = topMaterialRef.current;
    if (!failureBlink || !topMaterial) {
      return;
    }

    const peakEmissiveIntensity = Math.max(baseEmissiveIntensity + 0.72, 0.92);
    const timeline = gsap.timeline();

    for (let blinkIndex = 0; blinkIndex < 3; blinkIndex += 1) {
      timeline.to(topMaterial, {
        duration: FAILURE_BLINK_STEP_DURATION,
        ease: "power1.inOut",
        emissiveIntensity: peakEmissiveIntensity,
      });
      timeline.to(topMaterial, {
        duration: FAILURE_BLINK_STEP_DURATION,
        ease: "power1.inOut",
        emissiveIntensity: baseEmissiveIntensity,
      });
    }

    return () => {
      timeline.kill();
      topMaterial.emissiveIntensity = baseEmissiveIntensity;
    };
  }, [baseEmissiveIntensity, failureBlink, failurePulseToken]);

  return (
    <group position={[tile.x * TILE_SIZE, 0, tile.y * TILE_SIZE]}>
      {Array.from({ length: stackCount }, (_, layer) => (
        <mesh castShadow key={layer} position={[0, BLOCK_HEIGHT * (layer + 0.5), 0]} receiveShadow>
          <boxGeometry args={[1.92, BLOCK_HEIGHT, 1.92]} />
          <meshStandardMaterial color={sideColor} />
          <meshStandardMaterial color={sideColor} />
          <meshStandardMaterial color={topColor} />
          <meshStandardMaterial color="#9ea8b3" />
          <meshStandardMaterial color={sideColor} />
          <meshStandardMaterial color={sideColor} />
          <Edges color="#69717b" scale={1} threshold={15} />
        </mesh>
      ))}
      <mesh castShadow receiveShadow position={[0, stackCount * BLOCK_HEIGHT + 0.06, 0]}>
        <boxGeometry args={[2, 0.14, 2]} />
        <meshStandardMaterial
          color={topColor}
          emissive={emissive}
          emissiveIntensity={baseEmissiveIntensity}
          ref={topMaterialRef}
        />
        <Edges color="#5f6771" scale={1} threshold={15} />
      </mesh>
      {isActive ? null : null}
    </group>
  );
}

function VictoryBeam({
  active,
  robot,
}: {
  active: boolean;
  robot: RobotState;
}) {
  const beamGroupRef = useRef<Group>(null);
  const beamMaterialRef = useRef<MeshBasicMaterial>(null);
  const flareMaterialRef = useRef<MeshBasicMaterial>(null);
  const lightRef = useRef<PointLight>(null);

  useLayoutEffect(() => {
    const beamGroup = beamGroupRef.current;
    if (!beamGroup) {
      return;
    }

    beamGroup.position.set(
      robot.x * TILE_SIZE,
      (robot.z + 1) * BLOCK_HEIGHT + 0.1,
      robot.y * TILE_SIZE,
    );
  }, [robot]);

  useEffect(() => {
    const beamGroup = beamGroupRef.current;
    const beamMaterial = beamMaterialRef.current;
    const flareMaterial = flareMaterialRef.current;
    const light = lightRef.current;
    const baseY = (robot.z + 1) * BLOCK_HEIGHT + 0.1;

    if (!beamGroup || !beamMaterial || !flareMaterial || !light) {
      return undefined;
    }

    if (!active) {
      beamGroup.visible = false;
      gsap.set(beamGroup.position, { y: baseY });
      gsap.set(beamGroup.scale, { x: 0.72, y: 0.08, z: 0.72 });
      gsap.set(beamMaterial, { opacity: 0 });
      gsap.set(flareMaterial, { opacity: 0 });
      gsap.set(light, { intensity: 0 });
      return undefined;
    }

    beamGroup.visible = true;
    gsap.set(beamGroup.position, { y: baseY });
    gsap.set(beamGroup.scale, { x: 0.72, y: 0.08, z: 0.72 });
    gsap.set(beamMaterial, { opacity: 0 });
    gsap.set(flareMaterial, { opacity: 0 });
    gsap.set(light, { intensity: 0 });

    const timeline = gsap.timeline({
      defaults: { ease: "power2.out" },
    });

    timeline.to(beamGroup.scale, { duration: 0.68, x: 1, y: 1, z: 1 }, 0);
    timeline.to(beamMaterial, { duration: 0.58, opacity: 0.3 }, 0);
    timeline.to(flareMaterial, { duration: 0.52, opacity: 0.36 }, 0.14);
    timeline.to(light, { duration: 0.64, intensity: 1.55 }, 0);
    timeline.to(beamMaterial, { duration: 0.62, opacity: 0.24 }, 0.62);
    timeline.to(flareMaterial, { duration: 0.56, opacity: 0.2 }, 0.56);

    timeline.to(
      beamMaterial,
      { duration: ROBOT_VICTORY_BEAM_EXIT_DURATION_SECONDS * ROBOT_VICTORY_BEAM_FADE_PORTION, opacity: 0 },
      ROBOT_VICTORY_BEAM_EXIT_START_SECONDS,
    );
    timeline.to(
      flareMaterial,
      { duration: 0.48, opacity: 0 },
      ROBOT_VICTORY_BEAM_EXIT_START_SECONDS,
    );
    timeline.to(
      light,
      { duration: ROBOT_VICTORY_BEAM_EXIT_DURATION_SECONDS, intensity: 0 },
      ROBOT_VICTORY_BEAM_EXIT_START_SECONDS,
    );
    timeline.to(
      beamGroup.scale,
      { duration: ROBOT_VICTORY_BEAM_EXIT_DURATION_SECONDS, x: 0, y: 0, z: 0 },
      ROBOT_VICTORY_BEAM_EXIT_START_SECONDS,
    );
    timeline.to(
      beamGroup.position,
      { duration: ROBOT_VICTORY_BEAM_EXIT_DURATION_SECONDS, y: baseY + 8.4 },
      ROBOT_VICTORY_BEAM_EXIT_START_SECONDS,
    );
    timeline.set(beamGroup, { visible: false }, ROBOT_VICTORY_BEAM_EXIT_START_SECONDS + ROBOT_VICTORY_BEAM_EXIT_DURATION_SECONDS);

    return () => {
      timeline.kill();
    };
  }, [active, robot.z]);

  return (
    <group ref={beamGroupRef} visible={false}>
      <pointLight color="#fff1a6" distance={10} intensity={0} position={[0, 8.8, 0]} ref={lightRef} />
      <mesh position={[0, 8.6, 0]}>
        <cylinderGeometry args={[0.2, 0.82, 17.2, 24, 1, true]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#fff2b3"
          depthWrite={false}
          opacity={0}
          ref={beamMaterialRef}
          side={DoubleSide}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh position={[0, 0.12, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.44, 1.02, 32]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#fff9d1"
          depthWrite={false}
          opacity={0}
          ref={flareMaterialRef}
          side={DoubleSide}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  );
}

function GridFloor({ level }: { level: LevelDefinition }) {
  const { minX, maxX, minY, maxY } = getBoardMetrics(level);
  const padding = 2;
  const tiles = [];

  for (let x = minX - padding; x <= maxX + padding; x += 1) {
    for (let y = minY - padding; y <= maxY + padding; y += 1) {
      tiles.push(
        <mesh castShadow key={`${x},${y}`} position={[x * TILE_SIZE, 0.05, y * TILE_SIZE]} receiveShadow>
          <boxGeometry args={[2, 0.1, 2]} />
          <meshStandardMaterial color="#d0d6de" />
          <meshStandardMaterial color="#d0d6de" />
          <meshStandardMaterial color="#edf1f5" />
          <meshStandardMaterial color="#b3bdc8" />
          <meshStandardMaterial color="#d0d6de" />
          <meshStandardMaterial color="#d0d6de" />
          <Edges color="#707985" scale={1} threshold={15} />
        </mesh>,
      );
    }
  }

  return <group>{tiles}</group>;
}

export function GameCanvas({
  activeFrame,
  committedRobot,
  failurePulse,
  failurePulseToken,
  isRotationLocked,
  litTargets,
  level,
  onFrameComplete,
  onVictorySequenceComplete,
  quarterTurns,
  robotColorId,
  showVictorySequence,
}: {
  activeFrame: TraceFrame | null;
  committedRobot: RobotState;
  failurePulse: boolean;
  failurePulseToken: object | null;
  isRotationLocked: boolean;
  litTargets: string[];
  level: LevelDefinition;
  onFrameComplete: () => void;
  onVictorySequenceComplete: () => void;
  quarterTurns: number;
  robotColorId: RobotColorId;
  showVictorySequence: boolean;
}) {
  const { centerX, centerZ } = getBoardMetrics(level);
  const [victoryBeamActive, setVictoryBeamActive] = useState(showVictorySequence);
  const [orbitAzimuth, setOrbitAzimuth] = useState(CAMERA_BASE_AZIMUTH - quarterTurns * (Math.PI / 2));
  const [orbitElevation, setOrbitElevation] = useState(CAMERA_BASE_ELEVATION);
  const dragStateRef = useRef<{
    pointerId: number;
    startAzimuth: number;
    startElevation: number;
    startX: number;
    startY: number;
  } | null>(null);
  const azimuthTweenRef = useRef<gsap.core.Tween | null>(null);
  const orbitAzimuthRef = useRef(orbitAzimuth);
  const orbitElevationRef = useRef(orbitElevation);
  const previousQuarterTurnsRef = useRef(quarterTurns);
  const activeTileKey =
    activeFrame === null ? null : `${activeFrame.robotAfter.x},${activeFrame.robotAfter.y},${activeFrame.robotAfter.z}`;
  const failureTileKey = failurePulse ? `${committedRobot.x},${committedRobot.y},${committedRobot.z}` : null;
  const showResetViewButton =
    Math.abs(orbitAzimuth - CAMERA_BASE_AZIMUTH) > 0.01 ||
    Math.abs(orbitElevation - CAMERA_BASE_ELEVATION) > 0.01;

  function setAzimuth(angle: number) {
    orbitAzimuthRef.current = angle;
    setOrbitAzimuth(angle);
  }

  function setElevation(angle: number) {
    const clamped = clamp(angle, CAMERA_MIN_ELEVATION, CAMERA_MAX_ELEVATION);
    orbitElevationRef.current = clamped;
    setOrbitElevation(clamped);
  }

  function animateAzimuth(targetAngle: number, duration: number) {
    azimuthTweenRef.current?.kill();
    const state = { value: orbitAzimuthRef.current };

    azimuthTweenRef.current = gsap.to(state, {
      duration,
      ease: "power2.out",
      onUpdate: () => {
        setAzimuth(state.value);
      },
      value: targetAngle,
    });
  }

  function resetView(duration = 0.28) {
    dragStateRef.current = null;
    setElevation(CAMERA_BASE_ELEVATION);
    animateAzimuth(CAMERA_BASE_AZIMUTH, duration);
  }

  useEffect(() => {
    if (!showVictorySequence) {
      setVictoryBeamActive(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setVictoryBeamActive(true);
    }, ROBOT_VICTORY_EMOTE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showVictorySequence]);

  useEffect(() => {
    const deltaTurns = quarterTurns - previousQuarterTurnsRef.current;
    previousQuarterTurnsRef.current = quarterTurns;
    if (deltaTurns === 0 || dragStateRef.current) {
      return;
    }

    animateAzimuth(orbitAzimuthRef.current - deltaTurns * (Math.PI / 2), 0.24);
  }, [quarterTurns]);

  useEffect(() => {
    previousQuarterTurnsRef.current = quarterTurns;
    resetView(0.24);
  }, [level.id]);

  useEffect(() => {
    if (!isRotationLocked) {
      return;
    }

    dragStateRef.current = null;
  }, [isRotationLocked]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || isRotationLocked) {
      return;
    }

    azimuthTweenRef.current?.kill();
    dragStateRef.current = {
      pointerId: event.pointerId,
      startAzimuth: orbitAzimuthRef.current,
      startElevation: orbitElevationRef.current,
      startX: event.clientX,
      startY: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const nextAzimuth = dragState.startAzimuth + (event.clientX - dragState.startX) * DRAG_AZIMUTH_RADIANS_PER_PIXEL;
    const nextElevation =
      dragState.startElevation - (event.clientY - dragState.startY) * DRAG_ELEVATION_RADIANS_PER_PIXEL;
    setAzimuth(nextAzimuth);
    setElevation(nextElevation);
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div
      className={`relative h-[420px] w-full overflow-hidden rounded-[22px] border border-[var(--panel-border)] md:h-[640px] ${isRotationLocked ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
      onPointerCancel={handlePointerEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      style={{ background: "var(--canvas-inner)", touchAction: "none" }}
    >
      {showResetViewButton ? (
        <button
          className="ui-button absolute right-4 top-4 z-10 px-3 py-2 text-xs uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isRotationLocked}
          onClick={(event) => {
            event.stopPropagation();
            resetView();
          }}
          onPointerDown={(event) => event.stopPropagation()}
          type="button"
        >
          <RotateCcw className="h-4 w-4" />
          View
        </button>
      ) : null}
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={["#d7dfe6"]} />
        <PerspectiveCamera makeDefault far={100} fov={28} near={0.1} position={[14, 12, 14]} />
        <CameraRig elevation={orbitElevation} level={level} orbitAngle={orbitAzimuth} />
        <ambientLight intensity={1.15} />
        <directionalLight
          castShadow
          intensity={1.05}
          position={[5, 9, 6]}
          shadow-mapSize-height={2048}
          shadow-mapSize-width={2048}
        />
        <directionalLight intensity={0.7} position={[-4, 6, -3]} />
        <hemisphereLight args={["#fff6d8", "#8d99aa", 0.82]} />
        <pointLight color="#7dff5c" intensity={litTargets.length > 0 ? 2.8 : 0.25} position={[2, 3, 2]} distance={7} />
        <group position={[-centerX, 0, -centerZ]}>
          <GridFloor level={level} />
          {level.board.map((tile) => {
            const tileKey = `${tile.x},${tile.y},${tile.z}`;
            return (
              <TileBlock
                failureBlink={tileKey === failureTileKey}
                failurePulseToken={failurePulseToken}
                isActive={tileKey === activeTileKey}
                isLit={tile.kind === "TARGET" && litTargets.includes(tile.id as string)}
                key={tile.kind === "TARGET" ? tile.id : tileKey}
                tile={tile}
              />
            );
          })}
          <VictoryBeam active={victoryBeamActive} robot={committedRobot} />
          <Robot
            activeFrame={activeFrame}
            colorId={robotColorId}
            failurePulse={failurePulse}
            failurePulseToken={failurePulseToken}
            litTargets={litTargets}
            onFrameComplete={onFrameComplete}
            onVictorySequenceComplete={onVictorySequenceComplete}
            robot={committedRobot}
            victorySequenceActive={showVictorySequence}
          />
        </group>
        <EffectComposer>
          <Bloom intensity={0.18} luminanceThreshold={0.9} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
