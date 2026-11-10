/**
 * Visual-change gate for re-captured screenshots (`docs-toolkit accept:images`).
 *
 * A re-capture is byte-different from the committed PNG even when nothing on
 * screen changed, so copying captures over the docs images blindly commits a
 * new blob for every file. This module decodes both versions to RGBA, compares
 * pixels, and copies a capture only when it differs visibly.
 *
 * A pixel counts as different when any channel moves by more than
 * `tolerance`. A capture is `changed` when the differing pixels exceed
 * `threshold` of the image OR any `tileSize`×`tileSize` tile holds at least
 * `tileMinPixels` of them — the tile rule keeps a single relabelled menu item
 * in a full-page capture from hiding under the global fraction. A third rule
 * catches broad faint changes (a theme colour moving by less than
 * `tolerance`): `faintThreshold` of the pixels moving by more than
 * `faintTolerance` also counts as `changed`.
 */

import fs from "fs";
import path from "path";
import { LFS_PULL_HINT } from "./lfs-pointer.js";

/** Per-channel difference (0–255) at or below which a pixel counts as equal. */
export const DEFAULT_TOLERANCE = 16;
/** Fraction of differing pixels at or above which a capture is `changed`. */
export const DEFAULT_THRESHOLD = 0.0001;
/** Edge length of the square tiles used for the localized-change rule. */
export const DEFAULT_TILE_SIZE = 32;
/** Differing pixels in one tile at or above which a capture is `changed`. */
export const DEFAULT_TILE_MIN_PIXELS = 16;
/** Per-channel difference above which a pixel counts for the faint rule. */
export const DEFAULT_FAINT_TOLERANCE = 4;
/** Fraction of faintly differing pixels at or above which a capture is `changed`. */
export const DEFAULT_FAINT_THRESHOLD = 0.01;

const LFS_POINTER_PREFIX = "version https://git-lfs.github.com/spec/v1";

export interface CompareOptions {
  tolerance?: number;
  threshold?: number;
  tileSize?: number;
  tileMinPixels?: number;
  faintTolerance?: number;
  faintThreshold?: number;
}

export interface CompareResult {
  changed: boolean;
  reason: "dimensions" | "pixels" | "tile" | "faint" | null;
  oldSize: [number, number];
  newSize: [number, number];
  diffPixels: number;
  diffFraction: number;
  maxTileDiffPixels: number;
  faintFraction: number;
}

export type GateStatus = "new" | "changed" | "unchanged" | "forced";

export interface GateFileResult extends Partial<CompareResult> {
  file: string;
  status: GateStatus;
  copied: boolean;
}

export interface GateReport {
  from: string;
  to: string;
  dryRun: boolean;
  options: Required<CompareOptions>;
  files: GateFileResult[];
  summary: Record<GateStatus, number>;
}

export interface AcceptImagesOptions extends CompareOptions {
  from: string;
  to: string;
  dryRun?: boolean;
  /** File names (basename, relative to `from`) to copy even if unchanged. */
  force?: string[];
}

/** Raised for problems the user must fix; the CLI prints `message` and exits 1. */
export class ImageGateError extends Error {}

type SharpModule = (typeof import("sharp"))["default"];

async function loadSharp(): Promise<SharpModule> {
  try {
    const mod = await import("sharp");
    return (mod.default ?? mod) as SharpModule;
  } catch (err) {
    throw new ImageGateError(
      "accept:images needs `sharp` to decode PNGs, and it could not be loaded " +
        `(${(err as Error).message}). In the backend.ai-webui checkout run ` +
        "`pnpm install` at the repository root; elsewhere `pnpm add -D sharp`.",
    );
  }
}

export function isLfsPointer(buf: Buffer): boolean {
  return (
    buf.length < 1024 &&
    buf.subarray(0, LFS_POINTER_PREFIX.length).toString("utf-8") ===
      LFS_POINTER_PREFIX
  );
}

function checkRange(
  name: string,
  value: number,
  min: number,
  max: number,
  integer: boolean,
): number {
  if (
    !Number.isFinite(value) ||
    value < min ||
    value > max ||
    (integer && !Number.isInteger(value))
  ) {
    const kind = integer ? "an integer" : "a number";
    const range =
      min > 0 && min < 1 ? `above 0 up to ${max}` : `from ${min} to ${max}`;
    throw new ImageGateError(`${name} must be ${kind} ${range}, got ${value}.`);
  }
  return value;
}

function resolveOptions(opts: CompareOptions): Required<CompareOptions> {
  return {
    tolerance: checkRange(
      "--tolerance",
      opts.tolerance ?? DEFAULT_TOLERANCE,
      0,
      254,
      true,
    ),
    threshold: checkRange(
      "--threshold",
      opts.threshold ?? DEFAULT_THRESHOLD,
      Number.MIN_VALUE,
      1,
      false,
    ),
    tileSize: checkRange(
      "--tile-size",
      opts.tileSize ?? DEFAULT_TILE_SIZE,
      2,
      4096,
      true,
    ),
    tileMinPixels: checkRange(
      "--tile-min-pixels",
      opts.tileMinPixels ?? DEFAULT_TILE_MIN_PIXELS,
      1,
      16777216,
      true,
    ),
    faintTolerance: checkRange(
      "--faint-tolerance",
      opts.faintTolerance ?? DEFAULT_FAINT_TOLERANCE,
      0,
      254,
      true,
    ),
    faintThreshold: checkRange(
      "--faint-threshold",
      opts.faintThreshold ?? DEFAULT_FAINT_THRESHOLD,
      Number.MIN_VALUE,
      1,
      false,
    ),
  };
}

async function decode(
  sharp: SharpModule,
  buf: Buffer,
  label: string,
): Promise<{ data: Buffer; width: number; height: number }> {
  try {
    const { data, info } = await sharp(buf)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return { data, width: info.width, height: info.height };
  } catch (err) {
    throw new ImageGateError(
      `Cannot decode ${label}: ${(err as Error).message}`,
    );
  }
}

/** Compare two encoded images (any format sharp reads). */
export async function compareImages(
  oldBuf: Buffer,
  newBuf: Buffer,
  options: CompareOptions = {},
  labels: { old: string; new: string } = { old: "old image", new: "new image" },
): Promise<CompareResult> {
  const opts = resolveOptions(options);
  const sharp = await loadSharp();
  const a = await decode(sharp, oldBuf, labels.old);
  const b = await decode(sharp, newBuf, labels.new);
  const base = {
    oldSize: [a.width, a.height] as [number, number],
    newSize: [b.width, b.height] as [number, number],
  };
  if (a.width !== b.width || a.height !== b.height) {
    return {
      ...base,
      changed: true,
      reason: "dimensions",
      diffPixels: 0,
      diffFraction: 1,
      maxTileDiffPixels: 0,
      faintFraction: 1,
    };
  }

  const { width, height } = a;
  const size = opts.tileSize;
  // Four grids shifted by half a tile, so a change straddling a tile corner
  // still lands whole in one tile of some grid.
  const half = Math.floor(size / 2);
  const grids = [
    [0, 0],
    [half, 0],
    [0, half],
    [half, half],
  ].map(([ox, oy]) => {
    const cols = Math.ceil((width + ox) / size);
    const rows = Math.ceil((height + oy) / size);
    return { ox, oy, cols, tiles: new Uint32Array(cols * rows) };
  });
  let diffPixels = 0;
  let faintPixels = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      // Colour under full transparency is invisible.
      if (a.data[o + 3] === 0 && b.data[o + 3] === 0) continue;
      const d = Math.max(
        Math.abs(a.data[o] - b.data[o]),
        Math.abs(a.data[o + 1] - b.data[o + 1]),
        Math.abs(a.data[o + 2] - b.data[o + 2]),
        Math.abs(a.data[o + 3] - b.data[o + 3]),
      );
      if (d > opts.faintTolerance) faintPixels++;
      if (d > opts.tolerance) {
        diffPixels++;
        for (const g of grids) {
          g.tiles[
            Math.floor((y + g.oy) / size) * g.cols +
              Math.floor((x + g.ox) / size)
          ]++;
        }
      }
    }
  }
  let maxTileDiffPixels = 0;
  for (const g of grids) {
    for (const t of g.tiles) if (t > maxTileDiffPixels) maxTileDiffPixels = t;
  }
  const diffFraction = diffPixels / (width * height);
  const faintFraction = faintPixels / (width * height);

  let reason: CompareResult["reason"] = null;
  if (diffFraction >= opts.threshold) reason = "pixels";
  else if (maxTileDiffPixels >= opts.tileMinPixels) reason = "tile";
  else if (faintFraction >= opts.faintThreshold) reason = "faint";
  return {
    ...base,
    changed: reason !== null,
    reason,
    diffPixels,
    diffFraction,
    maxTileDiffPixels,
    faintFraction,
  };
}

/**
 * Copy each PNG in `from` into `to` unless an existing file there looks the
 * same. Throws `ImageGateError` before copying anything when an input is
 * unusable, so a failed run never leaves a half-applied batch.
 */
export async function acceptImages(
  options: AcceptImagesOptions,
): Promise<GateReport> {
  const opts = resolveOptions(options);
  const from = path.resolve(options.from);
  const to = path.resolve(options.to);
  if (!fs.existsSync(from) || !fs.statSync(from).isDirectory()) {
    throw new ImageGateError(`--from is not a directory: ${from}`);
  }
  if (!fs.existsSync(to) || !fs.statSync(to).isDirectory()) {
    throw new ImageGateError(`--to is not a directory: ${to}`);
  }

  const names = fs
    .readdirSync(from)
    .filter((f) => f.toLowerCase().endsWith(".png"))
    .sort();
  const force = new Set((options.force ?? []).map((f) => path.basename(f)));
  for (const f of force) {
    if (!names.includes(f)) {
      throw new ImageGateError(
        `--force ${f}: no such capture in ${from}. Pass the PNG's file name.`,
      );
    }
  }

  const results: GateFileResult[] = [];
  for (const file of names) {
    const src = path.join(from, file);
    const dest = path.join(to, file);
    const newBuf = fs.readFileSync(src);
    if (isLfsPointer(newBuf)) {
      throw new ImageGateError(
        `${src} is a Git LFS pointer, not a PNG. ${LFS_PULL_HINT} Then rerun.`,
      );
    }
    if (!fs.existsSync(dest)) {
      results.push({ file, status: "new", copied: false });
      continue;
    }
    const oldBuf = fs.readFileSync(dest);
    if (isLfsPointer(oldBuf)) {
      throw new ImageGateError(
        `${dest} is a Git LFS pointer, not a PNG, so the capture cannot be ` +
          `compared with it. ${LFS_PULL_HINT} Then rerun.`,
      );
    }
    const cmp = await compareImages(oldBuf, newBuf, opts, {
      old: dest,
      new: src,
    });
    const status: GateStatus = cmp.changed
      ? "changed"
      : force.has(file)
        ? "forced"
        : "unchanged";
    results.push({ file, status, copied: false, ...cmp });
  }

  if (!options.dryRun) {
    for (const r of results) {
      if (r.status === "unchanged") continue;
      fs.copyFileSync(path.join(from, r.file), path.join(to, r.file));
      r.copied = true;
    }
  }

  const summary: Record<GateStatus, number> = {
    new: 0,
    changed: 0,
    unchanged: 0,
    forced: 0,
  };
  for (const r of results) summary[r.status]++;
  return {
    from,
    to,
    dryRun: !!options.dryRun,
    options: opts,
    files: results,
    summary,
  };
}

function pct(f: number): string {
  return `${(f * 100).toFixed(4)}%`;
}

export function formatGateLine(r: GateFileResult): string {
  const label = r.status.padEnd(9);
  if (r.status === "new") return `  ${label} ${r.file}`;
  if (r.reason === "dimensions") {
    return `  ${label} ${r.file}  (dimensions ${r.oldSize?.join("x")} -> ${r.newSize?.join("x")})`;
  }
  return (
    `  ${label} ${r.file}  (diff ${pct(r.diffFraction ?? 0)}, ` +
    `${r.diffPixels} px, max tile ${r.maxTileDiffPixels} px, ` +
    `faint ${pct(r.faintFraction ?? 0)})`
  );
}

export function formatGateSummary(report: GateReport): string {
  const s = report.summary;
  const forced = s.forced ? `, ${s.forced} forced` : "";
  const dry = report.dryRun ? " [dry run: nothing copied]" : "";
  return `${s.new} new, ${s.changed} changed, ${s.unchanged} unchanged (skipped)${forced}${dry}`;
}
