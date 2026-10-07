#!/usr/bin/env node
// `pnpm run dev-env` — pick a dev API server and test account from the team's
// catalog (served by the team PR board at `http://board.<domain>/api/catalog`),
// and write the pick into the git-ignored env files.
// Conventions: DEV_ENVIRONMENT.md ("Dev servers and test accounts").
import {
  PROBE_STALE_MINUTES,
  allSettings,
  ambiguityNote,
  downWarning,
  findServer,
  formatCatalog,
  formatConfigLine,
  formatSettingValue,
  keptPasswordEmails,
  loginPrefillVars,
  managerSettings,
  parseCatalog,
  playwrightVars,
  redactCatalog,
  selectAccount,
  serverHealth,
  upsertEnv,
} from "./dev-env-lib.mjs";
import dotenv from "dotenv";
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
  config <server> [--all] [--json]
                             The server's probed config.toml: manager-related
                             switches, or every key with --all
  get <server> <account> [--json]
                             One account, password included when the catalog has one
  use <server> [account] [--no-password]
                             Write .env.development.local (login pre-fill; account
                             is a role or an email, default "user") and e2e/envs/.env.playwright`;

class UserError extends Error {}

/**
 * Where to read the catalog: a JSON file (`WEBUI_DEV_ENV_CATALOG`), a URL
 * (`WEBUI_DEV_ENV_CATALOG_URL`), or the board on the gateway host named by
 * the dev-gw config. Plain http: Node's fetch rejects the gateway's internal CA.
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
      `No dev box gateway configured (${configPath} is missing or has no "domain"), ` +
        "so the board's catalog URL is unknown.\n" +
        "Join the gateway with `dev-gw join` (DEV_ENVIRONMENT.md), or point " +
        "WEBUI_DEV_ENV_CATALOG_URL at a catalog URL.",
    );
  }
  const boardUrl = `http://board.${domain.trim()}/api/catalog`;
  return { url: boardUrl, label: boardUrl };
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
    `note: the catalog has no password for ${account.email} (${server.name}, ${account.role}); ` +
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

/**
 * Write the vars `buildVars(existing)` returns into `relativePath`, where
 * `existing` is the file's current parsed content (empty for a new file, even
 * one seeded from a sample). Prints one line per hand-written password kept.
 */
function writeEnvFile(relativePath, buildVars, { seedFrom, expand } = {}) {
  const target = path.join(REPO_ROOT, relativePath);
  let content = "";
  let existing = {};
  if (fs.existsSync(target)) {
    content = fs.readFileSync(target, "utf8");
    existing = dotenv.parse(content);
  } else if (seedFrom && fs.existsSync(path.join(REPO_ROOT, seedFrom))) {
    content = fs.readFileSync(path.join(REPO_ROOT, seedFrom), "utf8");
  }
  const vars = buildVars(existing);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, upsertEnv(content, vars, { expand }), {
    mode: 0o600,
  });
  console.log(`wrote ${relativePath}`);
  const kept = keptPasswordEmails(vars);
  for (const email of kept) {
    console.log(`kept the password already in ${relativePath} for ${email}`);
  }
  return { vars, kept };
}

async function use(serverName, selector, { password }) {
  const catalog = await loadCatalog();
  const server = findServer(catalog, serverName);
  if (!server.endpoint) {
    throw new UserError(
      `Server "${server.name}" has no endpoint in the catalog.`,
    );
  }
  const { account, others } = selectAccount(server, selector);
  // Vite runs dotenv-expand over this file; Playwright reads its file with plain dotenv.
  const { vars: prefill, kept } = writeEnvFile(
    ".env.development.local",
    (existing) => loginPrefillVars(server, account, { password, existing }),
    { expand: true },
  );
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
  writeEnvFile(
    "e2e/envs/.env.playwright",
    (existing) => playwrightVars(server, { existing }),
    { seedFrom: "e2e/envs/.env.playwright.sample" },
  );
  console.log(
    `${server.name} (${server.endpoint}) as ${account.role} <${account.email}>` +
      (prefill.VITE_DEFAULT_PASSWORD !== null
        ? ""
        : ", password not pre-filled"),
  );
  if (ambiguityNote(others)) console.log(ambiguityNote(others));
  if (password && !account.passwordAvailable && kept.length === 0) {
    console.log(missingPasswordNote(server, account));
  }
  if (downWarning(server)) console.log(downWarning(server));
  console.log("Restart `pnpm run dev` to pick up the login pre-fill.");
}

/** The server's probed `config.toml`: the manager-related switches, or with `all` every key. */
function showConfig(server, { all, json }) {
  const status = server.status;
  const config = status?.config ?? null;
  const settings = all ? allSettings(config) : managerSettings(config);
  if (json) {
    console.log(
      JSON.stringify(
        {
          server: server.name,
          endpoint: server.endpoint,
          configFetchedAt: status?.configFetchedAt ?? null,
          configError: status?.configError ?? null,
          configTruncated: status?.configTruncated ?? false,
          settings,
        },
        null,
        2,
      ),
    );
    return;
  }
  console.log(`${server.name}  ${server.endpoint ?? "(no endpoint)"}`);
  if (!config) {
    console.log(formatConfigLine(server));
    return;
  }
  console.log(
    `fetched: ${status.configFetchedAt ?? "unknown"}` +
      (status.configTruncated ? " (truncated)" : "") +
      (status.configError ? ` · last fetch failed: ${status.configError}` : ""),
  );
  const width = Math.max(...settings.map((row) => row.key.length), 0);
  for (const { key, value, present } of settings) {
    console.log(
      `  ${key.padEnd(width)}  ${present ? formatSettingValue(value, 80) : "— (not set)"}`,
    );
  }
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
    case "config": {
      if (positional.length !== 1) throw new UserError(USAGE);
      return showConfig(findServer(await loadCatalog(), positional[0]), {
        all: flags.has("--all"),
        json,
      });
    }
    case "get": {
      if (positional.length !== 2) throw new UserError(USAGE);
      const server = findServer(await loadCatalog(), positional[0]);
      const { account, others } = selectAccount(server, positional[1]);
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
      if (ambiguityNote(others)) console.error(ambiguityNote(others));
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
