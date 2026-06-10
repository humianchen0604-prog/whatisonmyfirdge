/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlaceBounds } from "../utils/placeCollision";
import { computeDoorScale, scalePx } from "./viewportScale";

export const POLAROID_OBSTACLE_ID = "__corner-polaroid__";

const BASE_FRAME_WIDTH = 176;
const BASE_SIZE_SCALE = 0.8;
const POLAROID_SIZE_BOOST = 1.15;
const BASE_ANCHOR_OFFSET = 20;
const BASE_OBSTACLE_MARGIN = 14;
const BASE_MATCHA_SIZE = Math.round(26 * 1.4);
const BASE_LEAVES_SIZE = Math.round(26 * 1.4);

export interface PolaroidLayout {
  anchorOffset: number;
  frameWidth: number;
  framePadding: number;
  captionHeight: number;
  photoSize: number;
  frameHeight: number;
  obstacleMargin: number;
  matchaLatteSize: number;
  matchaLatteOffsetRight: number;
  greenLeavesSize: number;
  greenLeavesOffsetLeft: number;
  greenLeavesOffsetDown: number;
}

export function computePolaroidLayout(
  canvasWidth: number,
  canvasHeight: number
): PolaroidLayout {
  const scale = computeDoorScale(canvasWidth, canvasHeight);

  const frameWidth = scalePx(
    BASE_FRAME_WIDTH * BASE_SIZE_SCALE * POLAROID_SIZE_BOOST,
    scale
  );
  const framePadding = scalePx(
    12 * BASE_SIZE_SCALE * POLAROID_SIZE_BOOST,
    scale
  );
  const captionHeight = scalePx(
    48 * BASE_SIZE_SCALE * POLAROID_SIZE_BOOST,
    scale
  );
  const photoSize = frameWidth - framePadding * 2;
  const frameHeight = framePadding + photoSize + captionHeight;
  const matchaLatteSize = scalePx(
    BASE_MATCHA_SIZE * 1.4 * POLAROID_SIZE_BOOST,
    scale
  );
  const greenLeavesSize = scalePx(
    BASE_LEAVES_SIZE * 0.7 * POLAROID_SIZE_BOOST,
    scale
  );

  return {
    anchorOffset: scalePx(BASE_ANCHOR_OFFSET, scale),
    frameWidth,
    framePadding,
    captionHeight,
    photoSize,
    frameHeight,
    obstacleMargin: scalePx(BASE_OBSTACLE_MARGIN, scale),
    matchaLatteSize,
    matchaLatteOffsetRight: Math.round(matchaLatteSize * 0.4),
    greenLeavesSize,
    greenLeavesOffsetLeft: Math.round(greenLeavesSize * 0.4),
    greenLeavesOffsetDown: Math.round(greenLeavesSize * 0.2),
  };
}

export function getPolaroidPosition(
  canvasWidth: number,
  canvasHeight: number
): { left: number; top: number } {
  const layout = computePolaroidLayout(canvasWidth, canvasHeight);

  return {
    left: canvasWidth - layout.anchorOffset - layout.frameWidth,
    top: Math.round((canvasHeight - layout.frameHeight) / 2),
  };
}

export function getPolaroidBounds(
  canvasWidth: number,
  canvasHeight: number
): PlaceBounds {
  const layout = computePolaroidLayout(canvasWidth, canvasHeight);
  const { left, top } = getPolaroidPosition(canvasWidth, canvasHeight);
  const margin = layout.obstacleMargin;

  return {
    id: POLAROID_OBSTACLE_ID,
    x: left - margin - layout.greenLeavesOffsetLeft,
    y: top - margin,
    width:
      layout.frameWidth +
      margin * 2 +
      layout.matchaLatteOffsetRight +
      layout.greenLeavesOffsetLeft,
    height: layout.frameHeight + margin * 2 + layout.greenLeavesOffsetDown,
  };
}
