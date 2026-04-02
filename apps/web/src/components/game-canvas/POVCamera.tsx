import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3, Quaternion, MathUtils } from "three";
import type { Material } from "three";
import { PerspectiveCamera } from "@react-three/drei";
import type React from "react";

interface POVCameraProps {
  isActive: boolean;
  robotRef: React.RefObject<import("three").Group | null>;
  modelRef: React.RefObject<import("three").Group | null>;
  activeCommand?: string | null;
}

const MOUSE_SENSITIVITY = 0.0018;
const LOOK_SMOOTHING = 0.08;
const MAX_PITCH_UP = MathUtils.degToRad(58);   // upward look limit from home angle
const MAX_PITCH_DOWN = MathUtils.degToRad(22); // downward limit — prevents seeing inside the bot body
const MAX_YAW = MathUtils.degToRad(80);

// Home (resting) angles — camera starts here and drifts back here on pointer release
const HOME_YAW = 0;
const HOME_PITCH = -MAX_PITCH_DOWN; // bottom of usable range = "lowest possible" starting angle
const RETURN_SPEED = 0.025;         // drift-back speed (lower = slower/gentler)

// Head-bob parameters
const BOB_FREQ = 2.4;    // cycles per second while walking
const BOB_H_AMP = 0.045; // horizontal sway amplitude
const BOB_V_AMP = 0.022; // vertical bob amplitude

// Height animation parameters
const HEIGHT_STAND = 2.2;   // normal eye level
const HEIGHT_CROUCH = 1.35; // crouched eye level during ACTIVATE / sitting
const HEIGHT_LERP = 0.055;  // smoothing speed

// ---------- mesh classification helpers ----------

/** Meshes that must be completely hidden (camera passes through them) */
function isHiddenMesh(name: string) {
  return (
    name.includes("head")     ||
    name.includes("neck")     ||
    name.includes("eye")      ||
    name.includes("ear")      ||
    name.includes("body")     ||
    name.includes("torso")    ||
    name.includes("chest")    ||
    name.includes("spine")    ||
    name.includes("shoulder") ||
    name.includes("upperarm") ||
    name.includes("upper_arm")||
    name.includes("lowerarm") ||
    name.includes("lower_arm")||
    name.includes("forearm")
  );
}

/** Hand/finger meshes — left visible but rendered on top with no depth test */
function isHandMesh(name: string) {
  return (
    name.includes("hand")   ||
    name.includes("finger") ||
    name.includes("thumb")  ||
    name.includes("wrist")  ||
    name.includes("palm")
  );
}

type MaterialOverride = {
  material: Material;
  origDepthTest: boolean;
  origDepthWrite: boolean;
};

export function POVCamera({ isActive, robotRef, modelRef, activeCommand }: POVCameraProps) {
  const povCameraRef = useRef<any>(null);

  // Per-frame working objects (stable refs to avoid GC pressure)
  const targetPosition = useRef(new Vector3()).current;
  const baseQuat = useRef(new Quaternion()).current;
  const yawQuat = useRef(new Quaternion()).current;
  const pitchQuat = useRef(new Quaternion()).current;
  const yAxis = useRef(new Vector3(0, 1, 0)).current;
  const xAxis = useRef(new Vector3(1, 0, 0)).current;

  // Mouse look offsets (target & smoothed-current)
  const yawTarget = useRef(HOME_YAW);
  const pitchTarget = useRef(HOME_PITCH);
  const yawCurrent = useRef(HOME_YAW);
  const pitchCurrent = useRef(HOME_PITCH);

  // Time accumulator for head bob
  const bobTime = useRef(0);

  // Smoothly animated camera height & base pitch
  const currentHeight = useRef(HEIGHT_STAND);
  const currentBasePitch = useRef(-0.7);

  // Mesh override state — applied lazily on first frame where modelRef is ready
  const hiddenMeshesRef = useRef<import("three").Object3D[]>([]);
  const handOverridesRef = useRef<MaterialOverride[]>([]);
  const handObjectsRef = useRef<import("three").Object3D[]>([]);
  const meshSetupApplied = useRef(false);

  // ---------- pointer listeners ----------
  useEffect(() => {
    if (!isActive) {
      yawTarget.current = HOME_YAW;
      pitchTarget.current = HOME_PITCH;
      yawCurrent.current = HOME_YAW;
      pitchCurrent.current = HOME_PITCH;
      bobTime.current = 0;
      return;
    }

    function onPointerMove(e: PointerEvent) {
      yawTarget.current -= e.movementX * MOUSE_SENSITIVITY;
      pitchTarget.current -= e.movementY * MOUSE_SENSITIVITY;
      yawTarget.current = MathUtils.clamp(yawTarget.current, -MAX_YAW, MAX_YAW);
      pitchTarget.current = MathUtils.clamp(pitchTarget.current, HOME_PITCH, HOME_PITCH + MAX_PITCH_UP);
    }

    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [isActive]);

  // ---------- cleanup on deactivate ----------
  useEffect(() => {
    if (!isActive) {
      // Restore hidden meshes
      hiddenMeshesRef.current.forEach(m => { (m as any).visible = true; });
      hiddenMeshesRef.current = [];

      // Restore hand material overrides
      handOverridesRef.current.forEach(({ material, origDepthTest, origDepthWrite }) => {
        material.depthTest = origDepthTest;
        material.depthWrite = origDepthWrite;
      });
      handOverridesRef.current = [];

      // Restore hand render order
      handObjectsRef.current.forEach(obj => { (obj as any).renderOrder = 0; });
      handObjectsRef.current = [];

      meshSetupApplied.current = false;
    }
  }, [isActive]);

  useFrame((_, delta) => {
    if (!isActive || !povCameraRef.current || !robotRef.current) return;

    const cam = povCameraRef.current;
    const isWalking = activeCommand === "FORWARD";

    // ---------- lazy mesh setup (runs once when modelRef is ready) ----------
    if (!meshSetupApplied.current && modelRef.current) {
      modelRef.current.traverse((child: any) => {
        if (child.type !== "Mesh" && child.type !== "SkinnedMesh") return;
        const name = child.name.toLowerCase();

        if (isHiddenMesh(name)) {
          // Fully hide upper-body geometry that the camera clips through
          if (child.visible) {
            child.visible = false;
            hiddenMeshesRef.current.push(child);
          }
        } else if (isHandMesh(name)) {
          // Keep hands visible but render them on top without depth testing
          // so they never clip against the near plane or body geometry
          child.renderOrder = 999;
          handObjectsRef.current.push(child);

          const materials: Material[] = Array.isArray(child.material)
            ? child.material
            : [child.material];

          for (const mat of materials) {
            handOverridesRef.current.push({
              material: mat,
              origDepthTest: mat.depthTest,
              origDepthWrite: mat.depthWrite,
            });
            mat.depthTest = false;
            mat.depthWrite = false;
          }
        }
      });
      meshSetupApplied.current = true;
    }

    // ---------- look drift & smoothing ----------
    yawTarget.current = MathUtils.lerp(yawTarget.current, HOME_YAW, RETURN_SPEED);
    pitchTarget.current = MathUtils.lerp(pitchTarget.current, HOME_PITCH, RETURN_SPEED);
    yawCurrent.current = MathUtils.lerp(yawCurrent.current, yawTarget.current, LOOK_SMOOTHING);
    pitchCurrent.current = MathUtils.lerp(pitchCurrent.current, pitchTarget.current, LOOK_SMOOTHING);

    // ---------- head-bob ----------
    bobTime.current += delta * BOB_FREQ * Math.PI * 2;
    const bobH = isWalking ? Math.sin(bobTime.current) * BOB_H_AMP : 0;
    const bobV = isWalking ? Math.abs(Math.sin(bobTime.current)) * BOB_V_AMP : 0;

    // ---------- height & pitch animation ----------
    const isSitting = activeCommand === "ACTIVATE";
    const heightTarget = isSitting ? HEIGHT_CROUCH : HEIGHT_STAND;
    const basePitchTarget = isSitting ? -0.4 : -0.7;
    currentHeight.current = MathUtils.lerp(currentHeight.current, heightTarget, HEIGHT_LERP);
    currentBasePitch.current = MathUtils.lerp(currentBasePitch.current, basePitchTarget, HEIGHT_LERP);

    // ---------- camera position & rotation ----------
    robotRef.current.getWorldPosition(targetPosition);
    targetPosition.y += currentHeight.current + bobV;

    baseQuat.copy(robotRef.current.quaternion);
    baseQuat.multiply(new Quaternion().setFromAxisAngle(yAxis, Math.PI));

    yawQuat.setFromAxisAngle(yAxis, yawCurrent.current);
    pitchQuat.setFromAxisAngle(xAxis, pitchCurrent.current + currentBasePitch.current);

    const finalQuat = baseQuat.multiply(yawQuat).multiply(pitchQuat);
    cam.quaternion.copy(finalQuat);
    cam.position.copy(targetPosition);

    cam.translateX(bobH);
    cam.translateZ(-1.1);
    cam.updateProjectionMatrix();
  });

  return (
    <PerspectiveCamera
      ref={povCameraRef}
      fov={90}
      near={0.45}
      far={100}
      makeDefault={isActive}
    />
  );
}
