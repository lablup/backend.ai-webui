#!/usr/bin/env node
// `pnpm run dev-env` — pick a dev API server and test account from the team's
// Bitwarden collection, and write the pick into the git-ignored env files.
// Conventions and one-time setup: DEV_ENVIRONMENT.md ("Dev servers and test accounts").
import {
  findAccount,
  findServer,
  formatCatalog,
  loginPrefillVars,
  parseCatalog,
  playwrightVars,
  redactCatalog,
  upsertEnv,
} from "./dev-env-lib.mjs";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const CONFIG_PATH =
  process.env.WEBUI_DEV_ENV_CONFIG ??
  path.join(os.homedir(), ".config", "fw", "webui-dev-env.json");
// A data dir of its own, so the read-only account never collides with a personal `bw` login.
const BW_DATA_DIR = path.join(path.dirname(CONFIG_PATH), "webui-dev-env-bw");

const USAGE = `Usage: pnpm run dev-env <command>

  setup                      Store the read-only Bitwarden account on this machine (once)
  status                     Check the bw binary, the stored config and the login
  list [--json]              Servers, accounts and their notes (no passwords)
  get <server> <role> [--json]
                             One account, password included
  use <server> [role] [--no-password]
                             Write .env.development.local (login pre-fill, role
                             defaults to "user") and e2e/envs/.env.playwright`;

class UserError extends Error {}

function readConfig() {
  let raw;
  try {
    raw = fs.readFileSync(CONFIG_PATH, "utf8");
  } catch {
    throw new UserError(
      `No config at ${CONFIG_PATH}. Run \`pnpm run dev-env setup\` first.`,
    );
  }
  const config = JSON.parse(raw);
  for (const key of ["server", "clientId", "clientSecret", "password"]) {
    if (!config[key]) {
      throw new UserError(
        `${CONFIG_PATH} is missing "${key}". Re-run \`pnpm run dev-env setup\`.`,
      );
    }
  }
  return config;
}

function bw(args, env = {}) {
  const result = spawnSync("bw", [...args, "--nointeraction"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, BITWARDENCLI_APPDATA_DIR: BW_DATA_DIR, ...env },
  });
  if (result.error?.code === "ENOENT") {
    throw new UserError(
      "The Bitwarden CLI (`bw`) is not installed. Install it with `npm install -g @bitwarden/cli`.",
    );
  }
  if (result.error) throw result.error;
  return result;
}

function bwOrThrow(args, env) {
  const result = bw(args, env);
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout).trim();
    throw new UserError(`\`bw ${args[0]}\` failed: ${detail}`);
  }
  return result.stdout;
}

// bw prints one-off notices before its JSON on a fresh data dir; the payload is the last line.
function lastJsonLine(stdout) {
  return JSON.parse(stdout.trim().split("\n").pop());
}

function bwStatus() {
  return lastJsonLine(bwOrThrow(["status"]));
}

/** Log in if needed, unlock, sync, and return a session key. */
function openSession(config) {
  const wanted = config.server.replace(/\/+$/, "");
  let status = bwStatus();
  if (
    status.status !== "unauthenticated" &&
    (status.serverUrl ?? "").replace(/\/+$/, "") !== wanted
  ) {
    bwOrThrow(["logout"]);
    status = bwStatus();
  }
  if (status.status === "unauthenticated") {
    bwOrThrow(["config", "server", wanted]);
    bwOrThrow(["login", "--apikey"], {
      BW_CLIENTID: config.clientId,
      BW_CLIENTSECRET: config.clientSecret,
    });
  }
  const session = bwOrThrow(
    ["unlock", "--passwordenv", "BW_PASSWORD", "--raw"],
    {
      BW_PASSWORD: config.password,
    },
  )
    .trim()
    .split("\n")
    .pop();
  bwOrThrow(["sync"], { BW_SESSION: session });
  return session;
}

function loadCatalog() {
  const config = readConfig();
  const session = openSession(config);
  const args = ["list", "items"];
  if (config.collectionId) args.push("--collectionid", config.collectionId);
  const items = lastJsonLine(bwOrThrow(args, { BW_SESSION: session }));
  return parseCatalog(items);
}

function ask(question, { secret = false } = {}) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });
  if (secret) {
    // Echo nothing after the prompt itself has been written.
    const write = rl._writeToOutput.bind(rl);
    rl._writeToOutput = (text) => {
      if (text.includes(question)) write(text);
    };
  }
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      if (secret) process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

async function setup() {
  if (!process.stdin.isTTY) {
    throw new UserError(
      "`setup` asks for secrets interactively; run it in a terminal.",
    );
  }
  let previous = {};
  try {
    previous = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch {
    // First run.
  }
  console.log(
    "Enter the read-only Bitwarden account for WebUI dev servers.\n" +
      "Its API key and master password are in the team collection of your own vault.\n",
  );
  const keep = (value) => (value ? " [keep current]" : "");
  const config = {
    server:
      (await ask(
        `Bitwarden server URL${previous.server ? ` [${previous.server}]` : ""}: `,
      )) || previous.server,
    clientId:
      (await ask(`API key client_id${keep(previous.clientId)}: `)) ||
      previous.clientId,
    clientSecret:
      (await ask(`API key client_secret${keep(previous.clientSecret)}: `, {
        secret: true,
      })) || previous.clientSecret,
    password:
      (await ask(`Master password${keep(previous.password)}: `, {
        secret: true,
      })) || previous.password,
    collectionId:
      (await ask(
        `Collection id (optional)${previous.collectionId ? ` [${previous.collectionId}]` : ""}: `,
      )) ||
      previous.collectionId ||
      undefined,
  };
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, {
    mode: 0o600,
  });
  fs.chmodSync(CONFIG_PATH, 0o600);
  console.log(`\nSaved ${CONFIG_PATH}`);

  // A changed API key must not keep riding the previous login.
  if (bwStatus().status !== "unauthenticated") bwOrThrow(["logout"]);
  const catalog = loadCatalog();
  console.log(`Login works: ${catalog.servers.length} server(s) visible.`);
}

function status() {
  const version = bwOrThrow(["--version"]).trim().split("\n").pop();
  console.log(`bw: ${version}`);
  const config = readConfig();
  console.log(`config: ${CONFIG_PATH} (server ${config.server})`);
  const catalog = loadCatalog();
  const accounts = catalog.servers.reduce(
    (sum, s) => sum + s.accounts.length,
    0,
  );
  console.log(
    `vault: ${catalog.servers.length} server(s), ${accounts} account(s)`,
  );
  for (const warning of catalog.warnings) console.log(`warning: ${warning}`);
}

function writeEnvFile(relativePath, vars, { seedFrom, expand } = {}) {
  const target = path.join(REPO_ROOT, relativePath);
  let content = "";
  if (fs.existsSync(target)) {
    content = fs.readFileSync(target, "utf8");
  } else if (seedFrom && fs.existsSync(path.join(REPO_ROOT, seedFrom))) {
    content = fs.readFileSync(path.join(REPO_ROOT, seedFrom), "utf8");
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, upsertEnv(content, vars, { expand }), {
    mode: 0o600,
  });
  console.log(`wrote ${relativePath}`);
}

function use(serverName, role, { password }) {
  const catalog = loadCatalog();
  const server = findServer(catalog, serverName);
  if (!server.endpoint) {
    throw new UserError(
      `Server "${server.name}" has no endpoint in Bitwarden.`,
    );
  }
  const account = findAccount(server, role);
  const prefill = loginPrefillVars(server, account, { password });
  // Vite runs dotenv-expand over this file; Playwright reads its file with plain dotenv.
  writeEnvFile(".env.development.local", prefill, { expand: true });
  const shadowed = Object.keys(prefill).filter(
    (key) =>
      process.env[key] !== undefined &&
      process.env[key] !== (prefill[key] ?? ""),
  );
  if (shadowed.length > 0) {
    console.log(
      `warning: ${shadowed.join(", ")} is exported in this shell, and Vite prefers the ` +
        "shell over .env.development.local. Unset it, or the pre-fill will not change.",
    );
  }
  writeEnvFile("e2e/envs/.env.playwright", playwrightVars(server), {
    seedFrom: "e2e/envs/.env.playwright.sample",
  });
  console.log(
    `${server.name} (${server.endpoint}) as ${account.role} <${account.email}>` +
      (password ? "" : ", password not pre-filled"),
  );
  if (server.stale || account.stale) {
    console.log(
      "note: the Bitwarden notes for this pick have not been verified recently.",
    );
  }
  console.log("Restart `pnpm run dev` to pick up the login pre-fill.");
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const flags = new Set(rest.filter((arg) => arg.startsWith("--")));
  const positional = rest.filter((arg) => !arg.startsWith("--"));
  const json = flags.has("--json");

  switch (command) {
    case "setup":
      return setup();
    case "status":
      return status();
    case "list": {
      const catalog = redactCatalog(loadCatalog());
      console.log(
        json ? JSON.stringify(catalog, null, 2) : formatCatalog(catalog),
      );
      return;
    }
    case "get": {
      if (positional.length !== 2) throw new UserError(USAGE);
      const server = findServer(loadCatalog(), positional[0]);
      const account = findAccount(server, positional[1]);
      const result = {
        server: server.name,
        endpoint: server.endpoint,
        ...account,
      };
      if (json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`endpoint: ${result.endpoint}`);
        console.log(`email: ${result.email}`);
        console.log(`password: ${result.password}`);
      }
      return;
    }
    case "use": {
      if (positional.length < 1 || positional.length > 2)
        throw new UserError(USAGE);
      return use(positional[0], positional[1] ?? "user", {
        password: !flags.has("--no-password"),
      });
    }
    case undefined:
    case "help":
    case "--help":
      console.log(USAGE);
      return;
    default:
      throw new UserError(`Unknown command "${command}".\n\n${USAGE}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(error.message.includes("Usage:") ? 2 : 1);
});
