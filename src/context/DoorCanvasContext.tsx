/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext } from "react";
import { CanvasSize } from "../utils/placeCollision";

export const DoorCanvasContext = createContext<CanvasSize>({
  width: 0,
  height: 0,
});

export function useDoorCanvas(): CanvasSize {
  return useContext(DoorCanvasContext);
}

interface DoorCanvasProviderProps {
  value: CanvasSize;
  children: React.ReactNode;
}

export function DoorCanvasProvider({
  value,
  children,
}: DoorCanvasProviderProps) {
  return (
    <DoorCanvasContext.Provider value={value}>
      {children}
    </DoorCanvasContext.Provider>
  );
}
