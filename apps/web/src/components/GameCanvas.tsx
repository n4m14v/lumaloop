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
  quarterTurns: number;
  robotColorId: RobotColorId;
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
  quarterTurns,
  robotColorId,
  showVictorySequence,
  theme,
}: GameCanvasProps) {
  const [victoryBeamActive, setVictoryBeamActive] = useState(showVictorySequence);
  const { canvasInteractionProps, cursorClassName, orbitAzimuth, orbitElevation, zoom } = useOrbitCameraControls({
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
      style={{ touchAction: "none" }}
      {...canvasInteractionProps}
    >
      <Canvas gl={{ alpha: true }} dpr={[1, 1.5]}>
        <PerspectiveCamera makeDefault far={100} fov={28} near={0.1} position={[14, 12, 14]} />
        <CameraRig elevation={orbitElevation} level={level} orbitAngle={orbitAzimuth} zoom={zoom} />
        <ambientLight intensity={1.15} />
        <directionalLight intensity={1.05} position={[5, 9, 6]} />
        <directionalLight intensity={0.7} position={[-4, 6, -3]} />
        <hemisphereLight args={["#fff6d8", "#8d99aa", 0.82]} />
        <pointLight color="#7dff5c" intensity={litTargets.length > 0 ? 1.9 : 0.14} position={[2, 3, 2]} distance={6} />
        <LevelScene
          activeFrame={activeFrame}
          committedRobot={committedRobot}
          failurePulse={failurePulse}
          failurePulseToken={failurePulseToken}
          litTargets={litTargets}
          level={level}
          onFrameComplete={onFrameComplete}
          onVictorySequenceComplete={onVictorySequenceComplete}
          robotColorId={robotColorId}
          showVictorySequence={showVictorySequence}
          theme={theme}
          victoryBeamActive={victoryBeamActive}
        />
        <EffectComposer>
          <Bloom intensity={0.08} luminanceThreshold={0.96} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
