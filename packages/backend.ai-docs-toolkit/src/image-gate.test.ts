/**
 * Unit tests for the screenshot visual-change gate (`accept:images`).
 *
 * Run with: `pnpm test` (uses tsx --test). Every PNG is synthesized in a
 * temp directory with sharp, a devDependency of this package.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import {
  acceptImages,
  compareImages,
  isLfsPointer,
  ImageGateError,
} from "./image-gate.js";

const W = 800;
const H = 600;

/** A deterministic screenshot-like RGBA buffer: gradient plus stripes. */
function basePixels(width = W, height = H): Buffer {
  const buf = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      buf[o] = (x * 255) / width;
      buf[o + 1] = (y * 255) / height;
      buf[o + 2] = (x + y) % 64 < 32 ? 40 : 220;
      buf[o + 3] = 255;
    }
  }
  return buf;
}

function paintBlock(
  buf: Buffer,
  left: number,
  top: number,
  size: number,
  width = W,
): Buffer {
  const out = Buffer.from(buf);
  for (let y = top; y < top + size; y++) {
    for (let x = left; x < left + size; x++) {
      const o = (y * width + x) * 4;
      out[o] = 255 - out[o];
      out[o + 1] = 255 - out[o + 1];
      out[o + 2] = 255 - out[o + 2];
    }
  }
  return out;
}

async function png(
  pixels: Buffer,
  width = W,
  height = H,
  compressionLevel = 6,
): Promise<Buffer> {
  return sharp(pixels, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel })
    .toBuffer();
}

function tmpDirs(): { from: string; to: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "image-gate-"));
  const from = path.join(root, "from");
  const to = path.join(root, "to");
  fs.mkdirSync(from);
  fs.mkdirSync(to);
  return { from, to };
}

// ── compareImages ─────────────────────────────────────────────

test("compareImages — a byte-different re-encode of the same pixels is unchanged", async () => {
  const pixels = basePixels();
  const a = await png(pixels, W, H, 9);
  const b = await png(pixels, W, H, 1);
  assert.notDeepEqual(a, b);
  const r = await compareImages(a, b);
  assert.equal(r.changed, false);
  assert.equal(r.diffPixels, 0);
});

test("compareImages — per-channel noise within the tolerance is unchanged", async () => {
  const pixels = basePixels();
  const noisy = Buffer.from(pixels);
  for (let i = 0; i < noisy.length; i += 4) {
    noisy[i] = Math.min(255, noisy[i] + 8);
    noisy[i + 2] = Math.max(0, noisy[i + 2] - 8);
  }
  const r = await compareImages(await png(pixels), await png(noisy));
  assert.equal(r.changed, false);
  assert.equal(r.diffPixels, 0);
});

test("compareImages — a few scattered anti-aliasing pixels are unchanged", async () => {
  const pixels = basePixels();
  let scattered = pixels;
  for (const [x, y] of [
    [10, 10],
    [300, 40],
    [500, 200],
    [700, 590],
    [42, 420],
  ]) {
    scattered = paintBlock(scattered, x, y, 2);
  }
  const r = await compareImages(await png(pixels), await png(scattered));
  assert.equal(r.changed, false);
  assert.equal(r.diffPixels, 20);
  assert.ok(r.maxTileDiffPixels < 16);
});

test("compareImages — a small localized change below the global threshold is changed by the tile rule", async () => {
  const pixels = basePixels();
  // 6×6 = 36 px is 0.0075% of 800×600 — under the 0.01% global threshold.
  const edited = paintBlock(pixels, 400, 300, 6);
  const r = await compareImages(await png(pixels), await png(edited));
  assert.ok(r.diffFraction < 0.0001);
  assert.equal(r.changed, true);
  assert.equal(r.reason, "tile");
  assert.equal(r.maxTileDiffPixels, 36);
});

test("compareImages — a small change straddling a tile corner is still caught", async () => {
  const pixels = basePixels();
  // 6×6 centred on (64, 64): split 9/9/9/9 across four aligned 32-px tiles.
  const edited = paintBlock(pixels, 61, 61, 6);
  const r = await compareImages(await png(pixels), await png(edited));
  assert.equal(r.changed, true);
  assert.equal(r.reason, "tile");
  assert.equal(r.maxTileDiffPixels, 36);
});

test("compareImages — a large change is changed by the global fraction", async () => {
  const pixels = basePixels();
  const edited = paintBlock(pixels, 0, 0, 200);
  const r = await compareImages(await png(pixels), await png(edited));
  assert.equal(r.changed, true);
  assert.equal(r.reason, "pixels");
  assert.ok(r.diffFraction > 0.05);
});

test("compareImages — different dimensions are changed", async () => {
  const a = await png(basePixels());
  const b = await png(basePixels(W, H + 2), W, H + 2);
  const r = await compareImages(a, b);
  assert.equal(r.changed, true);
  assert.equal(r.reason, "dimensions");
  assert.deepEqual(r.oldSize, [W, H]);
  assert.deepEqual(r.newSize, [W, H + 2]);
});

// ── acceptImages ──────────────────────────────────────────────

async function seedBatch(): Promise<{ from: string; to: string }> {
  const dirs = tmpDirs();
  const pixels = basePixels();
  // same.png: identical pixels, different bytes
  fs.writeFileSync(path.join(dirs.to, "same.png"), await png(pixels, W, H, 9));
  fs.writeFileSync(
    path.join(dirs.from, "same.png"),
    await png(pixels, W, H, 1),
  );
  // edited.png: localized change
  fs.writeFileSync(path.join(dirs.to, "edited.png"), await png(pixels));
  fs.writeFileSync(
    path.join(dirs.from, "edited.png"),
    await png(paintBlock(pixels, 100, 100, 10)),
  );
  // fresh.png: no existing file
  fs.writeFileSync(path.join(dirs.from, "fresh.png"), await png(pixels));
  // a non-PNG in --from is ignored
  fs.writeFileSync(path.join(dirs.from, "notes.txt"), "ignored");
  return dirs;
}

test("acceptImages — copies new and changed captures, skips unchanged ones", async () => {
  const { from, to } = await seedBatch();
  const before = fs.readFileSync(path.join(to, "same.png"));
  const report = await acceptImages({ from, to });

  assert.deepEqual(report.summary, {
    new: 1,
    changed: 1,
    unchanged: 1,
    forced: 0,
  });
  const byFile = Object.fromEntries(report.files.map((f) => [f.file, f]));
  assert.equal(byFile["fresh.png"].status, "new");
  assert.equal(byFile["fresh.png"].copied, true);
  assert.equal(byFile["edited.png"].status, "changed");
  assert.equal(byFile["edited.png"].copied, true);
  assert.equal(byFile["same.png"].status, "unchanged");
  assert.equal(byFile["same.png"].copied, false);
  assert.equal(byFile["notes.txt"], undefined);

  assert.deepEqual(fs.readFileSync(path.join(to, "same.png")), before);
  assert.deepEqual(
    fs.readFileSync(path.join(to, "edited.png")),
    fs.readFileSync(path.join(from, "edited.png")),
  );
  assert.ok(fs.existsSync(path.join(to, "fresh.png")));
});

test("acceptImages — --dry-run reports the same statuses and writes nothing", async () => {
  const { from, to } = await seedBatch();
  const snapshot = () =>
    Object.fromEntries(
      fs.readdirSync(to).map((f) => [f, fs.readFileSync(path.join(to, f))]),
    );
  const before = snapshot();
  const report = await acceptImages({ from, to, dryRun: true });
  assert.equal(report.dryRun, true);
  assert.deepEqual(report.summary, {
    new: 1,
    changed: 1,
    unchanged: 1,
    forced: 0,
  });
  assert.ok(report.files.every((f) => !f.copied));
  assert.deepEqual(snapshot(), before);
});

test("acceptImages — --force copies an unchanged capture and marks it forced", async () => {
  const { from, to } = await seedBatch();
  const report = await acceptImages({ from, to, force: ["same.png"] });
  const same = report.files.find((f) => f.file === "same.png");
  assert.equal(same?.status, "forced");
  assert.equal(same?.copied, true);
  assert.deepEqual(
    fs.readFileSync(path.join(to, "same.png")),
    fs.readFileSync(path.join(from, "same.png")),
  );
});

test("acceptImages — --force naming a file that was not captured fails", async () => {
  const { from, to } = await seedBatch();
  await assert.rejects(
    acceptImages({ from, to, force: ["missing.png"] }),
    (err: unknown) =>
      err instanceof ImageGateError && /missing\.png/.test(err.message),
  );
});

test("acceptImages — a Git LFS pointer in --to fails with a git lfs pull hint and copies nothing", async () => {
  const { from, to } = await seedBatch();
  const pointer =
    "version https://git-lfs.github.com/spec/v1\n" +
    "oid sha256:4d7a214614ab2935c943f9e0ff69d22eadbb8f32b1258daaa5e2ca24d17e2393\n" +
    "size 12345\n";
  fs.writeFileSync(path.join(to, "same.png"), pointer);
  assert.equal(isLfsPointer(Buffer.from(pointer)), true);

  await assert.rejects(acceptImages({ from, to }), (err: unknown) => {
    assert.ok(err instanceof ImageGateError);
    assert.match(err.message, /Git LFS pointer/);
    assert.match(err.message, /git lfs pull/);
    return true;
  });
  assert.equal(fs.existsSync(path.join(to, "fresh.png")), false);
});

test("acceptImages — an undecodable existing file fails instead of being overwritten", async () => {
  const { from, to } = await seedBatch();
  fs.writeFileSync(path.join(to, "same.png"), "not a png");
  await assert.rejects(
    acceptImages({ from, to }),
    (err: unknown) =>
      err instanceof ImageGateError && /Cannot decode/.test(err.message),
  );
  assert.equal(
    fs.readFileSync(path.join(to, "same.png"), "utf-8"),
    "not a png",
  );
});

test("acceptImages — a missing directory fails", async () => {
  const { from } = tmpDirs();
  await assert.rejects(
    acceptImages({ from, to: path.join(from, "nope") }),
    ImageGateError,
  );
});
