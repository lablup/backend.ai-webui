import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { MARKER, render } from "./render.mjs";

const SCRIPT = fileURLToPath(new URL("./render.mjs", import.meta.url));

const HEAD = "1111111aaaaaaa";
const BASE = "2222222bbbbbbb";

const PLAN = {
  head: HEAD,
  base: BASE,
  toolchainChanged: false,
  targets: [
    { id: "webui", compared: true },
    { id: "backend.ai-ui", compared: false },
  ],
};

const part = (name, gzipBytes, hash = name) => ({
  name,
  bytes: gzipBytes * 3,
  gzipBytes,
  hash,
});

const record = (side, totals, parts, extra = {}) => ({
  target: "webui",
  side,
  commit: side === "head" ? HEAD : BASE,
  source: "build",
  totals,
  parts,
  ...extra,
});

test("a compared target shows base, head and the difference", () => {
  const { markdown, manifest } = render(PLAN, {
    "webui.base": record(
      "base",
      { eagerJsBytes: 2048, chunks: 10 },
      [part("index", 1000), part("same", 50), part("gone", 300)],
      { source: "cache" },
    ),
    "webui.head": record("head", { eagerJsBytes: 3072, chunks: 11 }, [
      part("index", 1500, "index2"),
      part("same", 50),
      part("fresh", 200),
    ]),
  });

  assert.ok(markdown.startsWith(`${MARKER}\n`));
  assert.deepEqual(manifest, { compared: 1 });
  assert.match(markdown, /Head `1111111` · merge base `2222222`/);
  assert.match(markdown, /Base `2222222` from the cache\./);
  assert.match(
    markdown,
    /\| Eager JS \| 2\.0 kB \| 3\.0 kB \| \+1\.0 kB \| \+50\.00% \|/,
  );
  assert.match(markdown, /\| Chunks \| 10 \| 11 \| \+1 \| \+10\.00% \|/);
  assert.match(markdown, /\| `fresh` \(new\) \| 0 B \| 200 B \| \+200 B \|/);
  assert.match(markdown, /\| `gone` \(removed\) \| 300 B \| 0 B \| −300 B \|/);
  assert.doesNotMatch(markdown, /`same`/);
  const order = ["`index`", "`gone`", "`fresh`"].map((n) =>
    markdown.indexOf(n),
  );
  assert.deepEqual(
    [...order].sort((a, b) => a - b),
    order,
  );
  assert.match(markdown, /Unchanged: `backend\.ai-ui`\./);
});

test("only the ten largest part changes are listed", () => {
  const parts = (offset) =>
    Array.from({ length: 15 }, (_, i) =>
      part(`p${i}`, 100 + i * offset, `h${i}-${offset}`),
    );
  const { markdown } = render(PLAN, {
    "webui.base": record("base", { jsBytes: 1 }, parts(0)),
    "webui.head": record("head", { jsBytes: 1 }, parts(10)),
  });
  assert.equal((markdown.match(/^\| `p\d+` \|/gm) ?? []).length, 10);
  assert.match(markdown, /`p14`/);
  assert.doesNotMatch(markdown, /`p4`/);
});

test("a failed base build shows its error in place of the base column", () => {
  const { markdown, manifest } = render(PLAN, {
    "webui.base": {
      target: "webui",
      side: "base",
      commit: BASE,
      source: "build",
      error: "base build failed: boom",
    },
    "webui.head": record("head", { jsBytes: 4096 }, []),
  });
  assert.equal(manifest.compared, 1);
  assert.match(markdown, /Base build failed: `base build failed: boom`/);
  assert.match(markdown, /\| \| Head \|/);
  assert.match(markdown, /\| JS \| 4\.0 kB \|/);
});

test("nothing compared still renders the marker and the unchanged line", () => {
  const plan = {
    ...PLAN,
    targets: PLAN.targets.map((t) => ({ ...t, compared: false })),
  };
  const { markdown, manifest } = render(plan, {});
  assert.ok(markdown.startsWith(MARKER));
  assert.equal(manifest.compared, 0);
  assert.match(markdown, /No target's inputs changed/);
  assert.match(markdown, /Unchanged: `webui`, `backend\.ai-ui`\./);
});

test("a push run renders the head values only", () => {
  const plan = {
    head: HEAD,
    base: null,
    targets: PLAN.targets.map((t) => ({ ...t, compared: false })),
  };
  const { markdown, manifest } = render(plan, {
    "webui.head": record("head", { jsBytes: 2 * 1024 * 1024 }, []),
  });
  assert.equal(manifest.compared, 0);
  assert.match(markdown, /Commit `1111111`/);
  assert.match(markdown, /\| JS \| 2\.00 MB \|/);
  assert.doesNotMatch(markdown, /backend\.ai-ui/);
});

test("part names cannot break out of their code span or table cell", () => {
  const { markdown } = render(PLAN, {
    "webui.base": record("base", { jsBytes: 1 }, []),
    "webui.head": record("head", { jsBytes: 1 }, [part("a`b|c", 10)]),
  });
  assert.match(markdown, /\| `abc` \(new\) \|/);
});

test("the CLI exits zero and writes both files even on unreadable input", () => {
  const dir = mkdtempSync(join(tmpdir(), "bundle-size-render-"));
  const planPath = join(dir, "plan.json");
  writeFileSync(planPath, "{not json");
  execFileSync("node", [SCRIPT, "--plan", planPath, "--out-dir", dir]);
  assert.ok(
    readFileSync(join(dir, "bundle-size-report.md"), "utf8").startsWith(MARKER),
  );
  assert.deepEqual(
    JSON.parse(readFileSync(join(dir, "bundle-size-report.json"), "utf8")),
    { compared: 0 },
  );
});

test("a base that is the head measurement says so instead of naming a cache", () => {
  const head = record("head", { eagerJsBytes: 2048 }, [part("index", 1000)]);
  const { markdown } = render(PLAN, {
    "webui.base": { ...head, side: "base", source: "head" },
    "webui.head": head,
  });
  assert.match(
    markdown,
    /Inputs unchanged since the merge base; the head measurement stands in for the base, so Δ is 0 and does not show the toolchain change\./,
  );
  assert.doesNotMatch(markdown, /from the cache/);
});
