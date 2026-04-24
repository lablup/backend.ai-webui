#!/usr/bin/env node
/**
 * dev.mjs — unified entrypoint for `pnpm run dev`.
 *
 * Runs the React dev server behind a Portless-managed URL
 * (e.g. http://webui.localhost:1355). Launches TypeScript watch + Relay watch
 * + the React dev server concurrently.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const cwd = process.cwd();
const concurrentlyBin = path.join(cwd, "node_modules", ".bin", "concurrently");
const tscBin = path.join(cwd, "node_modules", ".bin", "tsc");

/**
 * Read `.env.development.local` and extract THEME_HEADER_COLOR so the React
 * dev server can pick it up as `REACT_APP_THEME_COLOR`. Returns an empty
 * object when the file is missing or the key is unset.
 */
function loadThemeColorEnv() {
  const envFile = path.join(cwd, ".env.development.local");
  if (!existsSync(envFile)) return {};
  let themeColor;
  for (const rawLine of readFileSync(envFile, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (key !== "THEME_HEADER_COLOR") continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value && value !== "undefined") themeColor = value;
  }
  return themeColor ? { REACT_APP_THEME_COLOR: themeColor } : {};
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
  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exit(code ?? 0);
  });
  for (const sig of ["SIGINT", "SIGTERM"]) {
    process.on(sig, () => {
      if (!child.killed) child.kill(sig);
    });
  }
}

// Portless injects `PORT` and CRA/Craco listens on it. Forward theme color
// so the built CSS can tint the header per-worktree.
const themeEnv = loadThemeColorEnv();
const reactCmd =
  "node scripts/portless-run.mjs --name webui --auto-start -- pnpm --prefix ./react run start";
runConcurrently(reactCmd, themeEnv);
