/**
 * Image optimization pipeline (FR-2722, F5 stretch).
 *
 * When the operator runs `docs-toolkit build:web --optimize-images`, every
 * PNG larger than `SIZE_THRESHOLD_BYTES` is re-encoded as a `.webp` variant
 * (and optionally `.avif`) so pages can serve the smaller format via
 * `<picture>` while keeping the original PNG as fallback.
 *
 * Design notes
 * - Off by default. The dev/preview path must NOT pay the wall-clock cost.
 * - Air-gap safe: relies on `sharp`, which ships pre-built native binaries
 *   per platform. No network calls, no CDN dependency.
 * - Optional dependency: when `sharp` fails to load (unusual platform, no
 *   prebuilt binary, intentionally pruned install), we emit a warning and
 *   silently fall back to PNG-only output. The build never hard-fails on
 *   a missing optional encoder.
 * - Cache-friendly: variants are keyed by SHA-256 content hash of the
 *   source bytes. A second build with unchanged inputs is a 100% cache hit.
 *   Cache lives next to the destination images so it persists alongside
 *   the build output.
 * - Safety net: if the encoded variant ends up larger than the source
 *   (rare for big PNGs, common for already-tiny screenshots), we skip the
 *   variant — there's no benefit to shipping a heavier format.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";

/** Source PNGs smaller than this are not re-encoded (no benefit). */
export const SIZE_THRESHOLD_BYTES = 50 * 1024;

/** Cache directory name (relative to the optimizer working dir). */
const CACHE_DIRNAME = ".image-optimizer-cache";

/**
 * Lazy-loaded handle to the `sharp` module. Resolved on first use; if the
 * load fails we cache `null` so subsequent calls also return `null`
 * without re-throwing. We stash the actual module type behind `unknown`
 * to keep this file compilable even when `sharp` is not installed in
 * the consumer's `node_modules` (the package is an optional peer dep).
 */
type SharpModule = typeof import("sharp");
let sharpCache: SharpModule | null | undefined;

async function loadSharp(): Promise<SharpModule | null> {
  if (sharpCache !== undefined) return sharpCache;
  try {
    const mod = await import("sharp");
    sharpCache = (mod.default ?? mod) as SharpModule;
    return sharpCache;
  } catch (err) {
    console.warn(
      `[image-optimizer] sharp is not available — image optimization will be skipped. ` +
        `Install \`sharp\` to enable WebP/AVIF generation. (${(err as Error).message})`,
    );
    sharpCache = null;
    return null;
  }
}

/** Result of optimizing a single source image. */
export interface OptimizeImageResult {
  /** Filename (no directory) of the WebP variant relative to `outDir`. */
  webp?: string;
  /** Filename (no directory) of the AVIF variant relative to `outDir`. */
  avif?: string;
  /** Size in bytes of the source image. */
  sourceBytes: number;
  /** Size in bytes of the WebP variant (if produced). */
  webpBytes?: number;
  /** Size in bytes of the AVIF variant (if produced). */
  avifBytes?: number;
  /** True when the image was below the size threshold or already cached. */
  skipped: boolean;
  /** Reason for skip when `skipped === true`. */
  skipReason?: "below-threshold" | "no-benefit" | "encoder-unavailable";
  /** True when the encoded variant came from the on-disk cache. */
  cacheHit: boolean;
}

export interface OptimizeImageOptions {
  /** Generate AVIF in addition to WebP. Default: false (WebP only). */
  avif?: boolean;
  /**
   * Directory to use for the variant cache. Cached encoded bytes are
   * keyed by source content hash, so identical inputs across runs hit
   * the cache regardless of the source path. Defaults to a sibling of
   * `outDir` so the cache persists alongside build output.
   */
  cacheDir?: string;
}

/**
 * Optimize a single source image into WebP (and optionally AVIF) variants.
 *
 * Behavior:
 *   - Source < 50 KB → skipped (no benefit for already-tiny PNGs).
 *   - Variant >= source bytes → skipped for that format only.
 *   - sharp unavailable → skipped (warning emitted once, build continues).
 *   - On success, the variant filename is written to `outDir` and the
 *     bytes are also cached at `cacheDir/<hash>.<ext>` for re-use.
 *
 * Output filenames mirror the source basename: `foo.png` → `foo.webp`.
 * This keeps the HTML rewrite step simple — it can derive the variant
 * URL from the original `<img src=>` value with a single extension swap.
 */
export async function optimizeImage(
  srcPath: string,
  outDir: string,
  options: OptimizeImageOptions = {},
): Promise<OptimizeImageResult> {
  const sourceStat = fs.statSync(srcPath);
  const sourceBytes = sourceStat.size;

  if (sourceBytes < SIZE_THRESHOLD_BYTES) {
    return {
      sourceBytes,
      skipped: true,
      skipReason: "below-threshold",
      cacheHit: false,
    };
  }

  const sharp = await loadSharp();
  if (!sharp) {
    return {
      sourceBytes,
      skipped: true,
      skipReason: "encoder-unavailable",
      cacheHit: false,
    };
  }

  const sourceBytesBuf = fs.readFileSync(srcPath);
  const hash = crypto
    .createHash("sha256")
    .update(sourceBytesBuf)
    .digest("hex")
    .slice(0, 16);
  const baseName = path.basename(srcPath, path.extname(srcPath));
  const cacheDir =
    options.cacheDir ?? path.join(path.dirname(outDir), CACHE_DIRNAME);
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });

  const result: OptimizeImageResult = {
    sourceBytes,
    skipped: false,
    cacheHit: false,
  };
  let webpHit = false;
  let avifHit = false;

  // ── WebP ──────────────────────────────────────────────────────
  const webpResult = await encodeOrCache({
    format: "webp",
    hash,
    sourceBytes,
    sourceBuf: sourceBytesBuf,
    cacheDir,
    sharp,
  });
  if (webpResult) {
    const outName = `${baseName}.webp`;
    fs.writeFileSync(path.join(outDir, outName), webpResult.bytes);
    result.webp = outName;
    result.webpBytes = webpResult.bytes.length;
    webpHit = webpResult.cacheHit;
  }

  // ── AVIF (optional) ──────────────────────────────────────────
  if (options.avif) {
    const avifResult = await encodeOrCache({
      format: "avif",
      hash,
      sourceBytes,
      sourceBuf: sourceBytesBuf,
      cacheDir,
      sharp,
    });
    if (avifResult) {
      const outName = `${baseName}.avif`;
      fs.writeFileSync(path.join(outDir, outName), avifResult.bytes);
      result.avif = outName;
      result.avifBytes = avifResult.bytes.length;
      avifHit = avifResult.cacheHit;
    }
  }

  // We report `cacheHit: true` only when EVERY produced variant came from
  // the cache. A partial hit (WebP cached, AVIF freshly encoded) is still
  // partial work, and the per-image summary distinguishes that case.
  const producedAny = !!(result.webp ?? result.avif);
  result.cacheHit =
    producedAny &&
    (result.webp ? webpHit : true) &&
    (result.avif ? avifHit : true);

  // If neither variant was produced, the source had no benefit over either
  // encoder — flag it for the per-build report so operators know which
  // images don't need re-encoding next time.
  if (!producedAny) {
    result.skipped = true;
    result.skipReason = "no-benefit";
  }

  return result;
}

interface EncodeOrCacheArgs {
  format: "webp" | "avif";
  hash: string;
  sourceBytes: number;
  sourceBuf: Buffer;
  cacheDir: string;
  sharp: SharpModule;
}

/**
 * Encode `sourceBuf` to `format` (or read from cache). Returns `null`
 * when the encoded output would be at least as large as the source,
 * preserving the "skip if no benefit" invariant.
 */
async function encodeOrCache(
  args: EncodeOrCacheArgs,
): Promise<{ bytes: Buffer; cacheHit: boolean } | null> {
  const { format, hash, sourceBytes, sourceBuf, cacheDir, sharp } = args;
  const cachePath = path.join(cacheDir, `${hash}.${format}`);

  // Cache lookup. The "no-benefit" sentinel is a 0-byte file at the cache
  // path — we record it so we don't re-encode every time.
  if (fs.existsSync(cachePath)) {
    const stat = fs.statSync(cachePath);
    if (stat.size === 0) return null; // cached "no benefit" answer
    const bytes = fs.readFileSync(cachePath);
    if (bytes.length >= sourceBytes) {
      // Defensive: cache entry is bigger than source. Treat as no-benefit.
      // Re-write as the 0-byte sentinel so the next probe is constant-time.
      fs.writeFileSync(cachePath, Buffer.alloc(0));
      return null;
    }
    return { bytes, cacheHit: true };
  }

  // Encode. sharp's pipeline is async/promise-based.
  let encoded: Buffer;
  try {
    const pipeline = sharp(sourceBuf);
    if (format === "webp") {
      encoded = await pipeline.webp({ quality: 82, effort: 4 }).toBuffer();
    } else {
      // AVIF: aim for visually-lossless at competitive size. effort=4 is
      // a reasonable default — higher effort gains very little for the
      // typical screenshot at the cost of much longer encode time.
      encoded = await pipeline.avif({ quality: 60, effort: 4 }).toBuffer();
    }
  } catch (err) {
    console.warn(
      `[image-optimizer] sharp failed to encode ${format}: ${(err as Error).message}`,
    );
    return null;
  }

  if (encoded.length >= sourceBytes) {
    // Record the no-benefit sentinel so subsequent runs don't re-encode.
    fs.writeFileSync(cachePath, Buffer.alloc(0));
    return null;
  }
  fs.writeFileSync(cachePath, encoded);
  return { bytes: encoded, cacheHit: false };
}

/** Aggregate stats produced by a build's optimization pass. */
export interface OptimizeImageStats {
  totalPngs: number;
  encoded: number;
  cacheHits: number;
  belowThreshold: number;
  noBenefit: number;
  encoderUnavailable: number;
  totalSourceBytes: number;
  totalWebpBytes: number;
  totalAvifBytes: number;
}

export function newOptimizeImageStats(): OptimizeImageStats {
  return {
    totalPngs: 0,
    encoded: 0,
    cacheHits: 0,
    belowThreshold: 0,
    noBenefit: 0,
    encoderUnavailable: 0,
    totalSourceBytes: 0,
    totalWebpBytes: 0,
    totalAvifBytes: 0,
  };
}

export function recordOptimizeStat(
  stats: OptimizeImageStats,
  result: OptimizeImageResult,
): void {
  stats.totalPngs += 1;
  stats.totalSourceBytes += result.sourceBytes;
  if (result.webpBytes) stats.totalWebpBytes += result.webpBytes;
  if (result.avifBytes) stats.totalAvifBytes += result.avifBytes;

  if (result.skipped) {
    if (result.skipReason === "below-threshold") stats.belowThreshold += 1;
    else if (result.skipReason === "no-benefit") stats.noBenefit += 1;
    else if (result.skipReason === "encoder-unavailable") {
      stats.encoderUnavailable += 1;
    }
    return;
  }

  if (result.cacheHit) stats.cacheHits += 1;
  else stats.encoded += 1;
}

/**
 * Format the per-build optimization summary line. Returns `null` when no
 * encoding occurred (so callers can skip the log line entirely).
 */
export function formatOptimizeSummary(
  stats: OptimizeImageStats,
): string | null {
  if (stats.totalPngs === 0) return null;
  const eligible = stats.totalPngs - stats.belowThreshold;
  if (eligible === 0) return null;

  const parts: string[] = [];
  parts.push(`${stats.totalPngs} PNGs`);

  if (stats.encoded > 0) {
    const reductionPct =
      stats.totalSourceBytes > 0
        ? (
            ((stats.totalSourceBytes -
              (stats.totalWebpBytes + stats.totalAvifBytes)) /
              stats.totalSourceBytes) *
            100
          ).toFixed(1)
        : "0";
    parts.push(`${stats.encoded} encoded`);
    parts.push(`avg ${reductionPct}% smaller`);
  }
  if (stats.cacheHits > 0) {
    const cacheRatio = (
      (stats.cacheHits / Math.max(1, stats.cacheHits + stats.encoded)) *
      100
    ).toFixed(0);
    parts.push(`${stats.cacheHits} cache hits (${cacheRatio}%)`);
  }
  if (stats.noBenefit > 0) parts.push(`${stats.noBenefit} skipped (no benefit)`);
  if (stats.belowThreshold > 0) {
    parts.push(`${stats.belowThreshold} below 50 KB`);
  }
  if (stats.encoderUnavailable > 0) {
    parts.push(`${stats.encoderUnavailable} encoder unavailable`);
  }

  return `Image optimization: ${parts.join(", ")}`;
}

/**
 * Rewrite `<img src="…/foo.png" …>` tags to a `<picture>` element with a
 * `<source type="image/webp" srcset="…/foo.webp">` (and optional AVIF) fallback,
 * preserving the existing `<img>` as the final child.
 *
 * `availability` keys are the page-relative `src` values used in the rendered
 * HTML (the same keys the dimension map uses, e.g. `./images/foo.png`). Tags
 * whose `src` isn't in the map are left untouched. Tags already inside a
 * `<picture>` element keep their original behavior — we don't double-wrap.
 *
 * The substitution is deliberately conservative:
 *   - We only rewrite `<img>` tags whose `src` ends in `.png`.
 *   - We preserve every original `<img>` attribute (including F5's lazy /
 *     decoding / width / height additions).
 *   - We don't touch `srcset=` on the `<img>` if the page has set one.
 */
export interface ImageVariantInfo {
  webp?: string;
  avif?: string;
}

export function rewriteImageTagsToPicture(
  html: string,
  availability: Map<string, ImageVariantInfo>,
): string {
  if (availability.size === 0) return html;
  // Match self-closing or non-self-closing `<img …>` tags. We do NOT touch
  // tags already wrapped in `<picture>` — a simple lookbehind would do, but
  // browsers and our HTML are flat enough that we can match literal text
  // and post-filter by checking for `</picture>` proximity. Since the page
  // builder never emits `<picture>` directly, in practice this is a
  // straight one-pass replace.
  return html.replace(/<img\b([^>]*)\/?>(?!\s*<\/picture>)/gi, (full, attrs) => {
    const srcMatch = attrs.match(/\bsrc\s*=\s*"([^"]+)"/i);
    if (!srcMatch) return full;
    const src = srcMatch[1];
    if (!/\.png$/i.test(src)) return full;
    const variants = availability.get(src);
    if (!variants || (!variants.webp && !variants.avif)) return full;

    const sources: string[] = [];
    // AVIF first per browser preference: when both are present, browsers
    // pick the first matching `<source>`. AVIF generally wins on size for
    // the same visual quality, so if the operator opted in we surface it
    // ahead of WebP.
    if (variants.avif) {
      sources.push(
        `<source type="image/avif" srcset="${escapeAttribute(variants.avif)}" />`,
      );
    }
    if (variants.webp) {
      sources.push(
        `<source type="image/webp" srcset="${escapeAttribute(variants.webp)}" />`,
      );
    }

    return `<picture>${sources.join("")}${full}</picture>`;
  });
}

/**
 * Escape an attribute value for safe injection into HTML. We only ever
 * place URL-shaped strings into `srcset`, so a minimal escape (quote +
 * ampersand) is sufficient — full HTML escaping would over-encode the `&`
 * inside legitimate query strings on some asset URLs.
 */
function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
