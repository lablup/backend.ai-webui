#!/usr/bin/env node
// `pnpm run dev-env` — pick a dev API server and test account from the team's
// catalog (served by the dev box gateway through `dev-gw catalog`), and write
// the pick into the git-ignored env files.
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
import { fileURLToPath } from "node:url";

const REPO_ROOT =
  process.env.WEBUI_DEV_ENV_ROOT ??
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// A JSON file in `bw list items` shape that replaces the gateway — for tests and for a box without one.
const CATALOG_OVERRIDE = process.env.WEBUI_DEV_ENV_CATALOG;
const EXIT_NOT_ENROLLED = 3;

const USAGE = `Usage: pnpm run dev-env <command>

  status                     Check dev-gw and the catalog it serves
  list [--json]              Servers, accounts and their notes (no passwords)
  get <server> <role> [--json]
                             One account, password included
  use <server> [role] [--no-password]
                             Write .env.development.local (login pre-fill, role
                             defaults to "user") and e2e/envs/.env.playwright`;

class UserError extends Error {}

function downloadCommand() {
  let domain = "<domain>";
  try {
    const config = JSON.parse(
      fs.readFileSync(
        path.join(os.homedir(), ".config", "fw", "dev-gw.json"),
        "utf8",
      ),
    );
    if (config.domain) domain = config.domain;
  } catch {
    // Not joined to a gateway yet; keep the placeholder.
  }
  return `mkdir -p ~/.local/bin && curl -fsSL http://dev-gw.${domain}/dev-gw -o ~/.local/bin/dev-gw && chmod +x ~/.local/bin/dev-gw`;
}

/**
 * The `dev-gw` on PATH, refusing a client older than `dev-gw catalog`: an old
 * client reads an unknown subcommand as `join <box>` and renames the box.
 */
function resolveDevGw() {
  const found = (process.env.PATH ?? "")
    .split(path.delimiter)
    .filter(Boolean)
    .map((dir) => path.join(dir, "dev-gw"))
    .find((candidate) => {
      try {
        fs.accessSync(candidate, fs.constants.X_OK);
        return fs.statSync(candidate).isFile();
      } catch {
        return false;
      }
    });
  if (!found) {
    throw new UserError(
      `\`dev-gw\` is not on PATH. Install it from the gateway:\n  ${downloadCommand()}`,
    );
  }
  if (!/\bcatalog\b/.test(fs.readFileSync(found, "utf8"))) {
    throw new UserError(
      `${found} predates \`dev-gw catalog\`. Update it from the gateway:\n  ${downloadCommand()}`,
    );
  }
  return found;
}

/** Raw catalog items, from the override file or `dev-gw catalog`. */
function fetchItems() {
  if (CATALOG_OVERRIDE) {
    try {
      return JSON.parse(fs.readFileSync(CATALOG_OVERRIDE, "utf8"));
    } catch (error) {
      throw new UserError(
        `WEBUI_DEV_ENV_CATALOG=${CATALOG_OVERRIDE}: ${error.message}`,
      );
    }
  }
  const result = spawnSync(resolveDevGw(), ["catalog"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  const hint = (result.stderr ?? "").trim();
  if (result.status === EXIT_NOT_ENROLLED) {
    throw new UserError(
      "This box cannot read the catalog yet. Run `dev-gw enroll` (once per box), " +
        "then wait up to five minutes for the gateway to sync." +
        (hint ? `\ndev-gw said:\n${hint}` : ""),
    );
  }
  if (result.status !== 0) {
    throw new UserError(
      `\`dev-gw catalog\` failed (exit ${result.status})${hint ? `: ${hint}` : ""}`,
    );
  }
  const lines = result.stdout.trim().split("\n");
  try {
    return JSON.parse(lines[lines.length - 1]);
  } catch {
    throw new UserError("`dev-gw catalog` did not print a JSON catalog.");
  }
}

function loadCatalog() {
  return parseCatalog(fetchItems());
}

function status() {
  if (CATALOG_OVERRIDE) {
    console.log(`catalog: ${CATALOG_OVERRIDE} (WEBUI_DEV_ENV_CATALOG)`);
  } else {
    console.log(`dev-gw: ${resolveDevGw()}`);
  }
  const catalog = loadCatalog();
  const accounts = catalog.servers.reduce(
    (sum, s) => sum + s.accounts.length,
    0,
  );
  console.log(
    `catalog: ${catalog.servers.length} server(s), ${accounts} account(s)`,
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
      `Server "${server.name}" has no endpoint in the catalog.`,
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
      "note: the catalog notes for this pick have not been verified recently.",
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
