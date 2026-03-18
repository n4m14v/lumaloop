/**
 * Comments:
 * - Encapsulates orbit, zoom, and pointer interaction state for the game canvas.
 * - GameCanvas stays focused on scene assembly while this hook owns camera input behavior.
 */

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";

import gsap from "gsap";

import {
  CAMERA_BASE_AZIMUTH,
  CAMERA_BASE_ELEVATION,
  CAMERA_MAX_ELEVATION,
  CAMERA_MIN_ELEVATION,
  CAMERA_ZOOM_MAX,
  CAMERA_ZOOM_MIN,
  CAMERA_ZOOM_STEP,
  DRAG_AZIMUTH_RADIANS_PER_PIXEL,
  DRAG_ELEVATION_RADIANS_PER_PIXEL,
  clamp,
} from "./constants";

interface OrbitCameraControlsOptions {
  isRotationLocked: boolean;
  levelId: string;
  quarterTurns: number;
}

export function useOrbitCameraControls({
  isRotationLocked,
  levelId,
  quarterTurns,
}: OrbitCameraControlsOptions) {
  const [orbitAzimuth, setOrbitAzimuth] = useState(CAMERA_BASE_AZIMUTH - quarterTurns * (Math.PI / 2));
  const [orbitElevation, setOrbitElevation] = useState(CAMERA_BASE_ELEVATION);
  const [zoom, setZoom] = useState(1);
  const dragStateRef = useRef<{
    pointerId: number;
    startAzimuth: number;
    startElevation: number;
    startX: number;
    startY: number;
  } | null>(null);
  const azimuthTweenRef = useRef<gsap.core.Tween | null>(null);
  const orbitAzimuthRef = useRef(orbitAzimuth);
  const orbitElevationRef = useRef(orbitElevation);
  const previousQuarterTurnsRef = useRef(quarterTurns);

  function setAzimuth(angle: number) {
    orbitAzimuthRef.current = angle;
    setOrbitAzimuth(angle);
  }

  function setElevation(angle: number) {
    const clampedElevation = clamp(angle, CAMERA_MIN_ELEVATION, CAMERA_MAX_ELEVATION);
    orbitElevationRef.current = clampedElevation;
    setOrbitElevation(clampedElevation);
  }

  function animateAzimuth(targetAngle: number, duration: number) {
    azimuthTweenRef.current?.kill();
    const state = { value: orbitAzimuthRef.current };

    azimuthTweenRef.current = gsap.to(state, {
      duration,
      ease: "power2.out",
      onUpdate: () => {
        setAzimuth(state.value);
      },
      value: targetAngle,
    });
  }

  function resetView(duration = 0.28) {
    dragStateRef.current = null;
    setElevation(CAMERA_BASE_ELEVATION);
    setZoom(1);
    animateAzimuth(CAMERA_BASE_AZIMUTH, duration);
  }

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault();
    setZoom((currentZoom) => clamp(currentZoom + event.deltaY * CAMERA_ZOOM_STEP, CAMERA_ZOOM_MIN, CAMERA_ZOOM_MAX));
  }

  useEffect(() => {
    const deltaTurns = quarterTurns - previousQuarterTurnsRef.current;
    previousQuarterTurnsRef.current = quarterTurns;
    if (deltaTurns === 0 || dragStateRef.current) {
      return;
    }

    animateAzimuth(orbitAzimuthRef.current - deltaTurns * (Math.PI / 2), 0.24);
  }, [quarterTurns]);

  useEffect(() => {
    previousQuarterTurnsRef.current = quarterTurns;
    resetView(0.24);
  }, [levelId]);

  useEffect(() => {
    const root = document.documentElement;
    const parallaxX = Math.sin(orbitAzimuth) * 28;
    const parallaxY = (orbitElevation - CAMERA_BASE_ELEVATION) * -42;

    root.style.setProperty("--space-parallax-x", `${parallaxX.toFixed(2)}px`);
    root.style.setProperty("--space-parallax-y", `${parallaxY.toFixed(2)}px`);

    return () => {
      root.style.setProperty("--space-parallax-x", "0px");
      root.style.setProperty("--space-parallax-y", "0px");
    };
  }, [orbitAzimuth, orbitElevation]);

  useEffect(() => {
    if (!isRotationLocked) {
      return;
    }

    dragStateRef.current = null;
  }, [isRotationLocked]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || isRotationLocked) {
      return;
    }

    azimuthTweenRef.current?.kill();
    dragStateRef.current = {
      pointerId: event.pointerId,
      startAzimuth: orbitAzimuthRef.current,
      startElevation: orbitElevationRef.current,
      startX: event.clientX,
      startY: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const nextAzimuth = dragState.startAzimuth + (event.clientX - dragState.startX) * DRAG_AZIMUTH_RADIANS_PER_PIXEL;
    const nextElevation =
      dragState.startElevation + (event.clientY - dragState.startY) * DRAG_ELEVATION_RADIANS_PER_PIXEL;
    setAzimuth(nextAzimuth);
    setElevation(nextElevation);
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return {
    canvasInteractionProps: {
      onPointerCancel: handlePointerEnd,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onWheel: handleWheel,
    },
    cursorClassName: isRotationLocked ? "cursor-default" : "cursor-grab active:cursor-grabbing",
    orbitAzimuth,
    orbitElevation,
    zoom,
  };
}
