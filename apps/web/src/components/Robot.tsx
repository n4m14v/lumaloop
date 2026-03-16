import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { AnimationMixer, Color, LoopOnce, LoopRepeat } from "three";
import type { AnimationAction, AnimationClip, Group, Material, MeshBasicMaterial, Object3D, PointLight } from "three";

import type { RobotState, TraceFrame } from "@lumaloop/engine";
import { ROBOT_PALETTES, type RobotColorId } from "../features/game/robotColors";

const TILE_SIZE = 2.4;
const BLOCK_HEIGHT = 1.1;
const MODEL_FOOT_OFFSET = 0.08;
const MODEL_URL = "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb";
const MODEL_SCALE = 0.42;
const DEFAULT_SURPRISE_INFLUENCE = 0.2;
const FORWARD_MOVE_DURATION = 0.98;
const FORWARD_WALK_TIME_SCALE = 1.1;
export const ROBOT_VICTORY_EMOTE_DELAY_MS = 900;
export const ROBOT_VICTORY_BEAM_EXIT_START_SECONDS = 1.46;
export const ROBOT_VICTORY_BEAM_EXIT_DURATION_SECONDS = 1.2;
export const ROBOT_VICTORY_BEAM_FADE_PORTION = 0.72;
export const ROBOT_VICTORY_BOT_FLOAT_START_SECONDS = 0.12;
export const ROBOT_VICTORY_BOT_FLOAT_DURATION_SECONDS = 1;
export const ROBOT_VICTORY_POPUP_DELAY_MS = 200;

type RobotProps = {
  activeFrame: TraceFrame | null;
  colorId: RobotColorId;
  failurePulse: boolean;
  failurePulseToken: object | null;
  litTargets: string[];
  onFrameComplete: () => void;
  onVictorySequenceComplete: () => void;
  robot: RobotState;
  victorySequenceActive: boolean;
};

function toWorldPosition(robot: RobotState) {
  return [
    robot.x * TILE_SIZE,
    (robot.z + 1) * BLOCK_HEIGHT + MODEL_FOOT_OFFSET,
    robot.y * TILE_SIZE,
  ] as const;
}

function toFacingRotation(facing: RobotState["facing"]) {
  switch (facing) {
    case "N":
      return Math.PI;
    case "E":
      return Math.PI / 2;
    case "S":
      return 0;
    case "W":
      return -Math.PI / 2;
  }
}

function getShortestRotationTarget(current: number, target: number) {
  let delta = target - current;

  while (delta > Math.PI) {
    delta -= Math.PI * 2;
  }

  while (delta < -Math.PI) {
    delta += Math.PI * 2;
  }

  return current + delta;
}

function isMeshLike(
  object: Object3D,
): object is Object3D & {
  castShadow: boolean;
  frustumCulled: boolean;
  material: Material | Material[];
  receiveShadow: boolean;
} {
  return "isMesh" in object && object.isMesh === true && "material" in object;
}

function findClip(clips: AnimationClip[], candidates: string[]) {
  if (clips.length === 0) {
    return null;
  }

  const normalizedCandidates = candidates.map((candidate) => candidate.toLowerCase());

  for (const candidate of normalizedCandidates) {
    const exact = clips.find((clip) => clip.name.toLowerCase() === candidate);
    if (exact) {
      return exact;
    }
  }

  for (const candidate of normalizedCandidates) {
    const partial = clips.find((clip) => clip.name.toLowerCase().includes(candidate));
    if (partial) {
      return partial;
    }
  }

  return null;
}

function setEmissive(material: Material, intensity: number) {
  if (!("emissiveIntensity" in material)) {
    return;
  }

  material.emissiveIntensity = intensity;
}

function supportsOpacity(material: Material): material is Material & { opacity: number; transparent: boolean } {
  return "opacity" in material && "transparent" in material;
}

function supportsColor(material: Material): material is Material & { color: Color } {
  return "color" in material && material.color instanceof Color;
}

type MorphCapableObject = Object3D & {
  morphTargetDictionary?: Record<string, number>;
  morphTargetInfluences?: number[];
};

type MorphBinding = {
  index: number;
  influences: number[];
};

function isMorphCapableObject(object: Object3D): object is MorphCapableObject {
  return "morphTargetDictionary" in object && "morphTargetInfluences" in object;
}

function setMorphInfluence(bindings: MorphBinding[], value: number) {
  for (const morph of bindings) {
    morph.influences[morph.index] = value;
  }
}

export function Robot({
  activeFrame,
  colorId,
  failurePulse,
  failurePulseToken,
  litTargets,
  onFrameComplete,
  onVictorySequenceComplete,
  robot,
  victorySequenceActive,
}: RobotProps) {
  const rootRef = useRef<Group>(null);
  const modelRef = useRef<Group>(null);
  const shadowRef = useRef<MeshBasicMaterial>(null);
  const statusLightRef = useRef<PointLight>(null);
  const failureLightRef = useRef<PointLight>(null);
  const activeActionRef = useRef<AnimationAction | null>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionCacheRef = useRef<Map<string, AnimationAction>>(new Map());
  const emissiveMaterialsRef = useRef<Material[]>([]);
  const fadeMaterialsRef = useRef<Array<Material & { opacity: number; transparent: boolean }>>([]);
  const tintMaterialsRef = useRef<Array<{ material: Material & { color: Color }; originalColor: Color }>>([]);
  const surpriseMorphsRef = useRef<MorphBinding[]>([]);
  const onFrameCompleteRef = useRef(onFrameComplete);
  const onVictorySequenceCompleteRef = useRef(onVictorySequenceComplete);
  const { scene, animations } = useGLTF(MODEL_URL);
  const clonedScene = useMemo(() => clone(scene), [scene]);
  const mixer = useMemo(() => new AnimationMixer(clonedScene), [clonedScene]);
  const palette = ROBOT_PALETTES[colorId];

  const animationSet = useMemo(
    () => ({
      celebrate: findClip(animations, ["dance", "celebrate"]),
      idle: findClip(animations, ["idle", "standing", "stand"]),
      jump: findClip(animations, ["jump"]),
      no: findClip(animations, ["no"]),
      sit: findClip(animations, ["sitting", "sit"]),
      walk: findClip(animations, ["walking", "walk", "running", "run"]),
    }),
    [animations],
  );

  useEffect(() => {
    onFrameCompleteRef.current = onFrameComplete;
  }, [onFrameComplete]);

  useEffect(() => {
    onVictorySequenceCompleteRef.current = onVictorySequenceComplete;
  }, [onVictorySequenceComplete]);

  useEffect(() => {
    mixerRef.current = mixer;
    actionCacheRef.current.clear();
    activeActionRef.current = null;

    return () => {
      mixer.stopAllAction();
      actionCacheRef.current.clear();
      activeActionRef.current = null;
      mixerRef.current = null;
    };
  }, [mixer]);

  useFrame((_, delta) => {
    mixer.update(delta);
  });

  function getAction(clip: AnimationClip | null) {
    if (!clip) {
      return null;
    }

    const cached = actionCacheRef.current.get(clip.name);
    if (cached) {
      return cached;
    }

    const action = mixer.clipAction(clip, clonedScene);
    actionCacheRef.current.set(clip.name, action);
    return action;
  }

  useEffect(() => {
    const emissiveMaterials: Material[] = [];
    const fadeMaterials: Array<Material & { opacity: number; transparent: boolean }> = [];
    const tintMaterials: Array<{ material: Material & { color: Color }; originalColor: Color }> = [];
    const surpriseMorphs: MorphBinding[] = [];

    clonedScene.traverse((child: Object3D) => {
      if (isMorphCapableObject(child) && child.morphTargetDictionary && child.morphTargetInfluences) {
        const surpriseIndex = Object.entries(child.morphTargetDictionary).find(([name]) =>
          name.toLowerCase().includes("surpris"),
        )?.[1];

        if (typeof surpriseIndex === "number") {
          surpriseMorphs.push({
            index: surpriseIndex,
            influences: child.morphTargetInfluences,
          });
        }
      }

      if (!isMeshLike(child)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;
      child.frustumCulled = false;

      const isMultiMaterial = Array.isArray(child.material);
      const sourceMaterials: Material[] = isMultiMaterial ? [...(child.material as Material[])] : [child.material as Material];
      const materials = sourceMaterials.map((material: Material) => material.clone());
      child.material = isMultiMaterial ? materials : materials[0]!;

      for (const material of materials) {
        if ("emissiveIntensity" in material) {
          emissiveMaterials.push(material);
        }
        if (supportsOpacity(material)) {
          material.transparent = true;
          fadeMaterials.push(material);
        }
        if (supportsColor(material)) {
          tintMaterials.push({ material, originalColor: material.color.clone() });
        }
      }
    });

    emissiveMaterialsRef.current = emissiveMaterials;
    fadeMaterialsRef.current = fadeMaterials;
    tintMaterialsRef.current = tintMaterials;
    surpriseMorphsRef.current = surpriseMorphs;
  }, [clonedScene]);

  useEffect(() => {
    const primary = new Color(palette.gltfPrimary);
    const accent = new Color(palette.gltfAccent);

    for (const { material, originalColor } of tintMaterialsRef.current) {
      const hsl = { h: 0, s: 0, l: 0 };
      originalColor.getHSL(hsl);

      if (hsl.l < 0.14 || hsl.s < 0.08) {
        material.color.copy(originalColor);
        continue;
      }

      if (hsl.h > 0.04 && hsl.h < 0.16 && hsl.s > 0.18) {
        material.color.lerpColors(originalColor, primary, 0.92);
        continue;
      }

      if (hsl.h > 0.08 && hsl.h < 0.18 && hsl.l > 0.55) {
        material.color.lerpColors(originalColor, accent, 0.45);
        continue;
      }

      material.color.copy(originalColor);
    }
  }, [palette]);

  useEffect(() => {
    setMorphInfluence(surpriseMorphsRef.current, DEFAULT_SURPRISE_INFLUENCE);
  }, [clonedScene]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const [x, y, z] = toWorldPosition(robot);
    root.position.set(x, y, z);
    root.rotation.y = toFacingRotation(robot.facing);
  }, [robot]);

  useEffect(() => {
    const model = modelRef.current;
    if (!model) {
      return;
    }

    model.scale.setScalar(MODEL_SCALE);
  }, []);

  useEffect(() => {
    if (!statusLightRef.current) {
      return;
    }

    const statusLight = statusLightRef.current;
    const hasLitTargets = litTargets.length > 0;

    gsap.to(statusLight.color, {
      b: hasLitTargets ? 0.4 : 1,
      duration: 0.2,
      g: hasLitTargets ? 1 : 0.78,
      r: hasLitTargets ? 0.54 : 0.36,
    });
    gsap.to(statusLight, {
      duration: 0.2,
      intensity: hasLitTargets ? 1.4 : 0.7,
    });
  }, [litTargets]);

  useEffect(() => {
    const idleAction = getAction(animationSet.idle);
    if (!idleAction || activeFrame || failurePulse || victorySequenceActive) {
      return;
    }

    const previousAction = activeActionRef.current;
    if (previousAction && previousAction !== idleAction) {
      previousAction.fadeOut(0.12);
      previousAction.stop();
    }

    idleAction.enabled = true;
    idleAction.reset();
    idleAction.setLoop(LoopRepeat, Infinity);
    idleAction.timeScale = 1;
    idleAction.fadeIn(0.2).play();
    activeActionRef.current = idleAction;

    return () => {
      idleAction.fadeOut(0.2);
    };
  }, [activeFrame, animationSet.idle, failurePulse, victorySequenceActive]);

  useEffect(() => {
    if (!failurePulse || !failureLightRef.current) {
      return undefined;
    }

    const failureLight = failureLightRef.current;
    const materials = emissiveMaterialsRef.current;
    const timeline = gsap.timeline();
    const noAction = getAction(animationSet.no);

    if (noAction) {
      const previousAction = activeActionRef.current;
      if (previousAction && previousAction !== noAction) {
        previousAction.fadeOut(0.12);
      }

      noAction.enabled = true;
      noAction.reset();
      noAction.setLoop(LoopOnce, 2);
      noAction.clampWhenFinished = true;
      noAction.fadeIn(0.12).play();
      activeActionRef.current = noAction;
    }

    timeline.to(failureLight, { duration: 0.14, intensity: 2.1 });
    timeline.to(failureLight, { duration: 0.26, intensity: 0 }, 0.14);
    timeline.to(materials, { duration: 0.14, emissiveIntensity: 0.95 });
    timeline.to(materials, { duration: 0.22, emissiveIntensity: 0.2 }, 0.14);

    return () => {
      timeline.kill();
      failureLight.intensity = 0;
      if (noAction) {
        noAction.stop();
      }
      if (activeActionRef.current === noAction) {
        activeActionRef.current = null;
      }
      for (const material of materials) {
        setEmissive(material, 0.2);
      }
    };
  }, [animationSet.no, failurePulse, failurePulseToken]);

  useEffect(() => {
    if (!activeFrame || !rootRef.current || victorySequenceActive) {
      return undefined;
    }

    const root = rootRef.current;
    const [targetX, targetY, targetZ] = toWorldPosition(activeFrame.robotAfter);
    const targetRotation = getShortestRotationTarget(
      root.rotation.y,
      toFacingRotation(activeFrame.robotAfter.facing),
    );
    const movementDuration =
      activeFrame.command === "JUMP"
        ? 0.46
        : activeFrame.command === "FORWARD"
          ? FORWARD_MOVE_DURATION
          : activeFrame.command === "LIGHT"
            ? 0.44
            : 0.22;
    const nextClip =
      activeFrame.command === "FORWARD"
        ? animationSet.walk
        : activeFrame.command === "JUMP"
          ? animationSet.jump
          : activeFrame.command === "LIGHT"
            ? animationSet.sit ?? animationSet.idle
          : animationSet.idle;
    const nextAction = getAction(nextClip);

    if (nextAction) {
      const previousAction = activeActionRef.current;
      if (previousAction && previousAction !== nextAction) {
        previousAction.fadeOut(0.12);
      }

      nextAction.enabled = true;
      nextAction.reset();
      nextAction.setLoop(
        activeFrame.command === "JUMP" || activeFrame.command === "LIGHT" ? LoopOnce : LoopRepeat,
        activeFrame.command === "JUMP" || activeFrame.command === "LIGHT" ? 1 : Infinity,
      );
      nextAction.clampWhenFinished = activeFrame.command === "JUMP" || activeFrame.command === "LIGHT";
      nextAction.timeScale =
        activeFrame.command === "FORWARD" ? FORWARD_WALK_TIME_SCALE : activeFrame.command === "LIGHT" ? 2.1 : 1;
      nextAction.fadeIn(0.12).play();
      activeActionRef.current = nextAction;
    }

    const timeline = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        const idleAction = getAction(animationSet.idle);

        if (nextAction && nextAction !== idleAction) {
          nextAction.fadeOut(0.1);
        }

        if (idleAction) {
          idleAction.enabled = true;
          idleAction.reset();
          idleAction.setLoop(LoopRepeat, Infinity);
          idleAction.fadeIn(0.12).play();
          activeActionRef.current = idleAction;
        }

        onFrameCompleteRef.current();
      },
    });

    if (activeFrame.command === "FORWARD") {
      timeline.to(root.position, { duration: movementDuration, x: targetX, y: targetY, z: targetZ }, 0);
    } else if (activeFrame.command === "JUMP") {
      timeline.to(root.position, { duration: movementDuration, x: targetX, z: targetZ }, 0);
      timeline.to(root.position, { duration: movementDuration / 2, y: targetY + 0.92 }, 0);
      timeline.to(root.position, { duration: movementDuration / 2, y: targetY }, movementDuration / 2);
    } else if (activeFrame.command === "TURN_LEFT" || activeFrame.command === "TURN_RIGHT") {
      timeline.to(root.rotation, { duration: movementDuration, y: targetRotation }, 0);
    } else if (activeFrame.command === "LIGHT") {
      timeline.to({}, { duration: movementDuration }, 0);
    } else {
      timeline.to(root.position, { duration: 0.18, x: targetX, y: targetY, z: targetZ }, 0);
    }

    return () => {
      timeline.kill();
    };
  }, [activeFrame, animationSet.idle, animationSet.jump, animationSet.sit, animationSet.walk, victorySequenceActive]);

  useEffect(() => {
    const root = rootRef.current;
    const model = modelRef.current;
    const shadowMaterial = shadowRef.current;
    const surpriseMorphs = surpriseMorphsRef.current;

    if (!root || !model || !shadowMaterial) {
      return;
    }

    if (!victorySequenceActive) {
      gsap.set(root.scale, { x: 1, y: 1, z: 1 });
      gsap.set(root.rotation, { x: 0, y: toFacingRotation(robot.facing), z: 0 });
      gsap.set(model.scale, { x: MODEL_SCALE, y: MODEL_SCALE, z: MODEL_SCALE });
      gsap.set(shadowMaterial, { opacity: 0.2 });
      gsap.set(fadeMaterialsRef.current, { opacity: 1 });
      setMorphInfluence(surpriseMorphs, DEFAULT_SURPRISE_INFLUENCE);
      return;
    }

    const waveAction = getAction(findClip(animations, ["wave"]));
    const popupStartSeconds =
      ROBOT_VICTORY_EMOTE_DELAY_MS / 1000 +
      ROBOT_VICTORY_BOT_FLOAT_START_SECONDS +
      ROBOT_VICTORY_BOT_FLOAT_DURATION_SECONDS;

    const timeline = gsap.timeline({
      onComplete: () => {
        onVictorySequenceCompleteRef.current();
      },
    });

    if (waveAction) {
      timeline.call(() => {
        const previousAction = activeActionRef.current;
        if (previousAction && previousAction !== waveAction) {
          previousAction.fadeOut(0.16);
        }

        waveAction.enabled = true;
        waveAction.reset();
        waveAction.setLoop(LoopRepeat, Infinity);
        waveAction.fadeIn(0.16).play();
        activeActionRef.current = waveAction;
      }, [], ROBOT_VICTORY_EMOTE_DELAY_MS / 1000 + ROBOT_VICTORY_BOT_FLOAT_START_SECONDS);
    }

    if (surpriseMorphs.length > 0) {
      const surpriseState = { value: DEFAULT_SURPRISE_INFLUENCE };

      timeline.to(
        surpriseState,
        {
          duration: 0.14,
          ease: "power2.out",
          onUpdate: () => {
            setMorphInfluence(surpriseMorphs, surpriseState.value);
          },
          value: 1,
        },
        ROBOT_VICTORY_EMOTE_DELAY_MS / 1000,
      );
    }

    timeline.to(
      model.scale,
      { duration: 0.26, x: MODEL_SCALE * 0.95, y: MODEL_SCALE * 1.04, z: MODEL_SCALE * 0.95, ease: "power2.out" },
      ROBOT_VICTORY_EMOTE_DELAY_MS / 1000,
    );
    timeline.to(
      root.position,
      {
        duration: ROBOT_VICTORY_BOT_FLOAT_DURATION_SECONDS,
        ease: "power2.in",
        y: root.position.y + 13.5,
      },
      ROBOT_VICTORY_EMOTE_DELAY_MS / 1000 + ROBOT_VICTORY_BOT_FLOAT_START_SECONDS,
    );
    timeline.to(
      root.scale,
      {
        duration: ROBOT_VICTORY_BOT_FLOAT_DURATION_SECONDS,
        ease: "power2.inOut",
        x: 0.7,
        y: 0.7,
        z: 0.7,
      },
      ROBOT_VICTORY_EMOTE_DELAY_MS / 1000 + ROBOT_VICTORY_BOT_FLOAT_START_SECONDS,
    );
    timeline.to(
      root.rotation,
      {
        duration: ROBOT_VICTORY_BOT_FLOAT_DURATION_SECONDS,
        ease: "power2.in",
        x: 0,
        y: root.rotation.y,
        z: 0,
      },
      ROBOT_VICTORY_EMOTE_DELAY_MS / 1000 + ROBOT_VICTORY_BOT_FLOAT_START_SECONDS,
    );
    timeline.to(
      fadeMaterialsRef.current,
      {
        duration: ROBOT_VICTORY_BOT_FLOAT_DURATION_SECONDS * 0.28,
        ease: "sine.out",
        opacity: 0.68,
      },
      ROBOT_VICTORY_EMOTE_DELAY_MS / 1000 +
        ROBOT_VICTORY_BOT_FLOAT_START_SECONDS +
        ROBOT_VICTORY_BOT_FLOAT_DURATION_SECONDS * 0.5,
    );
    timeline.to(
      fadeMaterialsRef.current,
      {
        duration: ROBOT_VICTORY_BOT_FLOAT_DURATION_SECONDS * 0.22,
        ease: "power3.out",
        opacity: 0,
      },
      ROBOT_VICTORY_EMOTE_DELAY_MS / 1000 +
        ROBOT_VICTORY_BOT_FLOAT_START_SECONDS +
        ROBOT_VICTORY_BOT_FLOAT_DURATION_SECONDS * 0.78,
    );
    timeline.to(
      shadowMaterial,
      {
        duration: ROBOT_VICTORY_BOT_FLOAT_DURATION_SECONDS,
        ease: "power1.out",
        opacity: 0.02,
      },
      ROBOT_VICTORY_EMOTE_DELAY_MS / 1000 + ROBOT_VICTORY_BOT_FLOAT_START_SECONDS,
    );
    timeline.to(
      {},
      { duration: ROBOT_VICTORY_POPUP_DELAY_MS / 1000 },
      popupStartSeconds,
    );

    return () => {
      timeline.kill();
      setMorphInfluence(surpriseMorphs, DEFAULT_SURPRISE_INFLUENCE);
    };
  }, [animationSet.idle, animations, robot.facing, victorySequenceActive]);

  return (
    <group ref={rootRef}>
      <mesh position={[0, 0.02, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.62, 32]} />
        <meshBasicMaterial color="#05131d" opacity={0.2} ref={shadowRef} transparent />
      </mesh>
      <pointLight color="#5bc8ff" distance={5.5} intensity={0.7} position={[0, 1.8, 0.6]} ref={statusLightRef} />
      <pointLight color="#ff5656" distance={4} intensity={0} position={[0, 1.4, 0]} ref={failureLightRef} />
      <group ref={modelRef}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
