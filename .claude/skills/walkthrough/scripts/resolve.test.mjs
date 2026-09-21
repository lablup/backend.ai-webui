// node --test .claude/skills/walkthrough/scripts/resolve.test.mjs
import { pidAlive, readRecords, recordServingPr } from "./resolve.mjs";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { test } from "node:test";

const record = (over = {}) => ({
  app: "fr-1-pr10-word",
  repo: "lablup/backend.ai-webui",
  branch: "feat/FR-1",
  pid: 4242,
  startedAt: "2026-09-18T01:00:00Z",
  stoppedAt: null,
  served: [{ pr: 10, branch: "feat/FR-1" }],
  ...over,
});
const alive = () => true;

test("picks the live record whose served[] names the PR", () => {
  const records = [
    { file: "a.json", record: record({ app: "other", served: [{ pr: 11 }] }) },
    { file: "b.json", record: record() },
  ];
  assert.equal(
    recordServingPr(records, 10, { isAlive: alive })?.file,
    "b.json",
  );
  assert.equal(
    recordServingPr(records, "10", { isAlive: alive })?.file,
    "b.json",
  );
  assert.equal(recordServingPr(records, 12, { isAlive: alive }), null);
});

test("a stopped record, a dead pid, or another repo does not count", () => {
  const stopped = {
    file: "s.json",
    record: record({ stoppedAt: "2026-09-18T02:00:00Z" }),
  };
  const dead = { file: "d.json", record: record({ pid: 1 }) };
  const elsewhere = {
    file: "e.json",
    record: record({ repo: "lablup/other" }),
  };
  assert.equal(recordServingPr([stopped], 10, { isAlive: alive }), null);
  assert.equal(recordServingPr([dead], 10, { isAlive: () => false }), null);
  assert.equal(
    recordServingPr([elsewhere], 10, {
      isAlive: alive,
      repo: "lablup/backend.ai-webui",
    }),
    null,
  );
  // With no repo to match against, the record's repo is not held against it.
  assert.equal(
    recordServingPr([elsewhere], 10, { isAlive: alive })?.file,
    "e.json",
  );
});

test("two live servers for one PR: the newest boot wins", () => {
  const older = {
    file: "o.json",
    record: record({ startedAt: "2026-09-18T01:00:00Z" }),
  };
  const newer = {
    file: "n.json",
    record: record({ startedAt: "2026-09-18T03:00:00Z" }),
  };
  assert.equal(
    recordServingPr([older, newer], 10, { isAlive: alive })?.file,
    "n.json",
  );
  assert.equal(
    recordServingPr([newer, older], 10, { isAlive: alive })?.file,
    "n.json",
  );
});

test("a record without a pid is trusted on stoppedAt alone", () => {
  const nopid = { file: "p.json", record: record({ pid: undefined }) };
  assert.equal(
    recordServingPr([nopid], 10, { isAlive: () => false })?.file,
    "p.json",
  );
});

test("readRecords skips non-JSON and half-written files", () => {
  const dir = mkdtempSync(join(tmpdir(), "wt-records-"));
  writeFileSync(join(dir, "good.json"), JSON.stringify(record()));
  writeFileSync(join(dir, "broken.json"), "{ not json");
  writeFileSync(join(dir, "notes.txt"), "ignored");
  const records = readRecords(dir);
  assert.deepEqual(
    records.map((entry) => entry.file.split("/").pop()),
    ["good.json"],
  );
  assert.deepEqual(readRecords(join(dir, "missing")), []);
});

test("pidAlive answers for this process and not for a nonsense pid", () => {
  assert.equal(pidAlive(process.pid), true);
  assert.equal(pidAlive(0), false);
  assert.equal(pidAlive(-1), false);
  assert.equal(pidAlive(2 ** 22 - 1), false);
});
