/**
 * Compress images under assets/ for smaller git + Vercel deploys.
 *
 * Usage:
 *   npm run compress:assets -- --dry-run          # preview only
 *   npm run compress:assets -- --backup           # backup then compress
 *   npm run compress:assets -- --backup --dry-run
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

/** @type {Record<string, { maxEdge: number; jpegQuality: number; pngCompression: number }>} */
const PROFILES = {
  Photos: { maxEdge: 1920, jpegQuality: 82, pngCompression: 9 },
  Places: { maxEdge: 1200, jpegQuality: 82, pngCompression: 9 },
  Wallpaper: { maxEdge: 2560, jpegQuality: 85, pngCompression: 9 },
  Decor: { maxEdge: 1600, jpegQuality: 85, pngCompression: 9 },
  default: { maxEdge: 1920, jpegQuality: 82, pngCompression: 9 },
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
  const minSavingsBytes = 32 * 1024;

  if (!force && !needsResize && originalStat.size < 400 * 1024) {
    return {
      relativePath,
      skipped: true,
      reason: "already small",
      before: originalStat.size,
      after: originalStat.size,
    };
  }

  let pipeline = image.rotate().resize({
    width: profile.maxEdge,
    height: profile.maxEdge,
    fit: "inside",
    withoutEnlargement: true,
  });

  /** @type {Buffer} */
  let output;

  if (ext === ".png" || (hasAlpha && ext !== ".jpg" && ext !== ".jpeg")) {
    output = await pipeline
      .png({
        compressionLevel: profile.pngCompression,
        adaptiveFiltering: true,
        palette: !hasAlpha,
      })
      .toBuffer();
  } else if (ext === ".webp") {
    output = await pipeline.webp({ quality: profile.jpegQuality }).toBuffer();
  } else {
    output = await pipeline
      .jpeg({ quality: profile.jpegQuality, mozjpeg: true })
      .toBuffer();
  }

  const saved = originalStat.size - output.length;
  if (!force && saved < minSavingsBytes) {
    return {
      relativePath,
      skipped: true,
      reason: "savings too small",
      before: originalStat.size,
      after: originalStat.size,
    };
  }

  if (dryRun) {
    return {
      relativePath,
      skipped: false,
      dryRun: true,
      before: originalStat.size,
      after: output.length,
    };
  }

  if (useBackup) {
    await backupFile(filePath, relativePath);
  }

  const tempPath = `${filePath}.compressing`;
  await fs.writeFile(tempPath, output);
  await fs.rename(tempPath, filePath);

  return {
    relativePath,
    skipped: false,
    before: originalStat.size,
    after: output.length,
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
      console.log(
        `${tag} ${result.relativePath}: ${formatBytes(result.before)} -> ${formatBytes(result.after)} (${formatBytes(result.before - result.after)} saved)`
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
    console.log("Run: npm run compress:assets -- --backup");
  } else if (useBackup) {
    console.log(`\nOriginals backed up to ${path.relative(ROOT, BACKUP_DIR)}/`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
