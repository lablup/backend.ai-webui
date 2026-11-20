// Gate: the package-manager document of pnpm-lock.yaml (its first YAML
// document, which pins the `packageManager` pnpm) must not record `@pnpm/exe`.
//
// pnpm >= 11.20 records only `pnpm` for a v12 pin, because from v12 the `pnpm`
// package is itself the native executable. A pnpm below 11.20 (installed with
// npm or standalone alike) adds `@pnpm/exe` beside it, even under
// `--frozen-lockfile`, and every newer pnpm drops it again on its next
// writable install — so the document flips between PRs (#11186).
import { readFileSync, realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** The first YAML document of a pnpm-lock.yaml that starts with one. */
export function packageManagerDocument(lockfileText) {
  const docs = lockfileText.split(/^---[ \t]*$/m);
  // A lockfile with a package-manager document starts with `---`, so the
  // text before it is empty and the document is the second piece.
  return docs.length >= 3 && docs[0].trim() === "" ? docs[1] : null;
}

/** Lines of the package-manager document that pin `@pnpm/exe` itself. */
export function findExeEntries(lockfileText) {
  const doc = packageManagerDocument(lockfileText);
  if (doc === null) return [];
  // `'@pnpm/exe':` (importer) and `'@pnpm/exe@<v>':` (packages/snapshots);
  // the `@pnpm/exe.<platform>` packages that `pnpm` depends on are expected.
  return doc
    .split("\n")
    .filter((line) => /^\s*'?@pnpm\/exe(?:'|@)/.test(line))
    .map((line) => line.trim());
}

const isMain =
  process.argv[1] &&
  realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const lockfile = resolve(root, "pnpm-lock.yaml");
  const entries = findExeEntries(readFileSync(lockfile, "utf8"));
  if (entries.length > 0) {
    console.error(
      [
        "pnpm-lock.yaml: the package-manager document records @pnpm/exe:",
        ...entries.map((e) => `  ${e}`),
        "",
        "A pnpm older than 11.20 wrote it. Update the pnpm on your PATH",
        "(`pnpm self-update`; see Initializing in README.md), then run `pnpm install`",
        "(without --frozen-lockfile) to restore the canonical form.",
      ].join("\n"),
    );
    process.exit(1);
  }
  console.log("pnpm-lock.yaml: package-manager document OK");
}
