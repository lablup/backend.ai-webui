import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  contentHash,
  hashedFilename,
  resolveAsset,
  writeHashedAsset,
  type AssetManifest,
} from "./asset-hasher.js";

test("contentHash — deterministic for identical input", () => {
  const a = contentHash("hello world");
  const b = contentHash("hello world");
  assert.equal(a, b);
});

test("contentHash — differs on different input", () => {
  const a = contentHash("hello world");
  const b = contentHash("hello world!");
  assert.notEqual(a, b);
});

test("contentHash — returns 8 hex chars", () => {
  const h = contentHash("anything");
  assert.equal(h.length, 8);
  assert.match(h, /^[0-9a-f]{8}$/);
});

test("contentHash — accepts Buffer input identically to string", () => {
  const fromString = contentHash("data");
  const fromBuffer = contentHash(Buffer.from("data", "utf8"));
  assert.equal(fromString, fromBuffer);
});

test("hashedFilename — inserts hash before the extension", () => {
  assert.equal(hashedFilename("styles.css", "deadbeef"), "styles.deadbeef.css");
});

test("hashedFilename — handles compound extensions by treating only the last as ext", () => {
  // .webmanifest is a single extension; documented behavior is `name.{hash}.{ext}`.
  assert.equal(
    hashedFilename("site.webmanifest", "abc12345"),
    "site.abc12345.webmanifest",
  );
});

test("hashedFilename — appends `.{hash}` when there is no extension", () => {
  assert.equal(hashedFilename("noext", "12345678"), "noext.12345678");
});

test("writeHashedAsset — writes bytes to disk under the hashed name and registers in manifest", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hasher-"));
  try {
    const manifest: AssetManifest = {};
    const written = writeHashedAsset(dir, "styles.css", "body { color: red; }", manifest);
    assert.match(written, /^styles\.[0-9a-f]{8}\.css$/);
    assert.equal(manifest["styles.css"], written);
    assert.equal(
      fs.readFileSync(path.join(dir, written), "utf8"),
      "body { color: red; }",
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("writeHashedAsset — different bytes for the same logical name produce different hashed filenames", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hasher-"));
  try {
    const manifest: AssetManifest = {};
    const a = writeHashedAsset(dir, "styles.css", "a", manifest);
    const b = writeHashedAsset(dir, "styles.css", "bb", manifest);
    assert.notEqual(a, b);
    // The manifest is overwritten — most recent write wins.
    assert.equal(manifest["styles.css"], b);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("resolveAsset — returns the hashed name for a registered asset", () => {
  const manifest: AssetManifest = { "search.js": "search.cafef00d.js" };
  assert.equal(resolveAsset(manifest, "search.js"), "search.cafef00d.js");
});

test("resolveAsset — returns null for an unregistered asset (no throw)", () => {
  const manifest: AssetManifest = {};
  assert.equal(resolveAsset(manifest, "code-copy.js"), null);
});
