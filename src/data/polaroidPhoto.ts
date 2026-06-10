/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const polaroidModules = import.meta.glob(
  "../../assets/Polaroid/**/*.{png,jpg,jpeg,webp}",
  { eager: true, import: "default" }
) as Record<string, string>;

const placeFallbackModules = import.meta.glob(
  "../../assets/Places/**/*.{png,jpg,jpeg,webp}",
  { eager: true, import: "default" }
) as Record<string, string>;

function firstSortedUrl(modules: Record<string, string>): string | undefined {
  const key = Object.keys(modules).sort()[0];
  return key ? modules[key] : undefined;
}

function captionFromPath(filePath: string): string {
  const filename = filePath.split("/").pop() ?? filePath;
  const base = filename.replace(/\.[^.]+$/, "");
  const parts = base.split("_");
  if (parts.length < 2) return base;

  return parts
    .slice(1)
    .join(" ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
}

const polaroidPath = Object.keys(polaroidModules).sort()[0];
const fallbackPath = Object.keys(placeFallbackModules).sort()[0];
const imagePath = polaroidPath ?? fallbackPath;
const imageUrl = imagePath
  ? (polaroidModules[imagePath] ?? placeFallbackModules[fallbackPath])
  : "";

export const CORNER_POLAROID = {
  imageUrl,
  caption: imagePath ? captionFromPath(imagePath) : "Summer Days",
  altText: imagePath ? captionFromPath(imagePath) : "Polaroid memory",
};
