import { useEffect, useState } from "react";

import { PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

import type { LevelDefinition, RobotState, TraceFrame } from "@lumaloop/engine";

import type { RobotColorId } from "../features/game/robotColors";
import { ROBOT_VICTORY_EMOTE_DELAY_MS } from "./Robot";
import { CameraRig } from "./game-canvas/CameraRig";
import { LevelScene } from "./game-canvas/LevelScene";
import { useOrbitCameraControls } from "./game-canvas/useOrbitCameraControls";

interface GameCanvasProps {
  activeFrame: TraceFrame | null;
  className?: string;
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
  theme: "dark" | "light";
}

export function GameCanvas({
  activeFrame,
  className,
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
  theme,
}: GameCanvasProps) {
  const [victoryBeamActive, setVictoryBeamActive] = useState(showVictorySequence);
  const isLightTheme = theme === "light";
  const { canvasContainerRef, canvasInteractionProps, cursorClassName, orbitAzimuth, orbitElevation, zoom } =
    useOrbitCameraControls({
      isRotationLocked,
      levelId: level.id,
      quarterTurns,
    });

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
        <PerspectiveCamera makeDefault far={100} fov={28} near={0.1} position={[14, 12, 14]} />
        <CameraRig elevation={orbitElevation} level={level} orbitAngle={orbitAzimuth} zoom={zoom} />
        <ambientLight color={isLightTheme ? "#f4f7fb" : "#ffffff"} intensity={isLightTheme ? 0.58 : 1.15} />
        <directionalLight color={isLightTheme ? "#fff4e6" : "#ffffff"} intensity={isLightTheme ? 0.96 : 1.05} position={[5, 9, 6]} />
        <directionalLight color={isLightTheme ? "#dbe8f5" : "#ffffff"} intensity={isLightTheme ? 0.28 : 0.7} position={[-4, 6, -3]} />
        <hemisphereLight args={isLightTheme ? ["#edf3f9", "#b3bfca", 0.24] : ["#fff6d8", "#8d99aa", 0.82]} />
        <pointLight
          color={isLightTheme ? "#ffd700" : "#ffef40"}
          intensity={litTargets.length > 0 ? (isLightTheme ? 0.44 : 1.9) : isLightTheme ? 0.03 : 0.14}
          position={[2, 3, 2]}
          distance={isLightTheme ? 4.2 : 6}
        />
        <LevelScene
          activeFrame={activeFrame}
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
          theme={theme}
          victoryBeamActive={victoryBeamActive}
        />
        <EffectComposer>
          <Bloom intensity={isLightTheme ? 0.012 : 0.08} luminanceThreshold={isLightTheme ? 1 : 0.96} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
