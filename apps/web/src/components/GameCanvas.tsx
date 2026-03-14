import { useEffect, useEffectEvent, useLayoutEffect, useRef } from "react";

import { Edges, OrthographicCamera } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import gsap from "gsap";
import type { Group, Mesh, MeshBasicMaterial, PointLight } from "three";
import { AdditiveBlending, Color, DoubleSide } from "three";

import type { LevelDefinition, RobotState, TraceFrame } from "@lumaloop/engine";

const TILE_SIZE = 2.4;
const BLOCK_HEIGHT = 1.1;
const ROBOT_OFFSET = 0.66;

function toWorldPosition(robot: RobotState) {
  return [
    robot.x * TILE_SIZE,
    (robot.z + 1) * BLOCK_HEIGHT + ROBOT_OFFSET,
    robot.y * TILE_SIZE,
  ] as const;
}

function toFacingRotation(facing: RobotState["facing"]) {
  switch (facing) {
    case "N":
      return Math.PI;
    case "E":
      return Math.PI / 2;
    case "S":
      return 0;
    case "W":
      return -Math.PI / 2;
  }
}

function getShortestRotationTarget(current: number, target: number) {
  let delta = target - current;

  while (delta > Math.PI) {
    delta -= Math.PI * 2;
  }

  while (delta < -Math.PI) {
    delta += Math.PI * 2;
  }

  return current + delta;
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

function CameraRig({ level }: { level: LevelDefinition }) {
  const { camera } = useThree();

  useLayoutEffect(() => {
    const { maxHeight } = getBoardMetrics(level);
    camera.position.set(14, 12 + maxHeight * 0.2, 14);
    camera.lookAt(0, maxHeight * 0.35, 0);
    camera.updateProjectionMatrix();
  }, [camera, level]);

  return null;
}

function TileBlock({
  isActive,
  isLit,
  tile,
}: {
  isActive: boolean;
  isLit: boolean;
  tile: LevelDefinition["board"][number];
}) {
  const stackCount = tile.z + 1;
  const topColor = isLit ? "#87ff6c" : tile.kind === "TARGET" ? "#4ca8ff" : tile.kind === "BLOCKED" ? "#98adbf" : "#dfe4ea";
  const sideColor = tile.kind === "BLOCKED" ? "#8597a9" : "#bcc5ce";
  const emissive = isLit ? "#66ff55" : tile.kind === "TARGET" ? "#3f8fff" : "#5f7b95";

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
          emissiveIntensity={isLit ? 1.3 : tile.kind === "TARGET" ? 0.48 : 0.14}
        />
        <Edges color="#5f6771" scale={1} threshold={15} />
      </mesh>
      {tile.kind === "TARGET" ? (
        <mesh position={[0, stackCount * BLOCK_HEIGHT + 0.18, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.08, 32]} />
          <meshStandardMaterial
            color={isLit ? "#f8fffe" : "#d7ecff"}
            emissive={isLit ? "#7fff64" : "#69aefe"}
            emissiveIntensity={isLit ? 1.2 : 0.22}
          />
        </mesh>
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
    timeline.to(beamMaterial, { duration: 0.68, opacity: 0 }, 1.44);
    timeline.to(flareMaterial, { duration: 0.48, opacity: 0 }, 1.44);
    timeline.to(light, { duration: 0.68, intensity: 0 }, 1.44);
    timeline.to(beamGroup.scale, { duration: 0.68, x: 0, y: 1, z: 0 }, 1.44);
    timeline.to(beamGroup.position, { duration: 0.68, y: baseY + 8.4 }, 1.44);

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

function Robot({
  activeFrame,
  failurePulse,
  litTargets,
  onFrameComplete,
  onVictorySequenceComplete,
  robot,
  victorySequenceActive,
}: {
  activeFrame: TraceFrame | null;
  failurePulse: boolean;
  litTargets: string[];
  onFrameComplete: () => void;
  onVictorySequenceComplete: () => void;
  robot: RobotState;
  victorySequenceActive: boolean;
}) {
  const rootRef = useRef<Group>(null);
  const bodyGroupRef = useRef<Group>(null);
  const torsoRef = useRef<Mesh>(null);
  const headGroupRef = useRef<Group>(null);
  const shadowRef = useRef<Mesh>(null);
  const shadowMaterialRef = useRef<MeshBasicMaterial>(null);
  const emitFrameComplete = useEffectEvent(onFrameComplete);
  const emitVictorySequenceComplete = useEffectEvent(onVictorySequenceComplete);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const [x, y, z] = toWorldPosition(robot);
    root.position.set(x, y, z);
    root.rotation.y = toFacingRotation(robot.facing);
  }, [robot]);

  useEffect(() => {
    if (!activeFrame || !rootRef.current) {
      return undefined;
    }

    const root = rootRef.current;
    const body = bodyGroupRef.current;
    const head = headGroupRef.current;
    const [targetX, targetY, targetZ] = toWorldPosition(activeFrame.robotAfter);
    const targetRotation = getShortestRotationTarget(
      root.rotation.y,
      toFacingRotation(activeFrame.robotAfter.facing),
    );
    const movementDuration = activeFrame.command === "JUMP" ? 0.46 : activeFrame.command === "FORWARD" ? 0.3 : 0.22;
    const timeline = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: emitFrameComplete,
    });

    if (activeFrame.command === "FORWARD") {
      timeline.to(root.position, { duration: movementDuration, x: targetX, y: targetY, z: targetZ }, 0);
    } else if (activeFrame.command === "JUMP") {
      if (body && head) {
        timeline.to([body.scale, head.scale], { duration: 0.12, y: 0.78, x: 1.12, z: 1.12 }, 0);
        timeline.to([body.scale, head.scale], { duration: 0.16, y: 1.12, x: 0.92, z: 0.92 }, 0.12);
        timeline.to([body.scale, head.scale], { duration: 0.12, y: 1, x: 1, z: 1 }, 0.32);
      }
      timeline.to(root.position, { duration: movementDuration, x: targetX, z: targetZ }, 0);
      timeline.to(root.position, { duration: movementDuration / 2, y: targetY + 0.9 }, 0);
      timeline.to(root.position, { duration: movementDuration / 2, y: targetY }, movementDuration / 2);
    } else if (activeFrame.command === "TURN_LEFT" || activeFrame.command === "TURN_RIGHT") {
      timeline.to(root.rotation, { duration: movementDuration, y: targetRotation }, 0);
    } else if (activeFrame.command === "LIGHT") {
      if (body) {
        timeline.to(body.scale, { duration: 0.12, x: 1.14, y: 0.9, z: 1.14 }, 0);
        timeline.to(body.scale, { duration: 0.18, x: 1, y: 1, z: 1 }, 0.12);
      } else {
        timeline.to({}, { duration: movementDuration });
      }
    } else {
      timeline.to(root.position, { duration: 0.18, x: targetX, y: targetY, z: targetZ }, 0);
    }

    return () => {
      timeline.kill();
    };
  }, [activeFrame, emitFrameComplete]);

  useEffect(() => {
    if (!failurePulse || !torsoRef.current) {
      return undefined;
    }

    const bodyMaterial = torsoRef.current.material;
    if (!("emissive" in bodyMaterial)) {
      return undefined;
    }

    const emissiveColor = bodyMaterial.emissive as Color;
    const timeline = gsap.timeline();
    timeline.to(emissiveColor, {
      duration: 0.16,
      r: 0.95,
      g: 0.15,
      b: 0.18,
    });
    timeline.to(emissiveColor, {
      duration: 0.22,
      r: 0.08,
      g: 0.22,
      b: 0.32,
    });

    return () => {
      timeline.kill();
    };
  }, [failurePulse]);

  useEffect(() => {
    const root = rootRef.current;
    const body = bodyGroupRef.current;
    const head = headGroupRef.current;
    const shadow = shadowRef.current;
    const shadowMaterial = shadowMaterialRef.current;

    if (!root || !body || !head || !shadow || !shadowMaterial) {
      return;
    }

    if (!victorySequenceActive) {
      gsap.set(root.scale, { x: 1, y: 1, z: 1 });
      gsap.set(root.rotation, { x: 0, z: 0 });
      gsap.set(body.scale, { x: 1, y: 1, z: 1 });
      gsap.set(head.scale, { x: 1, y: 1, z: 1 });
      gsap.set(shadow.scale, { x: 1, y: 1, z: 1 });
      gsap.set(shadowMaterial, { opacity: 0.24 });
      return;
    }

    const launchY = root.position.y + 13.5;
    const timeline = gsap.timeline({
      onComplete: emitVictorySequenceComplete,
    });

    timeline.to([body.scale, head.scale], { duration: 0.34, x: 0.92, y: 1.08, z: 0.92, ease: "power2.out" }, 0);
    timeline.to([body.scale, head.scale], { duration: 0.3, x: 1.05, y: 0.95, z: 1.05, ease: "power2.out" }, 0.34);
    timeline.to(root.position, { duration: 1.75, y: launchY, ease: "power3.out" }, 0.55);
    timeline.to(root.scale, { duration: 1.75, x: 0.68, y: 0.68, z: 0.68, ease: "power2.out" }, 0.55);
    timeline.to(root.rotation, { duration: 1.75, x: -0.12, z: 0.12, ease: "power2.out" }, 0.55);
    timeline.to(shadow.scale, { duration: 1.75, x: 0.32, y: 0.32, z: 0.32, ease: "power2.out" }, 0.55);
    timeline.to(shadowMaterial, { duration: 0.7, opacity: 0.02, ease: "power1.out" }, 0.55);

    return () => {
      timeline.kill();
    };
  }, [emitVictorySequenceComplete, victorySequenceActive]);

  const glowColor = litTargets.length > 0 ? "#7dff6c" : "#5bc8ff";

  return (
    <group ref={rootRef}>
      {/* Shadow */}
      <mesh position={[0, -0.48, 0]} receiveShadow ref={shadowRef} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.46, 32]} />
        <meshBasicMaterial color="#03131f" opacity={0.24} ref={shadowMaterialRef} transparent />
      </mesh>

      <group>
        <group ref={bodyGroupRef} position={[0, 0.02, 0]}>
          {/* Legs - Dual leg design for cute humanoid feel */}
          <mesh castShadow position={[-0.14, -0.12, 0]}>
            <capsuleGeometry args={[0.09, 0.28, 6, 12]} />
            <meshStandardMaterial color="#8da1b8" />
          </mesh>
          <mesh castShadow position={[0.14, -0.12, 0]}>
            <capsuleGeometry args={[0.09, 0.28, 6, 12]} />
            <meshStandardMaterial color="#8da1b8" />
          </mesh>
          <mesh castShadow position={[-0.14, -0.28, 0.08]}>
            <sphereGeometry args={[0.08, 14, 14]} />
            <meshStandardMaterial color="#dbe6f0" />
          </mesh>
          <mesh castShadow position={[0.14, -0.28, 0.08]}>
            <sphereGeometry args={[0.08, 14, 14]} />
            <meshStandardMaterial color="#dbe6f0" />
          </mesh>

          {/* Torso - Rounded & Premium */}
          <mesh castShadow position={[0, 0.28, 0]} ref={torsoRef}>
            <capsuleGeometry args={[0.3, 0.44, 10, 20]} />
            <meshStandardMaterial 
              color="#f8faff" 
              emissive={new Color("#7a93a9")} 
              emissiveIntensity={0.12} 
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>

          {/* Back - Distinctive Backpack for Directionality */}
          <mesh castShadow position={[0, 0.32, -0.18]}>
            <boxGeometry args={[0.38, 0.42, 0.18]} />
            <meshStandardMaterial color="#d4e1f0" roughness={0.4} />
          </mesh>
          <mesh castShadow position={[0, 0.28, -0.3]}>
            <boxGeometry args={[0.22, 0.16, 0.05]} />
            <meshStandardMaterial color="#b9c8d8" />
          </mesh>
          {/* Backpack Status Light */}
          <mesh position={[0, 0.42, -0.28]}>
            <boxGeometry args={[0.12, 0.06, 0.04]} />
            <meshStandardMaterial 
              color="#223344" 
              emissive={glowColor} 
              emissiveIntensity={0.6} 
            />
          </mesh>

          {/* Front - Chest Plate Detail */}
          <mesh castShadow position={[0, 0.3, 0.24]}>
            <boxGeometry args={[0.22, 0.18, 0.06]} />
            <meshStandardMaterial color="#e1ecf7" />
          </mesh>
          <mesh position={[0, 0.3, 0.28]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial color="#f9ffff" emissive={glowColor} emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[-0.08, 0.18, 0.27]}>
            <sphereGeometry args={[0.02, 12, 12]} />
            <meshStandardMaterial color="#7a8c9e" />
          </mesh>
          <mesh position={[0.08, 0.18, 0.27]}>
            <sphereGeometry args={[0.02, 12, 12]} />
            <meshStandardMaterial color="#7a8c9e" />
          </mesh>

          {/* Arms */}
          <mesh castShadow position={[-0.4, 0.36, 0.05]} rotation-z={0.3}>
            <capsuleGeometry args={[0.06, 0.2, 6, 10]} />
            <meshStandardMaterial color="#9fb1c5" />
          </mesh>
          <mesh castShadow position={[0.4, 0.36, 0.05]} rotation-z={-0.3}>
            <capsuleGeometry args={[0.06, 0.2, 6, 10]} />
            <meshStandardMaterial color="#9fb1c5" />
          </mesh>
        </group>

        <group ref={headGroupRef} position={[0, 0.94, 0.02]}>
          {/* Main Head - Slightly squashed for cuteness */}
          <mesh castShadow scale={[1.1, 0.95, 1.05]}>
            <sphereGeometry args={[0.34, 32, 32]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive={new Color("#93a9bd")} 
              emissiveIntensity={0.08} 
              roughness={0.2}
            />
          </mesh>

          {/* Front visor plate - clearly mounted on the +Z face */}
          <mesh position={[0, 0.03, 0.2]} scale={[0.72, 0.54, 0.34]}>
            <sphereGeometry args={[0.3, 24, 24]} />
            <meshStandardMaterial 
              color="#0a1a2a" 
              transparent 
              opacity={0.9} 
              metalness={0.9} 
              roughness={0.1} 
            />
          </mesh>

          {/* Glowy expression eyes inside the visor */}
          <mesh position={[-0.1, 0.06, 0.31]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color="#000000" emissive={glowColor} emissiveIntensity={2.2} />
          </mesh>
          <mesh position={[0.1, 0.06, 0.31]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color="#000000" emissive={glowColor} emissiveIntensity={2.2} />
          </mesh>
          <mesh position={[0, -0.06, 0.33]}>
            <boxGeometry args={[0.08, 0.03, 0.02]} />
            <meshStandardMaterial color="#5b6d82" />
          </mesh>
          <mesh position={[0, -0.11, 0.325]}>
            <sphereGeometry args={[0.018, 12, 12]} />
            <meshStandardMaterial color="#ffb7cb" />
          </mesh>

          {/* Side "Ears" / Sensors */}
          <mesh castShadow position={[-0.34, 0, 0]} rotation-y={-Math.PI / 2}>
            <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
            <meshStandardMaterial color="#c5d3e1" />
          </mesh>
          <mesh castShadow position={[0.34, 0, 0]} rotation-y={Math.PI / 2}>
            <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
            <meshStandardMaterial color="#c5d3e1" />
          </mesh>

          {/* Antenna - Tilted back slightly to indicate direction */}
          <mesh castShadow position={[0.05, 0.42, -0.08]} rotation-x={-0.2}>
            <cylinderGeometry args={[0.012, 0.012, 0.28, 12]} />
            <meshStandardMaterial color="#8aa0b5" />
          </mesh>
          <mesh castShadow position={[0.05, 0.6, -0.14]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#ffd05c" emissive="#ffd05c" emissiveIntensity={0.6} />
          </mesh>
      </group>
      </group>
    </group>
  );
}

export function GameCanvas({
  activeFrame,
  committedRobot,
  failurePulse,
  litTargets,
  level,
  onFrameComplete,
  onVictorySequenceComplete,
  quarterTurns,
  showVictorySequence,
}: {
  activeFrame: TraceFrame | null;
  committedRobot: RobotState;
  failurePulse: boolean;
  litTargets: string[];
  level: LevelDefinition;
  onFrameComplete: () => void;
  onVictorySequenceComplete: () => void;
  quarterTurns: number;
  showVictorySequence: boolean;
}) {
  const { centerX, centerZ } = getBoardMetrics(level);
  const activeTileKey =
    activeFrame === null ? null : `${activeFrame.robotAfter.x},${activeFrame.robotAfter.y},${activeFrame.robotAfter.z}`;

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-[28px] border-2 border-[#c6cf94] bg-[#f6f1ba] md:h-[620px]">
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={["#e8e2b4"]} />
        <OrthographicCamera makeDefault position={[14, 12, 14]} zoom={42} near={0.1} far={100} />
        <CameraRig level={level} />
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
        <group position={[-centerX, 0, -centerZ]} rotation-y={quarterTurns * (Math.PI / 2)}>
          <GridFloor level={level} />
          {level.board.map((tile) => {
            const tileKey = `${tile.x},${tile.y},${tile.z}`;
            return (
              <TileBlock
                isActive={tileKey === activeTileKey}
                isLit={tile.kind === "TARGET" && litTargets.includes(tile.id as string)}
                key={tile.kind === "TARGET" ? tile.id : tileKey}
                tile={tile}
              />
            );
          })}
          <VictoryBeam active={showVictorySequence} robot={committedRobot} />
          <Robot
            activeFrame={activeFrame}
            failurePulse={failurePulse}
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
