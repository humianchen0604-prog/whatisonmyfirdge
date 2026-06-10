/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import handleUrl from "../../assets/Decor/Handle.webp";
import { getFridgeHandlePosition } from "../constants/fridgeHandle";
import { useDoorCanvas } from "../context/DoorCanvasContext";

export default function FridgeHandle() {
  const canvas = useDoorCanvas();

  const position = useMemo(() => {
    if (canvas.width === 0 || canvas.height === 0) return null;
    return getFridgeHandlePosition(canvas.width, canvas.height);
  }, [canvas.width, canvas.height]);

  if (!position) return null;

  return (
    <div
      id="fridge-handle"
      className="absolute z-30 pointer-events-none"
      style={{
        left: position.left,
        bottom: position.bottom,
        width: position.width,
        height: position.height,
      }}
    >
      <img
        src={handleUrl}
        alt=""
        className="h-full w-full object-contain object-left-bottom"
        draggable={false}
      />
    </div>
  );
}
