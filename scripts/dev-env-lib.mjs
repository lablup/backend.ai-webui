// Pure logic behind `pnpm run dev-env`: normalizing the team PR board's catalog of
// dev servers and test accounts, and writing a pick into the env files and
// config.toml.
//
// It lives outside dev-env.mjs so it can be unit tested without the board.
import TOML from "@iarna/toml";

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

// ---- manager lines ----------------------------------------------------------

/** A manager line: the first two numeric components of a version (`26.9.0rc1` → `26.9`). */
const LINE = /^\d+\.\d+$/;

/** `"main"` (backend.ai's main branch) or a line; what a server `tracks` and what a floor may be. */
const TRACK = /^(main|\d+\.\d+)$/;

/** What a server's probe says about its version against what it tracks. */
export const FRESHNESS = ["current", "behind", "unknown"];

/**
 * The line of a version string, or null when it does not start with
 * `<digits>.<digits>`: `26.4.13` → `26.4`, `26.9.0rc1` → `26.9`, `x.y.z` → null.
 */
export function versionLine(version) {
  const m = /^\s*v?(\d+)\.(\d+)(?!\d)/.exec(version ?? "");
  return m ? `${Number(m[1])}.${Number(m[2])}` : null;
}

/**
 * Numeric compare of two lines (`26.4` < `26.10`); `"main"` sorts after every
 * numbered line. The contract compares lines by their two components only, so
 * this is deliberately not PEP 440: `packages/backend.ai-client/src/pep440.ts`
 * is TypeScript this script does not load, and a line has no pre-release or
 * patch to order.
 */
export function compareLines(a, b) {
  if (a === b) return 0;
  if (a === "main") return 1;
  if (b === "main") return -1;
  const [aMajor, aMinor] = a.split(".").map(Number);
  const [bMajor, bMinor] = b.split(".").map(Number);
  return aMajor - bMajor || aMinor - bMinor;
}

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
  if (raw.freshness != null && !FRESHNESS.includes(raw.freshness)) {
    warnings.push(
      `${label}: "status.freshness" ${JSON.stringify(raw.freshness)} is not one of ${FRESHNESS.join(", ")}, ignored`,
    );
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
    // An old board (no `tracks`) sends neither: null, not "unknown".
    expectedVersion: stringOrNull(raw.expected_version),
    freshness: FRESHNESS.includes(raw.freshness) ? raw.freshness : null,
  };
}

/** `tracks`: `"main"`, a line, or null; anything else is dropped with a warning. */
function parseTracks(raw, label, warnings) {
  if (raw == null) return null;
  if (typeof raw === "string" && TRACK.test(raw.trim())) return raw.trim();
  warnings.push(
    `${label}: "tracks" ${JSON.stringify(raw)} is not "main" or a line like "26.9", ignored`,
  );
  return null;
}

/** The board's probe of backend.ai on GitHub: main's VERSION and the newest release per line. */
function parseUpstream(raw, warnings) {
  if (raw == null) return null;
  if (!isObject(raw)) {
    warnings.push('"upstream" is not an object, ignored');
    return null;
  }
  const lines = {};
  if (raw.lines != null && !isObject(raw.lines)) {
    warnings.push('"upstream.lines" is not an object, ignored');
  } else if (isObject(raw.lines)) {
    for (const [line, version] of Object.entries(raw.lines)) {
      if (LINE.test(line) && typeof version === "string" && version !== "") {
        lines[line] = version;
      } else {
        warnings.push(`"upstream.lines" entry ${JSON.stringify(line)} is malformed, ignored`);
      }
    }
  }
  return {
    checkedAt: stringOrNull(raw.checked_at),
    mainVersion: stringOrNull(raw.main_version),
    lines,
    error: stringOrNull(raw.error),
  };
}

const names = (list) =>
  list.filter((name) => typeof name === "string" && name !== "");

/**
 * The board's computed `resolved` block on a policy branch: the range of
 * manager lines the branch must work on, each with its latest patch and the
 * live servers on it. Null when absent or malformed (one warning), so
 * `compatReport` computes the same block itself.
 */
function parseResolved(raw, label, warnings) {
  if (raw == null) return null;
  const malformed = (what) => {
    warnings.push(`${label}: "resolved" ${what}, computed here instead`);
    return null;
  };
  if (!isObject(raw)) return malformed("is not an object");
  if (typeof raw.upper !== "string" || !TRACK.test(raw.upper)) {
    return malformed('has no "upper"');
  }
  if (!Array.isArray(raw.lines) || !Array.isArray(raw.below_floor_servers)) {
    return malformed('has no "lines" or "below_floor_servers" list');
  }
  const lines = [];
  for (const entry of raw.lines) {
    if (!isObject(entry) || typeof entry.line !== "string" || !TRACK.test(entry.line) || !Array.isArray(entry.servers)) {
      return malformed('has a malformed "lines" entry');
    }
    lines.push({
      line: entry.line,
      latest: stringOrNull(entry.latest),
      servers: names(entry.servers),
    });
  }
  return {
    upper: raw.upper,
    floorVersion: stringOrNull(raw.floor_version),
    upperVersion: stringOrNull(raw.upper_version),
    lines,
    belowFloorServers: names(raw.below_floor_servers),
  };
}

/**
 * `policy.webui.branches`: the manager floor per webui branch. `null` when
 * the document has no policy (a board older than the contract). A branch
 * without a valid `min_manager_line` is skipped with a warning; a stored
 * `target` (the retired first contract) is ignored.
 */
function parsePolicy(raw, warnings) {
  if (raw == null) return null;
  if (!isObject(raw)) {
    warnings.push('"policy" is not an object, ignored');
    return null;
  }
  const branches = {};
  const rawBranches = raw.webui?.branches;
  if (rawBranches != null && !isObject(rawBranches)) {
    warnings.push('"policy.webui.branches" is not an object, ignored');
  }
  for (const [name, entry] of Object.entries(isObject(rawBranches) ? rawBranches : {})) {
    const label = `policy branch "${name}"`;
    if (!TRACK.test(name)) {
      // resolveCompatBranch can never select such a key, so listing it would mislead.
      warnings.push(`${label}: not "main" or a release branch like "26.9", skipped`);
      continue;
    }
    if (!isObject(entry)) {
      warnings.push(`${label}: not an object, skipped`);
      continue;
    }
    const minManagerLine =
      typeof entry.min_manager_line === "string" ? entry.min_manager_line.trim() : "";
    if (!TRACK.test(minManagerLine)) {
      warnings.push(
        `${label}: "min_manager_line" ${JSON.stringify(entry.min_manager_line)} is not "main" or a line like "26.4", skipped`,
      );
      continue;
    }
    branches[name] = {
      minManagerLine,
      notes: typeof entry.notes === "string" && entry.notes.trim() !== "" ? entry.notes.trim() : null,
      resolved: parseResolved(entry.resolved, label, warnings),
    };
  }
  return {
    updatedAt: stringOrNull(raw.updated_at),
    webui: { branches },
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

/** `tracks main (current)` / `tracks 26.9 (behind: expected 26.9.4)`, or null for a server that tracks nothing. */
export function formatTracks(server) {
  if (!server.tracks) return null;
  const { freshness, expectedVersion } = server.status ?? {};
  const state =
    freshness === "behind"
      ? `behind: expected ${expectedVersion ?? "unknown"}`
      : (freshness ?? "freshness unknown");
  return `tracks ${server.tracks} (${state})`;
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
        formatTracks(server),
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
      tracks: parseTracks(raw.tracks, label, warnings),
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
    upstream: parseUpstream(body.upstream, warnings),
    policy: parsePolicy(body.policy, warnings),
    warnings,
  };
}

// ---- manager compatibility policy -----------------------------------------

/** The policy branch a git branch reads: a release branch (`26.9`) is itself, anything else is `main`. */
export function resolveCompatBranch(gitBranch) {
  const name = (gitBranch ?? "").trim();
  return LINE.test(name) ? name : "main";
}

/** The upper bound of a branch's range: webui `main` → manager `main`, webui `X.Y` → manager line `X.Y`. */
export function upperLineOf(branchName) {
  return branchName === "main" ? "main" : branchName;
}

/** The newest version upstream knows for a line, or null; `"main"` is backend.ai main's VERSION. */
function latestOf(upstream, line) {
  if (!upstream) return null;
  return line === "main" ? upstream.mainVersion : (upstream.lines[line] ?? null);
}

/**
 * The board's `resolved` block computed from the servers and `upstream` here,
 * for a board that sent none. Numbered lines come from `upstream.lines` (plus
 * the floor and the upper bound themselves, and the lines live servers run
 * when there is no upstream); `main` closes the range of webui main.
 */
function resolveLocally(catalog, branchName, floor) {
  const upper = upperLineOf(branchName);
  const live = catalog.servers.filter((server) => server.status?.live === true);
  const lineOf = (server) => versionLine(server.status.managerVersion);
  const onMain = (server) => server.tracks === "main";
  const inRange = (line) =>
    compareLines(line, floor) >= 0 && compareLines(line, upper) <= 0;

  const candidates = new Set();
  if (floor !== "main") {
    candidates.add(floor);
    if (upper !== "main") candidates.add(upper);
    const known = catalog.upstream
      ? Object.keys(catalog.upstream.lines)
      : live.filter((server) => !onMain(server)).map(lineOf).filter((line) => line !== null);
    for (const line of known) candidates.add(line);
  }
  const lines = [...candidates]
    .filter(inRange)
    .sort(compareLines)
    .map((line) => ({
      line,
      latest: latestOf(catalog.upstream, line),
      servers: live.filter((server) => !onMain(server) && lineOf(server) === line).map((s) => s.name),
    }));
  if (upper === "main") {
    lines.push({
      line: "main",
      latest: latestOf(catalog.upstream, "main"),
      servers: live.filter(onMain).map((server) => server.name),
    });
  }
  // Below "main" means below the line main's VERSION names, for servers not built from main.
  const floorLine = floor === "main" ? versionLine(latestOf(catalog.upstream, "main")) : floor;
  const belowFloorServers =
    floorLine === null
      ? []
      : live
          .filter((server) => {
            const line = lineOf(server);
            return !onMain(server) && line !== null && compareLines(line, floorLine) < 0;
          })
          .map((server) => server.name);
  return {
    upper,
    floorVersion: latestOf(catalog.upstream, floor),
    upperVersion: latestOf(catalog.upstream, upper),
    lines,
    belowFloorServers,
  };
}

/**
 * What `compat` reports for a policy branch: `{ maintained: false }` when the
 * policy has no entry for it, else the floor and the resolved range — the
 * lines from the floor to the branch's own line, each with its latest patch
 * and live servers — as the board resolved it or, failing that, computed here.
 * `gateFloorLine` is the line gates are compared against: the floor, or for a
 * floor of `main` the line of main's VERSION (null when upstream is unknown).
 */
export function compatReport(catalog, branchName) {
  const branch = catalog.policy?.webui.branches[branchName];
  if (!branch) {
    return {
      branch: branchName,
      maintained: false,
      maintainedBranches: Object.keys(catalog.policy?.webui.branches ?? {}),
    };
  }
  const floor = branch.minManagerLine;
  const resolved = branch.resolved ?? resolveLocally(catalog, branchName, floor);
  const mainVersion = resolved.lines.find((entry) => entry.line === "main")?.latest ?? latestOf(catalog.upstream, "main");
  return {
    branch: branchName,
    maintained: true,
    floor,
    notes: branch.notes,
    ...resolved,
    gateFloorLine: floor === "main" ? versionLine(mainVersion) : floor,
  };
}

/** Where `compat` looks for version gates; `__generated__`, tests, stories and `.doc.*` catalogs are skipped. */
export const GATE_SCAN_DIRS = [
  "react/src",
  "packages/backend.ai-ui/src",
  "packages/backend.ai-client/src",
];

export const GATE_SCAN_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs"];

export function isGateScanFile(relativePath) {
  const name = relativePath.split("/").pop();
  return (
    GATE_SCAN_EXTENSIONS.some((ext) => name.endsWith(ext)) &&
    !relativePath.split("/").includes("__generated__") &&
    // `.doc.ts` is a component's Astryx catalog entry: prose and examples, not a gate.
    !/\.(test|spec|stories|doc)\./.test(name)
  );
}

const GATE_PATTERNS = [
  // isManagerVersionCompatibleWith('26.9.0') and the backport array form.
  {
    kind: "isManagerVersionCompatibleWith",
    regex: /isManagerVersionCompatibleWith\(\s*(?:(['"])([^'"]*)\1|\[([^\]]*)\])/g,
    versions: (m) => (m[3] !== undefined ? quoted(m[3]) : [m[2]]),
  },
  {
    kind: "@since",
    regex: /@since\(\s*version:\s*"([^"]*)"/g,
    versions: (m) => [m[1]],
  },
  {
    kind: "@deprecatedSince",
    regex: /@deprecatedSince\(\s*version:\s*"([^"]*)"/g,
    versions: (m) => [m[1]],
  },
  {
    kind: "@sinceMultiple",
    regex: /@sinceMultiple\(\s*versions:\s*\[([^\]]*)\]/g,
    versions: (m) => quoted(m[1]),
  },
  {
    kind: "@deprecatedSinceMultiple",
    regex: /@deprecatedSinceMultiple\(\s*versions:\s*\[([^\]]*)\]/g,
    versions: (m) => quoted(m[1]),
  },
];

function quoted(list) {
  return [...list.matchAll(/(['"])([^'"]*)\1/g)].map((m) => m[2]);
}

/**
 * Every version gate in `source`, with its 1-based line: `{ line, kind,
 * versions, lines }`. `lines` drops a version that is not `<digits>.<digits>…`
 * (a test's `x.y.z`), so a gate whose versions are all such is reported with
 * no lines and never counts as deletable.
 */
export function findVersionGates(source) {
  const gates = [];
  for (const { kind, regex, versions } of GATE_PATTERNS) {
    for (const m of source.matchAll(regex)) {
      const found = versions(m);
      gates.push({
        line: source.slice(0, m.index).split("\n").length,
        kind,
        versions: found,
        lines: found.map(versionLine).filter((line) => line !== null),
      });
    }
  }
  return gates.sort((a, b) => a.line - b.line);
}

/**
 * ADR 0010's deletion rule: a gate is at or below the floor when every one
 * of its lines is; a backport array with one newer entry stays.
 */
export function isGateAtOrBelowFloor(gate, floorLine) {
  return (
    gate.lines.length > 0 &&
    gate.lines.every((line) => compareLines(line, floorLine) <= 0)
  );
}

/** Human-readable `compat` output; `gates` is `[{ file, line, kind, versions }]` already filtered to the floor. */
export function formatCompatReport(report, gates, { gitBranch } = {}) {
  const detected =
    gitBranch && gitBranch !== report.branch
      ? ` (git branch ${gitBranch})`
      : "";
  const lines = [`branch: ${report.branch}${detected}`];
  if (!report.maintained) {
    lines.push(
      `policy: not maintained — the catalog policy has no entry for "${report.branch}"` +
        (report.maintainedBranches.length > 0
          ? `; maintained: ${report.maintainedBranches.join(", ")}`
          : "; it has no branches at all"),
    );
    return lines.join("\n");
  }
  const describe = (line, version) =>
    line === "main"
      ? `main (backend.ai main branch${version ? `, ${version}` : ""})`
      : `${line} line${version ? ` (latest patch ${version})` : ""}`;
  lines.push(`floor: ${describe(report.floor, report.floorVersion)}`);
  lines.push(
    `range: ${report.floor} … ${report.upper}` +
      (report.upper !== report.floor && report.upperVersion ? ` (${report.upperVersion})` : "") +
      ", every line at its latest patch",
  );
  const width = Math.max(...report.lines.map((entry) => `${entry.line} (${entry.latest ?? "?"})`.length), 0);
  for (const entry of report.lines) {
    const label = `${entry.line} (${entry.latest ?? "?"})`.padEnd(width);
    lines.push(`  ${label}  ${entry.servers.length > 0 ? entry.servers.join(", ") : "— no server"}`);
  }
  if (report.belowFloorServers.length > 0) {
    lines.push(`below the floor: ${report.belowFloorServers.join(", ")}`);
  }
  if (report.notes) lines.push(`notes: ${report.notes}`);
  const gaps = report.lines.filter((entry) => entry.servers.length === 0).map((entry) => entry.line);
  if (gaps.length > 0) {
    lines.push(`warning: no live server on ${gaps.join(", ")} — coverage gap`);
  }
  lines.push("");
  if (report.gateFloorLine === null) {
    lines.push("gates at or below the floor: unknown — the floor is main and upstream has no main version");
  } else {
    const at = `the ${report.gateFloorLine} line` + (report.floor === "main" ? " (main's VERSION)" : "");
    if (gates.length === 0) {
      lines.push(`gates at or below ${at}: none`);
    } else {
      lines.push(`gates at or below ${at} (${gates.length}; deletable per ADR 0010):`);
      for (const gate of gates) {
        lines.push(`  ${gate.file}:${gate.line}  ${gate.kind}(${gate.versions.join(", ")})`);
      }
    }
  }
  return lines.join("\n");
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

/** Stems e2e/utils/test-util.ts reads with a hard-coded fallback (the sample's default accounts). */
const E2E_STEMS_WITH_DEFAULTS = new Set(["E2E_ADMIN", "E2E_USER", "E2E_USER2"]);

/**
 * The warning `use` prints for E2E slots it left without an email or a
 * password, given the vars it wrote; null when every slot is complete.
 */
export function e2eFallbackWarning(server, vars) {
  const empty = E2E_SLOTS.map(({ stem }) => stem).filter(
    (stem) => vars[`${stem}_EMAIL`] === null,
  );
  const noPassword = E2E_SLOTS.map(({ stem }) => stem).filter(
    (stem) =>
      vars[`${stem}_EMAIL`] !== null && vars[`${stem}_PASSWORD`] === null,
  );
  if (empty.length === 0 && noPassword.length === 0) return null;
  const parts = [
    empty.length ? `no account for ${empty.join(", ")}` : null,
    noPassword.length ? `no password for ${noPassword.join(", ")}` : null,
  ].filter(Boolean);
  const fallsBack = [...empty, ...noPassword].filter((stem) =>
    E2E_STEMS_WITH_DEFAULTS.has(stem),
  );
  const notRead = [...empty, ...noPassword].filter(
    (stem) => !E2E_STEMS_WITH_DEFAULTS.has(stem),
  );
  return [
    `warning: ${server.name} has ${parts.join(" and ")}.`,
    fallsBack.length
      ? `e2e will fall back to the sample default credentials for ${fallsBack.join(", ")}.`
      : null,
    notRead.length ? `(${notRead.join(", ")} is not read by e2e yet.)` : null,
  ]
    .filter(Boolean)
    .join(" ");
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

// ---- config.toml -----------------------------------------------------------

/** First line of a config.toml `use` wrote; a file without it is hand-written and kept. */
export const CONFIG_GENERATED_MARKER =
  "# Written by `pnpm run dev-env use`";

/**
 * Probed keys `use` never copies: the login endpoint comes from
 * `.env.development.local` (a baked `apiEndpoint` disables API sign-in), and
 * `plugin.*` names bundle files the deployment has and a worktree does not.
 */
export const CONFIG_COPY_SKIP = ["general.apiEndpoint", "general.apiEndpointText", "plugin"];

const TOML_KEY = "[A-Za-z0-9_-]+";
const PLACEHOLDER = /^"\[.*\]"$/;

/** `--set key=value` → `{key, value}`; the value is a TOML literal, else a string. */
export function parseConfigSet(arg) {
  const m = /^([A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+)=(.*)$/s.exec(arg ?? "");
  if (!m) {
    throw new Error(
      `--set takes "<section>.<key>=<value>", got "${arg}" (e.g. resources.openPortToPublic=true)`,
    );
  }
  const [, key, raw] = m;
  let value = raw.trim();
  try {
    value = TOML.parse(`v = ${value}`).v;
  } catch {
    // Not a TOML literal (a bare word, an URL): a string.
  }
  return { key, value };
}

/** Split the text after `key =` into the value and its trailing comment. */
function splitTomlValue(rest) {
  let i = 0;
  const text = rest;
  const skipString = (quote) => {
    i += 1;
    while (i < text.length && text[i] !== quote) {
      if (text[i] === "\\" && quote === '"') i += 1;
      i += 1;
    }
    i += 1;
  };
  while (i < text.length && text[i] === " ") i += 1;
  const start = i;
  if (text[i] === '"' || text[i] === "'") {
    skipString(text[i]);
  } else if (text[i] === "[") {
    let depth = 0;
    while (i < text.length) {
      if (text[i] === '"' || text[i] === "'") {
        skipString(text[i]);
        continue;
      }
      if (text[i] === "[") depth += 1;
      if (text[i] === "]") depth -= 1;
      i += 1;
      if (depth === 0) break;
    }
  } else {
    while (i < text.length && text[i] !== "#") i += 1;
  }
  const value = text.slice(start, i).trim();
  const comment = text.slice(i).trim();
  return { value, comment: comment.startsWith("#") ? comment : "" };
}

/** A TOML `key = value` line, keeping an inline comment where there was one. */
function tomlLine(key, value, comment) {
  const line = `${key} = ${TOML.stringify.value(value)}`;
  return comment ? `${line}  ${comment}` : line;
}

/**
 * Set one dotted key in TOML text, leaving every other line as written. The
 * key's own line is rewritten (a commented-out `#key = …` is uncommented);
 * otherwise it is appended to its section, which is created when missing.
 */
export function setTomlValue(text, dotted, value) {
  const at = dotted.lastIndexOf(".");
  if (at <= 0) throw new Error(`"${dotted}" is not a <section>.<key>`);
  const section = dotted.slice(0, at);
  const key = dotted.slice(at + 1);
  const lines = text.split("\n");
  const header = /^\s*\[([^\]]+)\]/;
  const active = new RegExp(`^\\s*(${TOML_KEY})\\s*=(.*)$`);
  const commented = new RegExp(`^\\s*#\\s*(${TOML_KEY})\\s*=(.*)$`);
  let start = -1;
  let end = lines.length;
  for (let i = 0; i < lines.length; i += 1) {
    const h = header.exec(lines[i]);
    if (!h) continue;
    if (start >= 0) {
      end = i;
      break;
    }
    if (h[1].trim() === section) start = i;
  }
  if (start < 0) {
    while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
    if (lines.length > 0) lines.push("");
    lines.push(`[${section}]`, tomlLine(key, value, ""), "");
    return lines.join("\n");
  }
  let fallback = -1;
  for (let i = start + 1; i < end; i += 1) {
    const a = active.exec(lines[i]);
    if (a && a[1] === key) {
      lines[i] = tomlLine(key, value, splitTomlValue(a[2]).comment);
      return lines.join("\n");
    }
    const c = commented.exec(lines[i]);
    if (c && c[1] === key && fallback < 0) fallback = i;
  }
  if (fallback >= 0) {
    lines[fallback] = tomlLine(key, value, splitTomlValue(commented.exec(lines[fallback])[2]).comment);
    return lines.join("\n");
  }
  let insert = end;
  while (insert > start + 1 && lines[insert - 1].trim() === "") insert -= 1;
  lines.splice(insert, 0, tomlLine(key, value, ""));
  return lines.join("\n");
}

/** Comment out the sample's `key = "[description]"` placeholder lines. */
export function disablePlaceholders(text) {
  const active = new RegExp(`^(\\s*)(${TOML_KEY}\\s*=)(.*)$`);
  return text
    .split("\n")
    .map((line) => {
      const m = active.exec(line);
      return m && PLACEHOLDER.test(splitTomlValue(m[3]).value) ? `${m[1]}#${m[2]}${m[3]}` : line;
    })
    .join("\n");
}

const skipped = (key) =>
  CONFIG_COPY_SKIP.some((s) => key === s || key.startsWith(`${s}.`));

/** `CONFIG_GENERATED_MARKER` on the first line. */
export function isGeneratedConfig(text) {
  return typeof text === "string" && text.startsWith(CONFIG_GENERATED_MARKER);
}

/**
 * config.toml for a worktree: the sample with its placeholders disabled, the
 * server's probed switches (minus CONFIG_COPY_SKIP) on top, then `overrides`
 * (`[{key, value}]`), under a header that says where each layer came from.
 */
export function renderConfigToml({ sample, server = null, overrides = [] }) {
  let text = disablePlaceholders(sample);
  const config = server?.status?.config ?? null;
  const copied = config ? allSettings(config).filter(({ key }) => !skipped(key)) : [];
  for (const { key, value } of copied) text = setTomlValue(text, key, value);
  for (const { key, value } of overrides) text = setTomlValue(text, key, value);
  const source = !server
    ? "switches: sample defaults (no server)"
    : config
      ? `switches: ${server.name} (probed ${server.status.configFetchedAt ?? "unknown"})`
      : `switches: sample defaults (${server.name} serves no config.toml)`;
  const head = [
    `${CONFIG_GENERATED_MARKER} — re-run it to refresh; delete this line to keep the file by hand.`,
    `# base: config.toml.sample · ${source}` +
      (overrides.length > 0
        ? ` · overrides: ${overrides.map(({ key, value }) => `${key} = ${TOML.stringify.value(value)}`).join(", ")}`
        : ""),
    "",
    "",
  ];
  return head.join("\n") + text.replace(/^\n+/, "");
}
