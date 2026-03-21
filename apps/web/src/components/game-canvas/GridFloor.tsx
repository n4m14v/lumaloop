/**
 * Comments:
 * - Floating floor tiles live in a dedicated module to keep the main canvas shell small.
 * - This module owns only decorative ground geometry and its lightweight animation.
 */

import { memo, useEffect, useMemo, useRef } from "react";

import { Edges } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace } from "three";

import type { LevelDefinition } from "@lumaloop/engine";

import {
  LOW_TILE_FLOAT_AMPLITUDE,
  LOW_TILE_FLOAT_BASE_LIFT,
  LOW_TILE_FLOAT_SPEED,
  TILE_SIZE,
} from "./constants";
import { getBoardMetrics } from "./sceneMath";

const CIRCUIT_TEXTURE_SIZE = 256;
const CIRCUIT_GRID_STEP = 32;
const CIRCUIT_TRACE_COLORS = ["rgba(255, 255, 255, 0.9)", "rgba(232, 242, 255, 0.88)", "rgba(244, 250, 255, 0.92)"];

const DARK_FLOOR_STYLE = {
  circuitOpacity: 0.72,
  edgeColor: "#ffffff",
  sideColor: "#eef6ff",
  sideOpacity: 0.18,
  sideRoughness: 0.14,
  topColor: "#ffffff",
  topOpacity: 0.12,
  topRoughness: 0.1,
  undershadowColor: "#d7e6f4",
  undershadowOpacity: 0.22,
  undershadowRoughness: 0.18,
} as const;

const LIGHT_FLOOR_STYLE = {
  circuitOpacity: 0.24,
  edgeColor: "#586977",
  sideColor: "#a7b4be",
  sideOpacity: 0.26,
  sideRoughness: 0.24,
  topColor: "#c4d0d8",
  topOpacity: 0.18,
  topRoughness: 0.2,
  undershadowColor: "#91a0ac",
  undershadowOpacity: 0.34,
  undershadowRoughness: 0.28,
} as const;

function hashCoordinateSeed(x: number, y: number) {
  let seed = Math.imul(x + 37, 73856093) ^ Math.imul(y - 19, 19349663);
  seed ^= seed >>> 13;
  seed = Math.imul(seed, 1274126177);
  seed ^= seed >>> 16;
  return seed >>> 0;
}

function createSeededRandom(seed: number) {
  let state = seed || 1;

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function pickTracePoint(random: () => number) {
  const maxIndex = CIRCUIT_TEXTURE_SIZE / CIRCUIT_GRID_STEP - 1;

  return {
    x: Math.round(random() * maxIndex) * CIRCUIT_GRID_STEP,
    y: Math.round(random() * maxIndex) * CIRCUIT_GRID_STEP,
  };
}

function clampToGrid(value: number) {
  return Math.max(0, Math.min(CIRCUIT_TEXTURE_SIZE, Math.round(value / CIRCUIT_GRID_STEP) * CIRCUIT_GRID_STEP));
}

function createCircuitTexture(seed: number, anisotropy: number) {
  if (typeof document === "undefined") {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = CIRCUIT_TEXTURE_SIZE;
  canvas.height = CIRCUIT_TEXTURE_SIZE;

  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  const random = createSeededRandom(seed);
  context.clearRect(0, 0, CIRCUIT_TEXTURE_SIZE, CIRCUIT_TEXTURE_SIZE);

  for (let index = 0; index < 3; index += 1) {
    const width = (2 + Math.floor(random() * 2)) * CIRCUIT_GRID_STEP;
    const height = (1 + Math.floor(random() * 2)) * CIRCUIT_GRID_STEP;
    const x = clampToGrid(random() * (CIRCUIT_TEXTURE_SIZE - width));
    const y = clampToGrid(random() * (CIRCUIT_TEXTURE_SIZE - height));

    context.strokeStyle = "rgba(255, 255, 255, 0.72)";
    context.lineWidth = 2;
    context.strokeRect(x + 6, y + 6, width - 12, height - 12);

    context.fillStyle = "rgba(255, 255, 255, 0.82)";
    const padRadius = 2.5;
    const pads = [
      { x: x + 10, y: y + 10 },
      { x: x + width - 10, y: y + 10 },
      { x: x + 10, y: y + height - 10 },
      { x: x + width - 10, y: y + height - 10 },
    ];

    for (const pad of pads) {
      context.beginPath();
      context.arc(pad.x, pad.y, padRadius, 0, Math.PI * 2);
      context.fill();
    }
  }

  for (let index = 0; index < 14; index += 1) {
    let current = pickTracePoint(random);
    const segments = 3 + Math.floor(random() * 4);

    context.beginPath();
    context.moveTo(current.x, current.y);

    for (let segment = 0; segment < segments; segment += 1) {
      const horizontal = random() > 0.5;
      const direction = random() > 0.5 ? 1 : -1;
      const length = (1 + Math.floor(random() * 3)) * CIRCUIT_GRID_STEP;
      current = horizontal
        ? { x: clampToGrid(current.x + direction * length), y: current.y }
        : { x: current.x, y: clampToGrid(current.y + direction * length) };
      context.lineTo(current.x, current.y);
    }

    context.strokeStyle = CIRCUIT_TRACE_COLORS[Math.floor(random() * CIRCUIT_TRACE_COLORS.length)] ?? "#eef7ff";
    context.lineWidth = 4 + Math.floor(random() * 2);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();

    context.fillStyle = "rgba(255, 255, 255, 0.9)";
    context.beginPath();
    context.arc(current.x, current.y, 3 + random() * 2, 0, Math.PI * 2);
    context.fill();
  }

  for (let index = 0; index < 16; index += 1) {
    const point = pickTracePoint(random);
    context.fillStyle = "rgba(245, 251, 255, 0.9)";
    context.beginPath();
    context.arc(point.x, point.y, 2 + random() * 2, 0, Math.PI * 2);
    context.fill();
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
}

const FloatingFloorTile = memo(function FloatingFloorTile({
  animated,
  maxAnisotropy,
  theme,
  x,
  y,
}: {
  animated: boolean;
  maxAnisotropy: number;
  theme: "dark" | "light";
  x: number;
  y: number;
}) {
  const groupRef = useRef<Group>(null);
  const phase = x * 0.45 + y * 0.6;
  const floorStyle = theme === "light" ? LIGHT_FLOOR_STYLE : DARK_FLOOR_STYLE;
  const circuitTexture = useMemo(
    () => (animated ? createCircuitTexture(hashCoordinateSeed(x, y), maxAnisotropy) : null),
    [animated, maxAnisotropy, x, y],
  );

  useEffect(() => {
    return () => {
      circuitTexture?.dispose();
    };
  }, [circuitTexture]);

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
        <meshStandardMaterial
          color={floorStyle.sideColor}
          metalness={0.02}
          opacity={floorStyle.sideOpacity}
          roughness={floorStyle.sideRoughness}
          transparent
        />
        <meshStandardMaterial
          color={floorStyle.sideColor}
          metalness={0.02}
          opacity={floorStyle.sideOpacity}
          roughness={floorStyle.sideRoughness}
          transparent
        />
        <meshStandardMaterial
          color={floorStyle.topColor}
          metalness={0.01}
          opacity={floorStyle.topOpacity}
          roughness={floorStyle.topRoughness}
          transparent
        />
        <meshStandardMaterial
          color={floorStyle.undershadowColor}
          metalness={0.03}
          opacity={floorStyle.undershadowOpacity}
          roughness={floorStyle.undershadowRoughness}
          transparent
        />
        <meshStandardMaterial
          color={floorStyle.sideColor}
          metalness={0.02}
          opacity={floorStyle.sideOpacity}
          roughness={floorStyle.sideRoughness}
          transparent
        />
        <meshStandardMaterial
          color={floorStyle.sideColor}
          metalness={0.02}
          opacity={floorStyle.sideOpacity}
          roughness={floorStyle.sideRoughness}
          transparent
        />
        <Edges color={floorStyle.edgeColor} scale={1} threshold={15} />
      </mesh>
      {animated && circuitTexture ? (
        <mesh position={[0, 0.056, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.92, 1.92]} />
          <meshBasicMaterial
            color={floorStyle.edgeColor}
            alphaMap={circuitTexture}
            depthWrite={false}
            opacity={floorStyle.circuitOpacity}
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
            toneMapped={false}
            transparent
          />
        </mesh>
      ) : null}
    </group>
  );
});

function GridFloorInner({ level, theme }: { level: LevelDefinition; theme: "dark" | "light" }) {
  const { gl } = useThree();
  const { minX, maxX, minY, maxY } = getBoardMetrics(level);
  const padding = 2;
  const maxAnisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
  const tiles = useMemo(() => {
    const floorTiles = [];
    const occupiedTiles = new Set(level.board.map((tile) => `${tile.x},${tile.y}`));

    for (let x = minX - padding; x <= maxX + padding; x += 1) {
      for (let y = minY - padding; y <= maxY + padding; y += 1) {
        floorTiles.push(
          <FloatingFloorTile
            animated={!occupiedTiles.has(`${x},${y}`)}
            key={`${x},${y}`}
            maxAnisotropy={maxAnisotropy}
            theme={theme}
            x={x}
            y={y}
          />,
        );
      }
    }

    return floorTiles;
  }, [level.board, maxAnisotropy, maxX, maxY, minX, minY, theme]);

  return <group>{tiles}</group>;
}

export const GridFloor = memo(
  GridFloorInner,
  (previousProps, nextProps) => previousProps.level === nextProps.level && previousProps.theme === nextProps.theme,
);
