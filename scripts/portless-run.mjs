#!/usr/bin/env node
/**
 * portless-run.mjs
 *
 * Helper that runs a command under the Portless proxy, transparently falling
 * back to a plain-port flow when `PORTLESS=0` is set or when Portless is not
 * installed (with a clear install hint).
 *
 * Usage:
 *   node scripts/portless-run.mjs [--name <subdomain>] \
 *     [--legacy-env KEY=VALUE ...] [--auto-start] \
 *     -- <command> [args...]
 *
 * Flags:
 *   --name <subdomain>        Portless subdomain (e.g. "webui", "wsproxy.webui").
 *                             If omitted, the app name is derived from the
 *                             current working directory's basename, slugified
 *                             to a DNS-safe label. This means two clones
 *                             (e.g. `webui` and `webui-feature`) automatically
 *                             get distinct URLs without any configuration.
 *   --legacy-env KEY=VALUE    Extra env var exported ONLY in the PORTLESS=0
 *                             (legacy) branch. Repeatable. Useful for e.g.
 *                             `PROXYBASEPORT=5050`.
 *   --auto-start              Attempt to start the Portless daemon if it is
 *                             not already running.
 *
 * Environment:
 *   PORTLESS=0  Skip Portless and run the command directly (legacy fallback).
 */
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

import { forwardSignals } from "./lib/forward-signals.mjs";

function parseArgs(argv) {
  const args = {
    name: null,
    legacyEnv: {},
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
    } else if (arg === "--legacy-env") {
      const kv = argv[++i];
      const eq = kv.indexOf("=");
      if (eq === -1) {
        throw new Error(`--legacy-env expects KEY=VALUE, got: ${kv}`);
      }
      args.legacyEnv[kv.slice(0, eq)] = kv.slice(eq + 1);
    } else if (arg === "--auto-start") {
      args.autoStart = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
    i += 1;
  }
  if (args.command.length === 0) throw new Error("Missing command after --");
  return args;
}

function slugify(raw) {
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "webui";
}

function resolveAppName(explicitName) {
  if (explicitName) return explicitName;
  const raw = path.basename(process.cwd());
  const slug = slugify(raw);
  if (slug !== raw) {
    console.warn(
      `[portless-run] Slugified project directory "${raw}" → "${slug}" for Portless subdomain.`,
    );
  }
  return slug;
}

function hasPortless() {
  const r = spawnSync("portless", ["--help"], { stdio: "ignore" });
  return r.error === undefined;
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

function runCommand(command, env) {
  const [cmd, ...rest] = command;
  const child = spawn(cmd, rest, { stdio: "inherit", env, shell: false });
  forwardSignals(child);
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

  console.log(
    `[portless-run] Routing "${args.command.join(" ")}" through http://${appName}.localhost:1355`,
  );
  const portlessArgs = [appName, ...args.command];
  const child = spawn("portless", portlessArgs, {
    stdio: "inherit",
    env,
    shell: false,
  });
  forwardSignals(child);
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
