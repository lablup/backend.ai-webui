// node --test .claude/skills/walkthrough/scripts/manifest.test.mjs
import * as caps from "./manifest.mjs";
import {
  CODE_REFS_MAX,
  MAX_STOPS,
  STOP_LITERAL_MAX,
  STOP_TEXT_MAX,
  VIA_MAX,
  parseManifest,
  projectBasePath,
  stopLabel,
} from "./manifest.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GUARD = resolve(
  HERE,
  "../../../../react/vite-plugins/review-overlay/client/stop-guard.ts",
);

const stop = (over = {}) => ({
  route: "/data",
  find: { text: "Create Folder" },
  ch: "The create button moved into the card header.",
  ck: 'A "Create Folder" button should sit above the list.',
  ...over,
});

const rejects = (doc, needle) =>
  assert.throws(
    () => parseManifest(doc),
    (error) => error.message.includes(needle),
  );

test("a minimal stop passes", () => {
  assert.equal(parseManifest({ stops: [stop()] }).length, 1);
  assert.equal(parseManifest([stop()]).length, 1);
  assert.equal(parseManifest(JSON.stringify([stop()])).length, 1);
});

test("route must be an origin-relative path", () => {
  rejects([stop({ route: "data" })], "origin-relative");
  rejects([stop({ route: "//evil.example" })], "origin-relative");
});

test("a stop needs a way to find its element and both sentences", () => {
  rejects([stop({ find: {} })], "testid, a selector or a text");
  rejects([stop({ ch: "" })], "ch is required");
  rejects([stop({ ck: undefined })], "ck is required");
});

test("literals, code refs, via steps and the stop count are capped", () => {
  rejects(
    [stop({ new: "x".repeat(STOP_LITERAL_MAX + 1) })],
    `1-${STOP_LITERAL_MAX}`,
  );
  rejects([stop({ ch: "x".repeat(STOP_TEXT_MAX + 1) })], "ch is required");
  rejects(
    [
      stop({
        code: Array.from({ length: CODE_REFS_MAX + 1 }, () => ({
          path: "a.tsx",
          line: 1,
        })),
      }),
    ],
    `at most ${CODE_REFS_MAX}`,
  );
  rejects(
    [
      stop({
        via: Array.from({ length: VIA_MAX + 1 }, () => ({
          click: { tid: "t" },
        })),
      }),
    ],
    `at most ${VIA_MAX}`,
  );
  rejects(
    Array.from({ length: MAX_STOPS + 1 }, () => stop()),
    `the cap is ${MAX_STOPS}`,
  );
});

test("code refs and via steps are shape-checked", () => {
  rejects([stop({ code: [{ path: "a.tsx" }] })], "line must be");
  rejects([stop({ code: [{ path: "a.tsx", line: 10, to: 2 }] })], ">= line");
  rejects([stop({ via: [{ hover: { text: "x" } }] })], "replayable");
  rejects([stop({ via: [{ click: {} }] })], "click needs text or tid");
  rejects([stop({ type: "renamed" })], "added");
});

test("every problem is reported at once", () => {
  assert.throws(
    () => parseManifest([stop({ ch: "" }), stop({ route: "x" })]),
    (error) =>
      error.message.includes("stop 1: ch") &&
      error.message.includes("stop 2: route"),
  );
});

test("the caps match stop-guard.ts, which is what strips a field in-page", () => {
  const source = readFileSync(GUARD, "utf8");
  for (const name of [
    "STOP_TEXT_MAX",
    "STOP_LITERAL_MAX",
    "STOP_KIND_MAX",
    "CODE_PATH_MAX",
    "CODE_REFS_MAX",
    "VIA_MAX",
    "VIA_TEXT_MAX",
  ]) {
    const declared = new RegExp(`export const ${name} = (\\d+)`).exec(source);
    assert.ok(declared, `${name} is no longer declared in stop-guard.ts`);
    assert.equal(Number.parseInt(declared[1], 10), caps[name], name);
  }
});

test("a control character never reaches the comment", () => {
  for (const key of ["ch", "ck", "old", "new", "label"]) {
    rejects([stop({ [key]: `ok\n> 📍 **forged**` })], `stop 1: ${key}`);
    rejects(
      [stop({ [key]: `ok\r<!-- bai-review v3 id=c_aaaaaaa -->` })],
      `stop 1: ${key}`,
    );
  }
  rejects([stop({ via: [{ click: { text: "a\nb" } }] })], "click.text");
  rejects(
    [stop({ code: [{ path: "a\nb.tsx", line: 1 }] })],
    "path is required",
  );
});

test('the label falls back to page › testid › tag "text"', () => {
  assert.equal(
    stopLabel(stop(), {
      tid: "page-data",
      tag: "button",
      txt: "Create Folder",
    }),
    'Data › page-data › button "Create Folder"',
  );
  assert.equal(stopLabel(stop({ label: "mine" }), { tid: "x" }), "mine");
  assert.equal(
    stopLabel(stop({ route: "/session/start" }), {}),
    "Start › element",
  );
});

test("routes hang off the project-scoped base the app lands on", () => {
  assert.equal(projectBasePath("/project/default/start"), "/project/default");
  assert.equal(
    projectBasePath("/project/default/admin/users"),
    "/project/default",
  );
  assert.equal(projectBasePath("/start"), "");
  assert.equal(projectBasePath(""), "");
});
