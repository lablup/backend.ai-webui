#!/usr/bin/env node
/**
 * portless-run.mjs
 *
 * Helper that runs a command under the Portless proxy, transparently falling
 * back to a plain-port flow when `PORTLESS=0` is set or when Portless is not
 * installed (with a clear install hint).
 *
 * Usage:
 *   node scripts/portless-run.mjs --name <subdomain> \
 *     [--legacy-env KEY=VALUE ...] [--auto-start] [--source-dev-config] \
 *     -- <command> [args...]
 *
 * Flags:
 *   --name <subdomain>        Portless subdomain (e.g. "webui", "wsproxy.webui").
 *                             The project directory name is appended automatically
 *                             when it is not already part of the given name, so
 *                             two clones (e.g. `webui` and `webui-feature`) get
 *                             distinct URLs.
 *   --legacy-env KEY=VALUE    Extra env var exported ONLY in the PORTLESS=0
 *                             (legacy) branch. Repeatable. Useful for e.g.
 *                             `PROXYBASEPORT=5050`.
 *   --auto-start              Attempt to start the Portless daemon if it is
 *                             not already running.
 *   --source-dev-config       In the Portless branch, source the theme-color
 *                             exports produced by `node scripts/dev-config.js
 *                             env` so `REACT_APP_THEME_COLOR` keeps working.
 *
 * Environment:
 *   PORTLESS=0  Skip Portless and run the command directly (legacy fallback).
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

function parseArgs(argv) {
  const args = {
    name: null,
    legacyEnv: {},
    autoStart: false,
    sourceDevConfig: false,
    command: [],
  };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === "--") {
      args.command = argv.slice(i + 1);
      break;
    }
    if (arg === "--name") {
      args.name = argv[++i];
    } else if (arg === "--legacy-env") {
      const kv = argv[++i];
      const eq = kv.indexOf("=");
      if (eq === -1) {
        throw new Error(`--legacy-env expects KEY=VALUE, got: ${kv}`);
      }
      args.legacyEnv[kv.slice(0, eq)] = kv.slice(eq + 1);
    } else if (arg === "--auto-start") {
      args.autoStart = true;
    } else if (arg === "--source-dev-config") {
      args.sourceDevConfig = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
    i += 1;
  }
  if (!args.name) throw new Error("--name is required");
  if (args.command.length === 0) throw new Error("Missing command after --");
  return args;
}

function resolveAppName(baseName) {
  const projectDir = path.basename(process.cwd());
  // Append the project directory name when it is not already the last segment,
  // so multiple clones get unique URLs (e.g. webui-feature vs webui).
  const parts = baseName.split(".");
  const last = parts[parts.length - 1];
  if (last === projectDir) return baseName;
  return `${baseName}.${projectDir}`;
}

function hasPortless() {
  const r = spawnSync("portless", ["--help"], { stdio: "ignore" });
  return r.status === 0 || r.status === null ? r.error === undefined : false;
}

function isProxyRunning() {
  // `portless list` exits non-zero when the daemon is not running.
  const r = spawnSync("portless", ["list"], { stdio: "ignore" });
  return r.status === 0;
}

function startProxy() {
  console.log("[portless-run] Starting Portless proxy daemon...");
  const r = spawnSync("portless", ["proxy", "start"], { stdio: "inherit" });
  return r.status === 0;
}

function loadThemeColorEnv() {
  const devConfig = path.join(process.cwd(), "scripts", "dev-config.js");
  if (!existsSync(devConfig)) return {};
  const r = spawnSync("node", [devConfig, "env"], { encoding: "utf8" });
  if (r.status !== 0) return {};
  const out = {};
  for (const line of (r.stdout || "").split("\n")) {
    const m = line.match(/^export\s+([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    const key = m[1];
    let value = m[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value && value !== "undefined") out[key] = value;
  }
  return out;
}

function runCommand(command, env) {
  const [cmd, ...rest] = command;
  const child = spawn(cmd, rest, { stdio: "inherit", env, shell: false });
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

function runLegacy(args) {
  const env = { ...process.env, ...args.legacyEnv };
  runCommand(args.command, env);
}

function runPortless(args) {
  if (!hasPortless()) {
    console.error(
      "[portless-run] ERROR: `portless` is not installed or not on PATH.\n" +
        "  Install it globally with `npm install -g portless` (or `pnpm add -g portless`).\n" +
        "  See DEV_ENVIRONMENT.md for details.\n" +
        "  To bypass Portless entirely, re-run with `PORTLESS=0` prefixed.",
    );
    process.exit(1);
  }

  if (args.autoStart && !isProxyRunning()) {
    if (!startProxy()) {
      console.error(
        "[portless-run] ERROR: Failed to start the Portless proxy.\n" +
          "  Try running `portless proxy start` manually, or set `PORTLESS=0` to bypass.",
      );
      process.exit(1);
    }
  }

  const appName = resolveAppName(args.name);
  const env = { ...process.env };
  if (args.sourceDevConfig) Object.assign(env, loadThemeColorEnv());

  console.log(
    `[portless-run] Routing "${args.command.join(" ")}" through http://${appName}.localhost:1355`,
  );
  const portlessArgs = [appName, ...args.command];
  const child = spawn("portless", portlessArgs, {
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

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`[portless-run] ${err.message}`);
    process.exit(2);
  }

  if (process.env.PORTLESS === "0") {
    runLegacy(args);
  } else {
    runPortless(args);
  }
}

main();
