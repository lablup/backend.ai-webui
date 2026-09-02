#!/usr/bin/env node
// Render the "PR Analysis Report" comment body from the artifacts CI produced.
// Writes markdown to stdout; the calling workflow posts or updates it.
//
// Usage:
//   node generate-pr-comment.mjs --analysis analysis.json --meta pr-meta.json \
//     [--bundle-head bundle-head.json] [--bundle-base bundle-base.json]

import { existsSync, readFileSync } from "node:fs";

const getArg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
};

const readJson = (path) =>
  path && existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;

const analysis = readJson(getArg("analysis"));
const meta = readJson(getArg("meta"));
const bundleHead = readJson(getArg("bundle-head"));
const bundleBase = readJson(getArg("bundle-base"));

if (!analysis || !meta) {
  console.error("Missing analysis.json or pr-meta.json");
  process.exit(1);
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;
const signed = (bytes) =>
  `${bytes > 0 ? "+" : bytes < 0 ? "−" : "±"}${kb(Math.abs(bytes))}`;

const link = (text, href) =>
  `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;

const out = [];
out.push("## PR Analysis Report");
out.push("");

// ── Storybook preview ────────────────────────────────────────────────────────
out.push("### 📚 Storybook Preview");
out.push("");
if (meta.storybookUrl) {
  out.push(`**${link("View Storybook for this PR", meta.storybookUrl)}**`);
  out.push("");
  out.push(
    "_GitHub Pages may take up to a minute to hydrate after the deploy._",
  );
} else {
  out.push("_No preview was deployed for this run._");
}
out.push("");

// ── Changed components ───────────────────────────────────────────────────────
out.push("### 🧩 Changed Components");
out.push("");
// The table is the actionable part, so it holds only the components a reviewer
// can actually open. Everything else goes below it, out of the way — a wall of
// "no story, nothing to open" rows is what makes a report like this get ignored.
const previewable = analysis.components.filter(
  (c) => c.deepLink && meta.storybookUrl,
);
const unpreviewable = analysis.components.filter(
  (c) => !c.deepLink || !meta.storybookUrl,
);
const MAX_ROWS = 30;

// `components/BAIVFolderDeleteButton.tsx` and
// `components/fragments/BAIVFolderDeleteButton.tsx` both exist. Disambiguate by
// subdirectory, but only when a PR actually touches both — otherwise the bare
// name reads better.
const nameCounts = new Map();
for (const c of analysis.components) {
  nameCounts.set(c.name, (nameCounts.get(c.name) ?? 0) + 1);
}
const label = (c) => {
  if (nameCounts.get(c.name) === 1) return c.name;
  const rel = c.file.replace("packages/backend.ai-ui/src/components/", "");
  return rel.replace(/\.tsx$/, "");
};

if (analysis.components.length === 0) {
  out.push(
    "_No component files changed in `packages/backend.ai-ui/src/components/`._",
  );
} else if (previewable.length === 0) {
  out.push(
    `_${analysis.components.length} component(s) changed, none of which has a ` +
      "`*.stories.tsx` — nothing to open in the preview._",
  );
} else {
  out.push("| Component | Changed | Stories | Open |");
  out.push("|---|---|---|---|");
  for (const c of previewable.slice(0, MAX_ROWS)) {
    const changed = [
      c.isNew ? "new" : c.sourceChanged && "source",
      c.storiesChanged && "stories",
    ]
      .filter(Boolean)
      .join(" + ");
    out.push(
      `| \`${label(c)}\` | ${changed} | ${c.storyCount} | ` +
        `${link("Storybook ↗", `${meta.storybookUrl}${c.deepLink}`)} |`,
    );
  }
  if (previewable.length > MAX_ROWS) {
    out.push(`| _…and ${previewable.length - MAX_ROWS} more_ | | | |`);
  }
}
out.push("");

if (analysis.summary.newWithoutStories > 0) {
  const names = analysis.components
    .filter((c) => c.isNew && !c.hasStories)
    .map((c) => `\`${label(c)}\``)
    .join(", ");
  out.push(
    `> ⚠️ New component(s) without a \`*.stories.tsx\`: ${names}. They cannot appear ` +
      "in the preview, and a story is the cheapest way to make a new component " +
      "reviewable.",
  );
  out.push("");
}

if (unpreviewable.length > 0) {
  out.push(
    `<details><summary>${unpreviewable.length} changed component(s) with no story ` +
      "to open</summary>",
  );
  out.push("");
  for (const c of unpreviewable) out.push(`- \`${c.name}\` — \`${c.file}\``);
  out.push("");
  out.push("</details>");
  out.push("");
}

if (analysis.otherPackageFiles.length > 0) {
  const shown = analysis.otherPackageFiles.slice(0, 10);
  out.push(
    `<details><summary>${analysis.otherPackageFiles.length} other changed file(s) in ` +
      "<code>packages/backend.ai-ui/</code></summary>",
  );
  out.push("");
  for (const f of shown) out.push(`- \`${f}\``);
  if (analysis.otherPackageFiles.length > shown.length) {
    out.push(`- …and ${analysis.otherPackageFiles.length - shown.length} more`);
  }
  out.push("");
  out.push("</details>");
  out.push("");
}

// ── Bundle size ──────────────────────────────────────────────────────────────
out.push("### 📦 Bundle Size");
out.push("");
if (!bundleHead) {
  out.push("_Bundle was not measured for this run._");
} else {
  const baseByFile = new Map(
    (bundleBase?.entries ?? []).map((e) => [e.file, e]),
  );
  const rows = bundleHead.entries.filter((e) => e.bytes >= 20 * 1024);
  out.push(`| File | Size | Gzip |${bundleBase ? " Δ Gzip vs base |" : ""}`);
  out.push(`|---|---|---|${bundleBase ? "---|" : ""}`);
  for (const e of rows) {
    const prev = baseByFile.get(e.file);
    const delta = bundleBase
      ? prev
        ? ` ${prev.hash === e.hash ? "—" : signed(e.gzipBytes - prev.gzipBytes)} |`
        : " 🆕 new |"
      : "";
    out.push(`| \`${e.file}\` | ${kb(e.bytes)} | ${kb(e.gzipBytes)} |${delta}`);
  }
  if (bundleBase) {
    const totalHead = bundleHead.entries.reduce((n, e) => n + e.gzipBytes, 0);
    const totalBase = bundleBase.entries.reduce((n, e) => n + e.gzipBytes, 0);
    out.push("");
    out.push(
      `**Total gzip:** ${kb(totalHead)} (${signed(totalHead - totalBase)} vs \`${analysis.base}\`)`,
    );
  } else {
    out.push("");
    out.push(
      "_No base measurement — the merge-base build was skipped " +
        "(dependency changes, or the base build failed)._",
    );
  }
}
out.push("");

if (analysis.diffMode === "two-dot") {
  out.push(
    "> ℹ️ The changed-file list came from a two-dot diff (no merge base was " +
      "reachable in the shallow clone), so it may over- or under-report.",
  );
  out.push("");
}

out.push("---");
out.push("");
out.push(
  `<sub>Generated by the PR Preview workflow · ${
    meta.storybookUrl ? `${link("Storybook", meta.storybookUrl)} · ` : ""
  }${link("CI run", meta.runUrl)}</sub>`,
);

console.log(out.join("\n"));
