/**
 * Comments:
 * - TileBlock owns per-tile geometry and all tile-local visual timelines.
 * - This keeps the main scene assembly declarative while preserving existing effects.
 */

import { useEffect, useRef } from "react";

import { Edges } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import type { Group, MeshBasicMaterial, MeshStandardMaterial, PointLight } from "three";
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

export function TileBlock({
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
        timeline.to(haloMaterial, { duration: 0.28, ease: "power2.out", opacity: 0.1 }, 0);
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

    const elapsed = clock.getElapsedTime();
    const pulse = (Math.sin(elapsed * 2.1 + tile.x * 0.35 + tile.y * 0.28) + 1) * 0.5;
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
