/**
 * Comments:
 * - TileBlock owns per-tile geometry and all tile-local visual timelines.
 * - This keeps the main scene assembly declarative while preserving existing effects.
 */

import { memo, useEffect, useLayoutEffect, useRef, useMemo } from "react";

import { Edges, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import type { Group, MeshBasicMaterial, PointLight } from "three";
import { AdditiveBlending, MeshStandardMaterial, Color, MeshPhysicalMaterial } from "three";

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
  frostedShellRoughness: 0.14,
  frostedShellThickness: 0,
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

interface TileBlockProps {
  activeCommand?: string | null;
  failureBlink: boolean;
  failurePulseToken: object | null;
  isActive: boolean;
  isLit: boolean;
  tile: LevelDefinition["board"][number];
  victoryGlow: boolean;
}

function ToggleGlyph({ isActive, activeCommand }: { isActive: boolean; activeCommand: string | null }) {
  const glyphGroupRef = useRef<Group>(null);
  const baseColor = "#97efff";
  const sharedMaterial = useMemo(
    () => new MeshPhysicalMaterial({
      color: baseColor,
      emissive: "#47d7ff",
      emissiveIntensity: 0.4,
      roughness: 0.1,
      metalness: 0.5,
      transmission: 0.4,
      thickness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    }),
    []
  );

  useEffect(() => {
    let targetEmissive = new Color("#47d7ff");
    let targetIntensity = 0.4;

    if (activeCommand === "TOGGLE") {
      targetEmissive = new Color("#00ffff");
      targetIntensity = 2.5;

      const tl = gsap.timeline();
      tl.to(sharedMaterial, { emissiveIntensity: targetIntensity, duration: 0.1 });
      tl.to(sharedMaterial.emissive, { r: targetEmissive.r, g: targetEmissive.g, b: targetEmissive.b, duration: 0.1 }, 0);

      const activeEmissive = new Color("#00aaff");
      tl.to(sharedMaterial, { emissiveIntensity: 1.2, duration: 0.3 }, 0.2);
      tl.to(sharedMaterial.emissive, { r: activeEmissive.r, g: activeEmissive.g, b: activeEmissive.b, duration: 0.3 }, 0.2);
    } else if (isActive) {
      targetEmissive = new Color("#00aaff");
      targetIntensity = 1.2;

      gsap.to(sharedMaterial, { emissiveIntensity: targetIntensity, duration: 0.3 });
      gsap.to(sharedMaterial.emissive, { r: targetEmissive.r, g: targetEmissive.g, b: targetEmissive.b, duration: 0.3 });
    } else {
      gsap.to(sharedMaterial, { emissiveIntensity: targetIntensity, duration: 0.3 });
      gsap.to(sharedMaterial.emissive, { r: targetEmissive.r, g: targetEmissive.g, b: targetEmissive.b, duration: 0.3 });
    }
  }, [isActive, activeCommand, sharedMaterial]);

  useFrame(({ clock }) => {
    if (!glyphGroupRef.current) return;
    const elapsed = clock.getElapsedTime();
    // Smooth, consistent rotation around the Y axis for dynamic "sync/swap" feel
    glyphGroupRef.current.rotation.y = elapsed * 0.8;
  });

  const R = 0.18;
  const tube = 0.035;
  const arc = Math.PI * 0.65; // ~117 degrees length for each arrow

  return (
    <group ref={glyphGroupRef} position={[0, BLOCK_HEIGHT * 0.5 - 0.015, 0]}>
      {/* Lay flat conceptually on top of the tile, scaled up to be larger */}
      <group rotation={[-Math.PI / 2, 0, 0]} scale={1.4}>

        {/* Core resting dot */}
        <mesh position={[0, 0, 0]} material={sharedMaterial}>
          <sphereGeometry args={[0.04, 16, 16]} />
        </mesh>

        {/* Curved Arrow 1 */}
        <group>
          <mesh material={sharedMaterial}>
            {/* The tail trail */}
            <torusGeometry args={[R, tube, 12, 32, arc]} />
          </mesh>
          {/* Arrowhead pointed tangentially at the terminal of the arc */}
          <mesh position={[R * Math.cos(arc), R * Math.sin(arc), 0]} rotation={[0, 0, arc + Math.PI / 2]} material={sharedMaterial}>
            <coneGeometry args={[0.08, 0.18, 12]} />
          </mesh>
        </group>

        {/* Curved Arrow 2 - Mirrors Arrow 1 exactly 180 degrees */}
        <group rotation={[0, 0, Math.PI]}>
          <mesh material={sharedMaterial}>
            <torusGeometry args={[R, tube, 12, 32, arc]} />
          </mesh>
          <mesh position={[R * Math.cos(arc), R * Math.sin(arc), 0]} rotation={[0, 0, arc + Math.PI / 2]} material={sharedMaterial}>
            <coneGeometry args={[0.08, 0.18, 12]} />
          </mesh>
        </group>

      </group>
    </group>
  );
}

function TileBlockInner({
  activeCommand,
  failureBlink,
  failurePulseToken,
  isActive,
  isLit,
  tile,
  victoryGlow,
}: TileBlockProps) {
  const tileRootGroupRef = useRef<Group>(null);
  const topMaterialRef = useRef<MeshStandardMaterial | MeshPhysicalMaterial>(null);
  const targetCoreMaterialRef = useRef<MeshStandardMaterial>(null);
  const targetHaloMaterialRef = useRef<MeshBasicMaterial>(null);
  const targetSuccessGlowRef = useRef<MeshBasicMaterial>(null);
  const targetLightRef = useRef<PointLight>(null);
  const targetOrbGroupRef = useRef<Group>(null);
  const switchPulseGroupRef = useRef<Group>(null);
  const switchPulseMaterialRef = useRef<MeshBasicMaterial>(null);
  const switchLightRef = useRef<PointLight>(null);
  const stackCount = tile.z + 1;
  const isSwitch = tile.kind === "SWITCH";
  const isTarget = tile.kind === "TARGET";
  const tileStyle = DARK_TILE_STYLE;
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
    const baseIntensity = isLit ? 4.6 : 0.6;
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
  }, [isLit, isTarget, tileStyle.targetCoreColor, tileStyle.targetCoreColorLit, tileStyle.targetHaloOpacity, tileStyle.targetHaloOpacityLit, victoryGlow]);

  useFrame(({ clock }) => {
    if (
      !isTarget ||
      victoryGlow ||
      activeCommand === "ACTIVATE" ||
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
    const baseLightIntensity = isLit ? 1.2 : 0.6;

    targetOrbGroupRef.current.scale.setScalar(baseScale + pulse * 0.22);
    targetCoreMaterialRef.current.emissiveIntensity = (isLit ? 3.8 : 3.1) + pulse * 2.2;
    targetHaloMaterialRef.current.opacity = baseHaloOpacity + pulse * 0.24;
    targetLightRef.current.intensity = baseLightIntensity + pulse * (isLit ? 0.24 : 0.14);
  });

  useLayoutEffect(() => {
    if (
      !isTarget ||
      activeCommand !== "ACTIVATE" ||
      !targetOrbGroupRef.current ||
      !targetCoreMaterialRef.current ||
      !targetHaloMaterialRef.current ||
      !targetLightRef.current
    ) {
      return;
    }

    const orbGroup = targetOrbGroupRef.current;
    const coreMaterial = targetCoreMaterialRef.current;
    const haloMaterial = targetHaloMaterialRef.current;
    const targetLight = targetLightRef.current;
    const timeline = gsap.timeline();
    const baseScale = isLit ? 1.2 : 1;
    const baseHaloOpacity = isLit ? tileStyle.targetHaloOpacityLit : tileStyle.targetHaloOpacity;
    const baseLightIntensity = isLit ? 1.2 : 0.6;
    const baseEmissiveIntensity = isLit ? 3.8 : 3.1;

    timeline.to(orbGroup.scale, { duration: 0.12, ease: "power2.out", x: baseScale * 1.4, y: baseScale * 1.4, z: baseScale * 1.4 }, 0);
    timeline.to(coreMaterial, { duration: 0.12, ease: "power2.out", emissiveIntensity: baseEmissiveIntensity + 2.4 }, 0);
    timeline.to(haloMaterial, { duration: 0.12, ease: "power2.out", opacity: Math.max(baseHaloOpacity, 0.58) }, 0);
    timeline.to(targetLight, { duration: 0.12, ease: "power2.out", intensity: baseLightIntensity + 2.3 }, 0);
    timeline.to(orbGroup.scale, { duration: 0.28, ease: "power2.inOut", x: baseScale, y: baseScale, z: baseScale }, 0.12);
    timeline.to(coreMaterial, { duration: 0.28, ease: "power2.inOut", emissiveIntensity: baseEmissiveIntensity }, 0.12);
    timeline.to(haloMaterial, { duration: 0.28, ease: "power2.inOut", opacity: baseHaloOpacity }, 0.12);
    timeline.to(targetLight, { duration: 0.28, ease: "power2.inOut", intensity: baseLightIntensity }, 0.12);

    return () => {
      timeline.kill();
    };
  }, [activeCommand, isLit, isTarget, tileStyle.targetHaloOpacity, tileStyle.targetHaloOpacityLit]);

  useFrame(({ clock }) => {
    if (
      !isSwitch ||
      activeCommand === "TOGGLE" ||
      !switchPulseGroupRef.current ||
      !switchPulseMaterialRef.current ||
      !switchLightRef.current
    ) {
      return;
    }

    const elapsed = clock.getElapsedTime();
    const pulse = (Math.sin(elapsed * 2.6 + tile.x * 0.42 + tile.y * 0.33) + 1) * 0.5;
    const baseScale = isActive ? 1.03 : 1;
    const baseOpacity = isActive ? 0.12 : 0.08;
    const baseLightIntensity = isActive ? 0.34 : 0.16;

    switchPulseGroupRef.current.scale.setScalar(baseScale + pulse * 0.1);
    switchPulseMaterialRef.current.opacity = baseOpacity + pulse * 0.08;
    switchLightRef.current.intensity = baseLightIntensity + pulse * 0.18;
  });

  useLayoutEffect(() => {
    if (isSwitch && activeCommand === "TOGGLE" && tileRootGroupRef.current) {
      const tl = gsap.timeline();
      tl.to(tileRootGroupRef.current.position, { y: -0.15, duration: 0.15, ease: "power2.out" });
      tl.to(tileRootGroupRef.current.position, { y: 0, duration: 0.4, ease: "power2.inOut" }, 0.2);

      return () => {
        tl.kill();
      };
    }
  }, [isSwitch, activeCommand]);

  useLayoutEffect(() => {
    if (
      !isSwitch ||
      activeCommand !== "TOGGLE" ||
      !switchPulseGroupRef.current ||
      !switchPulseMaterialRef.current ||
      !switchLightRef.current
    ) {
      return;
    }

    const pulseGroup = switchPulseGroupRef.current;
    const pulseMaterial = switchPulseMaterialRef.current;
    const switchLight = switchLightRef.current;
    const timeline = gsap.timeline();

    timeline.to(pulseGroup.scale, { duration: 0.12, ease: "power2.out", x: 1.42, y: 1.42, z: 1.42 }, 0);
    timeline.to(pulseMaterial, { duration: 0.12, ease: "power2.out", opacity: 0.52 }, 0);
    timeline.to(switchLight, { duration: 0.12, ease: "power2.out", intensity: 1.7 }, 0);
    timeline.to(pulseGroup.scale, { duration: 0.32, ease: "power2.inOut", x: 1.04, y: 1.04, z: 1.04 }, 0.12);
    timeline.to(pulseMaterial, { duration: 0.32, ease: "power2.inOut", opacity: 0.16 }, 0.12);
    timeline.to(switchLight, { duration: 0.32, ease: "power2.inOut", intensity: 0.34 }, 0.12);

    return () => {
      timeline.kill();
    };
  }, [activeCommand, isSwitch]);

  return (
    <group position={[tile.x * TILE_SIZE, 0, tile.y * TILE_SIZE]}>
      <group ref={tileRootGroupRef}>
        {Array.from({ length: stackCount }, (_, layer) => (
          <group key={layer} position={[0, BLOCK_HEIGHT * (layer + 0.5), 0]}>
            <>
              <RoundedBox args={[1.92, BLOCK_HEIGHT - 0.06, 1.92]} radius={0.22} smoothness={8}>
                <meshPhysicalMaterial
                  color={shellColor}
                  depthTest
                  emissive={shellEmissive}
                  emissiveIntensity={shellEmissiveIntensity}
                  opacity={shellOpacity}
                  roughness={tileStyle.frostedShellRoughness}
                  thickness={tileStyle.frostedShellThickness}
                  transmission={shellTransmission}
                  transparent
                />
              </RoundedBox>
              <RoundedBox args={[1.7, BLOCK_HEIGHT - 0.24, 1.7]} radius={0.16} smoothness={4}>
                <meshBasicMaterial color={innerFillColor} depthTest opacity={innerFillOpacity} transparent />
              </RoundedBox>
              <RoundedBox args={[2.08, BLOCK_HEIGHT + 0.08, 2.08]} radius={0.18} smoothness={8}>
                <meshBasicMaterial color="#f9fcff" depthWrite={false} opacity={surfaceOpacity} toneMapped={false} transparent />
                <Edges color={edgeColor} scale={1} threshold={30} />
              </RoundedBox>
              {isSwitch && layer === stackCount - 1 ? <ToggleGlyph isActive={isActive} activeCommand={activeCommand ?? null} /> : null}
            </>
          </group>
        ))}
        {isSwitch ? (
          <group position={[0, chamberCenterY, 0]} ref={switchPulseGroupRef}>
            <pointLight color="#6de9ff" distance={4.8} intensity={0.16} position={[0, 0.12, 0]} ref={switchLightRef} />
            <mesh position={[0, BLOCK_HEIGHT * 0.5 - 0.02, 0]} rotation-x={-Math.PI / 2} renderOrder={2}>
              <ringGeometry args={[0.2, 0.62, 32]} />
              <meshBasicMaterial
                blending={AdditiveBlending}
                color="#8cefff"
                depthTest
                depthWrite={false}
                opacity={0.08}
                ref={switchPulseMaterialRef}
                toneMapped={false}
                transparent
              />
            </mesh>
          </group>
        ) : null}
        {isTarget ? (
          <group position={[0, chamberCenterY, 0]} ref={targetOrbGroupRef}>
          <pointLight
            color={isLit ? tileStyle.targetCoreColorLit : tileStyle.targetCoreColor}
            distance={isLit ? 6.5 : 3.5}
            intensity={isLit ? 4.6 : 0.6}
            ref={targetLightRef}
          />
          <mesh renderOrder={2}>
            <boxGeometry args={[0.24, 0.24, 0.24]} />
            <meshStandardMaterial
              color={isLit ? tileStyle.targetCoreColorLit : tileStyle.targetCoreColor}
              emissive={isLit ? tileStyle.targetCoreColorLit : tileStyle.targetCoreColor}
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
      </group>
    </group>
  );
}

export const TileBlock = memo(TileBlockInner, (previousProps, nextProps) => {
  return (
    previousProps.activeCommand === nextProps.activeCommand &&
    previousProps.failureBlink === nextProps.failureBlink &&
    previousProps.failurePulseToken === nextProps.failurePulseToken &&
    previousProps.isActive === nextProps.isActive &&
    previousProps.isLit === nextProps.isLit &&
    previousProps.tile === nextProps.tile &&
    previousProps.victoryGlow === nextProps.victoryGlow
  );
});
