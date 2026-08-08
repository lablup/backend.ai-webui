#!/usr/bin/env node
/**
 * antd remainder report — antd → Astryx migration, ticket 35.
 *
 * `antd-zero-gate.sh` answers one question: is the residue zero? While the
 * answer is "no", that is not actionable — a bare count of tainted files says
 * nothing about WHAT is left or WHO has to do it. Ticket 35 found the residue
 * is not a long tail of stragglers but a small number of structural roots, and
 * that distinction is invisible in the gate's own output.
 *
 * This script produces the actionable view: the remaining antd surface bucketed
 * by root cause and by owner, so the follow-up tickets can be planned from
 * measurement instead of guesswork. It never gates — it always exits 0. The
 * pass/fail authority stays with `antd-zero-gate.sh` alone, deliberately: a
 * reporting script that can also fail the build inevitably grows an allowlist,
 * and an allowlist is how a migration reports green while shipping the thing
 * it claims to have removed.
 *
 * Buckets:
 *   - RENDER  — the file imports antd VALUES (components, `theme`, `message`).
 *               Real conversion work: needs an Astryx equivalent and a visual
 *               check. This is the number that matters for planning.
 *   - TYPE    — the file only imports antd TYPES. Erased at build time, so it
 *               ships nothing; it only keeps antd required for `tsc`. Cheap to
 *               close, and closing it does not move the bundle at all.
 *   - PACKAGE — a non-antd package that drags the antd family in through its
 *               own dependencies. No amount of first-party conversion removes
 *               these; the package itself has to go.
 *
 * Usage:
 *   node scripts/migration-gates/antd-remainder-report.mjs [--json]
 *     [--markdown] [--top N]
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  analyzeGraph,
  stripComments,
  summarize,
} from "./antd-import-graph.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const rel = (f) => relative(REPO_ROOT, f).split(sep).join("/");

/**
 * Packages that pull the antd family in through their OWN dependency tree.
 *
 * Listed explicitly rather than derived, because the derivation is what makes
 * them interesting: each entry is a package we chose to depend on that makes
 * the production-graph gate unsatisfiable no matter how much first-party code
 * is converted. `antd` itself is excluded — it is the target, not a carrier.
 */
const CARRIER_PACKAGES = [
  {
    name: "@ant-design/x",
    importedBy: "react/src/components/Chat/*, react/src/helper/index.tsx",
    why:
      "peerDependencies { antd: ^6.1.1 } plus hard deps on @ant-design/icons, " +
      "@ant-design/cssinjs, @ant-design/colors and @rc-component/*. With " +
      "autoInstallPeers the peer resolves into the production graph, so this " +
      "package alone keeps antd-zero-gate part (a) red.",
  },
];

/**
 * Properties of the GATE itself that will mislead whoever finishes this
 * migration. Recorded here rather than "fixed" by loosening the gate: each one
 * is a place where the gate's verdict and the underlying reality can disagree,
 * and the person at the finish line needs to know which way.
 */
const GATE_CAVEATS = [
  {
    id: "incomplete-build-passes",
    severity: "false PASS (fixed in ticket 35)",
    what: "Part (b) used to report PASS over a build that never completed.",
    detail:
      "`pnpm run build` creates build/web and copies index.html / resources / " +
      "manifest into it BEFORE compiling the app. Ticket 35 hit a build that " +
      "aborted at `copyconfig` (missing root `config.toml`, which is gitignored " +
      "— copy it from config.toml.sample): the directory existed, held ~6 static " +
      "files, and part (b) scanned them and reported PASS. A compliance gate " +
      "whose green light can mean 'nothing was scanned' is worse than no gate. " +
      "Part (b) now asserts a minimum asset count before trusting a clean scan. " +
      "If you see that assertion fire, fix the build — do not lower the bound.",
  },
  {
    id: "anticon-is-first-party",
    severity: "false FAIL (active)",
    what: "`anticon` is now OUR class name, not antd's.",
    detail:
      "`packages/backend.ai-ui/src/icons/iconShim.tsx` deliberately renders " +
      '`class="anticon"`, and BUI ships the matching reset — measured: ' +
      "`packages/backend.ai-ui/dist/backend.ai-ui.css` contains `anticon` and " +
      "`anticon-spin` as first-party rules. Two e2e locators still use the " +
      "class — `e2e/user-profile/user-profile.spec.ts` (`.anticon-close`) and " +
      "`e2e/auto-scaling-rule-preset/preset-table-settings.spec.ts` " +
      "(`.anticon-check`); every other `.anticon-*` hit under `e2e/` is a " +
      "comment recording that the class is GONE. So part (b)'s `anticon` " +
      "signature " +
      "will keep firing after antd is entirely gone. The fix is to rename the " +
      "shim's class and repoint the e2e locators — NOT to drop the signature, " +
      "which would also stop catching real @ant-design/icons reintroduction.",
  },
];

/**
 * Does this file import antd VALUES, or only antd TYPES?
 *
 * Two things the pattern below MUST keep doing, both learned the hard way
 * (p3-w3b):
 *
 * 1. It runs over `stripComments(source)`. Migration comments in this repo
 *    quote the antd import they replaced, and those quotations were being
 *    counted as real imports.
 * 2. The clause is `[^;'"]*?`, NOT `[\s\S]*?`. The lazy any-character form
 *    could start a match at ANY earlier `import` keyword in the file and run
 *    to the antd `from`, swallowing whole statements in between. Since nearly
 *    every file here opens with `import type { …Fragment$key } from '…'`, the
 *    captured clause usually began with `type `, hit the `^type\s` guard
 *    below, and the antd import was skipped — silently classifying render
 *    files as type-only. Barring `;` and quotes confines a match to a single
 *    statement.
 */
export function classifyAntdImports(rawSource) {
  const source = stripComments(rawSource);
  // `import ... from 'antd'` / `'antd/es/...'` / `'@ant-design/...'` etc.
  const re =
    /\bimport\s+([^;'"]*?)\s+from\s+['"](antd(?:\/[^'"]*)?|antd-style(?:\/[^'"]*)?|@ant-design\/[^'"]*|rc-[^'"]*|@rc-component\/[^'"]*)['"]/g;
  let m;
  let sawAny = false;
  let sawValue = false;
  while ((m = re.exec(source))) {
    sawAny = true;
    const clause = m[1].trim();
    // `import type { X } from 'antd'` — the whole clause is type-only.
    if (/^type\s/.test(clause)) continue;
    const named = clause.match(/\{([\s\S]*)\}/);
    // A default or namespace binding is always a value import.
    const bare = clause
      .replace(/\{[\s\S]*\}/, "")
      .replace(/,/g, "")
      .trim();
    if (bare) {
      sawValue = true;
      continue;
    }
    if (named) {
      for (const spec of named[1].split(",")) {
        const s = spec.trim();
        if (s && !/^type\s/.test(s)) {
          sawValue = true;
          break;
        }
      }
    }
  }
  if (!sawAny) return "none";
  return sawValue ? "render" : "type";
}

/** Group a list of repo-relative paths into human-meaningful owners. */
function bucketByOwner(files) {
  const owners = new Map();
  const add = (key, file) => {
    if (!owners.has(key)) owners.set(key, []);
    owners.get(key).push(file);
  };
  for (const f of files) {
    if (f.startsWith("packages/backend.ai-ui/src/components/Table/"))
      add("BUI · Table", f);
    else if (f.startsWith("packages/backend.ai-ui/src/components/fragments/"))
      add("BUI · fragments", f);
    else if (f.startsWith("packages/backend.ai-ui/src/components/"))
      add("BUI · components", f);
    else if (f.startsWith("packages/backend.ai-ui/src/"))
      add("BUI · infrastructure (shims, hooks, helper)", f);
    else if (f.startsWith("react/src/pages/")) add("app · pages", f);
    else if (f.startsWith("react/src/components/")) add("app · components", f);
    else if (f.startsWith("react/src/")) add("app · other", f);
    else add("other", f);
  }
  return [...owners.entries()]
    .map(([owner, list]) => ({ owner, count: list.length, files: list.sort() }))
    .sort((a, b) => b.count - a.count);
}

function collect() {
  const analysis = analyzeGraph({ repoRoot: REPO_ROOT });
  const summary = summarize(analysis, REPO_ROOT);

  const render = [];
  const typeOnly = [];
  for (const [file, info] of analysis.files) {
    if (info.direct.length === 0) continue;
    let source = "";
    try {
      source = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const kind = classifyAntdImports(source);
    if (kind === "render") render.push(rel(file));
    else if (kind === "type") typeOnly.push(rel(file));
  }
  render.sort();
  typeOnly.sort();

  return {
    generatedFrom: "scripts/migration-gates/antd-remainder-report.mjs",
    totals: {
      scannedFiles: summary.total,
      directAntd: summary.direct,
      transitivelyReachable: summary.transitive,
      antdFree: summary.clean,
    },
    render: { count: render.length, byOwner: bucketByOwner(render) },
    typeOnly: { count: typeOnly.length, files: typeOnly },
    carrierPackages: CARRIER_PACKAGES,
    gateCaveats: GATE_CAVEATS,
    hubs: summary.hubs.slice(0, 20),
  };
}

/** Production-graph roots, straight from pnpm (same source as gate part (a)). */
function prodGraphRoots() {
  try {
    const out = execFileSync(
      "pnpm",
      ["-r", "list", "--prod", "--depth", "1", "--json"],
      { cwd: REPO_ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    const projects = JSON.parse(out || "[]");
    const roots = [];
    for (const project of projects) {
      for (const name of Object.keys(project.dependencies ?? {})) {
        if (
          name === "antd" ||
          name === "antd-style" ||
          name.startsWith("@ant-design/") ||
          name.startsWith("rc-") ||
          name.startsWith("@rc-component/")
        ) {
          roots.push(`${project.name ?? "(root)"} → ${name}`);
        }
      }
    }
    return roots.sort();
  } catch {
    return null;
  }
}

function toMarkdown(report, roots) {
  const L = [];
  L.push("<!-- GENERATED by scripts/migration-gates/antd-remainder-report.mjs");
  L.push("     Regenerate with:");
  L.push(
    "       node scripts/migration-gates/antd-remainder-report.mjs --markdown \\",
  );
  L.push("         > .scratch/astryx-migration/REMAINDER.md");
  L.push("     Do not hand-edit below the divider. -->");
  L.push("");
  L.push("# antd remainder — measured inventory");
  L.push("");
  L.push(
    "What is still antd on `to-astryx`, bucketed by root cause. The pass/fail",
  );
  L.push(
    "authority is `scripts/antd-zero-gate.sh`; this file is the actionable view",
  );
  L.push("of *why* it is not green yet.");
  L.push("");
  const t = report.totals;
  L.push("## Totals");
  L.push("");
  L.push("| Metric | Files |");
  L.push("|---|---:|");
  L.push(`| Scanned (shipping source) | ${t.scannedFiles} |`);
  L.push(`| Import antd directly | ${t.directAntd} |`);
  L.push(`| Reach antd transitively | ${t.transitivelyReachable} |`);
  L.push(`| antd-free | ${t.antdFree} |`);
  L.push("");
  L.push("## Bucket 1 — RENDER (real conversion work)");
  L.push("");
  L.push(
    `${report.render.count} files import antd **values**. Each needs an Astryx`,
  );
  L.push("equivalent and a visual check — this is the number to plan against.");
  L.push("");
  L.push("| Owner | Files |");
  L.push("|---|---:|");
  for (const b of report.render.byOwner) {
    L.push(`| ${b.owner} | ${b.count} |`);
  }
  L.push("");
  L.push("## Bucket 2 — TYPE-ONLY (cheap, ships nothing)");
  L.push("");
  L.push(
    `${report.typeOnly.count} files import only antd **types**. Erased at build`,
  );
  L.push(
    "time, so they add nothing to the bundle; they only keep antd required for",
  );
  L.push("`tsc`. Closing them does not move the bundle scan.");
  L.push("");
  for (const f of report.typeOnly.files) L.push(`- \`${f}\``);
  L.push("");
  L.push("## Bucket 3 — CARRIER PACKAGES (not closable by conversion)");
  L.push("");
  L.push(
    "Dependencies that drag the antd family in through their own trees. No",
  );
  L.push("amount of first-party conversion removes these.");
  L.push("");
  for (const p of report.carrierPackages) {
    L.push(`### \`${p.name}\``);
    L.push("");
    L.push(`- **Imported by**: ${p.importedBy}`);
    L.push(`- **Why it blocks the gate**: ${p.why}`);
    L.push("");
  }
  if (roots && roots.length) {
    L.push("### Live production-graph roots (`pnpm -r list --prod --depth 1`)");
    L.push("");
    for (const r of roots) L.push(`- \`${r}\``);
    L.push("");
  }
  L.push("## Gate caveats — where the gate and reality disagree");
  L.push("");
  L.push(
    "Read these before trusting any part of `antd-zero-gate.sh`. They are",
  );
  L.push(
    "recorded, not patched away: each is a known way the verdict can mislead.",
  );
  L.push("");
  for (const c of report.gateCaveats) {
    L.push(`### ${c.what}`);
    L.push("");
    L.push(`- **Risk**: ${c.severity}`);
    L.push(`- ${c.detail}`);
    L.push("");
  }
  L.push("## Top taint hubs");
  L.push("");
  L.push(
    "Direct-antd files ranked by how many other files they make antd-reachable.",
  );
  L.push("Converting a hub clears its whole dependent set at once.");
  L.push("");
  L.push("| File | Taints |");
  L.push("|---|---:|");
  for (const h of report.hubs) L.push(`| \`${h.file}\` | ${h.taints} |`);
  L.push("");
  return L.join("\n");
}

const args = process.argv.slice(2);
const report = collect();

if (args.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else if (args.includes("--markdown")) {
  console.log(toMarkdown(report, prodGraphRoots()));
} else {
  const t = report.totals;
  console.log("=== antd remainder report ===");
  console.log(
    `scanned: ${t.scannedFiles}  |  direct: ${t.directAntd}  |  ` +
      `transitive: ${t.transitivelyReachable}  |  antd-free: ${t.antdFree}`,
  );
  console.log("");
  console.log(`RENDER (real work): ${report.render.count} files`);
  for (const b of report.render.byOwner) {
    console.log(`    ${String(b.count).padStart(4)}  ${b.owner}`);
  }
  console.log("");
  console.log(`TYPE-ONLY (cheap):  ${report.typeOnly.count} files`);
  console.log("");
  console.log("CARRIER PACKAGES (not closable by conversion):");
  for (const p of report.carrierPackages) console.log(`    - ${p.name}`);
  console.log("");
  console.log(
    "(informational only — gating lives in scripts/antd-zero-gate.sh)",
  );
}
