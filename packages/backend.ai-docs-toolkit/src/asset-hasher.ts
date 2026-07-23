/**
 * Static asset content-hashing pipeline.
 *
 * Given a logical asset name (e.g. `styles.css`) and its bytes, produces a
 * deterministic 8-character hex content hash and a hashed filename
 * (e.g. `styles.deadbeef.css`). Maintains a manifest map of
 * `logical-name → hashed-name` so the page builder can resolve `<link>` and
 * `<script>` URLs without knowing the hash up front.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";

export type AssetManifest = Record<string, string>;

/** Compute an 8-char hex content hash. */
export function contentHash(data: string | Buffer): string {
  return crypto.createHash("sha256").update(data).digest("hex").slice(0, 8);
}

/**
 * Insert the hash before the extension.
 *   styles.css         → styles.{hash}.css
 *   site.webmanifest   → site.{hash}.webmanifest
 *   noext              → noext.{hash}
 */
export function hashedFilename(name: string, hash: string): string {
  const ext = path.extname(name);
  if (!ext) return `${name}.${hash}`;
  const base = name.slice(0, -ext.length);
  return `${base}.${hash}${ext}`;
}

/**
 * Write `bytes` to `assetsDir/{name with hash}` and record it in `manifest`.
 * Returns the hashed filename (relative — no directory).
 */
export function writeHashedAsset(
  assetsDir: string,
  logicalName: string,
  bytes: string | Buffer,
  manifest: AssetManifest,
): string {
  const hash = contentHash(bytes);
  const hashedName = hashedFilename(logicalName, hash);
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.writeFileSync(path.join(assetsDir, hashedName), bytes);
  manifest[logicalName] = hashedName;
  return hashedName;
}

/**
 * Look up a hashed name from the manifest, falling back to the logical name
 * if the asset wasn't registered (so callers don't crash on optional assets
 * that haven't been added yet, e.g. F4's `code-copy.js`).
 */
export function resolveAsset(
  manifest: AssetManifest,
  logicalName: string,
): string | null {
  return manifest[logicalName] ?? null;
}
