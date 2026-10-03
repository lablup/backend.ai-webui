// Pure logic behind `pnpm run dev-env`: turning Bitwarden items into a catalog
// of dev servers and test accounts, and writing a pick into the env files.
//
// It lives outside dev-env.mjs so it can be unit tested without the gateway.

/** Items are named `webui-dev/<server>` (the server) or `webui-dev/<server>/<role>` (an account). */
export const ITEM_PREFIX = "webui-dev/";

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

const BW_TYPE_LOGIN = 1;

/** Only an exact `share: public` opens an account's password to the public view; anything else is team. */
function shareTier(item) {
  return fieldValue(item, "share") === "public" ? "public" : "team";
}

function fieldValue(item, name) {
  const field = (item.fields ?? []).find(
    (f) => (f.name ?? "").trim().toLowerCase() === name,
  );
  const value = field?.value?.trim();
  return value ? value : null;
}

function parseTags(raw) {
  if (!raw) return [];
  return raw
    .split(/[,\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function isStale(verifiedAt, now) {
  if (!verifiedAt) return true;
  const verified = Date.parse(verifiedAt);
  if (Number.isNaN(verified)) return true;
  return now.getTime() - verified > STALE_AFTER_DAYS * 24 * 60 * 60 * 1000;
}

function normalizeEndpoint(raw) {
  return raw ? raw.trim().replace(/\/+$/, "") : null;
}

function describe(item, now) {
  const verifiedAt = fieldValue(item, "verified_at");
  return {
    tags: parseTags(fieldValue(item, "tags")),
    notes: item.notes?.trim() || null,
    verifiedAt,
    stale: isStale(verifiedAt, now),
  };
}

/**
 * Build the catalog from `bw list items` output. Items outside the naming
 * convention are ignored, so the collection may hold unrelated entries.
 * An account whose server has no item of its own still gets a server entry —
 * its endpoint then comes from the login's first URI.
 */
export function parseCatalog(items, now = new Date()) {
  const servers = new Map();
  const warnings = [];
  const serverOf = (name) => {
    if (!servers.has(name)) {
      servers.set(name, {
        name,
        endpoint: null,
        tags: [],
        notes: null,
        verifiedAt: null,
        stale: true,
        accounts: [],
      });
    }
    return servers.get(name);
  };

  for (const item of items ?? []) {
    const name = (item.name ?? "").trim();
    if (!name.startsWith(ITEM_PREFIX)) continue;
    const parts = name.slice(ITEM_PREFIX.length).split("/");
    if (parts.some((part) => part === "") || parts.length > 2) {
      warnings.push(`"${name}": expected webui-dev/<server>[/<role>]`);
      continue;
    }
    const [serverName, role] = parts;
    const server = serverOf(serverName);

    if (role === undefined) {
      Object.assign(server, describe(item, now), {
        endpoint:
          normalizeEndpoint(fieldValue(item, "endpoint")) ??
          normalizeEndpoint(item.login?.uris?.[0]?.uri) ??
          server.endpoint,
      });
      continue;
    }

    if (item.type !== BW_TYPE_LOGIN || !item.login?.username) {
      warnings.push(
        `"${name}": an account must be a Login item with a username`,
      );
      continue;
    }
    if (server.accounts.some((account) => account.role === role)) {
      warnings.push(`"${name}": duplicate role, keeping the first`);
      continue;
    }
    // The gateway's public view nulls a team-tier password and marks the item `password_in`.
    const passwordAvailable =
      !item.password_in &&
      typeof item.login.password === "string" &&
      item.login.password !== "";
    server.accounts.push({
      role,
      email: item.login.username,
      password: passwordAvailable ? item.login.password : null,
      share: shareTier(item),
      passwordAvailable,
      ...describe(item, now),
    });
    server.endpoint ??= normalizeEndpoint(item.login.uris?.[0]?.uri);
  }

  const sorted = [...servers.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  for (const server of sorted) {
    server.accounts.sort((a, b) => a.role.localeCompare(b.role));
    if (!server.endpoint) {
      warnings.push(`"${ITEM_PREFIX}${server.name}": no endpoint`);
    }
  }
  return { servers: sorted, warnings };
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
export function formatCatalog(catalog) {
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
    lines.push(`  ${meta(server)}`);
    if (server.notes) lines.push(...notes(server, "  "));
    for (const account of server.accounts) {
      lines.push(`  - ${account.role} [${account.share}]  ${account.email}`);
      lines.push(`      ${meta(account)}`);
      if (!account.passwordAvailable) {
        lines.push(
          "      password: in Bitwarden (enroll for the full catalog)",
        );
      }
      if (account.notes) lines.push(...notes(account, "      "));
    }
    lines.push("");
  }
  if (catalog.servers.length === 0) {
    lines.push(`No "${ITEM_PREFIX}…" items in the vault.`, "");
  }
  for (const warning of catalog.warnings) lines.push(`warning: ${warning}`);
  return lines.join("\n").trimEnd();
}
