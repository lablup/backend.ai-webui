/**
 * Git LFS pointer detection. A checkout without its LFS objects holds ~130-byte
 * pointer text in place of each image; every image consumer here would copy or
 * embed that text silently, so builds check for pointers first.
 */
import fs from "node:fs";
import path from "node:path";

export const LFS_POINTER_HEADER = "version https://git-lfs.github.com/spec/v1";
/** The Git LFS spec caps pointer files at 1024 bytes. */
export const LFS_POINTER_MAX_BYTES = 1024;

export const LFS_PULL_HINT =
  "Fetch the Git LFS images first: `bash .github/scripts/lfs/pull-docs-images.sh` " +
  "from the repository root (or `pnpm --filter backend.ai-webui-docs run images:pull`); " +
  "for an archive worktree, pass its directory: " +
  "`bash .github/scripts/lfs/pull-docs-images.sh <worktree>`.";

export function isLfsPointerFile(filePath: string): boolean {
  let fd: number | undefined;
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile() || stat.size > LFS_POINTER_MAX_BYTES) return false;
    fd = fs.openSync(filePath, "r");
    const head = Buffer.alloc(LFS_POINTER_HEADER.length + 1);
    const read = fs.readSync(fd, head, 0, head.length, 0);
    const text = head.subarray(0, read).toString("latin1");
    const eol = text.slice(LFS_POINTER_HEADER.length);
    return (
      text.startsWith(LFS_POINTER_HEADER) && (eol === "\n" || eol === "\r")
    );
  } catch {
    return false;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

/** Every LFS pointer file under the given directories (missing ones are skipped). */
export function findLfsPointerFiles(dirs: readonly string[]): string[] {
  const found: string[] = [];
  const walk = (dir: string): void => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && isLfsPointerFile(full)) found.push(full);
    }
  };
  for (const dir of dirs) walk(dir);
  return found.sort();
}

export class LfsPointerError extends Error {
  constructor(
    readonly files: readonly string[],
    message: string,
  ) {
    super(message);
    this.name = "LfsPointerError";
  }
}

export function formatLfsPointerError(
  files: readonly string[],
  options: { cwd?: string; limit?: number } = {},
): string {
  const cwd = options.cwd ?? process.cwd();
  const limit = options.limit ?? 5;
  const shown = files
    .slice(0, limit)
    .map((f) => `  ${path.relative(cwd, f) || f}`);
  const more =
    files.length > limit ? [`  … and ${files.length - limit} more`] : [];
  return [
    `${files.length} image file(s) are Git LFS pointers, not images:`,
    ...shown,
    ...more,
    LFS_PULL_HINT,
  ].join("\n");
}

/** Throws an {@link LfsPointerError} when any file under `dirs` is an LFS pointer. */
export function assertNoLfsPointers(
  dirs: readonly string[],
  options: { cwd?: string; limit?: number } = {},
): void {
  const files = findLfsPointerFiles(dirs);
  if (files.length > 0) {
    throw new LfsPointerError(files, formatLfsPointerError(files, options));
  }
}
