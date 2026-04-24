#!/usr/bin/env node
/**
 * dev.mjs — unified entrypoint for `pnpm run dev`.
 *
 * By default runs the React dev server behind a Portless-managed URL
 * (e.g. http://webui.localhost:1355). Set `PORTLESS=0` to restore the legacy
 * port-offset flow driven by `scripts/dev-config.js`.
 *
 * Both branches launch TypeScript watch + Relay watch + the React dev server
 * concurrently, matching the previous `concurrently` layout.
 */
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

import { forwardSignals } from "./lib/forward-signals.mjs";

const cwd = process.cwd();
const concurrentlyBin = path.join(cwd, "node_modules", ".bin", "concurrently");
const tscBin = path.join(cwd, "node_modules", ".bin", "tsc");
const usePortless = process.env.PORTLESS !== "0";

function loadDevConfigEnv() {
  const r = spawnSync("node", ["scripts/dev-config.js", "env"], {
    encoding: "utf8",
    cwd,
  });
  if (r.status !== 0) return {};
  const out = {};
  for (const line of (r.stdout || "").split("\n")) {
    const m = line.match(/^export\s+([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value && value !== "undefined") out[m[1]] = value;
  }
  return out;
}

function runConcurrently(reactStartCommand, extraEnv) {
  const args = [
    "--kill-others",
    "-c",
    "auto",
    "--names",
    "tsc,react-relay,react",
    `${tscBin} --watch --preserveWatchOutput`,
    "cd react && pnpm run relay:watch",
    reactStartCommand,
  ];
  const env = { ...process.env, ...extraEnv };
  const child = spawn(concurrentlyBin, args, {
    stdio: "inherit",
    env,
    shell: false,
  });
  forwardSignals(child);
}

function runLegacy() {
  // Print legacy config banner for parity with the pre-Portless script.
  const updateResult = spawnSync("node", ["scripts/dev-config.js", "update"], {
    stdio: "inherit",
    cwd,
  });
  if (updateResult.status !== 0) process.exit(updateResult.status ?? 1);
  const env = loadDevConfigEnv();
  const host = env.BAI_WEBUI_DEV_HOST || "localhost";
  const port = env.BAI_WEBUI_DEV_REACT_PORT || "9081";
  const reactCmd = `HOST=${host} PORT=${port} pnpm --prefix ./react run start`;
  runConcurrently(reactCmd, env);
}

function runPortless() {
  // Load theme-color env here once; it flows through `runConcurrently`'s
  // merged env to portless-run and then to the React dev server. This keeps
  // `REACT_APP_THEME_COLOR` working without double-loading it inside
  // portless-run.
  const themeEnv = loadDevConfigEnv();
  // Do not fix HOST/PORT in the Portless path — Portless injects `PORT` and
  // CRA/Craco listens on it. Also skip `--name`: portless-run derives the
  // subdomain from the current working directory so multiple worktrees get
  // distinct URLs automatically (e.g. webui vs webui-feature).
  const reactCmd =
    "node scripts/portless-run.mjs --auto-start -- pnpm --prefix ./react run start";
  console.log(
    "[dev] Using Portless (default). Set PORTLESS=0 to run the legacy port-9081(+offset) flow.",
  );
  runConcurrently(reactCmd, themeEnv);
}

if (usePortless) runPortless();
else runLegacy();
