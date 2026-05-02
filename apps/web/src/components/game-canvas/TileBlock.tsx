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
  edgeColor: "#eef6ff",
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
  dimmed?: boolean;
  failureBlink: boolean;
  failurePulseToken: object | null;
  isActive: boolean;
  isLit: boolean;
  isToggleGroupHighlighted?: boolean;
  isToggleGroupActive?: boolean;
  onToggleGroupHover?: ((toggleGroup: string | null) => void) | undefined;
  tile: LevelDefinition["board"][number];
  victoryGlow: boolean;
}

type ToggleSystemColor = {
  active: string;
  activeEdge: string;
  activeGlow: string;
  inactive: string;
  inactiveEdge: string;
  inactiveGlow: string;
};

const DEFAULT_TOGGLE_SYSTEM_COLOR: ToggleSystemColor = {
  active: "#6eea55",
  activeEdge: "#c9ffd5",
  activeGlow: "#54d944",
  inactive: "#52685b",
  inactiveEdge: "#6fa27d",
  inactiveGlow: "#214b32",
};

const TOGGLE_SYSTEM_COLORS: Record<string, ToggleSystemColor> = {
  amber: {
    ...DEFAULT_TOGGLE_SYSTEM_COLOR,
  },
  blue: {
    ...DEFAULT_TOGGLE_SYSTEM_COLOR,
  },
  violet: {
    ...DEFAULT_TOGGLE_SYSTEM_COLOR,
  },
};

function getToggleSystemColor(toggleGroup?: string): ToggleSystemColor {
  return TOGGLE_SYSTEM_COLORS[toggleGroup ?? ""] ?? DEFAULT_TOGGLE_SYSTEM_COLOR;
}

function SwitchCore({
  activeCommand,
  isToggleGroupActive,
  systemColor,
}: {
  activeCommand: string | null;
  isToggleGroupActive: boolean;
  systemColor: ToggleSystemColor;
}) {
  const coreGroupRef = useRef<Group>(null);
  const coreMaterialRef = useRef<MeshPhysicalMaterial>(null);
  const rimMaterialRef = useRef<MeshBasicMaterial>(null);
  const haloMaterialRef = useRef<MeshBasicMaterial>(null);
  const coreLightRef = useRef<PointLight>(null);

  useEffect(() => {
    const coreMaterial = coreMaterialRef.current;
    const rimMaterial = rimMaterialRef.current;
    const haloMaterial = haloMaterialRef.current;
    const coreLight = coreLightRef.current;

    if (!coreMaterial || !rimMaterial || !haloMaterial || !coreLight || !coreGroupRef.current) {
      return;
    }

    const coreColor = new Color(isToggleGroupActive ? systemColor.active : systemColor.inactive);
    const glowColor = new Color(isToggleGroupActive ? systemColor.activeGlow : systemColor.inactiveGlow);
    const timeline = gsap.timeline();
    const targetIntensity = isToggleGroupActive ? 0.72 : 0.035;
    const targetHaloOpacity = isToggleGroupActive ? 0.42 : 0.32;
    const targetRimOpacity = isToggleGroupActive ? 0.88 : 0.08;
    const recessColor = new Color("#0b1110");
    const targetLightIntensity = isToggleGroupActive ? 0.24 : 0;

    timeline.to(coreMaterial.color, { duration: 0.24, r: coreColor.r, g: coreColor.g, b: coreColor.b }, 0);
    timeline.to(coreMaterial.emissive, { duration: 0.24, r: glowColor.r, g: glowColor.g, b: glowColor.b }, 0);
    timeline.to(coreMaterial, { duration: 0.24, emissiveIntensity: targetIntensity }, 0);
    timeline.to(rimMaterial.color, { duration: 0.24, r: glowColor.r, g: glowColor.g, b: glowColor.b }, 0);
    timeline.to(rimMaterial, { duration: 0.24, opacity: targetRimOpacity }, 0);
    timeline.to(haloMaterial.color, { duration: 0.24, r: recessColor.r, g: recessColor.g, b: recessColor.b }, 0);
    timeline.to(haloMaterial, { duration: 0.24, opacity: targetHaloOpacity }, 0);
    timeline.to(coreLight.color, { duration: 0.24, r: glowColor.r, g: glowColor.g, b: glowColor.b }, 0);
    timeline.to(coreLight, { duration: 0.24, intensity: targetLightIntensity }, 0);
    timeline.to(coreGroupRef.current.position, { duration: 0.24, ease: "power2.out", y: isToggleGroupActive ? BLOCK_HEIGHT * 0.5 + 0.005 : BLOCK_HEIGHT * 0.5 - 0.055 }, 0);

    if (activeCommand === "TOGGLE") {
      timeline.to(coreMaterial, { duration: 0.12, emissiveIntensity: isToggleGroupActive ? 0.98 : 0.14 }, 0);
      timeline.to(rimMaterial, { duration: 0.12, opacity: isToggleGroupActive ? 0.95 : 0.18 }, 0);
      timeline.to(coreLight, { duration: 0.12, intensity: isToggleGroupActive ? 0.38 : 0.08 }, 0);
      timeline.to(coreGroupRef.current.position, { duration: 0.11, ease: "power2.out", y: BLOCK_HEIGHT * 0.5 - 0.085 }, 0);
      timeline.to(coreGroupRef.current.position, { duration: 0.28, ease: "elastic.out(1,0.62)", y: isToggleGroupActive ? BLOCK_HEIGHT * 0.5 + 0.005 : BLOCK_HEIGHT * 0.5 - 0.055 }, 0.12);
    }

    return () => {
      timeline.kill();
    };
  }, [activeCommand, isToggleGroupActive, systemColor]);

  useFrame(({ clock }) => {
    if (!coreGroupRef.current || !isToggleGroupActive) {
      return;
    }

    const elapsed = clock.getElapsedTime();
    const pulse = (Math.sin(elapsed * 3.1) + 1) * 0.5;
    coreGroupRef.current.scale.set(1 + pulse * 0.035, 1, 1 + pulse * 0.035);
  });

  return (
    <group ref={coreGroupRef} position={[0, isToggleGroupActive ? BLOCK_HEIGHT * 0.5 + 0.005 : BLOCK_HEIGHT * 0.5 - 0.055, 0]}>
      <pointLight
        color={isToggleGroupActive ? systemColor.activeGlow : systemColor.inactiveGlow}
        distance={2.2}
        intensity={isToggleGroupActive ? 0.24 : 0}
        position={[0, 0.22, 0]}
        ref={coreLightRef}
      />
      <group>
        <mesh position={[0, -0.018, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.38, 0.58, 48]} />
          <meshBasicMaterial
            color="#0b1110"
            depthWrite={false}
            opacity={0.44}
            ref={haloMaterialRef}
            toneMapped={false}
            transparent
          />
        </mesh>
        <mesh position={[0, 0.002, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.48, 0.55, 48]} />
          <meshBasicMaterial
            color={isToggleGroupActive ? systemColor.activeGlow : systemColor.inactiveGlow}
            depthWrite={false}
            opacity={isToggleGroupActive ? 0.88 : 0.08}
            ref={rimMaterialRef}
            toneMapped={false}
            transparent
          />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.42, 0.47, 0.1, 48]} />
          <meshPhysicalMaterial
            clearcoat={1}
            color={isToggleGroupActive ? "#225f33" : "#35443b"}
            emissive={isToggleGroupActive ? systemColor.activeGlow : systemColor.inactiveGlow}
            emissiveIntensity={isToggleGroupActive ? 0.2 : 0.04}
            metalness={0.18}
            roughness={0.18}
          />
        </mesh>
        <mesh position={[0, 0.112, 0]} scale={[1, 0.24, 1]}>
          <sphereGeometry args={[0.38, 48, 18]} />
          <meshPhysicalMaterial
            clearcoat={1}
            clearcoatRoughness={0.08}
            color={isToggleGroupActive ? systemColor.active : "#61746a"}
            emissive={isToggleGroupActive ? systemColor.activeGlow : systemColor.inactiveGlow}
            emissiveIntensity={isToggleGroupActive ? 0.72 : 0.035}
            metalness={0.2}
            ref={coreMaterialRef}
            roughness={0.12}
          />
        </mesh>
      </group>
    </group>
  );
}

function SwitchSideAccents({
  isToggleGroupActive,
  systemColor,
}: {
  isToggleGroupActive: boolean;
  systemColor: ToggleSystemColor;
}) {
  const accentColor = isToggleGroupActive ? systemColor.activeGlow : "#18251d";
  const accentOpacity = isToggleGroupActive ? 0.82 : 0.2;
  const emissiveIntensity = isToggleGroupActive ? 0.85 : 0.02;

  return (
    <group>
      {[
        { position: [0, 0, 0.985] as const, rotationY: 0 },
        { position: [0, 0, -0.985] as const, rotationY: 0 },
        { position: [0.985, 0, 0] as const, rotationY: Math.PI / 2 },
        { position: [-0.985, 0, 0] as const, rotationY: Math.PI / 2 },
      ].map(({ position, rotationY }, index) => (
        <RoundedBox
          args={[0.52, 0.055, 0.035]}
          key={index}
          position={[position[0], BLOCK_HEIGHT * 0.5, position[2]]}
          radius={0.018}
          rotation-y={rotationY}
          smoothness={3}
        >
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={emissiveIntensity}
            opacity={accentOpacity}
            roughness={0.2}
            transparent
          />
        </RoundedBox>
      ))}
    </group>
  );
}

function TileBlockInner({
  activeCommand,
  dimmed = false,
  failureBlink,
  failurePulseToken,
  isActive,
  isLit,
  isToggleGroupHighlighted = false,
  isToggleGroupActive = false,
  onToggleGroupHover,
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
  const isControlledTile = tile.kind === "NORMAL" && Boolean(tile.toggleGroup && tile.moveTo);
  const isToggleSystemTile = Boolean(isSwitch || isControlledTile);
  const isToggleSystemHighlighted = isToggleSystemTile && isToggleGroupHighlighted;
  const systemColor = getToggleSystemColor(tile.toggleGroup);
  const tileStyle = DARK_TILE_STYLE;
  const chamberCenterY = stackCount * BLOCK_HEIGHT * 0.5;
  const shellColor = isTarget
    ? isLit
      ? tileStyle.targetShellColorLit
      : tileStyle.targetShellColor
    : isControlledTile
      ? isToggleGroupActive || isToggleSystemHighlighted
        ? systemColor.active
        : tileStyle.frostedShellColor
      : tileStyle.frostedShellColor;
  const shellOpacity = isTarget ? tileStyle.targetShellOpacity : tileStyle.frostedShellOpacity;
  const shellTransmission = isTarget ? tileStyle.targetShellTransmission : tileStyle.frostedShellTransmission;
  const shellEmissive = isTarget
    ? isLit
      ? tileStyle.targetShellEmissiveLit
      : tileStyle.targetShellEmissive
    : isControlledTile
      ? isToggleGroupActive || isToggleSystemHighlighted
        ? systemColor.activeGlow
        : systemColor.inactiveGlow
      : tileStyle.frostedShellEmissive;
  const shellEmissiveIntensity = isTarget
    ? isLit
      ? tileStyle.targetShellEmissiveIntensityLit
      : tileStyle.targetShellEmissiveIntensity
    : isControlledTile
      ? isToggleGroupActive
        ? 0.62
        : isToggleSystemHighlighted
          ? 0.32
          : 0.06
      : tileStyle.frostedShellEmissiveIntensity;
  const surfaceOpacity = isTarget ? tileStyle.targetSurfaceOpacity : tileStyle.frostedSurfaceOpacity;
  const innerFillColor = isTarget
    ? isLit
      ? tileStyle.targetInnerFillColorLit
      : tileStyle.targetInnerFillColor
    : isControlledTile
      ? isToggleGroupActive || isToggleSystemHighlighted
        ? systemColor.active
        : systemColor.inactive
      : tileStyle.frostedInnerFillColor;
  const innerFillOpacity = isTarget ? tileStyle.targetInnerFillOpacity : tileStyle.frostedInnerFillOpacity;
  const edgeColor = isTarget
    ? isLit
      ? tileStyle.targetEdgeColorLit
      : tileStyle.targetEdgeColor
    : isToggleSystemTile
      ? isToggleGroupActive || isToggleSystemHighlighted
        ? systemColor.activeEdge
        : systemColor.inactiveEdge
      : tileStyle.edgeColor;
  const shellColorValue = useMemo(() => {
    const color = new Color(shellColor);

    if (isControlledTile && (isToggleGroupActive || isToggleSystemHighlighted)) {
      color.lerp(new Color(tileStyle.frostedShellColor), 0.34);
      color.lerp(new Color("#d7e9f4"), 0.12);
    }

    if (isControlledTile && !isToggleGroupActive && !isToggleSystemHighlighted) {
      color.lerp(new Color(systemColor.inactive), 0.52);
      color.lerp(new Color("#0a1018"), 0.2);
    }

    if (dimmed && !isTarget) {
      color.lerp(new Color("#0a1018"), 0.18);
    }

    return color;
  }, [dimmed, isControlledTile, isTarget, isToggleGroupActive, isToggleSystemHighlighted, shellColor, systemColor]);
  const innerFillColorValue = useMemo(() => {
    const color = new Color(innerFillColor);

    if (isControlledTile && (isToggleGroupActive || isToggleSystemHighlighted)) {
      color.lerp(new Color(tileStyle.frostedInnerFillColor), 0.42);
    }

    if (isControlledTile && !isToggleGroupActive && !isToggleSystemHighlighted) {
      color.lerp(new Color("#101820"), 0.34);
    }

    if (dimmed && !isTarget) {
      color.lerp(new Color("#090d14"), 0.26);
    }

    return color;
  }, [dimmed, innerFillColor, isControlledTile, isTarget, isToggleGroupActive, isToggleSystemHighlighted]);
  const edgeColorValue = useMemo(() => {
    const color = new Color(edgeColor);

    if (dimmed && !isTarget) {
      color.lerp(new Color("#617083"), 0.22);
    }

    return color;
  }, [dimmed, edgeColor, isTarget]);
  const shellOpacityValue = isControlledTile
    ? isToggleGroupActive || isToggleSystemHighlighted
      ? 0.68
      : 0.72
    : dimmed && !isTarget ? Math.max(0.88, shellOpacity * 0.98) : shellOpacity;
  const shellEmissiveIntensityValue = isControlledTile && (isToggleGroupActive || isToggleSystemHighlighted)
    ? shellEmissiveIntensity * 0.5
    : dimmed && !isTarget ? shellEmissiveIntensity * 0.42 : shellEmissiveIntensity;
  const innerFillOpacityValue = isControlledTile
    ? isToggleGroupActive || isToggleSystemHighlighted
      ? 0.14
      : 0.08
    : dimmed && !isTarget ? innerFillOpacity * 0.62 : innerFillOpacity;
  const surfaceOpacityValue = isControlledTile
    ? isToggleGroupActive || isToggleSystemHighlighted
      ? 0.09
      : 0.08
    : dimmed && !isTarget ? surfaceOpacity * 0.68 : surfaceOpacity;

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
  }, [failureBlink, failurePulseToken, shellEmissiveIntensityValue]);

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
    const baseScale = isToggleGroupActive ? 1.04 : 1;

    switchPulseGroupRef.current.scale.setScalar(baseScale + pulse * 0.05);
    switchPulseMaterialRef.current.opacity = isToggleGroupActive ? 0.08 + pulse * 0.04 : 0;
    switchLightRef.current.intensity = isToggleGroupActive ? 0.08 + pulse * 0.04 : 0;
  });

  useLayoutEffect(() => {
    if (isSwitch && activeCommand === "TOGGLE" && tileRootGroupRef.current) {
      const tl = gsap.timeline();
      tl.to(tileRootGroupRef.current.position, { y: -0.2, duration: 0.12, ease: "power2.out" });
      tl.to(tileRootGroupRef.current.position, { y: 0, duration: 0.34, ease: "elastic.out(1,0.58)" }, 0.16);

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

    timeline.to(pulseGroup.scale, { duration: 0.12, ease: "power2.out", x: 1.5, y: 1.5, z: 1.5 }, 0);
    timeline.to(pulseMaterial, { duration: 0.12, ease: "power2.out", opacity: isToggleGroupActive ? 0.52 : 0.2 }, 0);
    timeline.to(switchLight, { duration: 0.12, ease: "power2.out", intensity: isToggleGroupActive ? 0.52 : 0.14 }, 0);
    timeline.to(pulseGroup.scale, { duration: 0.32, ease: "power2.inOut", x: 1.04, y: 1.04, z: 1.04 }, 0.12);
    timeline.to(pulseMaterial, { duration: 0.32, ease: "power2.inOut", opacity: isToggleGroupActive ? 0.1 : 0 }, 0.12);
    timeline.to(switchLight, { duration: 0.32, ease: "power2.inOut", intensity: isToggleGroupActive ? 0.08 : 0 }, 0.12);

    return () => {
      timeline.kill();
    };
  }, [activeCommand, isSwitch, isToggleGroupActive]);

  return (
    <group
      onPointerEnter={(event) => {
        if (!isToggleSystemTile || !tile.toggleGroup) {
          return;
        }

        event.stopPropagation();
        onToggleGroupHover?.(tile.toggleGroup);
      }}
      onPointerLeave={(event) => {
        if (!isToggleSystemTile || !tile.toggleGroup) {
          return;
        }

        event.stopPropagation();
        onToggleGroupHover?.(null);
      }}
      position={[tile.x * TILE_SIZE, 0, tile.y * TILE_SIZE]}
    >
      <group ref={tileRootGroupRef}>
        {Array.from({ length: stackCount }, (_, layer) => (
          <group key={layer} position={[0, BLOCK_HEIGHT * (layer + 0.5), 0]}>
            <>
              <RoundedBox args={[1.92, BLOCK_HEIGHT - 0.06, 1.92]} radius={0.22} smoothness={8}>
                <meshPhysicalMaterial
                  color={shellColorValue}
                  depthTest
                  emissive={shellEmissive}
                  emissiveIntensity={shellEmissiveIntensityValue}
                  opacity={shellOpacityValue}
                  roughness={tileStyle.frostedShellRoughness}
                  {...(layer === stackCount - 1 ? { ref: topMaterialRef } : {})}
                  thickness={tileStyle.frostedShellThickness}
                  transmission={shellTransmission}
                  transparent
                />
              </RoundedBox>
              <RoundedBox args={[1.7, BLOCK_HEIGHT - 0.24, 1.7]} radius={0.16} smoothness={4}>
                <meshBasicMaterial color={innerFillColorValue} depthTest opacity={innerFillOpacityValue} transparent />
              </RoundedBox>
              <RoundedBox args={[2.08, BLOCK_HEIGHT + 0.08, 2.08]} radius={0.18} smoothness={8}>
                <meshBasicMaterial color="#f9fcff" depthWrite={false} opacity={surfaceOpacityValue} toneMapped={false} transparent />
                <Edges color={edgeColorValue} scale={1} threshold={30} />
              </RoundedBox>
              {isSwitch && layer === stackCount - 1 ? (
                <SwitchCore
                  activeCommand={activeCommand ?? null}
                  isToggleGroupActive={isToggleGroupActive}
                  systemColor={systemColor}
                />
              ) : null}
            </>
          </group>
        ))}
        {isSwitch ? (
          <group position={[0, chamberCenterY, 0]} ref={switchPulseGroupRef}>
            <pointLight
              color={isToggleGroupActive ? systemColor.activeGlow : systemColor.inactiveGlow}
              distance={4.8}
              intensity={0}
              position={[0, 0.12, 0]}
              ref={switchLightRef}
            />
            <mesh position={[0, BLOCK_HEIGHT * 0.5 - 0.02, 0]} rotation-x={-Math.PI / 2} renderOrder={2}>
              <ringGeometry args={[0.2, 0.62, 32]} />
              <meshBasicMaterial
                blending={AdditiveBlending}
                color={isToggleGroupActive ? systemColor.activeGlow : systemColor.inactiveGlow}
                depthTest
                depthWrite={false}
                opacity={0}
                ref={switchPulseMaterialRef}
                toneMapped={false}
                transparent
              />
            </mesh>
          </group>
        ) : null}
        {isSwitch ? (
          <group position={[0, (stackCount - 1) * BLOCK_HEIGHT, 0]}>
            <SwitchSideAccents isToggleGroupActive={isToggleGroupActive} systemColor={systemColor} />
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
    previousProps.isToggleGroupHighlighted === nextProps.isToggleGroupHighlighted &&
    previousProps.isToggleGroupActive === nextProps.isToggleGroupActive &&
    previousProps.tile === nextProps.tile &&
    previousProps.victoryGlow === nextProps.victoryGlow
  );
});
