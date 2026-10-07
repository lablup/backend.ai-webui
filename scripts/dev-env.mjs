#!/usr/bin/env node
// `pnpm run dev-env` — pick a dev API server and test account from the team's
// catalog (served by the dev box gateway at `http://dev-gw.<domain>/api/catalog`),
// and write the pick into the git-ignored env files.
// Conventions: DEV_ENVIRONMENT.md ("Dev servers and test accounts").
import {
  PROBE_STALE_MINUTES,
  downWarning,
  findAccount,
  findServer,
  formatCatalog,
  loginPrefillVars,
  parseCatalog,
  playwrightVars,
  redactCatalog,
  serverHealth,
  upsertEnv,
} from "./dev-env-lib.mjs";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT =
  process.env.WEBUI_DEV_ENV_ROOT ??
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FETCH_TIMEOUT_MS = 10_000;

const USAGE = `Usage: pnpm run dev-env <command>

  status                     Where the catalog comes from, and what it holds
  list [--json]              Servers, accounts and their notes (no passwords)
  get <server> <role> [--json]
                             One account, password included when the catalog has one
  use <server> [role] [--no-password]
                             Write .env.development.local (login pre-fill, role
                             defaults to "user") and e2e/envs/.env.playwright`;

class UserError extends Error {}

/**
 * Where to read the catalog: a JSON file (`WEBUI_DEV_ENV_CATALOG`), a URL
 * (`WEBUI_DEV_ENV_CATALOG_URL`), or the gateway named by the dev-gw config.
 */
function catalogSource() {
  const file = process.env.WEBUI_DEV_ENV_CATALOG?.trim();
  if (file) return { file, label: `${file} (WEBUI_DEV_ENV_CATALOG)` };
  const url = process.env.WEBUI_DEV_ENV_CATALOG_URL?.trim();
  if (url) return { url, label: `${url} (WEBUI_DEV_ENV_CATALOG_URL)` };

  const configPath =
    process.env.DEV_GW_CONFIG?.trim() ||
    path.join(os.homedir(), ".config", "fw", "dev-gw.json");
  let domain;
  try {
    domain = JSON.parse(fs.readFileSync(configPath, "utf8")).domain;
  } catch {
    domain = undefined;
  }
  if (typeof domain !== "string" || domain.trim() === "") {
    throw new UserError(
      `No dev box gateway configured (${configPath} is missing or has no "domain").\n` +
        "Join the gateway with `dev-gw join` (DEV_ENVIRONMENT.md), or point " +
        "WEBUI_DEV_ENV_CATALOG_URL at a catalog URL.",
    );
  }
  const gatewayUrl = `http://dev-gw.${domain.trim()}/api/catalog`;
  return { url: gatewayUrl, label: gatewayUrl };
}

async function readCatalogBody(source) {
  if (source.file) {
    try {
      return JSON.parse(fs.readFileSync(source.file, "utf8"));
    } catch (error) {
      throw new UserError(
        `WEBUI_DEV_ENV_CATALOG=${source.file}: ${error.message}`,
      );
    }
  }
  let response;
  try {
    response = await fetch(source.url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (error) {
    const reason =
      error.name === "TimeoutError"
        ? `no answer within ${FETCH_TIMEOUT_MS / 1000} s`
        : (error.cause?.message ?? error.message);
    throw new UserError(
      `Could not reach the catalog at ${source.url}: ${reason}. Is the dev VPN up?`,
    );
  }
  if (!response.ok) {
    throw new UserError(
      `The catalog at ${source.url} answered HTTP ${response.status}.`,
    );
  }
  try {
    return await response.json();
  } catch {
    throw new UserError(`The catalog at ${source.url} did not return JSON.`);
  }
}

async function loadCatalog(source = catalogSource()) {
  const body = await readCatalogBody(source);
  try {
    return parseCatalog(body);
  } catch (error) {
    throw new UserError(`${source.label}: ${error.message}`);
  }
}

function missingPasswordNote(server, account) {
  return (
    `note: the catalog has no password for ${server.name}/${account.role}; ` +
    "type it at login, or add it to your own git-ignored env file."
  );
}

async function status() {
  const source = catalogSource();
  console.log(`source: ${source.label}`);
  const catalog = await loadCatalog(source);
  const accounts = catalog.servers.flatMap((s) => s.accounts);
  const missing = accounts.filter((a) => !a.passwordAvailable).length;
  console.log(`updated: ${catalog.updatedAt ?? "unknown"}`);
  console.log(
    `catalog: ${catalog.servers.length} server(s), ${accounts.length} account(s)` +
      (missing > 0 ? `, ${missing} without a password` : ""),
  );
  const health = { live: 0, down: 0, unknown: 0 };
  for (const server of catalog.servers) health[serverHealth(server)] += 1;
  console.log(
    `probe: ${health.live} live, ${health.down} down, ${health.unknown} unknown ` +
      `(never probed, or not in the last ${PROBE_STALE_MINUTES} min)`,
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

async function use(serverName, role, { password }) {
  const catalog = await loadCatalog();
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
      (prefill.VITE_DEFAULT_PASSWORD !== null
        ? ""
        : ", password not pre-filled"),
  );
  if (password && !account.passwordAvailable) {
    console.log(missingPasswordNote(server, account));
  }
  if (downWarning(server)) console.log(downWarning(server));
  if (server.stale || account.stale) {
    console.log(
      "note: the catalog notes for this pick have not been verified in the last 90 days.",
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
      const catalog = redactCatalog(await loadCatalog());
      console.log(
        json ? JSON.stringify(catalog, null, 2) : formatCatalog(catalog),
      );
      return;
    }
    case "get": {
      if (positional.length !== 2) throw new UserError(USAGE);
      const server = findServer(await loadCatalog(), positional[0]);
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
        if (account.passwordAvailable) {
          console.log(`password: ${result.password}`);
        }
      }
      // stderr, so `--json` stays parseable.
      if (!account.passwordAvailable) {
        console.error(missingPasswordNote(server, account));
      }
      if (downWarning(server)) console.error(downWarning(server));
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
