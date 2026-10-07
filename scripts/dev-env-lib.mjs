// Pure logic behind `pnpm run dev-env`: normalizing the gateway's catalog of
// dev servers and test accounts, and writing a pick into the env files.
//
// It lives outside dev-env.mjs so it can be unit tested without the gateway.

/** The catalog contract version this parser understands. */
export const CATALOG_VERSION = 1;

/** A note older than this is reported as stale: it describes a server nobody has re-checked. */
export const STALE_AFTER_DAYS = 90;

/** Roles the E2E suite reads, and the `E2E_*` variable stem each one fills. */
export const E2E_ROLE_VARS = {
  admin: "E2E_ADMIN",
  user: "E2E_USER",
  user2: "E2E_USER2",
  monitor: "E2E_MONITOR",
  "domain-admin": "E2E_DOMAIN_ADMIN",
};

/** A probe older than this says nothing about the server now; the gateway re-probes every ~5 minutes. */
export const PROBE_STALE_MINUTES = 30;

const SLUG = /^[a-z0-9][a-z0-9-]{0,62}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function isStale(verifiedAt, now) {
  if (!verifiedAt) return true;
  const verified = Date.parse(verifiedAt);
  if (Number.isNaN(verified)) return true;
  return now.getTime() - verified > STALE_AFTER_DAYS * 24 * 60 * 60 * 1000;
}

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

/** Tags, notes and verification date, shared by servers and accounts; a bad value is dropped with a warning. */
function describe(entry, label, warnings, now) {
  let tags = [];
  if (Array.isArray(entry.tags)) {
    tags = entry.tags
      .filter((tag) => typeof tag === "string" && tag.trim() !== "")
      .map((tag) => tag.trim());
  } else if (entry.tags != null) {
    warnings.push(`${label}: "tags" is not a list, ignored`);
  }
  let verifiedAt = null;
  if (typeof entry.verified_at === "string" && DATE.test(entry.verified_at)) {
    verifiedAt = entry.verified_at;
  } else if (entry.verified_at != null) {
    warnings.push(`${label}: "verified_at" is not YYYY-MM-DD, ignored`);
  }
  const notes =
    typeof entry.notes === "string" && entry.notes.trim() !== ""
      ? entry.notes.trim()
      : null;
  return { tags, notes, verifiedAt, stale: isStale(verifiedAt, now) };
}

const stringOrNull = (value) =>
  typeof value === "string" && value !== "" ? value : null;

/** The gateway's read-only probe result; `null` when never probed or malformed (one warning). */
function parseStatus(raw, label, warnings) {
  if (raw == null) return null;
  if (!isObject(raw) || typeof raw.live !== "boolean") {
    warnings.push(`${label}: "status" is malformed, treated as unknown`);
    return null;
  }
  return {
    live: raw.live,
    checkedAt: stringOrNull(raw.checked_at),
    lastLiveAt: stringOrNull(raw.last_live_at),
    managerVersion: stringOrNull(raw.manager_version),
    apiVersion: stringOrNull(raw.api_version),
    latencyMs: Number.isFinite(raw.latency_ms) ? raw.latency_ms : null,
    error: stringOrNull(raw.error),
  };
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

function parseAccount(raw, server, warnings, now) {
  const label = `server "${server.name}"`;
  if (!isObject(raw)) {
    warnings.push(`${label}: an account is not an object, skipped`);
    return null;
  }
  if (typeof raw.role !== "string" || !SLUG.test(raw.role)) {
    warnings.push(
      `${label}: account role ${JSON.stringify(raw.role)} is not a slug, skipped`,
    );
    return null;
  }
  const who = `"${server.name}/${raw.role}"`;
  if (typeof raw.email !== "string" || raw.email.trim() === "") {
    warnings.push(`${who}: no email, skipped`);
    return null;
  }
  if (server.accounts.some((account) => account.role === raw.role)) {
    warnings.push(`${who}: duplicate role, keeping the first`);
    return null;
  }
  if (raw.password != null && typeof raw.password !== "string") {
    warnings.push(`${who}: password is not a string, treated as missing`);
  }
  const passwordAvailable =
    typeof raw.password === "string" && raw.password !== "";
  return {
    role: raw.role,
    email: raw.email.trim(),
    password: passwordAvailable ? raw.password : null,
    passwordAvailable,
    ...describe(raw, who, warnings, now),
  };
}

/**
 * Normalize the gateway's `GET /api/catalog` body. The gateway validates on
 * write; this still skips (and warns about) an entry that breaks the contract
 * instead of failing the whole catalog. Only a body with no `servers` list throws.
 */
export function parseCatalog(body, now = new Date()) {
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
      ...describe(raw, label, warnings, now),
      status: parseStatus(raw.status, label, warnings),
      accounts: [],
    };
    if (raw.accounts != null && !Array.isArray(raw.accounts)) {
      warnings.push(`${label}: "accounts" is not a list, ignored`);
    }
    for (const rawAccount of Array.isArray(raw.accounts) ? raw.accounts : []) {
      const account = parseAccount(rawAccount, server, warnings, now);
      if (account) server.accounts.push(account);
    }
    server.accounts.sort((a, b) => a.role.localeCompare(b.role));
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

export function findAccount(server, role) {
  const account = server.accounts.find((a) => a.role === role);
  if (!account) {
    const known = server.accounts.map((a) => a.role).join(", ") || "(none)";
    throw new Error(
      `Server "${server.name}" has no "${role}" account. Known: ${known}`,
    );
  }
  return account;
}

/**
 * `.env.development.local` values that pre-fill the login screen. The password
 * line is dropped on `password: false` and when the catalog has no password —
 * never written empty.
 */
export function loginPrefillVars(server, account, { password = true } = {}) {
  return {
    VITE_DEFAULT_API_ENDPOINT: server.endpoint,
    VITE_DEFAULT_EMAIL: account.email,
    VITE_DEFAULT_PASSWORD:
      password && account.passwordAvailable ? account.password : null,
  };
}

/**
 * `e2e/envs/.env.playwright` values: the endpoint plus every role the suite
 * reads. A role this server lacks is removed, so another server's account
 * never lingers next to the new endpoint; so is a password the catalog lacks.
 */
export function playwrightVars(server) {
  const vars = { E2E_WEBSERVER_ENDPOINT: server.endpoint };
  for (const [role, stem] of Object.entries(E2E_ROLE_VARS)) {
    const account = server.accounts.find((a) => a.role === role);
    vars[`${stem}_EMAIL`] = account?.email ?? null;
    vars[`${stem}_PASSWORD`] = account?.passwordAvailable
      ? account.password
      : null;
  }
  return vars;
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
  const meta = (entry) =>
    [
      entry.tags.length > 0 ? `tags: ${entry.tags.join(" ")}` : null,
      entry.verifiedAt
        ? `verified: ${entry.verifiedAt}${entry.stale ? " (stale)" : ""}`
        : "verified: never",
    ]
      .filter(Boolean)
      .join(" · ");
  const notes = (entry, indent) =>
    (entry.notes ?? "").split("\n").map((line) => `${indent}${line}`.trimEnd());

  for (const server of catalog.servers) {
    lines.push(`${server.name}  ${server.endpoint ?? "(no endpoint)"}`);
    lines.push(`  ${formatStatus(server, now)}`);
    lines.push(`  ${meta(server)}`);
    if (server.notes) lines.push(...notes(server, "  "));
    for (const account of server.accounts) {
      lines.push(`  - ${account.role}  ${account.email}`);
      lines.push(`      ${meta(account)}`);
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
