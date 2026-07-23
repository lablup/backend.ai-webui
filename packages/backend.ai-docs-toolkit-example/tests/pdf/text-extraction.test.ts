import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import zlib from "node:zlib";

import { pdfPath } from "./_helpers.js";

/**
 * pdf-lib does not expose a high-level text extractor (it only writes/edits
 * structure), and most PDF content streams are compressed (Flate). We DO
 * NOT pull a heavyweight text-extraction lib like `pdfjs-dist` here — the
 * cheaper "decompress every Flate stream and grep" approach is sufficient
 * for a smoke check that known fixture strings made it into the rendered
 * PDF. Latin text shows up as readable ASCII inside the decompressed
 * stream; CJK is encoded via font glyph indices and is intentionally NOT
 * asserted here (covered by `fonts.test.ts` instead).
 */
function decompressedContents(buf: Buffer): string {
  const out: string[] = [];
  const re = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(buf.toString("binary"))) !== null) {
    const raw = Buffer.from(m[1], "binary");
    try {
      out.push(zlib.inflateSync(raw).toString("binary"));
    } catch {
      // Stream wasn't Flate-compressed (e.g. inline image); skip.
      out.push(raw.toString("binary"));
    }
  }
  return out.join("\n");
}

/**
 * PDF text-stream encoding note: heading TEXT (e.g. "Quickstart") is
 * encoded via per-character `Tj`/`TJ` operators using font glyph IDs,
 * so a contiguous-substring grep does not find it. Heading SLUGS
 * (e.g. `quickstart`), however, appear verbatim inside the PDF
 * outline / link-annotation structure — those are exactly the smoke
 * checks below. They prove "this chapter made it into the rendered
 * PDF outline" without needing a real text extractor.
 */

test("PDF[en] — outline / link annotations include every chapter slug", () => {
  const buf = fs.readFileSync(pdfPath("en"));
  const text = decompressedContents(buf);
  for (const slug of ["quickstart", "features", "customization", "about"]) {
    assert.ok(
      text.includes(slug),
      `expected slug '${slug}' to appear in the PDF outline/link annotations`,
    );
  }
});

test("PDF[ko] — outline / link annotations include every chapter slug", () => {
  const buf = fs.readFileSync(pdfPath("ko"));
  const text = decompressedContents(buf);
  // Slugs are derived from the markdown filename (en titles), so they
  // are still ASCII even in the Korean PDF.
  for (const slug of ["quickstart", "features", "customization", "about"]) {
    assert.ok(
      text.includes(slug),
      `expected slug '${slug}' to appear in the PDF outline/link annotations`,
    );
  }
});

test("PDF[ko] — file size is consistent with CJK font embedding (smoke)", () => {
  const buf = fs.readFileSync(pdfPath("ko"));
  // CJK-embedded PDFs are materially larger than ASCII-only ones because
  // the font subset is heavier. The example's en PDF is ~100 KB; ko is
  // ~300 KB. Assert ko is at least 200 KB to catch a regression where
  // CJK fonts silently fall through to substitution glyphs.
  assert.ok(buf.length > 200_000, `ko PDF is suspiciously small: ${buf.length} bytes`);
});
