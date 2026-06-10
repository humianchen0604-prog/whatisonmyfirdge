/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import {
  CHERRY_LETTER_IMAGES,
  computeCherryLetterMetrics,
} from "../constants/cherryLetters";
import { useDoorCanvas } from "../context/DoorCanvasContext";
interface CherryLetterRowProps {
  placeCount?: number;
}

export default function CherryLetterRow({
  placeCount = 26,
}: CherryLetterRowProps) {
  const canvas = useDoorCanvas();

  const letterMetrics = useMemo(
    () =>
      computeCherryLetterMetrics(
        canvas.width,
        canvas.height,
        placeCount
      ),
    [canvas.width, canvas.height, placeCount]
  );

  if (canvas.width === 0) return null;

  return (
    <div
      id="cherry-letter-row"
      className="absolute z-30 pointer-events-none flex items-center"
      style={{
        top: letterMetrics.offset,
        left: letterMetrics.offset,
        gap: letterMetrics.gapPx,
      }}
    >
      {CHERRY_LETTER_IMAGES.map((letter, index) => (
        <img
          key={`${letter.char}-${index}`}
          src={letter.src}
          alt={letter.char}
          className="object-contain"
          style={{
            height: letterMetrics.height,
            width: letterMetrics.width,
            objectFit: "contain",
            filter: "drop-shadow(2px 3px 4px rgba(0, 0, 0, 0.15))",
          }}
        />
      ))}
    </div>
  );
}
