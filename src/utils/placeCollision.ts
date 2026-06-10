/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { computeDoorScale, scalePx } from "../constants/viewportScale";
import { PlaceItem } from "../types";

export const CANVAS_PADDING = 16;
export const PLACE_GAP = 14;
export const MAGNET_SIZE_MULTIPLIER = 2;

export interface LayoutMetrics {
  scale: number;
  padding: number;
  gap: number;
}

export function getLayoutMetrics(canvas: CanvasSize): LayoutMetrics {
  const scale = computeDoorScale(canvas.width, canvas.height);
  const gapScale = scale < 0.35 ? 0.6 : scale < 0.55 ? 0.8 : 1;

  return {
    scale,
    padding: scalePx(CANVAS_PADDING, scale),
    gap: scalePx(PLACE_GAP * gapScale, scale),
  };
}

export function getPlaceMagnetSizeMultiplier(
  canvasWidth: number,
  canvasHeight: number
): number {
  const scale = computeDoorScale(canvasWidth, canvasHeight);

  if (scale < 0.32 || canvasWidth < 360) return 1.25;
  if (scale < 0.45 || canvasWidth < 520) return 1.55;
  if (scale < 0.65 || canvasWidth < 720) return 1.75;

  return MAGNET_SIZE_MULTIPLIER;
}

export function getPlaceDragConstraints(
  place: PlaceItem,
  canvas: CanvasSize,
  padding = CANVAS_PADDING
): { left: number; right: number; top: number; bottom: number } {
  const bounds = toCollisionBounds(place);
  const offsetX = (bounds.width - place.width) / 2;
  const offsetY = (bounds.height - place.height) / 2;

  return {
    left: padding + offsetX - place.x,
    top: padding + offsetY - place.y,
    right: canvas.width - padding - bounds.width + offsetX - place.x,
    bottom: canvas.height - padding - bounds.height + offsetY - place.y,
  };
}

export interface PlaceBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export function toBounds(place: PlaceItem): PlaceBounds {
  return {
    id: place.id,
    x: place.x,
    y: place.y,
    width: place.width,
    height: place.height,
  };
}

export function toCollisionBounds(place: PlaceItem): PlaceBounds {
  const angleRad = (place.rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(angleRad));
  const sin = Math.abs(Math.sin(angleRad));
  const width = place.width * cos + place.height * sin;
  const height = place.width * sin + place.height * cos;
  const offsetX = (width - place.width) / 2;
  const offsetY = (height - place.height) / 2;

  return {
    id: place.id,
    x: place.x - offsetX,
    y: place.y - offsetY,
    width,
    height,
  };
}

export function overlaps(
  a: PlaceBounds,
  b: PlaceBounds,
  gap = PLACE_GAP
): boolean {
  return (
    a.x < b.x + b.width + gap &&
    a.x + a.width + gap > b.x &&
    a.y < b.y + b.height + gap &&
    a.y + a.height + gap > b.y
  );
}

function minimumSeparation(
  moved: PlaceBounds,
  other: PlaceBounds,
  gap = PLACE_GAP
): { dx: number; dy: number } {
  if (!overlaps(moved, other, gap)) {
    return { dx: 0, dy: 0 };
  }

  const pushLeft = moved.x + moved.width + gap - other.x;
  const pushRight = other.x + other.width + gap - moved.x;
  const pushUp = moved.y + moved.height + gap - other.y;
  const pushDown = other.y + other.height + gap - moved.y;

  const minX = Math.min(pushLeft, pushRight);
  const minY = Math.min(pushUp, pushDown);

  if (minX < minY) {
    return pushLeft < pushRight ? { dx: -pushLeft, dy: 0 } : { dx: pushRight, dy: 0 };
  }

  return pushUp < pushDown ? { dx: 0, dy: -pushUp } : { dx: 0, dy: pushDown };
}

function clampToCanvas(
  bounds: PlaceBounds,
  canvas: CanvasSize,
  padding = CANVAS_PADDING
): { x: number; y: number } {
  const minY = padding;
  const maxX = Math.max(canvas.width - bounds.width - padding, padding);
  const maxY = Math.max(canvas.height - bounds.height - padding, minY);

  return {
    x: Math.max(padding, Math.min(bounds.x, maxX)),
    y: Math.max(minY, Math.min(bounds.y, maxY)),
  };
}

export function resolvePlacePosition(
  moved: PlaceItem,
  others: PlaceItem[],
  canvas: CanvasSize,
  gap?: number,
  obstacles: PlaceBounds[] = []
): { x: number; y: number } {
  const { padding, gap: layoutGap } = getLayoutMetrics(canvas);
  const resolvedGap = gap ?? layoutGap;
  let x = moved.x;
  let y = moved.y;

  const otherBounds = [
    ...others
      .filter((place) => place.id !== moved.id)
      .map(toCollisionBounds),
    ...obstacles,
  ];

  for (let iteration = 0; iteration < 64; iteration++) {
    let adjusted = false;
    const current = toCollisionBounds({ ...moved, x, y });

    for (const other of otherBounds) {
      const { dx, dy } = minimumSeparation(current, other, resolvedGap);
      if (dx === 0 && dy === 0) continue;

      x += dx;
      y += dy;
      adjusted = true;
    }

    const clamped = clampToCanvas(
      toCollisionBounds({ ...moved, x, y }),
      canvas,
      padding
    );
    const offsetX = (toCollisionBounds({ ...moved, x, y }).width - moved.width) / 2;
    const offsetY =
      (toCollisionBounds({ ...moved, x, y }).height - moved.height) / 2;
    x = clamped.x + offsetX;
    y = clamped.y + offsetY;

    if (!adjusted) break;
  }

  return { x, y };
}

function placeHasCollision(
  place: PlaceItem,
  others: PlaceItem[],
  obstacles: PlaceBounds[],
  gap = PLACE_GAP
): boolean {
  const bounds = toCollisionBounds(place);

  for (const other of others) {
    if (other.id === place.id) continue;
    if (overlaps(bounds, toCollisionBounds(other), gap)) return true;
  }

  return obstacles.some((obstacle) => overlaps(bounds, obstacle, gap));
}

function layoutHasCollisions(
  places: PlaceItem[],
  obstacles: PlaceBounds[],
  gap = PLACE_GAP
): boolean {
  for (let i = 0; i < places.length; i++) {
    if (placeHasCollision(places[i], places, obstacles, gap)) return true;
  }
  return false;
}

export function hasLayoutOverlaps(
  places: PlaceItem[],
  canvas: CanvasSize,
  obstacles: PlaceBounds[] = []
): boolean {
  const { gap } = getLayoutMetrics(canvas);
  return layoutHasCollisions(places, obstacles, gap);
}

export function separateAllPlaces(
  places: PlaceItem[],
  canvas: CanvasSize,
  gap?: number,
  obstacles: PlaceBounds[] = []
): PlaceItem[] {
  const { gap: layoutGap } = getLayoutMetrics(canvas);
  const resolvedGap = gap ?? layoutGap;
  let result = places.map((place) => ({ ...place }));
  const maxPasses = Math.max(24, result.length * 6);

  for (let pass = 0; pass < maxPasses; pass++) {
    let changed = false;

    for (let i = 0; i < result.length; i++) {
      const resolved = resolvePlacePosition(
        result[i],
        result,
        canvas,
        resolvedGap,
        obstacles
      );
      if (resolved.x !== result[i].x || resolved.y !== result[i].y) {
        result[i] = { ...result[i], x: resolved.x, y: resolved.y };
        changed = true;
      }
    }

    if (!changed && !layoutHasCollisions(result, obstacles, resolvedGap)) break;
  }

  return result;
}

export function enforceNonOverlappingLayout(
  places: PlaceItem[],
  canvas: CanvasSize,
  obstacles: PlaceBounds[] = [],
  gap?: number
): PlaceItem[] {
  return separateAllPlaces(places, canvas, gap, obstacles);
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) | 0;
    return (Math.abs(state) % 10000) / 10000;
  };
}

function rotationForPlace(
  placeId: string,
  index: number,
  canvas: CanvasSize
): number {
  const rand = seededRandom(hashSeed(placeId) + index * 41);
  const scale = computeDoorScale(canvas.width, canvas.height);
  const maxRotation = scale < 0.35 ? 6 : scale < 0.55 ? 12 : 22;
  return Math.round((rand() - 0.5) * maxRotation);
}

function clampPlaceToCanvas(
  place: PlaceItem,
  canvas: CanvasSize,
  padding: number
): PlaceItem {
  const bounds = toCollisionBounds(place);
  const clamped = clampToCanvas(bounds, canvas, padding);
  const offsetX = (bounds.width - place.width) / 2;
  const offsetY = (bounds.height - place.height) / 2;

  return {
    ...place,
    x: Math.round(clamped.x + offsetX),
    y: Math.round(clamped.y + offsetY),
  };
}

function fitsWithoutCollision(
  place: PlaceItem,
  others: PlaceItem[],
  obstacles: PlaceBounds[],
  gap: number
): boolean {
  return !placeHasCollision(place, others, obstacles, gap);
}

function scatteredPositionForPlace(
  place: PlaceItem,
  index: number,
  placeCount: number,
  canvas: CanvasSize,
  padding: number,
  attempt: number,
  rotation: number
): { x: number; y: number } {
  const rand = seededRandom(
    hashSeed(place.id) +
      canvas.width * 13 +
      canvas.height * 17 +
      attempt * 59
  );
  const bounds = toCollisionBounds({ ...place, x: 0, y: 0, rotation });
  const offsetX = (bounds.width - place.width) / 2;
  const offsetY = (bounds.height - place.height) / 2;
  const minX = padding + offsetX;
  const minY = padding + offsetY;
  const maxX = Math.max(minX, canvas.width - padding - bounds.width + offsetX);
  const maxY = Math.max(minY, canvas.height - padding - bounds.height + offsetY);

  if (attempt < 48 || rand() > 0.35) {
    return {
      x: Math.round(minX + rand() * (maxX - minX)),
      y: Math.round(minY + rand() * (maxY - minY)),
    };
  }

  const aspect = canvas.width / Math.max(canvas.height, 1);
  const cols = Math.max(3, Math.round(Math.sqrt(placeCount * aspect)));
  const rows = Math.max(2, Math.ceil(placeCount / cols));
  const cellW = (canvas.width - padding * 2) / cols;
  const cellH = (canvas.height - padding * 2) / rows;
  const col = index % cols;
  const row = Math.floor(index / cols) % rows;
  const jitterX = (rand() - 0.5) * cellW * 0.85;
  const jitterY = (rand() - 0.5) * cellH * 0.85;

  return {
    x: Math.round(
      padding + col * cellW + cellW / 2 - place.width / 2 + jitterX
    ),
    y: Math.round(
      padding + row * cellH + cellH / 2 - place.height / 2 + jitterY
    ),
  };
}

export function layoutPlacesSpread(
  places: PlaceItem[],
  canvas: CanvasSize,
  gap?: number,
  obstacles: PlaceBounds[] = []
): PlaceItem[] {
  if (places.length === 0) return [];

  const { padding, gap: layoutGap } = getLayoutMetrics(canvas);
  const resolvedGap = gap ?? layoutGap;
  const sorted = [...places].sort(
    (a, b) => b.width * b.height - a.width * a.height
  );
  const result: PlaceItem[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const place = sorted[i];
    const rotation = rotationForPlace(place.id, i, canvas);
    let placed: PlaceItem | null = null;

    for (let attempt = 0; attempt < 72; attempt++) {
      const { x, y } = scatteredPositionForPlace(
        place,
        i + attempt * 3,
        places.length,
        canvas,
        padding,
        attempt,
        rotation
      );
      const candidate = clampPlaceToCanvas(
        { ...place, x, y, rotation, zIndex: i + 1 },
        canvas,
        padding
      );

      if (fitsWithoutCollision(candidate, result, obstacles, resolvedGap)) {
        placed = candidate;
        break;
      }
    }

    if (!placed) {
      const { x, y } = scatteredPositionForPlace(
        place,
        i,
        places.length,
        canvas,
        padding,
        0,
        rotation
      );
      const resolved = resolvePlacePosition(
        clampPlaceToCanvas(
          { ...place, x, y, rotation, zIndex: i + 1 },
          canvas,
          padding
        ),
        result,
        canvas,
        resolvedGap,
        obstacles
      );
      placed = { ...place, x: resolved.x, y: resolved.y, rotation, zIndex: i + 1 };
    }

    result.push(placed);
  }

  return enforceNonOverlappingLayout(
    result,
    canvas,
    obstacles,
    resolvedGap
  );
}

export function layoutPlacesGrid(
  places: PlaceItem[],
  canvas: CanvasSize,
  gap?: number,
  obstacles: PlaceBounds[] = []
): PlaceItem[] {
  if (places.length === 0) return [];

  const { padding, gap: layoutGap } = getLayoutMetrics(canvas);
  const resolvedGap = gap ?? layoutGap;
  const sorted = [...places].sort(
    (a, b) => b.width * b.height - a.width * a.height
  );
  const usableW = canvas.width - padding * 2;
  const usableH = canvas.height - padding * 2;
  const maxCellWidth = Math.max(
    ...sorted.map((place) => toCollisionBounds(place).width)
  );
  const maxCellHeight = Math.max(
    ...sorted.map((place) => toCollisionBounds(place).height)
  );
  const maxCols = Math.max(
    2,
    Math.floor(usableW / (maxCellWidth + resolvedGap))
  );
  const maxRows = Math.max(
    1,
    Math.floor(usableH / (maxCellHeight + resolvedGap))
  );
  let cols = Math.min(maxCols, sorted.length);
  let rows = Math.ceil(sorted.length / cols);

  if (rows > maxRows) {
    cols = Math.max(2, Math.ceil(sorted.length / maxRows));
    rows = Math.ceil(sorted.length / cols);
  }
  const result: PlaceItem[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const place = sorted[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cellW = usableW / cols;
    const cellH = usableH / rows;
    const rotation = rotationForPlace(place.id, i, canvas);
    const x = padding + col * cellW + (cellW - place.width) / 2;
    const y = padding + row * cellH + (cellH - place.height) / 2;

    result.push(
      clampPlaceToCanvas(
        { ...place, x, y, rotation, zIndex: i + 1 },
        canvas,
        padding
      )
    );
  }

  return enforceNonOverlappingLayout(
    result,
    canvas,
    obstacles,
    resolvedGap
  );
}

export function layoutPlacesRandomly(
  places: PlaceItem[],
  canvas: CanvasSize,
  gap = PLACE_GAP,
  obstacles: PlaceBounds[] = []
): PlaceItem[] {
  return layoutPlacesSpread(places, canvas, gap, obstacles);
}

function finalizeLayout(
  layout: PlaceItem[],
  places: PlaceItem[],
  canvas: CanvasSize,
  obstacles: PlaceBounds[]
): PlaceItem[] {
  if (layout.length !== places.length) return [];

  const separated = enforceNonOverlappingLayout(
    layout,
    canvas,
    obstacles
  );

  return isValidLayout(separated, places.length, canvas, obstacles)
    ? separated
    : [];
}

export const MAGNET_SIZE_SCALE = 1.85;

/** Fixed density for place magnet sizing — keeps scale consistent across years. */
export const MAGNET_LAYOUT_REFERENCE_COUNT = 18;

/** Base magnet width used for decor sizing (CHERRY letters, etc.). */
export function computeMagnetWidth(
  canvasWidth: number,
  canvasHeight: number,
  itemCount: number
): number {
  if (canvasWidth <= 0 || canvasHeight <= 0) return 138;

  const scale = computeDoorScale(canvasWidth, canvasHeight);
  const padding = scalePx(CANVAS_PADDING, scale);
  const gap = scalePx(PLACE_GAP, scale);
  const usableW = canvasWidth - padding * 2;
  const usableH = canvasHeight - padding * 2;

  const rotationBuffer = 1.05;
  const heightRatio = 1.08;
  const minCols = 3;
  const maxCols = Math.min(
    itemCount,
    Math.max(5, Math.ceil(usableW / (120 * scale)))
  );

  let bestWidth = Math.max(36, Math.round(48 * scale));

  for (let cols = minCols; cols <= maxCols; cols++) {
    const rows = Math.ceil(itemCount / cols);
    const cellW = usableW / cols - gap;
    const cellH = usableH / rows - gap;
    if (cellW <= 0 || cellH <= 0) continue;

    const widthFromCell = Math.min(cellW / rotationBuffer, cellH / heightRatio);
    bestWidth = Math.max(bestWidth, Math.floor(widthFromCell));
  }

  const densityScale = itemCount > 26 ? 0.92 : itemCount > 20 ? 0.96 : 1;
  const areaPerItem = (usableW * usableH) / Math.max(itemCount, 1);
  const maxFromArea = Math.sqrt(areaPerItem * 0.5);
  const cappedWidth = Math.min(bestWidth * 1.35 * densityScale, maxFromArea);

  return Math.max(Math.round(24 * scale), Math.round(cappedWidth));
}

/** Place sticker width — viewport-scaled, not inflated when a year has fewer places. */
export function computePlaceMagnetWidth(
  canvasWidth: number,
  canvasHeight: number,
  _itemCount?: number
): number {
  const baseWidth = computeMagnetWidth(
    canvasWidth,
    canvasHeight,
    MAGNET_LAYOUT_REFERENCE_COUNT
  );
  const multiplier = getPlaceMagnetSizeMultiplier(canvasWidth, canvasHeight);

  return Math.round(baseWidth * multiplier);
}

export function computePlaceMagnetWidthBounds(
  canvasWidth: number,
  canvasHeight: number,
  _itemCount?: number
): { min: number; max: number } {
  const scale = computeDoorScale(canvasWidth, canvasHeight);
  const max = computePlaceMagnetWidth(canvasWidth, canvasHeight);
  const min = Math.max(10, Math.round(14 * scale));

  return { min, max: Math.max(min, max) };
}

function isValidLayout(
  layout: PlaceItem[],
  expectedCount: number,
  canvas: CanvasSize,
  obstacles: PlaceBounds[]
): boolean {
  if (layout.length !== expectedCount) return false;

  const { padding } = getLayoutMetrics(canvas);

  for (const place of layout) {
    const bounds = toCollisionBounds(place);
    if (
      bounds.x < padding - 1 ||
      bounds.y < padding - 1 ||
      bounds.x + bounds.width > canvas.width - padding + 1 ||
      bounds.y + bounds.height > canvas.height - padding + 1
    ) {
      return false;
    }
  }

  return !hasLayoutOverlaps(layout, canvas, obstacles);
}

export async function findLargestNonOverlappingLayout(
  places: PlaceItem[],
  canvas: CanvasSize,
  obstacles: PlaceBounds[],
  loadWithWidth: (width: number) => Promise<PlaceItem[]>
): Promise<PlaceItem[]> {
  const { min, max } = computePlaceMagnetWidthBounds(canvas.width, canvas.height);
  const widthStep = max > 80 ? 2 : 1;

  for (let width = max; width >= min; width -= widthStep) {
    const withDimensions = await loadWithWidth(width);
    const spread = finalizeLayout(
      layoutPlacesSpread(withDimensions, canvas, undefined, obstacles),
      places,
      canvas,
      obstacles
    );
    if (spread.length === places.length) return spread;

    const grid = finalizeLayout(
      layoutPlacesGrid(withDimensions, canvas, undefined, obstacles),
      places,
      canvas,
      obstacles
    );
    if (grid.length === places.length) return grid;
  }

  for (let width = min - 1; width >= 8; width -= 1) {
    const withDimensions = await loadWithWidth(width);
    const grid = finalizeLayout(
      layoutPlacesGrid(withDimensions, canvas, undefined, obstacles),
      places,
      canvas,
      obstacles
    );
    if (grid.length === places.length) return grid;
  }

  return [];
}

export function packPlacesHorizontally(
  places: PlaceItem[],
  gapX: number,
  canvasHeight: number
): PlaceItem[] {
  let x = CANVAS_PADDING;

  return places.map((place, index) => {
    const y = Math.max(
      CANVAS_PADDING,
      Math.round((canvasHeight - place.height) / 2)
    );

    const positioned: PlaceItem = {
      ...place,
      x,
      y,
      rotation: ((index % 5) - 2) * 1.5,
      zIndex: index + 1,
    };

    x += place.width + gapX;
    return positioned;
  });
}

export function computeHorizontalCanvasWidth(
  places: PlaceItem[],
  gapX: number,
  minWidth: number
): number {
  if (places.length === 0) return minWidth;

  const laidOutWidth =
    CANVAS_PADDING * 2 +
    places.reduce((sum, place) => sum + place.width, 0) +
    Math.max(places.length - 1, 0) * gapX;

  const maxItemRight = Math.max(
    ...places.map((place) => place.x + place.width),
    laidOutWidth - CANVAS_PADDING
  );

  return Math.max(laidOutWidth, maxItemRight + CANVAS_PADDING, minWidth);
}

export function computeRowCanvasHeight(
  places: PlaceItem[],
  minHeight: number
): number {
  if (places.length === 0) return minHeight;

  const maxHeight = Math.max(...places.map((place) => place.height));
  return Math.max(maxHeight + CANVAS_PADDING * 2, minHeight);
}

export function loadPlaceDimensions(
  place: PlaceItem,
  itemWidth: number
): Promise<PlaceItem> {
  const scaledWidth = Math.round(itemWidth * (place.sizeScale ?? 1));

  return new Promise((resolve) => {
    const img = new Image();

    const finish = (height: number) => {
      resolve({ ...place, width: scaledWidth, height });
    };

    img.onload = () => {
      const height = img.naturalWidth
        ? Math.round((img.naturalHeight / img.naturalWidth) * scaledWidth)
        : Math.round(place.height * (place.sizeScale ?? 1));
      finish(height);
    };

    img.onerror = () => {
      console.warn(`Failed to load place image: ${place.name}`, place.imageUrl);
      finish(place.height);
    };

    img.src = place.imageUrl;
  });
}
