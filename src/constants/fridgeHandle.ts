/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlaceBounds } from "../utils/placeCollision";
import {
  computeDoorScale,
  isCompactDoorCanvas,
  scalePx,
} from "./viewportScale";

export const FRIDGE_HANDLE_OBSTACLE_ID = "__fridge-handle__";
export const FRIDGE_HANDLE_HEIGHT_RATIO = 0.35;
const COMPACT_HANDLE_HEIGHT_RATIO = 0.28;
const BASE_HANDLE_OFFSET = 14;
const COMPACT_HANDLE_OFFSET = 10;
const BASE_OBSTACLE_MARGIN = 8;
const HANDLE_ASPECT_RATIO = 605 / 3647;

function getHandleHeightRatio(canvasWidth: number): number {
  return isCompactDoorCanvas(canvasWidth)
    ? COMPACT_HANDLE_HEIGHT_RATIO
    : FRIDGE_HANDLE_HEIGHT_RATIO;
}

export interface FridgeHandleMetrics {
  left: number;
  bottom: number;
  width: number;
  height: number;
}

export function computeFridgeHandleMetrics(
  canvasWidth: number,
  canvasHeight: number
): Pick<FridgeHandleMetrics, "width" | "height"> {
  const height = Math.round(
    canvasHeight * getHandleHeightRatio(canvasWidth)
  );
  const width = Math.round(height * HANDLE_ASPECT_RATIO);
  return { height, width };
}

export function getFridgeHandlePosition(
  canvasWidth: number,
  canvasHeight: number
): FridgeHandleMetrics {
  const scale = computeDoorScale(canvasWidth, canvasHeight);
  const { height, width } = computeFridgeHandleMetrics(canvasWidth, canvasHeight);
  const baseOffset = isCompactDoorCanvas(canvasWidth)
    ? COMPACT_HANDLE_OFFSET
    : BASE_HANDLE_OFFSET;
  const offset = scalePx(baseOffset, scale);

  return {
    left: offset,
    bottom: offset,
    width,
    height,
  };
}

export function getFridgeHandleBounds(
  canvasWidth: number,
  canvasHeight: number
): PlaceBounds {
  const scale = computeDoorScale(canvasWidth, canvasHeight);
  const { height, width } = computeFridgeHandleMetrics(canvasWidth, canvasHeight);
  const margin = scalePx(BASE_OBSTACLE_MARGIN, scale);
  const baseOffset = isCompactDoorCanvas(canvasWidth)
    ? COMPACT_HANDLE_OFFSET
    : BASE_HANDLE_OFFSET;
  const offset = scalePx(baseOffset, scale);
  const left = offset;
  const top = canvasHeight - offset - height;

  return {
    id: FRIDGE_HANDLE_OBSTACLE_ID,
    x: left - margin,
    y: top - margin,
    width: width + margin * 2,
    height: height + margin * 2,
  };
}
