/**
 * Best-effort image metadata extraction for static-site image rendering.
 *
 * Currently supports parsing PNG IHDR width/height. Other formats fall through
 * and return `null` so callers can omit dimension attributes without breaking
 * the build.
 *
 * PNG layout (relevant prefix):
 *   - 8-byte signature: 89 50 4E 47 0D 0A 1A 0A
 *   - 4-byte chunk length (big-endian)
 *   - 4-byte chunk type ("IHDR")
 *   - 4-byte width  (big-endian)
 *   - 4-byte height (big-endian)
 */

import fs from "fs";

export interface ImageDimensions {
  width: number;
  height: number;
}

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

/**
 * Parse PNG width/height from a buffer. Returns null on any parse failure.
 */
export function parsePngDimensions(buf: Buffer): ImageDimensions | null {
  try {
    if (buf.length < 24) return null;
    // Check signature
    for (let i = 0; i < PNG_SIGNATURE.length; i++) {
      if (buf[i] !== PNG_SIGNATURE[i]) return null;
    }
    // First chunk type starts at byte 12 (8 sig + 4 length)
    const chunkType = buf.toString("ascii", 12, 16);
    if (chunkType !== "IHDR") return null;
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
    if (width <= 0 || height <= 0) return null;
    return { width, height };
  } catch {
    return null;
  }
}

/**
 * Read just enough of an image file to extract its dimensions. Returns null
 * on any I/O or parse failure — callers must never break the build on this.
 */
export function readImageDimensions(filePath: string): ImageDimensions | null {
  let fd: number | null = null;
  try {
    fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(32);
    const bytesRead = fs.readSync(fd, buf, 0, buf.length, 0);
    if (bytesRead < 24) return null;
    return parsePngDimensions(buf.subarray(0, bytesRead));
  } catch {
    return null;
  } finally {
    if (fd !== null) {
      try {
        fs.closeSync(fd);
      } catch {
        // ignore
      }
    }
  }
}
