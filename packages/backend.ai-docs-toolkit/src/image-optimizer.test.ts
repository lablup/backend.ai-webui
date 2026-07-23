/**
 * Unit tests for the image optimizer (FR-2722).
 *
 * Run with: `pnpm test` (uses tsx --test).
 *
 * Sharp-dependent tests load the module lazily; if sharp is not
 * installed in the test environment, the encoding paths short-circuit
 * with `skipReason: 'encoder-unavailable'` and we still verify the
 * graceful-fallback contract.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  newOptimizeImageStats,
  recordOptimizeStat,
  formatOptimizeSummary,
  rewriteImageTagsToPicture,
  SIZE_THRESHOLD_BYTES,
  type OptimizeImageResult,
  type ImageVariantInfo,
} from "./image-optimizer.js";

// ── rewriteImageTagsToPicture ─────────────────────────────────

test("rewriteImageTagsToPicture — wraps eligible <img> in <picture> with WebP source", () => {
  const html = `<img src="./images/foo.png" alt="Foo" loading="lazy" decoding="async" width="100" height="50" />`;
  const map = new Map<string, ImageVariantInfo>([
    ["./images/foo.png", { webp: "./images/foo.webp" }],
  ]);
  const out = rewriteImageTagsToPicture(html, map);
  assert.match(out, /^<picture>/);
  assert.match(out, /<source type="image\/webp" srcset="\.\/images\/foo\.webp" \/>/);
  // Original <img> attributes preserved
  assert.match(out, /alt="Foo"/);
  assert.match(out, /loading="lazy"/);
  assert.match(out, /decoding="async"/);
  assert.match(out, /width="100"/);
  assert.match(out, /height="50"/);
  assert.match(out, /<\/picture>$/);
});

test("rewriteImageTagsToPicture — emits AVIF source before WebP for browser preference", () => {
  const html = `<img src="./images/foo.png" />`;
  const map = new Map<string, ImageVariantInfo>([
    [
      "./images/foo.png",
      { webp: "./images/foo.webp", avif: "./images/foo.avif" },
    ],
  ]);
  const out = rewriteImageTagsToPicture(html, map);
  const avifIdx = out.indexOf("image/avif");
  const webpIdx = out.indexOf("image/webp");
  assert.ok(avifIdx > -1, "AVIF source should be emitted");
  assert.ok(webpIdx > -1, "WebP source should be emitted");
  assert.ok(avifIdx < webpIdx, "AVIF should appear before WebP");
});

test("rewriteImageTagsToPicture — leaves non-PNG <img> tags untouched", () => {
  const html = `<img src="./images/diagram.svg" /><img src="./images/photo.jpg" />`;
  const map = new Map<string, ImageVariantInfo>([
    ["./images/diagram.svg", { webp: "./images/diagram.webp" }],
  ]);
  const out = rewriteImageTagsToPicture(html, map);
  assert.equal(out, html, "non-PNG sources should be untouched");
});

test("rewriteImageTagsToPicture — leaves <img> without a registered variant untouched", () => {
  const html = `<img src="./images/missing.png" />`;
  const map = new Map<string, ImageVariantInfo>();
  const out = rewriteImageTagsToPicture(html, map);
  assert.equal(out, html);
});

test("rewriteImageTagsToPicture — escapes ampersands in srcset", () => {
  const html = `<img src="./images/foo.png" />`;
  const map = new Map<string, ImageVariantInfo>([
    ["./images/foo.png", { webp: "./images/foo.webp?v=1&hash=abc" }],
  ]);
  const out = rewriteImageTagsToPicture(html, map);
  assert.match(out, /srcset="\.\/images\/foo\.webp\?v=1&amp;hash=abc"/);
});

test("rewriteImageTagsToPicture — empty availability map is a no-op", () => {
  const html = `<img src="./images/foo.png" />`;
  const out = rewriteImageTagsToPicture(html, new Map());
  assert.equal(out, html);
});

// ── stats accumulator + summary ───────────────────────────────

test("formatOptimizeSummary — returns null when no PNGs were processed", () => {
  const stats = newOptimizeImageStats();
  assert.equal(formatOptimizeSummary(stats), null);
});

test("formatOptimizeSummary — returns null when only below-threshold PNGs were seen", () => {
  const stats = newOptimizeImageStats();
  recordOptimizeStat(stats, mkResult({ skipped: true, skipReason: "below-threshold" }));
  assert.equal(formatOptimizeSummary(stats), null);
});

test("formatOptimizeSummary — reports encoded count and average reduction", () => {
  const stats = newOptimizeImageStats();
  recordOptimizeStat(
    stats,
    mkResult({ sourceBytes: 100_000, webpBytes: 25_000 }),
  );
  recordOptimizeStat(
    stats,
    mkResult({ sourceBytes: 200_000, webpBytes: 50_000 }),
  );
  const out = formatOptimizeSummary(stats);
  assert.ok(out);
  assert.match(out, /2 PNGs/);
  assert.match(out, /2 encoded/);
  assert.match(out, /avg 75\.0% smaller/);
});

test("formatOptimizeSummary — reports cache hits with ratio", () => {
  const stats = newOptimizeImageStats();
  recordOptimizeStat(
    stats,
    mkResult({ sourceBytes: 100_000, webpBytes: 25_000, cacheHit: true }),
  );
  recordOptimizeStat(
    stats,
    mkResult({ sourceBytes: 100_000, webpBytes: 25_000, cacheHit: true }),
  );
  const out = formatOptimizeSummary(stats);
  assert.ok(out);
  assert.match(out, /2 cache hits \(100%\)/);
});

test("formatOptimizeSummary — reports below-threshold and no-benefit counts", () => {
  const stats = newOptimizeImageStats();
  recordOptimizeStat(
    stats,
    mkResult({ sourceBytes: 100_000, webpBytes: 25_000 }),
  );
  recordOptimizeStat(stats, mkResult({ skipped: true, skipReason: "below-threshold" }));
  recordOptimizeStat(stats, mkResult({ skipped: true, skipReason: "no-benefit" }));
  const out = formatOptimizeSummary(stats);
  assert.ok(out);
  assert.match(out, /1 skipped \(no benefit\)/);
  assert.match(out, /1 below 50 KB/);
});

// ── optimizeImage (sharp-aware) ───────────────────────────────

test("optimizeImage — skips files smaller than SIZE_THRESHOLD_BYTES", async () => {
  const { optimizeImage } = await import("./image-optimizer.js");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "img-opt-"));
  try {
    const tinyPng = path.join(tmp, "tiny.png");
    // Minimal valid PNG (1x1 transparent), well under 50 KB.
    fs.writeFileSync(tinyPng, makeMinimalPng());
    const result = await optimizeImage(tinyPng, path.join(tmp, "out"));
    assert.equal(result.skipped, true);
    assert.equal(result.skipReason, "below-threshold");
    assert.equal(result.webp, undefined);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("optimizeImage — sentinel: SIZE_THRESHOLD_BYTES is the documented 50 KB", () => {
  // FR-2722 acceptance criterion ties the threshold to 50 KB. If anyone
  // changes this, we want the test (and the ARCHITECTURE.md doc) to
  // surface it explicitly.
  assert.equal(SIZE_THRESHOLD_BYTES, 50 * 1024);
});

// ── helpers ───────────────────────────────────────────────────

function mkResult(partial: Partial<OptimizeImageResult>): OptimizeImageResult {
  return {
    sourceBytes: 0,
    skipped: false,
    cacheHit: false,
    ...partial,
  };
}

/**
 * Construct a minimal valid 1×1 transparent PNG (~67 bytes). Used by the
 * below-threshold skip test so we don't need to ship a binary fixture.
 */
function makeMinimalPng(): Buffer {
  // Hard-coded byte sequence for a 1x1 transparent PNG. Source: spec-built.
  return Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
    0x0d, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
}
