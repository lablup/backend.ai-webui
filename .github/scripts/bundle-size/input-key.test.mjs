import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { inputKey, plan } from "./input-key.mjs";

const TARGETS = [
  { id: "app", inputs: ["app", "shared.json"] },
  { id: "lib", inputs: ["lib", "shared.json"] },
];
const TOOLCHAIN = ["tools"];

function repo() {
  const dir = mkdtempSync(join(tmpdir(), "bundle-size-key-"));
  const git = (...args) =>
    execFileSync("git", args, { cwd: dir, encoding: "utf8" }).trim();
  git("init", "-q");
  git("config", "user.email", "test@example.com");
  git("config", "user.name", "test");
  const write = (path, content) => {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), content);
  };
  const commit = (message) => {
    git("add", "-A");
    git("commit", "-q", "-m", message);
    return git("rev-parse", "HEAD");
  };
  write("app/index.js", "app");
  write("lib/index.js", "lib");
  write("shared.json", "{}");
  write("tools/run.mjs", "v1");
  return { dir, write, commit, remove: (p) => rmSync(join(dir, p)) };
}

const run = (r, base, head = "HEAD") =>
  plan({ head, base, cwd: r.dir, targets: TARGETS, toolchainPaths: TOOLCHAIN });

test("only the target whose inputs changed is compared", () => {
  const r = repo();
  const base = r.commit("base");
  r.write("lib/index.js", "lib v2");
  r.write("unrelated.txt", "x");
  r.commit("head");

  const p = run(r, base);
  const [app, lib] = p.targets;
  assert.equal(app.compared, false);
  assert.equal(app.headKey, app.baseKey);
  assert.equal(app.restoreKey, "");
  assert.equal(lib.compared, true);
  assert.notEqual(lib.headKey, lib.baseKey);
  assert.equal(lib.restoreKey, lib.baseCacheKey);
  assert.equal(
    lib.baseCacheKey,
    `bundle-size-${p.toolchain}-lib-${lib.baseKey}`,
  );
});

test("a shared input changes every target that lists it", () => {
  const r = repo();
  const base = r.commit("base");
  r.write("shared.json", '{"a":1}');
  r.commit("head");

  assert.deepEqual(
    run(r, base).targets.map((t) => t.compared),
    [true, true],
  );
});

test("a toolchain change compares every target", () => {
  const r = repo();
  const base = r.commit("base");
  r.write("tools/run.mjs", "v2");
  r.commit("head");

  const p = run(r, base);
  assert.equal(p.toolchainChanged, true);
  assert.deepEqual(
    p.targets.map((t) => t.compared),
    [true, true],
  );
  assert.equal(p.targets[0].headKey, p.targets[0].baseKey);
});

test("a missing path hashes as missing and differs from an existing one", () => {
  const r = repo();
  const withFile = r.commit("base");
  r.remove("shared.json");
  const without = r.commit("head");

  assert.notEqual(
    inputKey("app", ["shared.json"], withFile, r.dir),
    inputKey("app", ["shared.json"], without, r.dir),
  );
  assert.equal(
    inputKey("app", ["nowhere"], withFile, r.dir),
    inputKey("app", ["nowhere"], without, r.dir),
  );
});

test("nothing compared needs no head build", () => {
  const r = repo();
  const base = r.commit("base");
  r.write("unrelated.txt", "x");
  r.commit("head");
  const p = run(r, base);
  assert.deepEqual(
    p.targets.map((t) => t.restoreKey),
    ["", ""],
  );
});

test("the target id is part of the key", () => {
  const r = repo();
  const head = r.commit("base");
  assert.notEqual(
    inputKey("a", ["shared.json"], head, r.dir),
    inputKey("b", ["shared.json"], head, r.dir),
  );
});

test("without a base nothing is compared and the head key is restored", () => {
  const r = repo();
  r.commit("head");
  const p = run(r, undefined);
  assert.equal(p.base, null);
  for (const t of p.targets) {
    assert.equal(t.compared, false);
    assert.equal(t.restoreKey, t.headCacheKey);
  }
});
