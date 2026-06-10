/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlaceItem } from "../types";
import {
  buildPlacePhotoLookup,
  resolvePlacePhotoUrl,
} from "./placePhotos";

const imageModules = import.meta.glob(
  "../../assets/Places/**/*.{png,jpg,jpeg,webp,JPG,JPEG}",
  { eager: true, import: "default" }
) as Record<string, string>;

export function yearFromPath(filePath: string): number {
  const match = filePath.match(/\/(\d{4})\//);
  return match ? Number(match[1]) : 0;
}

export const DEFAULT_PLACE_HEIGHT = 138;

export function formatPolaroidLabel(filePath: string): string {
  const filename = filePath.split("/").pop() ?? filePath;
  const base = filename.replace(/\.[^.]+$/, "");
  const [region, ...placeParts] = base.split("_");

  if (placeParts.length === 0) return base;

  const place = placeParts
    .join(" ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();

  return `${place}, ${region}`;
}

function parsePlaceName(filePath: string): string {
  return formatPolaroidLabel(filePath);
}

function buildPlaceId(filePath: string): string {
  return filePath
    .replace("../../assets/Places/", "")
    .replace(/\.[^.]+$/, "")
    .replace(/[/\\]/g, "-")
    .toLowerCase();
}

const SMALL_MAGNET_PATTERN =
  /China_Beijing|USA_SanDiego|USA_LasVegas|China_Guangdong|Spain_Barcelona/i;

function sizeScaleForPath(filePath: string): number {
  const filename = filePath.split("/").pop() ?? filePath;
  if (SMALL_MAGNET_PATTERN.test(filename)) return 0.6;
  return 1;
}

const placePhotoLookup = buildPlacePhotoLookup();

const sortedEntries = Object.entries(imageModules).sort(([pathA], [pathB]) => {
  const yearDiff = yearFromPath(pathB) - yearFromPath(pathA);
  if (yearDiff !== 0) return yearDiff;
  return pathA.localeCompare(pathB);
});

export const RAW_PLACES: PlaceItem[] = sortedEntries.map(([path, imageUrl]) => ({
  id: buildPlaceId(path),
  name: parsePlaceName(path),
  year: yearFromPath(path),
  imageUrl,
  photoUrl: resolvePlacePhotoUrl(path, imageUrl, placePhotoLookup),
  x: 0,
  y: 0,
  rotation: 0,
  zIndex: 0,
  width: 138,
  height: DEFAULT_PLACE_HEIGHT,
  sizeScale: sizeScaleForPath(path),
}));

if (import.meta.env.DEV) {
  console.info(`[places] loaded ${RAW_PLACES.length} assets from assets/Places/`);
}
