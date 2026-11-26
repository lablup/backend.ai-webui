import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { measureApp, measureLibrary, measureTarget } from "./measure.mjs";

const SCRIPT = fileURLToPath(new URL("./measure.mjs", import.meta.url));

function tree(files) {
  const dir = mkdtempSync(join(tmpdir(), "bundle-size-measure-"));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  return dir;
}

const gz = (s) => gzipSync(Buffer.from(s)).length;

const APP = {
  "index.html":
    '<script type="module" crossorigin src="/assets/index-AAAAAAAA.js"></script>',
  "assets/index-AAAAAAAA.js": 'import "./vendor-BBBBBBBB.js";\nconsole.log(1);',
  "assets/vendor-BBBBBBBB.js": "export const v = 1;",
  "assets/page-CCCCCCCC.js": "export const a = 1;",
  "assets/page-DDDDDDDD.js": "export const b = 2;",
  "assets/actionscript-3--17pq3dv.js": "export const c = 3;",
  "assets/index-EEEEEEEE.css": "body{color:red}",
  "assets/index-AAAAAAAA.js.map": "{}",
};

test("the app totals count eager chunks the way the budget does", () => {
  const { totals } = measureApp(tree(APP));
  const eager = [
    APP["assets/index-AAAAAAAA.js"],
    APP["assets/vendor-BBBBBBBB.js"],
  ];
  assert.equal(totals.eagerChunks, 2);
  assert.equal(totals.eagerJsBytes, eager.join("").length);
  assert.equal(totals.eagerJsGzipBytes, gz(eager[0]) + gz(eager[1]));
  assert.equal(totals.chunks, 5);
  assert.equal(totals.cssBytes, APP["assets/index-EEEEEEEE.css"].length);
  assert.equal(totals.cssGzipBytes, gz(APP["assets/index-EEEEEEEE.css"]));
});

test("app parts are chunk stems, with chunks of one stem summed", () => {
  const { parts } = measureApp(tree(APP));
  const byName = Object.fromEntries(parts.map((p) => [p.name, p]));
  assert.deepEqual(Object.keys(byName).sort(), [
    "actionscript-3",
    "index",
    "page",
    "vendor",
  ]);
  assert.equal(
    byName.page.bytes,
    APP["assets/page-CCCCCCCC.js"].length +
      APP["assets/page-DDDDDDDD.js"].length,
  );
  assert.match(byName.page.hash, /^[0-9a-f]{12}$/);
});

test("a chunk whose hash changes keeps its stem and changes its part hash", () => {
  const before = measureApp(tree(APP)).parts.find((p) => p.name === "vendor");
  const changed = { ...APP };
  delete changed["assets/vendor-BBBBBBBB.js"];
  changed["assets/vendor-ZZZZZZZZ.js"] = "export const v = 2;";
  changed["assets/index-AAAAAAAA.js"] =
    'import "./vendor-ZZZZZZZZ.js";\nconsole.log(1);';
  const after = measureApp(tree(changed)).parts.find(
    (p) => p.name === "vendor",
  );
  assert.notEqual(before.hash, after.hash);
});

test("the library lists every .js and .css file by stem path, skipping maps and types", () => {
  const dir = tree({
    "index.js": "export {}",
    "index.js.map": "{}",
    "index.d.ts": "export {};",
    "locale/ko.js": "export default {}",
    "style.css": "a{}",
    "dayjs.min-DLOgbIIN.js": "export const d = 1;",
    "theme-B5OxjixH.css": "b{}",
    "locale/zh-TW-D-as91g3.js": "export const z = 1;",
    "chunk-AAAAAAAA.js": "1",
    "chunk-BBBBBBBB.js": "22",
  });
  const { totals, parts } = measureLibrary(dir);
  const byName = Object.fromEntries(parts.map((p) => [p.name, p]));
  assert.deepEqual(Object.keys(byName).sort(), [
    "chunk.js",
    "dayjs.min.js",
    "index.js",
    "locale/ko.js",
    "locale/zh-TW.js",
    "style.css",
    "theme.css",
  ]);
  assert.equal(byName["chunk.js"].bytes, 3);
  assert.equal(totals.cssBytes, 6);
});

test("a library file whose hash changes keeps its part name", () => {
  const before = measureLibrary(tree({ "dayjs.min-DxrgBenM.js": "a" })).parts;
  const after = measureLibrary(tree({ "dayjs.min-DLOgbIIN.js": "b" })).parts;
  assert.equal(before[0].name, after[0].name);
  assert.notEqual(before[0].hash, after[0].hash);
});

test("a failed build carries only the error", () => {
  const record = measureTarget({
    target: { id: "webui", kind: "app" },
    side: "base",
    commit: "abc",
    error: "base build failed",
  });
  assert.deepEqual(record, {
    target: "webui",
    side: "base",
    commit: "abc",
    source: "build",
    error: "base build failed",
  });
});

test("the CLI writes bundle-size/<id>.<side>.json", () => {
  const dist = tree({ "index.js": "export {}" });
  const out = mkdtempSync(join(tmpdir(), "bundle-size-out-"));
  execFileSync("node", [
    SCRIPT,
    "--target",
    "backend.ai-ui",
    "--side",
    "head",
    "--dir",
    dist,
    "--commit",
    "deadbeef",
    "--out-dir",
    out,
  ]);
  const record = JSON.parse(
    readFileSync(join(out, "backend.ai-ui.head.json"), "utf8"),
  );
  assert.equal(record.target, "backend.ai-ui");
  assert.equal(record.side, "head");
  assert.equal(record.commit, "deadbeef");
  assert.equal(record.source, "build");
  assert.equal(record.parts.length, 1);
});
