/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MagnetType = 'letter' | 'sticky' | 'polaroid' | 'timer' | 'classic';

export interface MagnetBase {
  id: string;
  type: MagnetType;
  x: number;
  y: number;
  rotation: number; // in degrees, e.g. -15 to 15 for realistic placement
  zIndex: number;
}

export interface LetterMagnet extends MagnetBase {
  type: 'letter';
  char: string;
  color: string; // e.g. 'bg-red-500', 'bg-blue-500'
}

export interface StickyMagnet extends MagnetBase {
  type: 'sticky';
  text: string;
  color: string; // 'yellow' | 'pink' | 'mint' | 'blue' | 'lavender'
  isListMode: boolean;
  listItems: { id: string; text: string; checked: boolean }[];
}

export interface PolaroidMagnet extends MagnetBase {
  type: 'polaroid';
  imageUrl: string;
  caption: string;
}

export interface TimerMagnet extends MagnetBase {
  type: 'timer';
  minutes: number;
  remainingSeconds: number;
  isRunning: boolean;
}

export interface ClassicMagnet extends MagnetBase {
  type: 'classic';
  shape: 'avocado' | 'coffee' | 'cat' | 'donut' | 'pineapple' | 'sushi' | 'toast';
}

export type FridgeItem =
  | LetterMagnet
  | StickyMagnet
  | PolaroidMagnet
  | TimerMagnet
  | ClassicMagnet;

export interface PlaceItem {
  id: string;
  name: string;
  year: number;
  imageUrl: string;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
  width: number;
  height: number;
  sizeScale?: number;
  photoUrl?: string;
}

export interface DrawingLine {
  id: string;
  points: number[]; // Flat array [x1, y1, x2, y2, ...]
  color: string;
  width: number;
}
