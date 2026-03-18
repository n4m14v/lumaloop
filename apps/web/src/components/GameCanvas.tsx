import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Edges, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import gsap from "gsap";
import type { Group, MeshBasicMaterial, MeshStandardMaterial, PointLight } from "three";
import { AdditiveBlending, DoubleSide } from "three";
import { Color } from "three";

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
const CAMERA_ZOOM_MIN = 0.88;
const CAMERA_ZOOM_MAX = 1.14;
const CAMERA_ZOOM_STEP = 0.0009;
const FAILURE_BLINK_RISE_DURATION = 0.24;
const FAILURE_BLINK_HOLD_DURATION = 0.18;
const FAILURE_BLINK_FALL_DURATION = 0.26;
const FAILURE_BLINK_COUNT = 2;
const LOW_TILE_FLOAT_AMPLITUDE = 0.18;
const LOW_TILE_FLOAT_SPEED = 1.05;
const LOW_TILE_FLOAT_BASE_LIFT = 0.08;

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
  zoom,
}: {
  elevation: number;
  level: LevelDefinition;
  orbitAngle: number;
  zoom: number;
}) {
  const { camera } = useThree();

  useLayoutEffect(() => {
    const { maxHeight, planeSize } = getBoardMetrics(level);
    const targetY = maxHeight * 0.35;
    const radius = Math.max(35, planeSize * 1.52) * zoom;
    const planarRadius = Math.cos(elevation) * radius;

    camera.position.set(
      Math.cos(orbitAngle) * planarRadius,
      targetY + Math.sin(elevation) * radius,
      Math.sin(orbitAngle) * planarRadius,
    );
    camera.lookAt(0, targetY, 0);
    camera.updateProjectionMatrix();
  }, [camera, elevation, level, orbitAngle, zoom]);

  return null;
}

function TileBlock({
  failureBlink,
  failurePulseToken,
  isActive,
  isLit,
  tile,
  victoryGlow,
}: {
  failureBlink: boolean;
  failurePulseToken: object | null;
  isActive: boolean;
  isLit: boolean;
  tile: LevelDefinition["board"][number];
  victoryGlow: boolean;
}) {
  const topMaterialRef = useRef<MeshStandardMaterial>(null);
  const targetCoreMaterialRef = useRef<MeshStandardMaterial>(null);
  const targetHaloMaterialRef = useRef<MeshBasicMaterial>(null);
  const targetSuccessGlowRef = useRef<MeshBasicMaterial>(null);
  const targetLightRef = useRef<PointLight>(null);
  const targetOrbGroupRef = useRef<Group>(null);
  const stackCount = tile.z + 1;
  const isTarget = tile.kind === "TARGET";
  const isGlassChamber = tile.kind !== "BLOCKED";
  const chamberCenterY = stackCount * BLOCK_HEIGHT * 0.5;
  const topColor =
    isLit ? "#87ff6c" : isTarget ? "#89d8ff" : tile.kind === "BLOCKED" ? "#98adbf" : "#dfe4ea";
  const sideColor = tile.kind === "BLOCKED" ? "#8597a9" : "#bcc5ce";
  const emissive = isLit ? "#66ff55" : isTarget ? "#7fc8ff" : "#5f7b95";
  const baseEmissiveIntensity = isLit ? 1.3 : isTarget ? 0.38 : 0.14;

  useEffect(() => {
    const topMaterial = topMaterialRef.current;
    if (!failureBlink || !topMaterial) {
      return;
    }

    const peakEmissiveIntensity = Math.max(baseEmissiveIntensity + 1.18, 1.28);
    const timeline = gsap.timeline();
    const baseColor = topMaterial.color.clone();
    const baseEmissive = topMaterial.emissive.clone();
    const failureColor = new Color("#d58c8c");
    const failureEmissive = new Color("#c85f5f");

    for (let blinkIndex = 0; blinkIndex < FAILURE_BLINK_COUNT; blinkIndex += 1) {
      timeline.to(topMaterial, {
        duration: FAILURE_BLINK_RISE_DURATION,
        ease: "power2.out",
        emissiveIntensity: peakEmissiveIntensity,
      });
      timeline.to(
        topMaterial.color,
        {
          duration: FAILURE_BLINK_RISE_DURATION,
          ease: "power2.out",
          r: failureColor.r,
          g: failureColor.g,
          b: failureColor.b,
        },
        "<",
      );
      timeline.to(
        topMaterial.emissive,
        {
          duration: FAILURE_BLINK_RISE_DURATION,
          ease: "power2.out",
          r: failureEmissive.r,
          g: failureEmissive.g,
          b: failureEmissive.b,
        },
        "<",
      );
      timeline.to(topMaterial, {
        duration: FAILURE_BLINK_HOLD_DURATION,
        ease: "none",
        emissiveIntensity: peakEmissiveIntensity,
      });
      timeline.to(
        topMaterial.color,
        {
          duration: FAILURE_BLINK_HOLD_DURATION,
          ease: "none",
          r: failureColor.r,
          g: failureColor.g,
          b: failureColor.b,
        },
        "<",
      );
      timeline.to(
        topMaterial.emissive,
        {
          duration: FAILURE_BLINK_HOLD_DURATION,
          ease: "none",
          r: failureEmissive.r,
          g: failureEmissive.g,
          b: failureEmissive.b,
        },
        "<",
      );
      timeline.to(topMaterial, {
        duration: FAILURE_BLINK_FALL_DURATION,
        ease: "power2.inOut",
        emissiveIntensity: baseEmissiveIntensity,
      });
      timeline.to(
        topMaterial.color,
        {
          duration: FAILURE_BLINK_FALL_DURATION,
          ease: "power2.inOut",
          r: baseColor.r,
          g: baseColor.g,
          b: baseColor.b,
        },
        "<",
      );
      timeline.to(
        topMaterial.emissive,
        {
          duration: FAILURE_BLINK_FALL_DURATION,
          ease: "power2.inOut",
          r: baseEmissive.r,
          g: baseEmissive.g,
          b: baseEmissive.b,
        },
        "<",
      );
    }

    return () => {
      timeline.kill();
      topMaterial.color.copy(baseColor);
      topMaterial.emissive.copy(baseEmissive);
      topMaterial.emissiveIntensity = baseEmissiveIntensity;
    };
  }, [baseEmissiveIntensity, failureBlink, failurePulseToken]);

  useEffect(() => {
    if (!isTarget || !targetCoreMaterialRef.current || !targetLightRef.current) {
      return;
    }

    const coreMaterial = targetCoreMaterialRef.current;
    const coreLight = targetLightRef.current;
    const haloMaterial = targetHaloMaterialRef.current;
    const successGlowMaterial = targetSuccessGlowRef.current;
    const baseOpacity = 1;
    const baseScale = isLit ? 1.2 : 1;
    const baseIntensity = isLit ? 0.22 : 0.08;
    const baseColor = new Color(isLit ? "#86f6ff" : "#5adfff");
    const timeline = gsap.timeline();

    gsap.set(coreMaterial.color, { r: baseColor.r, g: baseColor.g, b: baseColor.b });
    gsap.set(coreMaterial, { opacity: baseOpacity });
    if (haloMaterial) {
      gsap.set(haloMaterial.color, { r: baseColor.r, g: baseColor.g, b: baseColor.b });
      gsap.set(haloMaterial, { opacity: isLit ? 0.26 : 0.18 });
    }
    if (successGlowMaterial) {
      gsap.set(successGlowMaterial, { opacity: 0 });
      gsap.set(successGlowMaterial.color, { r: 1, g: 0.97, b: 0.78 });
    }
    gsap.set(coreLight.color, { r: baseColor.r, g: baseColor.g, b: baseColor.b });
    gsap.set(coreLight, { intensity: baseIntensity });
    if (targetOrbGroupRef.current) {
      gsap.set(targetOrbGroupRef.current.scale, { x: baseScale, y: baseScale, z: baseScale });
    }

    if (victoryGlow) {
      const victoryColor = new Color("#ffe57a");
      timeline.to(coreMaterial, { duration: 0.28, ease: "power2.out", opacity: 0 }, 0);
      timeline.to(coreMaterial.color, {
        duration: 0.28,
        ease: "power2.out",
        r: victoryColor.r,
        g: victoryColor.g,
        b: victoryColor.b,
      }, 0);
      if (haloMaterial) {
        timeline.to(haloMaterial.color, {
          duration: 0.28,
          ease: "power2.out",
          r: victoryColor.r,
          g: victoryColor.g,
          b: victoryColor.b,
        }, 0);
        timeline.to(haloMaterial, { duration: 0.28, ease: "power2.out", opacity: 0.1 }, 0);
      }
      if (successGlowMaterial) {
        timeline.to(successGlowMaterial, { duration: 0.32, ease: "power2.out", opacity: 0.95 }, 0.04);
      }
      timeline.to(coreLight.color, {
        duration: 0.42,
        ease: "power2.out",
        r: victoryColor.r,
        g: victoryColor.g,
        b: victoryColor.b,
      }, 0);
      timeline.to(coreLight, { duration: 0.4, ease: "power2.out", intensity: 4.6 }, 0);
      if (targetOrbGroupRef.current) {
        timeline.to(targetOrbGroupRef.current.scale, { duration: 0.22, ease: "power2.out", x: 1, y: 1, z: 1 }, 0);
      }
    } else {
      timeline.to(coreMaterial, { duration: 0.24, ease: "power2.out", opacity: baseOpacity }, 0);
      if (haloMaterial) {
        timeline.to(haloMaterial, { duration: 0.24, ease: "power2.out", opacity: isLit ? 0.26 : 0.18 }, 0);
      }
      if (successGlowMaterial) {
        timeline.to(successGlowMaterial, { duration: 0.18, ease: "power2.out", opacity: 0 }, 0);
      }
      timeline.to(coreLight, { duration: 0.24, ease: "power2.out", intensity: baseIntensity }, 0);
      if (targetOrbGroupRef.current) {
        timeline.to(targetOrbGroupRef.current.scale, { duration: 0.24, ease: "power2.out", x: baseScale, y: baseScale, z: baseScale }, 0);
      }
    }

    return () => {
      timeline.kill();
    };
  }, [isLit, isTarget, victoryGlow]);

  useFrame(({ clock }) => {
    if (
      !isTarget ||
      victoryGlow ||
      !targetOrbGroupRef.current ||
      !targetCoreMaterialRef.current ||
      !targetHaloMaterialRef.current ||
      !targetLightRef.current
    ) {
      return;
    }

    const t = clock.getElapsedTime();
    const pulse = (Math.sin(t * 2.1 + tile.x * 0.35 + tile.y * 0.28) + 1) * 0.5;
    const baseScale = isLit ? 1.2 : 1;
    const baseHaloOpacity = isLit ? 0.26 : 0.18;
    const baseLightIntensity = isLit ? 0.22 : 0.08;

    targetOrbGroupRef.current.scale.setScalar(baseScale + pulse * 0.22);
    targetCoreMaterialRef.current.emissiveIntensity = (isLit ? 3.8 : 3.1) + pulse * 2.2;
    targetHaloMaterialRef.current.opacity = baseHaloOpacity + pulse * 0.24;
    targetLightRef.current.intensity = baseLightIntensity + pulse * (isLit ? 0.24 : 0.14);
  });

  return (
    <group position={[tile.x * TILE_SIZE, 0, tile.y * TILE_SIZE]}>
      {Array.from({ length: stackCount }, (_, layer) => (
        <mesh key={layer} position={[0, BLOCK_HEIGHT * (layer + 0.5), 0]}>
          <boxGeometry args={[1.92, BLOCK_HEIGHT, 1.92]} />
          {isGlassChamber ? (
            isTarget ? (
              <>
                <meshPhysicalMaterial
                  color="#9ee8ff"
                  envMapIntensity={0}
                  ior={1.02}
                  metalness={0}
                  opacity={0.42}
                  roughness={0.92}
                  thickness={1.4}
                  transmission={0.66}
                  transparent
                />
                <meshPhysicalMaterial
                  color="#9ee8ff"
                  envMapIntensity={0}
                  ior={1.02}
                  metalness={0}
                  opacity={0.42}
                  roughness={0.92}
                  thickness={1.4}
                  transmission={0.66}
                  transparent
                />
                <meshPhysicalMaterial
                  color="#c7f4ff"
                  envMapIntensity={0}
                  ior={1.02}
                  metalness={0}
                  opacity={0.34}
                  roughness={0.94}
                  thickness={1.1}
                  transmission={0.72}
                  transparent
                />
                <meshStandardMaterial color="#90a1b2" />
                <meshPhysicalMaterial
                  color="#9ee8ff"
                  envMapIntensity={0}
                  ior={1.02}
                  metalness={0}
                  opacity={0.42}
                  roughness={0.92}
                  thickness={1.4}
                  transmission={0.66}
                  transparent
                />
                <meshPhysicalMaterial
                  color="#9ee8ff"
                  envMapIntensity={0}
                  ior={1.02}
                  metalness={0}
                  opacity={0.42}
                  roughness={0.92}
                  thickness={1.4}
                  transmission={0.66}
                  transparent
                />
              </>
            ) : (
              <>
                <meshStandardMaterial color="#bcc5cf" roughness={0.98} />
                <meshStandardMaterial color="#bcc5cf" roughness={0.98} />
                <meshStandardMaterial color="#d8dde4" roughness={1} />
                <meshStandardMaterial color="#8f9dab" roughness={1} />
                <meshStandardMaterial color="#bcc5cf" roughness={0.98} />
                <meshStandardMaterial color="#bcc5cf" roughness={0.98} />
              </>
            )
          ) : (
            <>
              <meshStandardMaterial color={sideColor} />
              <meshStandardMaterial color={sideColor} />
              <meshStandardMaterial color={topColor} />
              <meshStandardMaterial color="#9ea8b3" />
              <meshStandardMaterial color={sideColor} />
              <meshStandardMaterial color={sideColor} />
            </>
          )}
          <Edges color="#69717b" scale={1} threshold={15} />
        </mesh>
      ))}
      <mesh position={[0, stackCount * BLOCK_HEIGHT + 0.06, 0]}>
        <boxGeometry args={[2, 0.14, 2]} />
        {isGlassChamber ? (
          isTarget ? (
            <meshPhysicalMaterial
              color="#cbf3ff"
              emissive={emissive}
              emissiveIntensity={Math.max(baseEmissiveIntensity + 0.02, 0.28)}
              envMapIntensity={0}
              ior={1.02}
              metalness={0}
              opacity={0.58}
              ref={topMaterialRef}
              roughness={0.94}
              thickness={0.9}
              transmission={0.68}
              transparent
            />
          ) : (
            <meshStandardMaterial
              color="#d7dde4"
              ref={topMaterialRef}
              roughness={1}
            />
          )
        ) : (
          <meshStandardMaterial
            color={topColor}
            emissive={emissive}
            emissiveIntensity={baseEmissiveIntensity}
            ref={topMaterialRef}
          />
        )}
        <Edges color="#5f6771" scale={1} threshold={15} />
      </mesh>
      {isTarget ? (
        <group position={[0, chamberCenterY, 0]} ref={targetOrbGroupRef}>
          <pointLight color={isLit ? "#86f6ff" : "#5adfff"} distance={0.85} intensity={0.08} ref={targetLightRef} />
          <mesh renderOrder={2}>
            <boxGeometry args={[0.24, 0.24, 0.24]} />
            <meshStandardMaterial
              color={isLit ? "#86f6ff" : "#5adfff"}
              emissive={isLit ? "#86f6ff" : "#5adfff"}
              emissiveIntensity={3.8}
              depthTest
              opacity={1}
              roughness={0.14}
              ref={targetCoreMaterialRef}
            />
          </mesh>
          <mesh renderOrder={1}>
            <sphereGeometry args={[0.2, 20, 20]} />
            <meshBasicMaterial
              blending={AdditiveBlending}
              color={isLit ? "#d4fdff" : "#aef5ff"}
              depthTest
              depthWrite={false}
              opacity={0.18}
              ref={targetHaloMaterialRef}
              toneMapped={false}
              transparent
            />
          </mesh>
          <mesh renderOrder={3}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          <mesh renderOrder={4}>
            <sphereGeometry args={[0.34, 24, 24]} />
            <meshBasicMaterial
              blending={AdditiveBlending}
              color="#ffe57a"
              depthTest
              depthWrite={false}
              opacity={0}
              ref={targetSuccessGlowRef}
              toneMapped={false}
              transparent
            />
          </mesh>
        </group>
      ) : null}
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

function FloatingFloorTile({
  animated,
  x,
  y,
}: {
  animated: boolean;
  x: number;
  y: number;
}) {
  const groupRef = useRef<Group>(null);
  const phase = x * 0.45 + y * 0.6;

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    group.position.y = animated
      ? 0.05 +
        LOW_TILE_FLOAT_BASE_LIFT +
        Math.sin(clock.getElapsedTime() * LOW_TILE_FLOAT_SPEED + phase) * LOW_TILE_FLOAT_AMPLITUDE
      : 0.05;
  });

  return (
    <group position={[x * TILE_SIZE, 0.05, y * TILE_SIZE]} ref={groupRef}>
      <mesh>
        <boxGeometry args={[2, 0.1, 2]} />
        <meshStandardMaterial color="#d0d6de" />
        <meshStandardMaterial color="#d0d6de" />
        <meshStandardMaterial color="#edf1f5" />
        <meshStandardMaterial color="#b3bdc8" />
        <meshStandardMaterial color="#d0d6de" />
        <meshStandardMaterial color="#d0d6de" />
        <Edges color="#707985" scale={1} threshold={15} />
      </mesh>
    </group>
  );
}

function GridFloor({ level }: { level: LevelDefinition }) {
  const { minX, maxX, minY, maxY } = getBoardMetrics(level);
  const padding = 2;
  const tiles = [];
  const occupiedTiles = new Set(level.board.map((tile) => `${tile.x},${tile.y}`));

  for (let x = minX - padding; x <= maxX + padding; x += 1) {
    for (let y = minY - padding; y <= maxY + padding; y += 1) {
      tiles.push(
        <FloatingFloorTile animated={!occupiedTiles.has(`${x},${y}`)} key={`${x},${y}`} x={x} y={y} />,
      );
    }
  }

  return <group>{tiles}</group>;
}

interface GameCanvasProps {
  activeFrame: TraceFrame | null;
  className?: string;
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
  theme: "dark" | "light";
}

export function GameCanvas({
  activeFrame,
  className,
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
  theme,
}: GameCanvasProps) {
  const { centerX, centerZ } = getBoardMetrics(level);
  const [victoryBeamActive, setVictoryBeamActive] = useState(showVictorySequence);
  const [orbitAzimuth, setOrbitAzimuth] = useState(CAMERA_BASE_AZIMUTH - quarterTurns * (Math.PI / 2));
  const [orbitElevation, setOrbitElevation] = useState(CAMERA_BASE_ELEVATION);
  const [zoom, setZoom] = useState(1);
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
    setZoom(1);
    animateAzimuth(CAMERA_BASE_AZIMUTH, duration);
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    setZoom((currentZoom) => clamp(currentZoom + event.deltaY * CAMERA_ZOOM_STEP, CAMERA_ZOOM_MIN, CAMERA_ZOOM_MAX));
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
    const root = document.documentElement;
    const parallaxX = Math.sin(orbitAzimuth) * 28;
    const parallaxY = (orbitElevation - CAMERA_BASE_ELEVATION) * -42;

    root.style.setProperty("--space-parallax-x", `${parallaxX.toFixed(2)}px`);
    root.style.setProperty("--space-parallax-y", `${parallaxY.toFixed(2)}px`);

    return () => {
      root.style.setProperty("--space-parallax-x", "0px");
      root.style.setProperty("--space-parallax-y", "0px");
    };
  }, [orbitAzimuth, orbitElevation]);

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
      dragState.startElevation + (event.clientY - dragState.startY) * DRAG_ELEVATION_RADIANS_PER_PIXEL;
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
      className={`${className ?? "relative h-[420px] w-full overflow-hidden md:h-[640px]"} ${isRotationLocked ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
      onPointerCancel={handlePointerEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onWheel={handleWheel}
      style={{ touchAction: "none" }}
    >
      <Canvas gl={{ alpha: true }} dpr={[1, 1.5]}>
        <PerspectiveCamera makeDefault far={100} fov={28} near={0.1} position={[14, 12, 14]} />
        <CameraRig elevation={orbitElevation} level={level} orbitAngle={orbitAzimuth} zoom={zoom} />
        <ambientLight intensity={1.15} />
        <directionalLight intensity={1.05} position={[5, 9, 6]} />
        <directionalLight intensity={0.7} position={[-4, 6, -3]} />
        <hemisphereLight args={["#fff6d8", "#8d99aa", 0.82]} />
        <pointLight color="#7dff5c" intensity={litTargets.length > 0 ? 1.9 : 0.14} position={[2, 3, 2]} distance={6} />
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
                victoryGlow={showVictorySequence && tileKey === `${committedRobot.x},${committedRobot.y},${committedRobot.z}`}
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
            theme={theme}
            victorySequenceActive={showVictorySequence}
          />
        </group>
        <EffectComposer>
          <Bloom intensity={0.08} luminanceThreshold={0.96} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
