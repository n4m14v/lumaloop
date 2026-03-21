/**
 * Comments:
 * - VictoryBeam isolates the win-sequence beam animation from the main canvas shell.
 * - It owns the GSAP timeline for the effect but keeps its public API very small.
 */

import { useEffect, useLayoutEffect, useRef } from "react";

import gsap from "gsap";
import type { Group, MeshBasicMaterial, PointLight } from "three";
import { AdditiveBlending, DoubleSide } from "three";

import type { RobotState } from "@lumaloop/engine";

import {
  ROBOT_VICTORY_BEAM_FADE_PORTION,
  ROBOT_VICTORY_BEAM_EXIT_DURATION_SECONDS,
  ROBOT_VICTORY_BEAM_EXIT_START_SECONDS,
} from "../Robot";
import { BLOCK_HEIGHT, TILE_SIZE } from "./constants";

const VICTORY_BEAM_BASE_OFFSET = 0.03;

export function VictoryBeam({
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
      (robot.z + 1) * BLOCK_HEIGHT + VICTORY_BEAM_BASE_OFFSET,
      robot.y * TILE_SIZE,
    );
  }, [robot]);

  useEffect(() => {
    const beamGroup = beamGroupRef.current;
    const beamMaterial = beamMaterialRef.current;
    const flareMaterial = flareMaterialRef.current;
    const light = lightRef.current;
    const baseY = (robot.z + 1) * BLOCK_HEIGHT + VICTORY_BEAM_BASE_OFFSET;

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
    timeline.set(
      beamGroup,
      { visible: false },
      ROBOT_VICTORY_BEAM_EXIT_START_SECONDS + ROBOT_VICTORY_BEAM_EXIT_DURATION_SECONDS,
    );

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
        <ringGeometry args={[0.3, 0.88, 32]} />
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
