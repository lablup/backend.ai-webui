#!/usr/bin/env node
/**
 * portless-run.mjs
 *
 * Helper that runs a command under the Portless proxy. Portless is the only
 * supported local dev path — if it is not installed, the script fails with a
 * clear install hint.
 *
 * Usage:
 *   node scripts/portless-run.mjs --name <subdomain> [--auto-start] \
 *     -- <command> [args...]
 *
 * Flags:
 *   --name <subdomain>        Portless subdomain (e.g. "webui", "wsproxy.webui").
 *                             The project directory name is appended automatically
 *                             when it is not already part of the given name, so
 *                             two clones (e.g. `webui` and `webui-feature`) get
 *                             distinct URLs.
 *   --auto-start              Attempt to start the Portless daemon if it is
 *                             not already running.
 */
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

function parseArgs(argv) {
  const args = {
    name: null,
    autoStart: false,
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
    } else if (arg === "--auto-start") {
      args.autoStart = true;
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

function runPortless(args) {
  if (!hasPortless()) {
    console.error(
      "[portless-run] ERROR: `portless` is not installed or not on PATH.\n" +
        "  Install it globally with `npm install -g portless` (or `pnpm add -g portless`).\n" +
        "  See DEV_ENVIRONMENT.md for details.",
    );
    process.exit(1);
  }

  if (args.autoStart && !isProxyRunning()) {
    if (!startProxy()) {
      console.error(
        "[portless-run] ERROR: Failed to start the Portless proxy.\n" +
          "  Try running `portless proxy start` manually.",
      );
      process.exit(1);
    }
  }

  const appName = resolveAppName(args.name);
  console.log(
    `[portless-run] Routing "${args.command.join(" ")}" through http://${appName}.localhost:1355`,
  );
  const portlessArgs = [appName, ...args.command];
  const child = spawn("portless", portlessArgs, {
    stdio: "inherit",
    env: process.env,
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
  runPortless(args);
}

main();
