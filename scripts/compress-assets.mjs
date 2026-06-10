/**
 * Compress images under assets/ for faster web loading and smaller deploys.
 *
 * Usage:
 *   npm run compress:assets -- --dry-run
 *   npm run compress:assets -- --backup
 *   npm run compress:assets -- --backup --force   # re-compress already optimized files
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS_DIR = path.join(ROOT, "assets");
const BACKUP_DIR = path.join(ROOT, "assets-backup");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

/** @type {Record<string, { maxEdge: number; quality: number; format: "webp" | "jpeg" | "png" }>} */
const PROFILES = {
  // Magnets render ~120–220px wide on the fridge — 640px is plenty for retina.
  Places: { maxEdge: 640, quality: 74, format: "webp" },
  // Polaroid photo area is small — 1024px covers hover previews well.
  Photos: { maxEdge: 1024, quality: 76, format: "webp" },
  Wallpaper: { maxEdge: 1920, quality: 78, format: "jpeg" },
  Decor: { maxEdge: 960, quality: 80, format: "webp" },
  default: { maxEdge: 1280, quality: 78, format: "webp" },
};

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const useBackup = args.has("--backup");
const force = args.has("--force");

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function profileFor(relativePath) {
  const topFolder = relativePath.split(path.sep)[0];
  return PROFILES[topFolder] ?? PROFILES.default;
}

async function walk(dir) {
  /** @type {string[]} */
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (IMAGE_EXT.has(ext)) files.push(fullPath);
  }

  return files;
}

async function backupFile(sourcePath, relativePath) {
  const destPath = path.join(BACKUP_DIR, relativePath);
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.copyFile(sourcePath, destPath);
}

async function encodeImage(pipeline, profile, ext, hasAlpha) {
  const { quality, format } = profile;

  if (format === "jpeg") {
    return pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
  }

  if (format === "webp") {
    return pipeline
      .webp({
        quality,
        alphaQuality: quality,
        effort: 5,
      })
      .toBuffer();
  }

  if (ext === ".png" || hasAlpha) {
    return pipeline
      .png({
        compressionLevel: 9,
        adaptiveFiltering: true,
        palette: !hasAlpha,
      })
      .toBuffer();
  }

  return pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
}

function outputExtension(profile, inputExt, hasAlpha) {
  if (profile.format === "jpeg") {
    if (inputExt === ".JPG") return ".JPG";
    if (inputExt === ".JPEG") return ".JPEG";
    if (inputExt === ".jpeg") return ".jpeg";
    return ".jpg";
  }
  if (profile.format === "webp") return ".webp";
  if (inputExt === ".png" || hasAlpha) return ".png";
  return ".jpg";
}

async function compressImage(filePath) {
  const relativePath = path.relative(ASSETS_DIR, filePath);
  const profile = profileFor(relativePath);
  const ext = path.extname(filePath).toLowerCase();
  const originalStat = await fs.stat(filePath);

  const image = sharp(filePath, { failOn: "none" });
  const metadata = await image.metadata();
  const hasAlpha = metadata.hasAlpha === true;
  const longestEdge = Math.max(metadata.width ?? 0, metadata.height ?? 0);

  const needsResize = longestEdge > profile.maxEdge;
  const skipSizeThreshold = profile.format === "webp" ? 120 * 1024 : 200 * 1024;
  const minSavingsBytes = force ? 4 * 1024 : 16 * 1024;

  if (!force && !needsResize && originalStat.size < skipSizeThreshold) {
    return {
      relativePath,
      skipped: true,
      reason: "already small",
      before: originalStat.size,
      after: originalStat.size,
      outputPath: filePath,
    };
  }

  let pipeline = image.rotate().resize({
    width: profile.maxEdge,
    height: profile.maxEdge,
    fit: "inside",
    withoutEnlargement: true,
  });

  const output = await encodeImage(pipeline, profile, ext, hasAlpha);
  const nextExt = outputExtension(profile, ext, hasAlpha);
  const outputPath = path.join(
    path.dirname(filePath),
    `${path.basename(filePath, path.extname(filePath))}${nextExt}`
  );

  const saved = originalStat.size - output.length;
  if (!force && saved < minSavingsBytes && outputPath === filePath) {
    return {
      relativePath,
      skipped: true,
      reason: "savings too small",
      before: originalStat.size,
      after: originalStat.size,
      outputPath: filePath,
    };
  }

  if (dryRun) {
    return {
      relativePath,
      skipped: false,
      dryRun: true,
      before: originalStat.size,
      after: output.length,
      outputPath,
    };
  }

  if (useBackup) {
    await backupFile(filePath, relativePath);
  }

  const tempPath = `${outputPath}.compressing`;
  await fs.writeFile(tempPath, output);
  await fs.rename(tempPath, outputPath);

  const sameFileIgnoringCase =
    path.resolve(outputPath).toLowerCase() === path.resolve(filePath).toLowerCase();
  if (outputPath !== filePath && !sameFileIgnoringCase) {
    await fs.unlink(filePath);
  }

  return {
    relativePath: path.relative(ASSETS_DIR, outputPath),
    skipped: false,
    before: originalStat.size,
    after: output.length,
    outputPath,
  };
}

async function main() {
  if (!dryRun && useBackup) {
    console.log(`Backing up originals to ${path.relative(ROOT, BACKUP_DIR)}/`);
  }

  const files = await walk(ASSETS_DIR);
  console.log(`Found ${files.length} images under assets/\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  let changed = 0;
  let skipped = 0;

  for (const filePath of files) {
    try {
      const result = await compressImage(filePath);
      totalBefore += result.before;
      totalAfter += result.after;

      if (result.skipped) {
        skipped += 1;
        continue;
      }

      changed += 1;
      const tag = result.dryRun ? "[dry-run]" : "[saved]";
      const renamed =
        result.outputPath && path.basename(result.outputPath) !== path.basename(filePath)
          ? ` -> ${path.basename(result.outputPath)}`
          : "";
      console.log(
        `${tag} ${result.relativePath}${renamed}: ${formatBytes(result.before)} -> ${formatBytes(result.after)} (${formatBytes(result.before - result.after)} saved)`
      );
    } catch (error) {
      console.error(`Failed: ${path.relative(ASSETS_DIR, filePath)}`, error);
    }
  }

  console.log("");
  console.log(`Changed: ${changed}  Skipped: ${skipped}`);
  console.log(
    `Total: ${formatBytes(totalBefore)} -> ${formatBytes(totalAfter)} (${formatBytes(totalBefore - totalAfter)} saved)`
  );

  if (dryRun) {
    console.log("\nDry run only — no files were modified.");
    console.log("Run: npm run compress:assets -- --backup --force");
  } else if (useBackup) {
    console.log(`\nOriginals backed up to ${path.relative(ROOT, BACKUP_DIR)}/`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
