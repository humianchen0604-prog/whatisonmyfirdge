/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const photoModules = import.meta.glob(
  "../../assets/Photos/**/*.{png,jpg,jpeg,webp,JPG,JPEG}",
  { eager: true, import: "default" }
) as Record<string, string>;

export function placeKeyFromPath(filePath: string): string {
  const filename = filePath.split("/").pop() ?? filePath;
  return filename.replace(/\.[^.]+$/i, "");
}

function candidateKeysFromPhotoPath(filePath: string): string[] {
  const filename = filePath.split("/").pop() ?? filePath;
  let base = filename.replace(/\.[^.]+$/i, "");
  base = base.replace(/_Photo\d+$/i, "");

  const parts = base.split("_");
  if (parts.length < 2) return [base];

  const keys = new Set<string>([base]);

  if (parts.length === 2) {
    keys.add(`${parts[1]}_${parts[0]}`);
  }

  return [...keys];
}

export function buildPlacePhotoLookup(): Map<string, string> {
  const lookup = new Map<string, string>();
  const sortedPhotoEntries = Object.entries(photoModules).sort(([pathA], [pathB]) =>
    pathA.localeCompare(pathB)
  );

  for (const [path, url] of sortedPhotoEntries) {
    for (const key of candidateKeysFromPhotoPath(path)) {
      if (!lookup.has(key)) {
        lookup.set(key, url);
      }
    }
  }

  return lookup;
}

export function resolvePlacePhotoUrl(
  placePath: string,
  magnetImageUrl: string,
  lookup: Map<string, string>
): string {
  return lookup.get(placeKeyFromPath(placePath)) ?? magnetImageUrl;
}
