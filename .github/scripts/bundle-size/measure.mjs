#!/usr/bin/env node
// Measure one bundle target's build output into bundle-size/<id>.<side>.json (ADR 0041).
//
// Usage: node measure.mjs --target <id> --side head|base --dir <output directory>
//          [--commit <sha>] [--error <message>] [--out-dir bundle-size]
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { join, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import { measure as measureEager } from "../../../scripts/bundle-budget.mjs";
import { TARGETS } from "./targets.mjs";

const CHUNK_STEM = /-[A-Za-z0-9_-]{8}\.js$/;
const FILE_HASH = /-[A-Za-z0-9_-]{8}(\.(?:js|css))$/;

function measureFiles(root, files, partName) {
  const totals = { jsBytes: 0, jsGzipBytes: 0, cssBytes: 0, cssGzipBytes: 0 };
  const parts = new Map();
  for (const file of files) {
    const content = readFileSync(join(root, file));
    const gzipBytes = gzipSync(content).length;
    const kind = file.endsWith(".js") ? "js" : "css";
    totals[`${kind}Bytes`] += content.length;
    totals[`${kind}GzipBytes`] += gzipBytes;
    const name = partName(file);
    if (name === null) continue;
    const part = parts.get(name) ?? {
      name,
      bytes: 0,
      gzipBytes: 0,
      hash: createHash("sha256"),
    };
    part.bytes += content.length;
    part.gzipBytes += gzipBytes;
    part.hash.update(content);
    parts.set(name, part);
  }
  return {
    totals,
    parts: [...parts.values()]
      .map((p) => ({ ...p, hash: p.hash.digest("hex").slice(0, 12) }))
      .sort((a, b) => b.bytes - a.bytes),
  };
}

const isAsset = (file) => file.endsWith(".js") || file.endsWith(".css");

export function measureApp(dir) {
  const eager = measureEager(dir);
  const files = readdirSync(join(dir, "assets")).filter(isAsset).sort();
  const { totals, parts } = measureFiles(join(dir, "assets"), files, (file) =>
    file.endsWith(".js")
      ? file.replace(CHUNK_STEM, "").replace(/\.js$/, "")
      : null,
  );
  return {
    totals: {
      eagerJsBytes: eager.eagerBytes,
      eagerJsGzipBytes: eager.eagerGzipBytes,
      eagerChunks: eager.eagerChunkCount,
      jsBytes: eager.totalJsBytes,
      jsGzipBytes: totals.jsGzipBytes,
      cssBytes: totals.cssBytes,
      cssGzipBytes: totals.cssGzipBytes,
      chunks: eager.chunkCount,
    },
    parts,
  };
}

export function measureLibrary(dir) {
  const files = readdirSync(dir, { recursive: true })
    .map((file) => file.split(sep).join("/"))
    .filter(isAsset)
    .sort();
  return measureFiles(dir, files, (file) => file.replace(FILE_HASH, "$1"));
}

const MEASURE_BY_KIND = { app: measureApp, library: measureLibrary };

export function measureTarget({ target, side, dir, commit, error }) {
  const record = { target: target.id, side, commit, source: "build" };
  if (error) return { ...record, error };
  return { ...record, ...MEASURE_BY_KIND[target.kind](dir) };
}

export function writeMeasurement(record, outDir = "bundle-size") {
  mkdirSync(outDir, { recursive: true });
  const path = join(outDir, `${record.target}.${record.side}.json`);
  writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`);
  return path;
}

if (
  process.argv[1] &&
  existsSync(process.argv[1]) &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href
) {
  const args = process.argv.slice(2);
  const flag = (name) => {
    const i = args.indexOf(`--${name}`);
    return i === -1 ? undefined : args[i + 1];
  };
  const target = TARGETS.find((t) => t.id === flag("target"));
  const side = flag("side");
  const dir = flag("dir");
  if (!target || !["head", "base"].includes(side) || (!dir && !flag("error"))) {
    console.error(
      "usage: measure.mjs --target <id> --side head|base --dir <dir> [--commit <sha>] [--error <message>] [--out-dir <dir>]",
    );
    process.exit(2);
  }
  const commit =
    flag("commit") ??
    execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: dir,
      encoding: "utf8",
    }).trim();
  const path = writeMeasurement(
    measureTarget({ target, side, dir, commit, error: flag("error") }),
    flag("out-dir"),
  );
  console.log(`Measured ${target.id} (${side}) -> ${path}`);
}
