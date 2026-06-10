/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Reference top-door canvas at a comfortable desktop viewport. */
export const REFERENCE_DOOR_WIDTH = 1200;
export const REFERENCE_DOOR_HEIGHT = 800;

/** Phone / narrow viewport (~390px and similar). */
export const COMPACT_VIEWPORT_MAX_WIDTH = 480;
export const TOP_DOOR_HEIGHT_VH_DESKTOP = 80;
export const TOP_DOOR_HEIGHT_VH_COMPACT = 56;
export const COMPACT_DOOR_CANVAS_MAX_WIDTH = 340;

export function isCompactDoorCanvas(canvasWidth: number): boolean {
  return canvasWidth > 0 && canvasWidth <= COMPACT_DOOR_CANVAS_MAX_WIDTH;
}

export function computeDoorScale(width: number, height: number): number {
  if (width <= 0 || height <= 0) return 1;

  const widthScale = width / REFERENCE_DOOR_WIDTH;
  const heightScale = height / REFERENCE_DOOR_HEIGHT;
  const scale = Math.min(widthScale, heightScale);

  return Math.max(0.15, Math.min(1, scale));
}

export function scalePx(value: number, scale: number): number {
  return Math.round(value * scale);
}
