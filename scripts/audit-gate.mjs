#!/usr/bin/env node
// @ts-check
/**
 * audit-gate.mjs — fail CI on high/critical advisories in shipped dependencies.
 *
 * Runs `pnpm audit --prod --json`, plus a full audit filtered to the
 * devDependencies the desktop build ships (`pnpm audit --prod` skips them),
 * keeps high/critical advisories, subtracts the reviewed allowlist in
 * scripts/audit-allowlist.json, and exits 1 on anything left or on an expired
 * allowlist entry. Allowlisted advisories that are no longer reported are
 * printed as stale (not fatal) so the list can be pruned.
 *
 * Usage:
 *   node scripts/audit-gate.mjs [--allowlist FILE] [--prod-report FILE --full-report FILE]
 *
 * The --*-report flags read saved `pnpm audit --json` output instead of
 * calling pnpm (tests, offline reruns).
 */

import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GATED_SEVERITIES = new Set(["high", "critical"]);
const DEFAULT_ALLOWLIST = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "audit-allowlist.json",
);

/** pnpm writes the importer `packages/foo` as `packages__foo` in audit paths. */
export function normalizeImporter(importer) {
  return importer === "" ? "." : importer.replaceAll("/", "__");
}

/**
 * Flatten a `pnpm audit --json` report into one finding per (advisory, module).
 * @param {any} report
 * @param {{ onlyModules?: Set<string> }} [opts]
 */
export function collectFindings(report, opts = {}) {
  if (!report || typeof report.advisories !== "object") {
    throw new Error(
      `unexpected pnpm audit output: ${JSON.stringify(report)?.slice(0, 300)}`,
    );
  }
  /** @type {Map<string, {id: string, package: string, severity: string, title: string, url: string, paths: Set<string>}>} */
  const byKey = new Map();
  for (const adv of Object.values(report.advisories)) {
    if (!GATED_SEVERITIES.has(adv.severity)) continue;
    if (opts.onlyModules && !opts.onlyModules.has(adv.module_name)) continue;
    const id = adv.github_advisory_id || `npm-${adv.id}`;
    const key = `${id}|${adv.module_name}`;
    const entry = byKey.get(key) ?? {
      id,
      package: adv.module_name,
      severity: adv.severity,
      title: adv.title,
      url: adv.url,
      paths: new Set(),
    };
    for (const f of adv.findings ?? []) {
      for (const p of f.paths ?? []) entry.paths.add(p);
    }
    byKey.set(key, entry);
  }
  return [...byKey.values()];
}

/**
 * Match findings against the allowlist.
 * @param {ReturnType<typeof collectFindings>} findings
 * @param {{ entries: any[] }} allowlist
 * @param {string} today YYYY-MM-DD (UTC)
 */
export function evaluate(findings, allowlist, today) {
  const entries = allowlist.entries ?? [];
  const errors = [];
  const allowed = [];
  const blocking = [];
  const usedEntries = new Set();

  for (const [i, e] of entries.entries()) {
    if (!e.id || !e.package || !e.reason) {
      errors.push(`allowlist entry #${i} needs id, package and reason`);
    }
    if (e.expires && !/^\d{4}-\d{2}-\d{2}$/.test(e.expires)) {
      errors.push(
        `allowlist entry ${e.id} has a malformed expires "${e.expires}"`,
      );
    } else if (e.expires && e.expires < today) {
      errors.push(
        `allowlist entry ${e.id} (${e.package}) expired on ${e.expires}: ${e.reason}`,
      );
    }
  }

  for (const f of findings) {
    const entry = entries.find((e) => {
      if (e.id !== f.id || e.package !== f.package) return false;
      if (!e.importers) return true;
      // Scoped entries cover only paths rooted in the listed importers, so the
      // same package reaching shipped code through another importer still fails.
      const roots = new Set(e.importers.map(normalizeImporter));
      return [...f.paths].every((p) => roots.has(p.split(">")[0]));
    });
    if (entry) {
      usedEntries.add(entry);
      allowed.push({ finding: f, entry });
    } else {
      blocking.push(f);
    }
  }

  const stale = entries.filter((e) => !usedEntries.has(e));
  return { errors, allowed, blocking, stale };
}

function runAudit(args) {
  try {
    return execFileSync("pnpm", ["audit", "--json", ...args], {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
      stdio: ["ignore", "pipe", "inherit"],
    });
  } catch (err) {
    // pnpm audit exits 1 whenever it finds anything; the JSON is still on stdout.
    if (err.stdout) return err.stdout;
    throw err;
  }
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) throw new Error(`unexpected argument ${a}`);
    out[a.slice(2)] = argv[++i];
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const allowlist = JSON.parse(
    readFileSync(args.allowlist ?? DEFAULT_ALLOWLIST, "utf8"),
  );
  const shipped = new Set(
    (allowlist.shippedDevDependencies ?? []).map((d) => d.package),
  );

  const prodReport = JSON.parse(
    args["prod-report"]
      ? readFileSync(args["prod-report"], "utf8")
      : runAudit(["--prod"]),
  );
  const findings = collectFindings(prodReport);
  if (shipped.size > 0) {
    const fullReport = JSON.parse(
      args["full-report"]
        ? readFileSync(args["full-report"], "utf8")
        : runAudit([]),
    );
    findings.push(...collectFindings(fullReport, { onlyModules: shipped }));
  }

  const today = new Date().toISOString().slice(0, 10);
  const { errors, allowed, blocking, stale } = evaluate(
    findings,
    allowlist,
    today,
  );

  for (const { finding: f, entry: e } of allowed) {
    console.log(
      `allowed  ${f.severity.padEnd(8)} ${f.id} ${f.package}` +
        `${e.expires ? ` (until ${e.expires})` : ""} — ${e.reason}`,
    );
  }
  for (const e of stale) {
    console.log(
      `stale    ${e.id} ${e.package} is no longer reported; remove it from the allowlist`,
    );
  }
  for (const f of blocking) {
    const sample = [...f.paths].slice(0, 3).join(", ");
    console.log(
      `::error title=${f.severity} advisory ${f.id}::${f.package}: ${f.title} (${f.url}) via ${sample}${f.paths.size > 3 ? ` (+${f.paths.size - 3} more)` : ""}`,
    );
  }
  for (const msg of errors)
    console.log(`::error title=audit allowlist::${msg}`);

  const failed = blocking.length > 0 || errors.length > 0;
  console.log(
    `\naudit gate: ${blocking.length} unreviewed high/critical, ${allowed.length} allowlisted, ${errors.length} allowlist error(s), ${stale.length} stale — ${failed ? "FAIL" : "PASS"}`,
  );
  if (failed) {
    console.log(
      'Fix: upgrade the dependency, or add a reviewed entry to scripts/audit-allowlist.json (see README "Dependency vulnerability gate").',
    );
  }
  process.exit(failed ? 1 : 0);
}

if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}
