import { useEffect, useState, useRef } from "react";

import { PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

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
}: GameCanvasProps) {
  const [victoryBeamActive, setVictoryBeamActive] = useState(showVictorySequence);
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
      ref={canvasContainerRef}
      style={{ touchAction: "none" }}
      {...canvasInteractionProps}
    >
      <Canvas gl={{ alpha: true, powerPreference: "high-performance" }} dpr={[1, 1.25]}>
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
        <EffectComposer>
          <Bloom intensity={0.08} luminanceThreshold={0.96} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
