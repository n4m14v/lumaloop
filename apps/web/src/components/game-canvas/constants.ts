/**
 * Comments:
 * - Shared numeric constants and small math helpers for the 3D game canvas.
 * - Keeping them centralized reduces drift across camera, tile, and effect modules.
 */

export const TILE_SIZE = 2.4;
export const BLOCK_HEIGHT = 1.1;
export const DRAG_AZIMUTH_RADIANS_PER_PIXEL = (Math.PI / 2) / 260;
export const DRAG_ELEVATION_RADIANS_PER_PIXEL = (Math.PI / 4) / 260;
export const CAMERA_BASE_AZIMUTH = Math.PI / 4;
export const CAMERA_BASE_ELEVATION = 0.68;
export const CAMERA_MIN_ELEVATION = 0.34;
export const CAMERA_MAX_ELEVATION = 1.12;
export const CAMERA_ZOOM_MIN = 0.88;
export const CAMERA_ZOOM_MAX = 1.14;
export const CAMERA_ZOOM_STEP = 0.0009;
export const FAILURE_BLINK_RISE_DURATION = 0.24;
export const FAILURE_BLINK_HOLD_DURATION = 0.18;
export const FAILURE_BLINK_FALL_DURATION = 0.26;
export const FAILURE_BLINK_COUNT = 2;
export const LOW_TILE_FLOAT_AMPLITUDE = 0.18;
export const LOW_TILE_FLOAT_SPEED = 1.05;
export const LOW_TILE_FLOAT_BASE_LIFT = 0.08;

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
