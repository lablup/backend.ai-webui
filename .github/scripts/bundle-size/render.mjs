#!/usr/bin/env node
// Render bundle-size-report.md and bundle-size-report.json from the plan and
// the measurement files (ADR 0040).
//
// Usage: node render.mjs --plan plan.json [--dir bundle-size] [--out-dir .]
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const MARKER = "<!-- bundle-size-report -->";
const MAX_PARTS = 10;

const size = (bytes) =>
  Math.abs(bytes) >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
    : Math.abs(bytes) >= 1024
      ? `${(bytes / 1024).toFixed(1)} kB`
      : `${bytes} B`;

const TOTALS = {
  eagerJsBytes: { label: "Eager JS", format: size },
  eagerJsGzipBytes: { label: "Eager JS (gzip)", format: size },
  eagerChunks: { label: "Eager chunks", format: String },
  jsBytes: { label: "JS", format: size },
  jsGzipBytes: { label: "JS (gzip)", format: size },
  cssBytes: { label: "CSS", format: size },
  cssGzipBytes: { label: "CSS (gzip)", format: size },
  chunks: { label: "Chunks", format: String },
};

const total = (key) => TOTALS[key] ?? { label: key, format: String };

const value = (format, n) => (n === undefined ? "—" : format(n));

const signed = (format, n) =>
  n === 0 ? "0" : `${n > 0 ? "+" : "−"}${format(Math.abs(n))}`;

const percent = (base, head) =>
  !base
    ? "—"
    : head === base
      ? "0%"
      : `${head > base ? "+" : "−"}${(Math.abs((head - base) / base) * 100).toFixed(2)}%`;

const code = (text) => `\`${String(text).replace(/[`|\n\r]/g, "")}\``;

const short = (commit) => (commit ? code(commit.slice(0, 7)) : "—");

function changedParts(base, head) {
  const baseParts = new Map(base.parts.map((p) => [p.name, p]));
  const headParts = new Map(head.parts.map((p) => [p.name, p]));
  const names = new Set([...baseParts.keys(), ...headParts.keys()]);
  return [...names]
    .map((name) => {
      const b = baseParts.get(name);
      const h = headParts.get(name);
      return {
        name,
        base: b?.gzipBytes ?? 0,
        head: h?.gzipBytes ?? 0,
        mark: !b ? " (new)" : !h ? " (removed)" : "",
        same: b && h && b.hash === h.hash,
      };
    })
    .filter((p) => !p.same)
    .sort((a, b) => Math.abs(b.head - b.base) - Math.abs(a.head - a.base))
    .slice(0, MAX_PARTS);
}

function comparedSection(id, base, head) {
  const lines = [`### ${code(id)}`, ""];
  if (!head || head.error) {
    lines.push(
      `_Head not measured${head?.error ? `: ${code(head.error)}` : ""}._`,
    );
    return lines;
  }
  if (!base || base.error) {
    lines.push(
      `> Base build failed${base?.error ? `: ${code(base.error)}` : ""}; head values only.`,
      "",
      ...totalsTable("Head", head.totals),
    );
    return lines;
  }
  lines.push(
    base.source === "head"
      ? "Inputs unchanged since the merge base; the head measurement stands in for the base, so Δ is 0 and does not show the toolchain change."
      : `Base ${short(base.commit)} from ${base.source === "cache" ? "the cache" : "a build"}.`,
    "",
    "| | Base | Head | Δ | Δ % |",
    "|---|---:|---:|---:|---:|",
  );
  for (const [key, n] of Object.entries(head.totals)) {
    const b = base.totals[key];
    const { label, format } = total(key);
    lines.push(
      `| ${label} | ${value(format, b)} | ${value(format, n)} | ${b === undefined ? "—" : signed(format, n - b)} | ${percent(b, n)} |`,
    );
  }
  lines.push("");
  const parts = changedParts(base, head);
  if (parts.length === 0) {
    lines.push("_No chunk or file changed._");
    return lines;
  }
  lines.push(
    "<details><summary>Largest gzip changes</summary>",
    "",
    "| Part | Base (gzip) | Head (gzip) | Δ |",
    "|---|---:|---:|---:|",
    ...parts.map(
      (p) =>
        `| ${code(p.name)}${p.mark} | ${size(p.base)} | ${size(p.head)} | ${signed(size, p.head - p.base)} |`,
    ),
    "",
    "</details>",
  );
  return lines;
}

function totalsTable(column, totals) {
  return [
    `| | ${column} |`,
    "|---|---:|",
    ...Object.entries(totals).map(([key, n]) => {
      const { label, format } = total(key);
      return `| ${label} | ${value(format, n)} |`;
    }),
  ];
}

function headSection(id, head) {
  return [`### ${code(id)}`, "", ...totalsTable("Size", head.totals)];
}

export function render(plan, measurements) {
  const read = (id, side) => measurements[`${id}.${side}`];
  const compared = plan.targets.filter((t) => t.compared);
  const unchanged = plan.targets.filter((t) => !t.compared);
  const out = [MARKER, "## Bundle size", ""];

  if (plan.base) {
    out.push(`Head ${short(plan.head)} · merge base ${short(plan.base)}`, "");
    if (plan.toolchainChanged) {
      out.push(
        "_The measurement toolchain changed, so every target is compared._",
        "",
      );
    }
    for (const t of compared) {
      out.push(
        ...comparedSection(t.id, read(t.id, "base"), read(t.id, "head")),
        "",
      );
    }
    if (compared.length === 0) out.push("_No target's inputs changed._", "");
    if (unchanged.length > 0) {
      out.push(
        `Unchanged: ${unchanged.map((t) => code(t.id)).join(", ")}.`,
        "",
      );
    }
  } else {
    out.push(`Commit ${short(plan.head)}`, "");
    for (const t of plan.targets) {
      const head = read(t.id, "head");
      if (head && !head.error) out.push(...headSection(t.id, head), "");
    }
  }

  return {
    markdown: `${out.join("\n").trimEnd()}\n`,
    manifest: { compared: compared.length },
  };
}

if (
  process.argv[1] &&
  existsSync(process.argv[1]) &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href
) {
  const args = process.argv.slice(2);
  const flag = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    return i === -1 ? fallback : args[i + 1];
  };
  const dir = flag("dir", "bundle-size");
  const outDir = flag("out-dir", ".");
  let result;
  try {
    const plan = JSON.parse(readFileSync(flag("plan"), "utf8"));
    const measurements = {};
    for (const t of plan.targets) {
      for (const side of ["head", "base"]) {
        const path = join(dir, `${t.id}.${side}.json`);
        if (existsSync(path)) {
          measurements[`${t.id}.${side}`] = JSON.parse(
            readFileSync(path, "utf8"),
          );
        }
      }
    }
    result = render(plan, measurements);
  } catch (error) {
    result = {
      markdown: `${MARKER}\n## Bundle size\n\n_The report could not be rendered: ${code(error.message)}._\n`,
      manifest: { compared: 0 },
    };
  }
  writeFileSync(join(outDir, "bundle-size-report.md"), result.markdown);
  writeFileSync(
    join(outDir, "bundle-size-report.json"),
    `${JSON.stringify(result.manifest)}\n`,
  );
  console.log(result.markdown);
}
