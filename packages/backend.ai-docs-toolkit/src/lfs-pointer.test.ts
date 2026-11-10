import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  assertNoLfsPointers,
  findLfsPointerFiles,
  isLfsPointerFile,
  LfsPointerError,
  LFS_POINTER_HEADER,
} from "./lfs-pointer.js";
import type { ResolvedDocConfig } from "./config.js";
import { generateWebsite } from "./website-generator.js";
import { generateWebDiff } from "./web-diff.js";

const POINTER = [
  LFS_POINTER_HEADER,
  `oid sha256:${"a".repeat(64)}`,
  "size 123456",
  "",
].join("\n");
const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

function tmpdir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "lfs-pointer-"));
}

function write(dir: string, rel: string, content: string | Buffer): string {
  const file = path.join(dir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

test("isLfsPointerFile — true for pointer text, LF or CRLF", () => {
  const dir = tmpdir();
  assert.equal(isLfsPointerFile(write(dir, "a.png", POINTER)), true);
  assert.equal(
    isLfsPointerFile(write(dir, "b.png", POINTER.replace(/\n/g, "\r\n"))),
    true,
  );
});

test("isLfsPointerFile — false for real images, other text, missing files and dirs", () => {
  const dir = tmpdir();
  const png = Buffer.concat([PNG_SIGNATURE, Buffer.alloc(64)]);
  assert.equal(isLfsPointerFile(write(dir, "real.png", png)), false);
  assert.equal(isLfsPointerFile(write(dir, "doc.md", "# Title\n")), false);
  assert.equal(
    isLfsPointerFile(write(dir, "quoted.md", `see: ${LFS_POINTER_HEADER}\n`)),
    false,
  );
  assert.equal(
    isLfsPointerFile(write(dir, "prefix.png", `${LFS_POINTER_HEADER}-extra\n`)),
    false,
  );
  assert.equal(isLfsPointerFile(path.join(dir, "missing.png")), false);
  assert.equal(isLfsPointerFile(dir), false);
});

test("isLfsPointerFile — false for files over the 1024-byte pointer cap", () => {
  const dir = tmpdir();
  const big = POINTER + "x".repeat(1024);
  assert.equal(isLfsPointerFile(write(dir, "big.png", big)), false);
});

test("findLfsPointerFiles — walks nested dirs, sorted, skips missing dirs", () => {
  const dir = tmpdir();
  write(
    dir,
    "en/images/real.png",
    Buffer.concat([PNG_SIGNATURE, Buffer.alloc(32)]),
  );
  const b = write(dir, "en/images/b.png", POINTER);
  const a = write(dir, "ko/images/nested/a.png", POINTER);
  write(dir, "en/index.md", "# Hello\n");
  assert.deepEqual(
    findLfsPointerFiles([
      path.join(dir, "en"),
      path.join(dir, "ko"),
      path.join(dir, "nope"),
    ]),
    [b, a].sort(),
  );
});

function makeVersionedProject(): { root: string; config: ResolvedDocConfig } {
  const root = tmpdir();
  write(root, "src/book.config.yaml", "title: Fixture\nlanguages: [en]\n");
  write(
    root,
    "src/en/images/real.png",
    Buffer.concat([PNG_SIGNATURE, Buffer.alloc(32)]),
  );
  const archive = ".docs-archive/docs-archive__26.8";
  write(
    root,
    `${archive}/src/book.config.yaml`,
    "title: Old\nlanguages: [en]\n",
  );
  write(
    root,
    `${archive}/src/en/images/old.png`,
    Buffer.concat([PNG_SIGNATURE, Buffer.alloc(16)]),
  );
  const config = {
    projectRoot: root,
    srcDir: path.join(root, "src"),
    distDir: path.join(root, "dist"),
    versionSource: path.join(root, "package.json"),
    version: "test",
    productName: "Fixture",
    versions: [
      { label: "next", source: { kind: "workspace" } },
      {
        label: "26.8",
        source: { kind: "archive-branch", ref: "docs-archive/26.8" },
        latest: true,
      },
    ],
  } as unknown as ResolvedDocConfig;
  return { root, config };
}

test("generateWebsite — fails before writing output when the workspace has pointers", async () => {
  const { root, config } = makeVersionedProject();
  write(root, "src/en/images/pointer.png", POINTER);
  await assert.rejects(
    generateWebsite(config, { lang: "en", strict: false }),
    (err: unknown) =>
      err instanceof LfsPointerError &&
      err.files.length === 1 &&
      /src\/en\/images\/pointer\.png/.test(err.message),
  );
  assert.equal(fs.existsSync(path.join(root, "dist")), false);
});

test("generateWebsite — finds pointers at any depth under src, in any language", async () => {
  const { root, config } = makeVersionedProject();
  write(root, "src/en/some_chapter/images/nested.png", POINTER);
  write(root, "src/ko/images/other-lang.png", POINTER);
  await assert.rejects(
    generateWebsite(config, { lang: "en", strict: false }),
    (err: unknown) =>
      err instanceof LfsPointerError &&
      err.files.length === 2 &&
      /src\/en\/some_chapter\/images\/nested\.png/.test(err.message),
  );
});

test("generateWebsite — also checks archive worktrees of the multi-version build", async () => {
  const { root, config } = makeVersionedProject();
  write(
    root,
    ".docs-archive/docs-archive__26.8/src/en/images/archived.png",
    POINTER,
  );
  await assert.rejects(
    generateWebsite(config, { lang: "en", strict: false }),
    (err: unknown) =>
      err instanceof LfsPointerError &&
      /\.docs-archive\/docs-archive__26\.8\/src\/en\/images\/archived\.png/.test(
        err.message,
      ),
  );
});

test("assertNoLfsPointers — passes on real images", () => {
  const dir = tmpdir();
  write(
    dir,
    "en/images/real.png",
    Buffer.concat([PNG_SIGNATURE, Buffer.alloc(32)]),
  );
  assert.doesNotThrow(() => assertNoLfsPointers([dir]));
});

test("assertNoLfsPointers — names the first files and the fix", () => {
  const dir = tmpdir();
  for (let i = 0; i < 7; i++) write(dir, `en/images/p${i}.png`, POINTER);
  assert.throws(
    () => assertNoLfsPointers([dir], { cwd: dir, limit: 5 }),
    (err: unknown) => {
      assert.ok(err instanceof LfsPointerError);
      assert.equal(err.files.length, 7);
      assert.match(err.message, /^7 image file\(s\) are Git LFS pointers/);
      assert.match(err.message, /\n {2}en\/images\/p0\.png\n/);
      assert.doesNotMatch(err.message, /p5\.png/);
      assert.match(err.message, /… and 2 more/);
      assert.match(err.message, /pull-docs-images\.sh/);
      assert.match(err.message, /images:pull/);
      return true;
    },
  );
});

test("generateWebDiff — rejects a build whose images are pointers", async () => {
  const root = tmpdir();
  write(
    root,
    "base/next/en/images/a.png",
    Buffer.concat([PNG_SIGNATURE, Buffer.alloc(16)]),
  );
  write(root, "head/next/en/images/a.png", POINTER);
  const config = {
    projectRoot: root,
    srcDir: path.join(root, "src"),
    distDir: path.join(root, "dist"),
  } as unknown as ResolvedDocConfig;
  await assert.rejects(
    generateWebDiff(config, {
      base: path.join(root, "base"),
      head: path.join(root, "head"),
      lang: "en",
      quiet: true,
    }),
    (err: unknown) =>
      err instanceof LfsPointerError &&
      /head\/next\/en\/images\/a\.png/.test(err.message),
  );
});
