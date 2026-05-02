import { useEffect, useRef, useState } from "react";

import { PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";

import type { LevelDefinition, RobotState, TraceFrame } from "@lumaloop/engine";

import type { RobotColorId } from "../features/game/robotColors";
import { ROBOT_VICTORY_EMOTE_DELAY_MS } from "./Robot";
import { CameraRig } from "./game-canvas/CameraRig";
import { LevelScene } from "./game-canvas/LevelScene";
import { POVCamera } from "./game-canvas/POVCamera";
import { useOrbitCameraControls } from "./game-canvas/useOrbitCameraControls";

interface GameCanvasProps {
  activeFrame: TraceFrame | null;
  className?: string;
  committedActiveToggleGroups: string[];
  committedRobot: RobotState;
  failurePulse: boolean;
  failurePulseToken: object | null;
  isRotationLocked: boolean;
  litTargets: string[];
  level: LevelDefinition;
  onFrameComplete: () => void;
  onVictorySequenceComplete: () => void;
  playbackSpeed: number;
  quarterTurns: number;
  robotColorId: RobotColorId;
  victoryExpressionActive: boolean;
  showVictorySequence: boolean;
  isPovActive: boolean;
  isAutoRunning: boolean;
  onSceneReady?: (() => void) | undefined;
}

function SceneReadySignal({
  canvasCreated,
  onSceneReady,
}: {
  canvasCreated: boolean;
  onSceneReady?: (() => void) | undefined;
}) {
  const { active } = useProgress();
  const hasReportedReadyRef = useRef(false);

  useEffect(() => {
    if (!canvasCreated || active || hasReportedReadyRef.current || !onSceneReady) {
      return;
    }

    let frameOneId = 0;
    let frameTwoId = 0;

    frameOneId = window.requestAnimationFrame(() => {
      frameTwoId = window.requestAnimationFrame(() => {
        hasReportedReadyRef.current = true;
        onSceneReady();
      });
    });

    return () => {
      window.cancelAnimationFrame(frameOneId);
      window.cancelAnimationFrame(frameTwoId);
    };
  }, [active, canvasCreated, onSceneReady]);

  return null;
}

export function GameCanvas({
  activeFrame,
  className,
  committedActiveToggleGroups,
  committedRobot,
  failurePulse,
  failurePulseToken,
  isRotationLocked,
  litTargets,
  level,
  onFrameComplete,
  onVictorySequenceComplete,
  playbackSpeed,
  quarterTurns,
  robotColorId,
  victoryExpressionActive,
  showVictorySequence,
  isPovActive,
  isAutoRunning,
  onSceneReady,
}: GameCanvasProps) {
  const [victoryBeamActive, setVictoryBeamActive] = useState(showVictorySequence);
  const [canvasCreated, setCanvasCreated] = useState(false);
  const { canvasContainerRef, canvasInteractionProps, cursorClassName, orbitAzimuth, orbitElevation, zoom } =
    useOrbitCameraControls({
      isRotationLocked,
      levelId: level.id,
      quarterTurns,
    });
  
  // Refs for POV Camera to follow the robot
  const robotRootRef = useRef<import("three").Group>(null);
  const robotModelRef = useRef<import("three").Group>(null);

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

  return (
    <div
      className={`${className ?? "relative h-[420px] w-full overflow-hidden md:h-[640px]"} ${cursorClassName}`}
      data-onboarding="game-board"
      ref={canvasContainerRef}
      style={{ touchAction: "none" }}
      {...canvasInteractionProps}
    >
      <Canvas
        dpr={[1, 1.25]}
        gl={{ alpha: true, powerPreference: "high-performance" }}
        onCreated={() => setCanvasCreated(true)}
      >
        <SceneReadySignal canvasCreated={canvasCreated} onSceneReady={onSceneReady} />
        {!isPovActive && <PerspectiveCamera makeDefault far={100} fov={28} near={0.1} position={[14, 12, 14]} />}
        {!isPovActive && <CameraRig elevation={orbitElevation} level={level} orbitAngle={orbitAzimuth} zoom={zoom} />}
        <POVCamera isActive={isPovActive} robotRef={robotRootRef} modelRef={robotModelRef} activeCommand={activeFrame?.command ?? null} />
        <ambientLight color="#ffffff" intensity={1.15} />
        <directionalLight color="#ffffff" intensity={1.05} position={[5, 9, 6]} />
        <directionalLight color="#ffffff" intensity={0.7} position={[-4, 6, -3]} />
        <hemisphereLight args={["#fff6d8", "#8d99aa", 0.82]} />
        <pointLight
          color="#ffef40"
          intensity={litTargets.length > 0 ? 1.9 : 0.14}
          position={[2, 3, 2]}
          distance={6}
        />
        <LevelScene
          activeFrame={activeFrame}
          committedActiveToggleGroups={committedActiveToggleGroups}
          committedRobot={committedRobot}
          failurePulse={failurePulse}
          failurePulseToken={failurePulseToken}
          litTargets={litTargets}
          level={level}
          onFrameComplete={onFrameComplete}
          onVictorySequenceComplete={onVictorySequenceComplete}
          playbackSpeed={playbackSpeed}
          robotColorId={robotColorId}
          victoryExpressionActive={victoryExpressionActive}
          showVictorySequence={showVictorySequence}
          victoryBeamActive={victoryBeamActive}
          robotRootRef={robotRootRef}
          robotModelRef={robotModelRef}
          isAutoRunning={isAutoRunning}
        />
      </Canvas>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,transparent_0%,transparent_58%,rgba(2,6,14,0.22)_100%)]"
      />
    </div>
  );
}
