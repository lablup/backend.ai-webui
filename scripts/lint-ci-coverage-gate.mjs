// Gate: every workspace package with a `lint` script must also define `lint:ci`.
//
// verify.sh lints with `pnpm -r lint:ci`, and pnpm `-r` silently skips (exit 0)
// any package that lacks the script — so a new package that ships only `lint`
// silently drops out of the Lint gate. This gate turns that silence into a
// failure (PR #9016 review).
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

// pnpm-workspace.yaml `packages:` entries — a flat list of literal dirs and
// single-level `dir/*` globs; parsed by hand to keep this dependency-free.
const workspaceYaml = fs.readFileSync(
  path.join(root, "pnpm-workspace.yaml"),
  "utf8",
);
const packagesBlock = workspaceYaml.match(/^packages:\n((?:[ \t]+-[^\n]*\n)+)/m);
if (!packagesBlock) {
  console.error("Could not parse `packages:` from pnpm-workspace.yaml");
  process.exit(1);
}
const globs = [...packagesBlock[1].matchAll(/^[ \t]+-[ \t]+["']?([^"'\n]+?)["']?[ \t]*$/gm)].map(
  (m) => m[1],
);

const pkgDirs = globs.flatMap((glob) => {
  if (glob.endsWith("/*")) {
    const base = path.join(root, glob.slice(0, -2));
    return fs
      .readdirSync(base, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => path.join(base, e.name));
  }
  return [path.join(root, glob)];
});

const offenders = [];
for (const dir of pkgDirs) {
  const pkgJsonPath = path.join(dir, "package.json");
  if (!fs.existsSync(pkgJsonPath)) continue;
  const scripts = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8")).scripts ?? {};
  if (scripts.lint && !scripts["lint:ci"]) {
    offenders.push(path.relative(root, dir));
  }
}

if (offenders.length > 0) {
  console.error(
    `Packages with a \`lint\` script but no \`lint:ci\`: ${offenders.join(", ")}`,
  );
  console.error(
    "`pnpm -r lint:ci` (the Lint gate) silently skips them — add a `lint:ci`",
  );
  console.error(
    "script (uncached if the package uses type-aware rules; see scripts/verify.sh).",
  );
  process.exit(1);
}
console.log(`lint:ci coverage ok (${pkgDirs.length} workspace packages scanned)`);
