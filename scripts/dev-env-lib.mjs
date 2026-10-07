// Pure logic behind `pnpm run dev-env`: normalizing the team PR board's catalog of
// dev servers and test accounts, and writing a pick into the env files.
//
// It lives outside dev-env.mjs so it can be unit tested without the board.

/** The catalog contract version this parser understands. */
export const CATALOG_VERSION = 1;

/** The roles the contract knows, least privileged first. */
export const ROLES = ["user", "project-admin", "admin"];

/**
 * The `E2E_*` stems `use` fills: the `index`-th account (stored order) with
 * `role`. Other stems (`E2E_MONITOR`, `E2E_DOMAIN_ADMIN`) are left as written.
 */
export const E2E_SLOTS = [
  { stem: "E2E_ADMIN", role: "admin", index: 0 },
  { stem: "E2E_USER", role: "user", index: 0 },
  { stem: "E2E_USER2", role: "user", index: 1 },
  { stem: "E2E_PROJECT_ADMIN", role: "project-admin", index: 0 },
];

/** A probe older than this says nothing about the server now; the board re-probes every ~5 minutes. */
export const PROBE_STALE_MINUTES = 30;

const SLUG = /^[a-z0-9][a-z0-9-]{0,62}$/;

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const sameEmail = (a, b) =>
  typeof a === "string" &&
  typeof b === "string" &&
  a.trim().toLowerCase() === b.trim().toLowerCase();

function normalizeEndpoint(raw) {
  if (typeof raw !== "string") return null;
  const endpoint = raw.trim().replace(/\/+$/, "");
  try {
    const { protocol } = new URL(endpoint);
    return protocol === "http:" || protocol === "https:" ? endpoint : null;
  } catch {
    return null;
  }
}

/** Tags and notes, shared by servers and accounts; a bad value is dropped with a warning. */
function describe(entry, label, warnings) {
  let tags = [];
  if (Array.isArray(entry.tags)) {
    tags = entry.tags
      .filter((tag) => typeof tag === "string" && tag.trim() !== "")
      .map((tag) => tag.trim());
  } else if (entry.tags != null) {
    warnings.push(`${label}: "tags" is not a list, ignored`);
  }
  const notes =
    typeof entry.notes === "string" && entry.notes.trim() !== ""
      ? entry.notes.trim()
      : null;
  return { tags, notes };
}

const stringOrNull = (value) =>
  typeof value === "string" && value !== "" ? value : null;

/** The board's read-only probe result; `null` when never probed or malformed (one warning). */
function parseStatus(raw, label, warnings) {
  if (raw == null) return null;
  if (!isObject(raw) || typeof raw.live !== "boolean") {
    warnings.push(`${label}: "status" is malformed, treated as unknown`);
    return null;
  }
  if (raw.config != null && !isObject(raw.config)) {
    warnings.push(`${label}: "status.config" is not an object, ignored`);
  }
  return {
    live: raw.live,
    checkedAt: stringOrNull(raw.checked_at),
    lastLiveAt: stringOrNull(raw.last_live_at),
    managerVersion: stringOrNull(raw.manager_version),
    apiVersion: stringOrNull(raw.api_version),
    latencyMs: Number.isFinite(raw.latency_ms) ? raw.latency_ms : null,
    error: stringOrNull(raw.error),
    config: isObject(raw.config) ? raw.config : null,
    configFetchedAt: stringOrNull(raw.config_fetched_at),
    configError: stringOrNull(raw.config_error),
    configTruncated: raw.config_truncated === true,
  };
}

// Keep in sync with MANAGER_CONFIG_KEYS in lablup/frontend-board board/ui/src/lib/catalog.ts.
/** The deployment switches in `config.toml` worth choosing a server by; `section.*` is the whole table. */
export const MANAGER_CONFIG_KEYS = [
  "general.connectionMode",
  "general.signupSupport",
  "general.allowSignout",
  "general.allowAnonymousChangePassword",
  "general.allowSignupWithoutConfirmation",
  "general.enableContainerCommit",
  "general.enableModelFolders",
  "general.enableImportFromHuggingFace",
  "general.enableExtendLoginSession",
  "general.enableReservoir",
  "general.force2FA",
  "general.allowProjectResourceMonitor",
  "general.directoryBasedUsage",
  "general.maxCountForPreopenPorts",
  "resources.openPortToPublic",
  "resources.allowPreferredPort",
  "resources.allowNonAuthTCP",
  "resources.maxFileUploadSize",
  "environments.showNonInstalledImages",
  "plugin.*",
  "pipeline.*",
];

function lookup(config, dotted) {
  let value = config;
  for (const part of dotted.split(".")) {
    if (!isObject(value) || !Object.hasOwn(value, part)) return undefined;
    value = value[part];
  }
  return value;
}

/** `[{key, value, present}]` for MANAGER_CONFIG_KEYS; a present `section.*` expands to one row per key in it. */
export function managerSettings(config) {
  const rows = [];
  for (const key of MANAGER_CONFIG_KEYS) {
    if (key.endsWith(".*")) {
      const section = key.slice(0, -2);
      const table = lookup(config, section);
      if (isObject(table) && Object.keys(table).length > 0) {
        for (const [name, value] of Object.entries(table)) {
          rows.push({ key: `${section}.${name}`, value, present: true });
        }
      } else {
        rows.push({ key, value: null, present: false });
      }
      continue;
    }
    const value = lookup(config, key);
    rows.push({ key, value: value ?? null, present: value !== undefined });
  }
  return rows;
}

/** Every leaf of `config` as `[{key, value, present: true}]`, for `config --all`. */
export function allSettings(config, prefix = "") {
  if (!isObject(config)) return [];
  return Object.entries(config).flatMap(([name, value]) =>
    isObject(value)
      ? allSettings(value, `${prefix}${name}.`)
      : [{ key: `${prefix}${name}`, value, present: true }],
  );
}

/** A setting value as one short token. */
export function formatSettingValue(value, max = 40) {
  const text =
    typeof value === "string" && !/\s/.test(value) && value !== ""
      ? value
      : JSON.stringify(value);
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** The compact `config:` line `list` prints under a server. */
export function formatConfigLine(server) {
  const status = server.status;
  if (!status?.config) {
    const why = status
      ? (status.configError ?? "not served")
      : "not checked yet";
    return `config: none (${why})`;
  }
  const tokens = managerSettings(status.config)
    .filter((row) => row.present)
    .map(({ key, value }) => {
      const name = key.replace(/^general\./, "");
      if (key === "general.connectionMode") return formatSettingValue(value);
      if (typeof value === "boolean") return `${value ? "+" : "-"}${name}`;
      return `${name}=${formatSettingValue(value)}`;
    });
  const extra = [
    status.configTruncated ? "(truncated)" : null,
    status.configError ? `(last fetch failed: ${status.configError})` : null,
  ].filter(Boolean);
  return [
    "config:",
    ...(tokens.length ? tokens : ["(no manager settings)"]),
    ...extra,
  ].join(" ");
}

function minutesSince(iso, now) {
  const time = Date.parse(iso ?? "");
  return Number.isNaN(time) ? null : (now.getTime() - time) / 60_000;
}

/**
 * `live`, `down` or `unknown`. A probe that never ran, or ran more than
 * PROBE_STALE_MINUTES ago, is `unknown`.
 */
export function serverHealth(server, now = new Date()) {
  const age = minutesSince(server.status?.checkedAt, now);
  if (!server.status || age === null || age > PROBE_STALE_MINUTES) {
    return "unknown";
  }
  return server.status.live ? "live" : "down";
}

function ago(iso, now) {
  const minutes = minutesSince(iso, now);
  if (minutes === null) return "at an unknown time";
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${Math.floor(minutes)}m ago`;
  if (minutes < 48 * 60) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / (24 * 60))}d ago`;
}

/** One line on the server's last probe, for `list`. */
export function formatStatus(server, now = new Date()) {
  const status = server.status;
  if (!status) return "not checked yet";
  const age = minutesSince(status.checkedAt, now);
  const staleProbe =
    age === null || age > PROBE_STALE_MINUTES ? " (probe stale)" : "";
  if (status.live) {
    return (
      [
        "live",
        status.managerVersion ? `manager ${status.managerVersion}` : null,
        `checked ${ago(status.checkedAt, now)}`,
      ]
        .filter(Boolean)
        .join(" · ") + staleProbe
    );
  }
  const since = status.lastLiveAt
    ? `DOWN since ${status.lastLiveAt}`
    : "DOWN, never seen live";
  const was = status.managerVersion ? ` (was ${status.managerVersion})` : "";
  return `${since}${was}: ${status.error ?? "no error reported"}${staleProbe}`;
}

/** The warning `use` / `get` print for a server the last probe found down, or null. */
export function downWarning(server) {
  if (!server.status || server.status.live) return null;
  return (
    `warning: ${server.name} was down at the last probe (${server.status.checkedAt ?? "time unknown"}): ` +
    `${server.status.error ?? "no error reported"}; last live ${server.status.lastLiveAt ?? "never"}.`
  );
}

function parseAccount(raw, server, warnings) {
  const label = `server "${server.name}"`;
  if (!isObject(raw)) {
    warnings.push(`${label}: an account is not an object, skipped`);
    return null;
  }
  if (typeof raw.email !== "string" || raw.email.trim() === "") {
    warnings.push(`${label}: an account has no email, skipped`);
    return null;
  }
  const who = `"${server.name}/${raw.email.trim()}"`;
  if (typeof raw.role !== "string" || raw.role.trim() === "") {
    warnings.push(`${who}: no role, skipped`);
    return null;
  }
  if (!ROLES.includes(raw.role)) {
    warnings.push(
      `${who}: unknown role "${raw.role}" (expected ${ROLES.join(", ")}), kept`,
    );
  }
  if (server.accounts.some((account) => sameEmail(account.email, raw.email))) {
    warnings.push(`${who}: duplicate email, keeping the first`);
    return null;
  }
  if (raw.password != null && typeof raw.password !== "string") {
    warnings.push(`${who}: password is not a string, treated as missing`);
  }
  const passwordAvailable =
    typeof raw.password === "string" && raw.password !== "";
  return {
    role: raw.role.trim(),
    email: raw.email.trim(),
    password: passwordAvailable ? raw.password : null,
    passwordAvailable,
    ...describe(raw, who, warnings),
  };
}

/**
 * Normalize the board's `GET /api/catalog` body. The board validates on
 * write; this still skips (and warns about) an entry that breaks the contract
 * instead of failing the whole catalog. Only a body with no `servers` list throws.
 */
export function parseCatalog(body) {
  if (!isObject(body) || !Array.isArray(body.servers)) {
    throw new Error('the catalog is not an object with a "servers" list');
  }
  const warnings = [];
  if (body.version !== CATALOG_VERSION) {
    warnings.push(
      `catalog version ${JSON.stringify(body.version)}, expected ${CATALOG_VERSION}; reading it anyway`,
    );
  }
  const servers = [];
  for (const raw of body.servers) {
    if (!isObject(raw)) {
      warnings.push("a server entry is not an object, skipped");
      continue;
    }
    if (typeof raw.name !== "string" || !SLUG.test(raw.name)) {
      warnings.push(
        `server name ${JSON.stringify(raw.name)} is not a slug, skipped`,
      );
      continue;
    }
    const label = `server "${raw.name}"`;
    if (servers.some((server) => server.name === raw.name)) {
      warnings.push(`${label}: duplicate name, keeping the first`);
      continue;
    }
    const endpoint = normalizeEndpoint(raw.endpoint);
    if (!endpoint) warnings.push(`${label}: no valid http(s) endpoint`);
    const server = {
      name: raw.name,
      endpoint,
      ...describe(raw, label, warnings),
      status: parseStatus(raw.status, label, warnings),
      accounts: [],
    };
    if (raw.accounts != null && !Array.isArray(raw.accounts)) {
      warnings.push(`${label}: "accounts" is not a list, ignored`);
    }
    for (const rawAccount of Array.isArray(raw.accounts) ? raw.accounts : []) {
      const account = parseAccount(rawAccount, server, warnings);
      if (account) server.accounts.push(account);
    }
    // Accounts keep their stored order: "the first user" is a selection rule.
    servers.push(server);
  }
  servers.sort((a, b) => a.name.localeCompare(b.name));
  return {
    updatedAt: typeof body.updated_at === "string" ? body.updated_at : null,
    servers,
    warnings,
  };
}

/** The catalog without passwords — what `list` prints and an agent reads to choose. */
export function redactCatalog(catalog) {
  return {
    ...catalog,
    servers: catalog.servers.map((server) => ({
      ...server,
      accounts: server.accounts.map(({ password: _password, ...rest }) => rest),
    })),
  };
}

export function findServer(catalog, serverName) {
  const server = catalog.servers.find((s) => s.name === serverName);
  if (!server) {
    const known = catalog.servers.map((s) => s.name).join(", ") || "(none)";
    throw new Error(`Unknown server "${serverName}". Known: ${known}`);
  }
  return server;
}

/**
 * Pick an account by email (case-insensitive) or by role, the first with that
 * role in stored order. `others` are the emails of the rest sharing the role.
 */
export function selectAccount(server, selector) {
  const byEmail = server.accounts.find((a) => sameEmail(a.email, selector));
  if (byEmail) return { account: byEmail, others: [] };
  const withRole = server.accounts.filter((a) => a.role === selector);
  if (withRole.length === 0) {
    const roles = [...new Set(server.accounts.map((a) => a.role))];
    throw new Error(
      `Server "${server.name}" has no account "${selector}". ` +
        `Roles: ${roles.join(", ") || "(none)"}; emails: ` +
        `${server.accounts.map((a) => a.email).join(", ") || "(none)"}`,
    );
  }
  return {
    account: withRole[0],
    others: withRole.slice(1).map((a) => a.email),
  };
}

/** The account `selectAccount` picks. */
export function findAccount(server, selector) {
  return selectAccount(server, selector).account;
}

/** The line `get` / `use` print when a role matched several accounts, or null. */
export function ambiguityNote(others) {
  return others.length > 0
    ? `also: ${others.join(", ")} — pass the email to pick one`
    : null;
}

/**
 * Set `vars[passwordKey]` for `account` in a file whose parsed content is
 * `existing`. Without a catalog password, a password a person wrote for the
 * same email is kept (the key is left out, so upsertEnv leaves its line
 * alone); any other is removed, so another account's password never lingers.
 */
function setPassword(vars, account, existing, emailKey, passwordKey) {
  if (account?.passwordAvailable) {
    vars[passwordKey] = account.password;
  } else if (
    !account ||
    !existing[passwordKey] ||
    !sameEmail(existing[emailKey], account.email)
  ) {
    vars[passwordKey] = null;
  }
}

/**
 * `.env.development.local` values that pre-fill the login screen, given the
 * file's current parsed content. The password line is removed on
 * `password: false`, and never written empty.
 */
export function loginPrefillVars(
  server,
  account,
  { password = true, existing = {} } = {},
) {
  const vars = {
    VITE_DEFAULT_API_ENDPOINT: server.endpoint,
    VITE_DEFAULT_EMAIL: account.email,
  };
  if (password) {
    setPassword(
      vars,
      account,
      existing,
      "VITE_DEFAULT_EMAIL",
      "VITE_DEFAULT_PASSWORD",
    );
  } else {
    vars.VITE_DEFAULT_PASSWORD = null;
  }
  return vars;
}

/**
 * `e2e/envs/.env.playwright` values: the endpoint plus every E2E_SLOTS stem,
 * given the file's current parsed content. A slot this server cannot fill is
 * removed, so another server's account never lingers next to the new endpoint.
 */
export function playwrightVars(server, { existing = {} } = {}) {
  const vars = { E2E_WEBSERVER_ENDPOINT: server.endpoint };
  for (const { stem, role, index } of E2E_SLOTS) {
    const account = server.accounts.filter((a) => a.role === role)[index];
    vars[`${stem}_EMAIL`] = account?.email ?? null;
    setPassword(vars, account, existing, `${stem}_EMAIL`, `${stem}_PASSWORD`);
  }
  return vars;
}

/** Emails whose hand-written password `vars` leaves in place: password keys it omits. */
export function keptPasswordEmails(vars) {
  return Object.keys(vars)
    .filter((key) => key.endsWith("_EMAIL"))
    .filter((key) => !(key.replace(/_EMAIL$/, "_PASSWORD") in vars))
    .map((key) => vars[key]);
}

/**
 * Quote a value for a dotenv file. Vite additionally runs dotenv-expand, which
 * reads `$` as a variable reference even inside quotes — `expand` escapes it.
 */
export function quoteEnvValue(value, { expand = false } = {}) {
  let text = String(value);
  if (/[\r\n]/.test(text)) {
    throw new Error(
      "A value with a line break cannot be written to an env file",
    );
  }
  if (expand) text = text.replace(/\$/g, "\\$");
  if (/^[A-Za-z0-9_@%+=:,./-]*$/.test(text)) return text;
  for (const quote of ["'", '"', "`"]) {
    // dotenv expands `\n` only inside double quotes.
    if (quote === '"' && text.includes("\\n")) continue;
    if (!text.includes(quote)) return `${quote}${text}${quote}`;
  }
  throw new Error(
    "A value mixing all three quote characters cannot be written to an env file",
  );
}

/**
 * Set `vars` in dotenv `content`, leaving every other line untouched. A key is
 * replaced where it already stands, appended otherwise; a `null` value removes it.
 */
export function upsertEnv(content, vars, options) {
  const pending = new Map(Object.entries(vars));
  const out = [];
  for (const line of content.split("\n")) {
    const key = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(
      line,
    )?.[1];
    if (key === undefined || !pending.has(key)) {
      out.push(line);
      continue;
    }
    const value = pending.get(key);
    if (value !== undefined) {
      // A repeated key keeps only its first occurrence.
      pending.set(key, undefined);
      if (value !== null) out.push(`${key}=${quoteEnvValue(value, options)}`);
    }
  }
  const appended = [...pending].filter(([, value]) => value != null);
  if (appended.length > 0) {
    while (out.length > 0 && out[out.length - 1] === "") out.pop();
    if (out.length > 0) out.push("");
    for (const [key, value] of appended) {
      out.push(`${key}=${quoteEnvValue(value, options)}`);
    }
  }
  const text = out.join("\n");
  return text.endsWith("\n") ? text : `${text}\n`;
}

/** Human-readable catalog for `list`. Never prints a password. */
export function formatCatalog(catalog, now = new Date()) {
  const lines = [];
  const notes = (entry, indent) =>
    (entry.notes ?? "").split("\n").map((line) => `${indent}${line}`.trimEnd());

  for (const server of catalog.servers) {
    lines.push(`${server.name}  ${server.endpoint ?? "(no endpoint)"}`);
    lines.push(`  ${formatStatus(server, now)}`);
    lines.push(`  ${formatConfigLine(server)}`);
    if (server.tags.length > 0) lines.push(`  tags: ${server.tags.join(" ")}`);
    if (server.notes) lines.push(...notes(server, "  "));
    for (const account of server.accounts) {
      lines.push(`  - ${account.role}  ${account.email}`);
      if (account.tags.length > 0) {
        lines.push(`      tags: ${account.tags.join(" ")}`);
      }
      if (!account.passwordAvailable) {
        lines.push("      password: — (typed at login)");
      }
      if (account.notes) lines.push(...notes(account, "      "));
    }
    lines.push("");
  }
  if (catalog.servers.length === 0) {
    lines.push("The catalog has no servers yet.", "");
  }
  for (const warning of catalog.warnings) lines.push(`warning: ${warning}`);
  return lines.join("\n").trimEnd();
}
