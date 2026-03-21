/**
 * Comments:
 * - TileBlock owns per-tile geometry and all tile-local visual timelines.
 * - This keeps the main scene assembly declarative while preserving existing effects.
 */

import { memo, useEffect, useRef } from "react";

import { Edges, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import type { Group, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, PointLight } from "three";
import { AdditiveBlending } from "three";
import { Color } from "three";

import type { LevelDefinition } from "@lumaloop/engine";

import {
  BLOCK_HEIGHT,
  FAILURE_BLINK_COUNT,
  FAILURE_BLINK_FALL_DURATION,
  FAILURE_BLINK_HOLD_DURATION,
  FAILURE_BLINK_RISE_DURATION,
  TILE_SIZE,
} from "./constants";

const DARK_TILE_STYLE = {
  edgeColor: "#ddebf5",
  frostedInnerFillColor: "#c9d9e6",
  frostedInnerFillOpacity: 0.22,
  frostedShellColor: "#edf5fb",
  frostedShellEmissive: "#a6d7ef",
  frostedShellEmissiveIntensity: 0.02,
  frostedShellOpacity: 1,
  frostedShellTransmission: 0,
  frostedSurfaceOpacity: 0.05,
  targetCoreColor: "#47d7ff",
  targetCoreColorLit: "#ffef40",
  targetEdgeColor: "#a6f4ff",
  targetEdgeColorLit: "#ffea75",
  targetHaloColor: "#97efff",
  targetHaloColorLit: "#fff58a",
  targetHaloOpacity: 0.14,
  targetHaloOpacityLit: 0.2,
  targetInnerFillColor: "#74d5f4",
  targetInnerFillColorLit: "#ffec74",
  targetInnerFillOpacity: 0.22,
  targetShellColor: "#79cce7",
  targetShellColorLit: "#fff2a0",
  targetShellEmissive: "#7fc8ff",
  targetShellEmissiveLit: "#ffef90",
  targetShellEmissiveIntensity: 0.38,
  targetShellEmissiveIntensityLit: 1,
  targetShellOpacity: 0.9,
  targetShellTransmission: 0,
  targetSurfaceOpacity: 0.14,
} as const;

const LIGHT_TILE_STYLE = {
  edgeColor: "#a3bfd2",
  frostedInnerFillColor: "#e6eef5",
  frostedInnerFillOpacity: 0.3,
  frostedShellColor: "#f7fbff",
  frostedShellEmissive: "#ffffff",
  frostedShellEmissiveIntensity: 0.1,
  frostedShellOpacity: 1,
  frostedShellTransmission: 0,
  frostedSurfaceOpacity: 0.08,
  targetCoreColor: "#39c5f5",
  targetCoreColorLit: "#ffd700",
  targetEdgeColor: "#2da8d9",
  targetEdgeColorLit: "#ffc254",
  targetHaloColor: "#6fd7fa",
  targetHaloColorLit: "#fff099",
  targetHaloOpacity: 0.15,
  targetHaloOpacityLit: 0.2,
  targetInnerFillColor: "#5ec6f2",
  targetInnerFillColorLit: "#ffe680",
  targetInnerFillOpacity: 0.3,
  targetShellColor: "#72cdf2",
  targetShellColorLit: "#fff3b0",
  targetShellEmissive: "#8cdcf7",
  targetShellEmissiveLit: "#fff8cc",
  targetShellEmissiveIntensity: 0.3,
  targetShellEmissiveIntensityLit: 0.5,
  targetShellOpacity: 0.95,
  targetShellTransmission: 0,
  targetSurfaceOpacity: 0.16,
} as const;

interface TileBlockProps {
  failureBlink: boolean;
  failurePulseToken: object | null;
  isActive: boolean;
  isLit: boolean;
  tile: LevelDefinition["board"][number];
  theme: "dark" | "light";
  victoryGlow: boolean;
}

function TileBlockInner({ failureBlink, failurePulseToken, isActive, isLit, tile, theme, victoryGlow }: TileBlockProps) {
  const topMaterialRef = useRef<MeshStandardMaterial | MeshPhysicalMaterial>(null);
  const targetCoreMaterialRef = useRef<MeshStandardMaterial>(null);
  const targetHaloMaterialRef = useRef<MeshBasicMaterial>(null);
  const targetSuccessGlowRef = useRef<MeshBasicMaterial>(null);
  const targetLightRef = useRef<PointLight>(null);
  const targetOrbGroupRef = useRef<Group>(null);
  const stackCount = tile.z + 1;
  const isTarget = tile.kind === "TARGET";
  const isFrostedVolume = !isTarget;
  const tileStyle = theme === "light" ? LIGHT_TILE_STYLE : DARK_TILE_STYLE;
  const chamberCenterY = stackCount * BLOCK_HEIGHT * 0.5;
  const shellColor = isTarget
    ? isLit
      ? tileStyle.targetShellColorLit
      : tileStyle.targetShellColor
    : tileStyle.frostedShellColor;
  const shellOpacity = isTarget ? tileStyle.targetShellOpacity : tileStyle.frostedShellOpacity;
  const shellTransmission = isTarget ? tileStyle.targetShellTransmission : tileStyle.frostedShellTransmission;
  const shellEmissive = isTarget
    ? isLit
      ? tileStyle.targetShellEmissiveLit
      : tileStyle.targetShellEmissive
    : tileStyle.frostedShellEmissive;
  const shellEmissiveIntensity = isTarget
    ? isLit
      ? tileStyle.targetShellEmissiveIntensityLit
      : tileStyle.targetShellEmissiveIntensity
    : tileStyle.frostedShellEmissiveIntensity;
  const isTransparentShell = shellOpacity < 1 || shellTransmission > 0;
  const surfaceOpacity = isTarget ? tileStyle.targetSurfaceOpacity : tileStyle.frostedSurfaceOpacity;
  const innerFillColor = isTarget
    ? isLit
      ? tileStyle.targetInnerFillColorLit
      : tileStyle.targetInnerFillColor
    : tileStyle.frostedInnerFillColor;
  const innerFillOpacity = isTarget ? tileStyle.targetInnerFillOpacity : tileStyle.frostedInnerFillOpacity;
  const edgeColor = isTarget
    ? isLit
      ? tileStyle.targetEdgeColorLit
      : tileStyle.targetEdgeColor
    : tileStyle.edgeColor;

  useEffect(() => {
    const topMaterial = topMaterialRef.current;
    if (!failureBlink || !topMaterial) {
      return;
    }

    const peakEmissiveIntensity = Math.max(shellEmissiveIntensity + 1.18, 1.28);
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
        emissiveIntensity: shellEmissiveIntensity,
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
      topMaterial.emissiveIntensity = shellEmissiveIntensity;
    };
  }, [failureBlink, failurePulseToken, shellEmissiveIntensity]);

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
    const baseIntensity = isLit ? 4.6 : theme === "light" ? 0.38 : 0.6;
    const baseColor = new Color(isLit ? tileStyle.targetCoreColorLit : tileStyle.targetCoreColor);
    const timeline = gsap.timeline();

    gsap.set(coreMaterial.color, { r: baseColor.r, g: baseColor.g, b: baseColor.b });
    gsap.set(coreMaterial, { opacity: baseOpacity });
    if (haloMaterial) {
      gsap.set(haloMaterial.color, { r: baseColor.r, g: baseColor.g, b: baseColor.b });
      gsap.set(haloMaterial, { opacity: isLit ? tileStyle.targetHaloOpacityLit : tileStyle.targetHaloOpacity });
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
      timeline.to(
        coreMaterial.color,
        {
          duration: 0.28,
          ease: "power2.out",
          r: victoryColor.r,
          g: victoryColor.g,
          b: victoryColor.b,
        },
        0,
      );
      if (haloMaterial) {
        timeline.to(
          haloMaterial.color,
          {
            duration: 0.28,
            ease: "power2.out",
            r: victoryColor.r,
            g: victoryColor.g,
            b: victoryColor.b,
          },
          0,
        );
        timeline.to(haloMaterial, { duration: 0.28, ease: "power2.out", opacity: theme === "light" ? 0.08 : 0.1 }, 0);
      }
      if (successGlowMaterial) {
        timeline.to(successGlowMaterial, { duration: 0.32, ease: "power2.out", opacity: 0.95 }, 0.04);
      }
      timeline.to(
        coreLight.color,
        {
          duration: 0.42,
          ease: "power2.out",
          r: victoryColor.r,
          g: victoryColor.g,
          b: victoryColor.b,
        },
        0,
      );
      timeline.to(coreLight, { duration: 0.4, ease: "power2.out", intensity: 4.6 }, 0);
      if (targetOrbGroupRef.current) {
        timeline.to(targetOrbGroupRef.current.scale, { duration: 0.22, ease: "power2.out", x: 1, y: 1, z: 1 }, 0);
      }
    } else {
      timeline.to(coreMaterial, { duration: 0.24, ease: "power2.out", opacity: baseOpacity }, 0);
      if (haloMaterial) {
        timeline.to(
          haloMaterial,
          {
            duration: 0.24,
            ease: "power2.out",
            opacity: isLit ? tileStyle.targetHaloOpacityLit : tileStyle.targetHaloOpacity,
          },
          0,
        );
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
  }, [isLit, isTarget, theme, tileStyle.targetCoreColor, tileStyle.targetCoreColorLit, tileStyle.targetHaloOpacity, tileStyle.targetHaloOpacityLit, victoryGlow]);

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

    const elapsed = clock.getElapsedTime();
    const pulse = (Math.sin(elapsed * 2.1 + tile.x * 0.35 + tile.y * 0.28) + 1) * 0.5;
    const baseScale = isLit ? 1.2 : 1;
    const baseHaloOpacity = isLit ? tileStyle.targetHaloOpacityLit : tileStyle.targetHaloOpacity;
    const baseLightIntensity = isLit ? (theme === "light" ? 1.0 : 1.2) : theme === "light" ? 0.5 : 0.6;

    targetOrbGroupRef.current.scale.setScalar(baseScale + pulse * 0.22);
    targetCoreMaterialRef.current.emissiveIntensity = (isLit ? (theme === "light" ? 3.0 : 3.8) : theme === "light" ? 2.6 : 3.1) + pulse * (theme === "light" ? 1.8 : 2.2);
    targetHaloMaterialRef.current.opacity = baseHaloOpacity + pulse * 0.24;
    targetLightRef.current.intensity = baseLightIntensity + pulse * (isLit ? 0.24 : 0.14);
  });

  return (
    <group position={[tile.x * TILE_SIZE, 0, tile.y * TILE_SIZE]}>
      {Array.from({ length: stackCount }, (_, layer) => (
        <group key={layer} position={[0, BLOCK_HEIGHT * (layer + 0.5), 0]}>
          <>
            <RoundedBox args={[1.92, BLOCK_HEIGHT - 0.06, 1.92]} radius={0.22} smoothness={8}>
              <meshPhysicalMaterial
                color={shellColor}
                clearcoat={0}
                clearcoatRoughness={1}
                depthWrite={!isTransparentShell}
                emissive={shellEmissive}
                emissiveIntensity={shellEmissiveIntensity}
                envMapIntensity={0}
                ior={1.02}
                metalness={0}
                opacity={shellOpacity}
                ref={topMaterialRef}
                roughness={1}
                thickness={0.05}
                transmission={shellTransmission}
                transparent={isTransparentShell}
              />
            </RoundedBox>
            <RoundedBox args={[1.28, BLOCK_HEIGHT * 0.5, 1.28]} position={[0, -0.02, 0]} radius={0.13} smoothness={6}>
              <meshBasicMaterial color={innerFillColor} depthWrite={false} opacity={innerFillOpacity} toneMapped={false} transparent />
            </RoundedBox>
            <RoundedBox args={[1.94, BLOCK_HEIGHT - 0.04, 1.94]} radius={0.22} smoothness={8}>
              <meshBasicMaterial color="#f9fcff" depthWrite={false} opacity={surfaceOpacity} toneMapped={false} transparent />
              <Edges color={edgeColor} scale={1} threshold={30} />
            </RoundedBox>
          </>
        </group>
      ))}
      {isTarget ? (
        <group position={[0, chamberCenterY, 0]} ref={targetOrbGroupRef}>
          <pointLight
            color={isLit ? tileStyle.targetCoreColorLit : tileStyle.targetCoreColor}
            distance={isLit ? 6.5 : theme === "light" ? 3.2 : 3.5}
            intensity={isLit ? 4.6 : theme === "light" ? 0.5 : 0.6}
            ref={targetLightRef}
          />
          <mesh renderOrder={2}>
            <boxGeometry args={[0.24, 0.24, 0.24]} />
            <meshStandardMaterial
              color={isLit ? tileStyle.targetCoreColorLit : tileStyle.targetCoreColor}
              emissive={isLit ? tileStyle.targetCoreColorLit : tileStyle.targetCoreColor}
              emissiveIntensity={theme === "light" ? 3.0 : 3.8}
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
              color={isLit ? tileStyle.targetHaloColorLit : tileStyle.targetHaloColor}
              depthTest
              depthWrite={false}
              opacity={isLit ? tileStyle.targetHaloOpacityLit : tileStyle.targetHaloOpacity}
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

export const TileBlock = memo(TileBlockInner, (previousProps, nextProps) => {
  return (
    previousProps.failureBlink === nextProps.failureBlink &&
    previousProps.failurePulseToken === nextProps.failurePulseToken &&
    previousProps.isActive === nextProps.isActive &&
    previousProps.isLit === nextProps.isLit &&
    previousProps.tile === nextProps.tile &&
    previousProps.theme === nextProps.theme &&
    previousProps.victoryGlow === nextProps.victoryGlow
  );
});
