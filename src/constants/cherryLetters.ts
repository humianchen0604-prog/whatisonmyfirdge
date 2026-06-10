/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlaceBounds, computeMagnetWidth } from "../utils/placeCollision";
import { computeDoorScale, scalePx } from "./viewportScale";
import C from "../../assets/Decor/C.png";
import E from "../../assets/Decor/E.png";
import H from "../../assets/Decor/H.png";
import R1 from "../../assets/Decor/R1.png";
import R2 from "../../assets/Decor/R2.png";
import Y from "../../assets/Decor/Y.png";

export const CHERRY_LETTERS_OBSTACLE_ID = "__cherry-letters__";
export const CHERRY_LETTER_GAP_PT = 1;
const BASE_LETTERS_OFFSET = 20;
const BASE_OBSTACLE_MARGIN = 10;
const TYPICAL_MAGNET_HEIGHT_RATIO = 1.08;
const CHERRY_LETTER_HEIGHT_SCALE = 0.45;
const LETTER_WIDTH_RATIO = 54 / 52;

export const CHERRY_LETTER_IMAGES = [
  { char: "C", src: C },
  { char: "H", src: H },
  { char: "E", src: E },
  { char: "R", src: R1 },
  { char: "R", src: R2 },
  { char: "Y", src: Y },
] as const;

export interface CherryLetterMetrics {
  height: number;
  width: number;
  gapPx: number;
  offset: number;
}

export function computeCherryLetterMetrics(
  canvasWidth: number,
  canvasHeight: number,
  placeCount: number
): CherryLetterMetrics {
  const scale = computeDoorScale(canvasWidth, canvasHeight);
  const gapPx = scalePx(CHERRY_LETTER_GAP_PT * (96 / 72), scale);
  const offset = scalePx(BASE_LETTERS_OFFSET, scale);

  if (canvasWidth === 0 || canvasHeight === 0) {
    return {
      height: Math.round(52 * CHERRY_LETTER_HEIGHT_SCALE * scale),
      width: Math.round(54 * CHERRY_LETTER_HEIGHT_SCALE * scale),
      gapPx,
      offset,
    };
  }

  const magnetWidth = computeMagnetWidth(canvasWidth, canvasHeight, placeCount);
  const typicalMagnetHeight = magnetWidth * TYPICAL_MAGNET_HEIGHT_RATIO;
  const heightFromDoor = canvasHeight * 0.09;
  const blendedMagnetHeight =
    typicalMagnetHeight * 0.88 + heightFromDoor * 0.12;

  const height = Math.round(blendedMagnetHeight * CHERRY_LETTER_HEIGHT_SCALE);
  const width = Math.round(height * LETTER_WIDTH_RATIO);

  return { height, width, gapPx, offset };
}

export function getCherryLetterObstacles(
  canvasWidth: number,
  canvasHeight: number,
  placeCount: number
): PlaceBounds[] {
  const { height, width, gapPx, offset } = computeCherryLetterMetrics(
    canvasWidth,
    canvasHeight,
    placeCount
  );
  const margin = scalePx(
    BASE_OBSTACLE_MARGIN,
    computeDoorScale(canvasWidth, canvasHeight)
  );
  let x = offset;

  return CHERRY_LETTER_IMAGES.map((letter, index) => {
    const bounds: PlaceBounds = {
      id: `${CHERRY_LETTERS_OBSTACLE_ID}-${index}`,
      x: x - margin,
      y: offset - margin,
      width: width + margin * 2,
      height: height + margin * 2,
    };
    x += width + gapPx;
    return bounds;
  });
}
