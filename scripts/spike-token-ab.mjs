/**
 * spike-token-ab.mjs — exact numeric A/B of every used token.
 *
 * Loads the shim through Vite's dev module graph inside a real browser (so the
 * Astryx CSS custom properties resolve in their real cascade), and compares each
 * value against antd's own `getDesignToken()` output for the same theme.
 */
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";

const antd = JSON.parse(readFileSync("/tmp/antd-tokens.json", "utf8"));
const scan = JSON.parse(readFileSync("/tmp/tokscan.json", "utf8"));
const used = scan.tokens
  .map((t) => t.name)
  .filter((n) => n !== "Layout" && n !== "blue0");

const themeJson = JSON.parse(readFileSync("resources/theme.json", "utf8"));

const b = await chromium.launch();
const report = {};
for (const mode of ["light", "dark"]) {
  const ctx = await b.newContext({ colorScheme: mode });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:5199/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  const shimTokens = await p.evaluate(
    async ({ mode, seeds }) => {
      const m = await import("/src/theme-shim/index.tsx");
      document.documentElement.setAttribute("data-theme", mode);
      document.documentElement.setAttribute("data-astryx-theme", "neutral");
      return m.buildTokens(mode, seeds);
    },
    {
      mode,
      seeds: {
        ...themeJson[mode].token,
        fontFamily: themeJson.fontFamily,
      },
    },
  );

  const rows = [];
  for (const name of used) {
    const a = antd[mode][name];
    const s = shimTokens[name];
    // #fff and #ffffff are the same colour; normalise 3-digit hex before diffing
    const norm = (v) => {
      if (typeof v !== "string") return v;
      let x = v.replace(/\s+/g, " ").trim().toLowerCase();
      const m3 = x.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/);
      if (m3) x = `#${m3[1]}${m3[1]}${m3[2]}${m3[2]}${m3[3]}${m3[3]}`;
      return x.replace(/,\s+/g, ",");
    };
    let status;
    if (s === undefined) status = "MISSING";
    else if (norm(a) === norm(s)) status = "EXACT";
    else if (typeof a === "number" && typeof s === "number")
      status = `DRIFT(${s - a > 0 ? "+" : ""}${s - a})`;
    else status = "DIFF";
    rows.push({ name, antd: a, shim: s, status, type: typeof s });
  }
  report[mode] = rows;
  await ctx.close();
}
await b.close();

writeFileSync("/tmp/token-ab.json", JSON.stringify(report, null, 2));
for (const mode of ["light", "dark"]) {
  const rows = report[mode];
  const by = {};
  for (const r of rows) {
    const k = r.status.startsWith("DRIFT") ? "DRIFT" : r.status;
    (by[k] ??= []).push(r);
  }
  console.log(
    `\n=== ${mode} === ` +
      Object.entries(by)
        .map(([k, v]) => `${k}=${v.length}`)
        .join("  ") +
      `  (of ${rows.length})`,
  );
  for (const r of rows) {
    if (r.status === "EXACT") continue;
    console.log(
      `  ${r.status.padEnd(10)} ${r.name.padEnd(26)} antd=${String(r.antd).replace(/\s+/g, " ").slice(0, 34).padEnd(34)} shim=${String(r.shim).replace(/\s+/g, " ").slice(0, 34)}`,
    );
  }
}
