// node --test .claude/skills/walkthrough/scripts/resolve.test.mjs
import {
  pidAlive,
  prFromRecord,
  readRecords,
  recordServingPr,
} from "./resolve.mjs";
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

test("the record on the PR's own branch beats a newer stack layer above it", () => {
  // A server booted from the top of a stack serves every lower layer too.
  const own = {
    file: "own.json",
    record: record({ startedAt: "2026-09-18T01:00:00Z" }),
  };
  const upper = {
    file: "upper.json",
    record: record({
      app: "fr-2-pr11-word",
      branch: "feat/FR-2",
      startedAt: "2026-09-18T03:00:00Z",
      served: [
        { pr: 10, branch: "feat/FR-1" },
        { pr: 11, branch: "feat/FR-2" },
      ],
    }),
  };
  const opts = { isAlive: alive, branch: "feat/FR-1" };
  assert.equal(recordServingPr([upper, own], 10, opts)?.file, "own.json");
  // With no server on the PR's branch the layer above it still serves the PR.
  assert.equal(recordServingPr([upper], 10, opts)?.file, "upper.json");
});

test("prFromRecord answers for the record's own branch, else the top layer", () => {
  assert.equal(prFromRecord(record()), 10);
  const stacked = record({
    branch: "feat/FR-2",
    served: [
      { pr: 10, branch: "feat/FR-1" },
      { pr: 11, branch: "feat/FR-2" },
    ],
  });
  assert.equal(prFromRecord(stacked), 11);
  assert.equal(prFromRecord(record({ branch: "other" })), 10);
  assert.equal(prFromRecord(record({ served: [] })), null);
  assert.equal(prFromRecord({}), null);
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
  // Beyond any kernel pid_max (2^22 on 64-bit Linux), so never allocatable.
  assert.equal(pidAlive(2 ** 31), false);
});
