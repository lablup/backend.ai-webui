import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";

import { parsePngDimensions, readImageDimensions } from "./image-meta.js";

/** Build a minimal valid PNG with the given dimensions (RGB, 8-bit). */
function makePng(width: number, height: number): Buffer {
  function chunk(type: string, data: Buffer): Buffer {
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length);
    const typeBuf = Buffer.from(type, "ascii");
    // CRC32 (Sarwate's table-based variant — same algorithm zlib uses).
    const table: number[] = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
    let c = 0xffffffff;
    for (const b of Buffer.concat([typeBuf, data])) {
      c = (table[(c ^ b) & 0xff] ^ (c >>> 8)) >>> 0;
    }
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE((c ^ 0xffffffff) >>> 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2; // color type = RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  // Single solid-color row, replicated `height` times.
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(width * 3, 0)]);
  const idat = zlib.deflateSync(Buffer.concat(Array(height).fill(row)));
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

test("parsePngDimensions — reads width/height from a valid PNG buffer", () => {
  const png = makePng(240, 120);
  assert.deepEqual(parsePngDimensions(png), { width: 240, height: 120 });
});

test("parsePngDimensions — returns null for buffers shorter than the IHDR window", () => {
  assert.equal(parsePngDimensions(Buffer.alloc(10)), null);
});

test("parsePngDimensions — returns null when the PNG signature is wrong", () => {
  const bad = Buffer.alloc(32);
  bad[0] = 0xff; // not 0x89
  assert.equal(parsePngDimensions(bad), null);
});

test("parsePngDimensions — returns null when the first chunk is not IHDR", () => {
  const png = makePng(10, 10);
  // Replace bytes 12..16 ("IHDR") with "IDAT" — first chunk type is now wrong.
  const bad = Buffer.from(png);
  bad.write("IDAT", 12, "ascii");
  assert.equal(parsePngDimensions(bad), null);
});

test("readImageDimensions — happy path on a real file", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "image-meta-"));
  try {
    const file = path.join(dir, "x.png");
    fs.writeFileSync(file, makePng(64, 32));
    assert.deepEqual(readImageDimensions(file), { width: 64, height: 32 });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("readImageDimensions — returns null on a missing file (no throw)", () => {
  assert.equal(readImageDimensions("/path/does/not/exist.png"), null);
});

test("readImageDimensions — returns null on an empty file (no throw)", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "image-meta-"));
  try {
    const file = path.join(dir, "empty.png");
    fs.writeFileSync(file, Buffer.alloc(0));
    assert.equal(readImageDimensions(file), null);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("readImageDimensions — returns null on a non-PNG file (no throw)", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "image-meta-"));
  try {
    const file = path.join(dir, "garbage.png");
    fs.writeFileSync(file, Buffer.from("not a png at all, just random text"));
    assert.equal(readImageDimensions(file), null);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
