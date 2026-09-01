import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { copyUserOgImage, renderDefaultOgImage } from "./og-image-renderer.js";

const TINY_PNG = Buffer.from([
  // 8-byte PNG signature
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  // IHDR chunk: 1×1, 8-bit, RGB
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde,
]);

test("copyUserOgImage — copies the source file under assets/og-default.<ext>", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "og-img-"));
  try {
    const src = path.join(dir, "brand.png");
    fs.writeFileSync(src, TINY_PNG);
    const dest = path.join(dir, "out");
    const result = copyUserOgImage({ sourcePath: src, destDir: dest });
    assert.notEqual(result, null);
    assert.equal(result!.relUrl, "assets/og-default.png");
    assert.ok(fs.existsSync(result!.absPath));
    assert.deepEqual(fs.readFileSync(result!.absPath), TINY_PNG);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("copyUserOgImage — returns null when the source file is missing (no throw)", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "og-img-"));
  try {
    const result = copyUserOgImage({
      sourcePath: path.join(dir, "missing.png"),
      destDir: path.join(dir, "out"),
    });
    assert.equal(result, null);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("copyUserOgImage — preserves the source extension in the dest filename", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "og-img-"));
  try {
    const src = path.join(dir, "brand.jpg");
    fs.writeFileSync(src, Buffer.from([0xff, 0xd8, 0xff, 0xe0]));
    const result = copyUserOgImage({ sourcePath: src, destDir: dir });
    assert.notEqual(result, null);
    assert.match(result!.relUrl, /assets\/og-default\.jpg$/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("renderDefaultOgImage — returns null and warns when source SVG is missing (no throw)", async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "og-img-"));
  try {
    let warned = "";
    t.mock.method(console, "warn", (msg: string) => {
      warned = msg;
    });
    const result = await renderDefaultOgImage({
      svgSourcePath: path.join(dir, "missing.svg"),
      destDir: path.join(dir, "out"),
    });
    assert.equal(result, null);
    assert.match(warned, /Source SVG not found/i);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("renderDefaultOgImage — gracefully handles missing Playwright peer dep (returns null, no throw)", async (t) => {
  // Skip when Playwright IS installed — this test is for the absence path.
  // Note: in typical CI/dev installs the dynamic `import("playwright")`
  // succeeds and this test skips. To exercise the missing-dep branch
  // deterministically, the renderer would need Playwright loader DI —
  // tracked as a follow-up; out of scope for this test-coverage PR.
  let playwrightInstalled = false;
  try {
    await import("playwright");
    playwrightInstalled = true;
  } catch {
    // Not installed — proceed.
  }
  if (playwrightInstalled) {
    t.skip("playwright is installed in this environment");
    return;
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "og-img-"));
  try {
    const svg = path.join(dir, "x.svg");
    fs.writeFileSync(svg, "<svg xmlns='http://www.w3.org/2000/svg'/>");
    t.mock.method(console, "warn", () => {});
    const result = await renderDefaultOgImage({
      svgSourcePath: svg,
      destDir: path.join(dir, "out"),
    });
    assert.equal(result, null);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
