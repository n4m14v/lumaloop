/**
 * Comments:
 * - CameraRig translates orbit state into a positioned Three.js camera.
 * - It depends only on scene metrics and does not own any input state.
 */

import { useLayoutEffect } from "react";

import { useThree } from "@react-three/fiber";

import type { LevelDefinition } from "@lumaloop/engine";

import { getBoardMetrics } from "./sceneMath";

export function CameraRig({
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
