// @ts-nocheck
import {
  CONFIG_GENERATED_MARKER,
  GATE_SCAN_DIRS,
  MANAGER_CONFIG_KEYS,
  ambiguityNote,
  allSettings,
  compareLines,
  compatReport,
  disablePlaceholders,
  findVersionGates,
  formatCompatReport,
  formatTracks,
  isGateAtOrBelowFloor,
  isGateScanFile,
  isGeneratedConfig,
  parseConfigSet,
  renderConfigToml,
  resolveCompatBranch,
  setTomlValue,
  upperLineOf,
  downWarning,
  e2eFallbackWarning,
  findAccount,
  findServer,
  formatCatalog,
  formatConfigLine,
  formatStatus,
  keptPasswordEmails,
  loginPrefillVars,
  managerSettings,
  parseCatalog,
  playwrightVars,
  quoteEnvValue,
  redactCatalog,
  selectAccount,
  serverHealth,
  upsertEnv,
  versionLine,
} from "./dev-env-lib.mjs";
import dotenv from "dotenv";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

const NOW = new Date("2026-10-02T00:00:00Z");

const account = (role, email, password, extra = {}) => ({
  role,
  email,
  password,
  tags: [],
  notes: "",
  ...extra,
});

// main's accounts in stored order: three users (the second without a
// password), an admin and a project admin without a password.
const BODY = {
  version: 1,
  updated_at: "2026-10-01T05:00:00Z",
  servers: [
    {
      name: "main",
      endpoint: "https://main.example.test:8090",
      tags: ["plugin:fair-share", "nightly"],
      notes: "Tracks manager main.\nReset every Monday.",
      accounts: [
        account("user", "user@example.test", "pw-user", {
          tags: ["multi-project"],
          notes: "Member of three projects.",
        }),
        account("admin", "admin@example.test", "pw-admin"),
        account("user", "user2@example.test", null),
        account("project-admin", "pa@example.test", null),
        account("user", "user3@example.test", "pw-user3"),
      ],
    },
    {
      name: "lts",
      endpoint: "http://lts.example.test",
      tags: [],
      notes: "",
      accounts: [account("user", "lts-user@example.test", "pw-lts")],
    },
  ],
};

describe("dev-env catalog", () => {
  const catalog = parseCatalog(BODY, NOW);
  const main = findServer(catalog, "main");

  it("sorts servers, keeps accounts in stored order and carries updated_at", () => {
    expect(catalog.servers.map((s) => s.name)).toEqual(["lts", "main"]);
    expect(main.accounts.map((a) => a.email)).toEqual([
      "user@example.test",
      "admin@example.test",
      "user2@example.test",
      "pa@example.test",
      "user3@example.test",
    ]);
    expect(catalog.updatedAt).toBe("2026-10-01T05:00:00Z");
    expect(catalog.warnings).toEqual([]);
  });

  it("maps the contract onto the catalog shape", () => {
    expect(main).toMatchObject({
      endpoint: "https://main.example.test:8090",
      tags: ["plugin:fair-share", "nightly"],
    });
    expect(main.notes).toContain("Reset every Monday.");
    expect(findAccount(main, "user")).toEqual({
      role: "user",
      email: "user@example.test",
      password: "pw-user",
      passwordAvailable: true,
      tags: ["multi-project"],
      notes: "Member of three projects.",
    });
    expect(findAccount(main, "admin").notes).toBeNull();
  });

  it("ignores a legacy verified_at on servers and accounts, without a warning", () => {
    const { servers, warnings } = parseCatalog(
      {
        version: 1,
        servers: [
          {
            name: "x",
            endpoint: "https://x.example.test",
            verified_at: "not a date",
            accounts: [
              account("user", "u@example.test", "pw", {
                verified_at: "2020-01-01",
              }),
            ],
          },
        ],
      },
      NOW,
    );
    for (const entry of [servers[0], servers[0].accounts[0]]) {
      expect(entry).not.toHaveProperty("verifiedAt");
      expect(entry).not.toHaveProperty("stale");
    }
    expect(warnings).toEqual([]);
  });

  it("treats a null or empty password as unavailable", () => {
    expect(findAccount(main, "pa@example.test")).toMatchObject({
      password: null,
      passwordAvailable: false,
    });
    const empty = parseCatalog(
      {
        version: 1,
        servers: [
          {
            name: "x",
            endpoint: "https://x.example.test",
            accounts: [account("user", "u@example.test", "")],
          },
        ],
      },
      NOW,
    ).servers[0];
    expect(findAccount(empty, "user")).toMatchObject({
      password: null,
      passwordAvailable: false,
    });
  });

  it("selects by role (first in stored order) or by email, naming the others", () => {
    expect(selectAccount(main, "user")).toEqual({
      account: findAccount(main, "user@example.test"),
      others: ["user2@example.test", "user3@example.test"],
    });
    expect(ambiguityNote(selectAccount(main, "user").others)).toBe(
      "also: user2@example.test, user3@example.test — pass the email to pick one",
    );
    const byEmail = selectAccount(main, "USER3@example.test");
    expect(byEmail.account.email).toBe("user3@example.test");
    expect(byEmail.others).toEqual([]);
    expect(selectAccount(main, "admin").others).toEqual([]);
    expect(ambiguityNote([])).toBeNull();
  });

  it("names roles and emails when a selection misses", () => {
    expect(() => findServer(catalog, "nope")).toThrow("Known: lts, main");
    expect(() => selectAccount(main, "monitor")).toThrow(
      'Server "main" has no account "monitor". Roles: user, admin, project-admin; ' +
        "emails: user@example.test, admin@example.test, user2@example.test, " +
        "pa@example.test, user3@example.test",
    );
  });

  it("keeps an unknown role with a warning and skips a duplicate email", () => {
    const { servers, warnings } = parseCatalog(
      {
        version: 1,
        servers: [
          {
            name: "a",
            endpoint: "https://a.example.test",
            accounts: [
              account("monitor", "m@example.test", "pw"),
              account("user", "u@example.test", "pw-first"),
              account("admin", " U@Example.test ", "pw-second"),
            ],
          },
        ],
      },
      NOW,
    );
    expect(servers[0].accounts.map((a) => [a.role, a.email])).toEqual([
      ["monitor", "m@example.test"],
      ["user", "u@example.test"],
    ]);
    expect(warnings).toEqual([
      '"a/m@example.test": unknown role "monitor" (expected user, project-admin, admin), kept',
      '"a/U@Example.test": duplicate email, keeping the first',
    ]);
  });

  it("skips and warns about entries that break the contract, never throwing", () => {
    const { servers, warnings } = parseCatalog(
      {
        version: 2,
        servers: [
          "nope",
          { name: "Bad Name", endpoint: "https://x.example.test" },
          {
            name: "a",
            endpoint: "ftp://a.example.test",
            tags: "not-a-list",
            accounts: [
              account("admin", "one@example.test", "pw", {
                verified_at: "yesterday",
              }),
              account("", "x@example.test", "pw"),
              { role: "user", email: "" },
              account("user", "m@example.test", 42),
              7,
            ],
          },
          { name: "a", endpoint: "https://dup.example.test" },
          { name: "b", endpoint: "https://b.example.test/", accounts: {} },
        ],
      },
      NOW,
    );
    expect(servers.map((s) => s.name)).toEqual(["a", "b"]);
    const [a, b] = servers;
    expect(a.endpoint).toBeNull();
    expect(a.tags).toEqual([]);
    expect(a.accounts.map((acc) => [acc.role, acc.email])).toEqual([
      ["admin", "one@example.test"],
      ["user", "m@example.test"],
    ]);
    expect(findAccount(a, "admin")).not.toHaveProperty("verifiedAt");
    expect(findAccount(a, "user").passwordAvailable).toBe(false);
    expect(b.endpoint).toBe("https://b.example.test");
    expect(b.accounts).toEqual([]);
    expect(warnings).toHaveLength(11);
    expect(warnings[0]).toContain("catalog version 2");
  });

  it("refuses a body with no servers list", () => {
    expect(() => parseCatalog({ version: 1 }, NOW)).toThrow('"servers" list');
    expect(() => parseCatalog([], NOW)).toThrow('"servers" list');
  });

  it("never leaks a password through the redacted catalog or its text form", () => {
    const redacted = redactCatalog(catalog);
    expect(JSON.stringify(redacted)).not.toContain("pw-");
    expect(redacted.servers[1].accounts[0]).not.toHaveProperty("password");
    expect(redacted.servers[1].accounts[0]).toHaveProperty(
      "passwordAvailable",
      true,
    );
    const text = formatCatalog(redacted);
    expect(text).toContain("main  https://main.example.test:8090");
    expect(text).toContain("  tags: plugin:fair-share nightly");
    expect(text).toContain("- user  user@example.test");
    expect(text).toContain("      tags: multi-project");
    expect(text).not.toContain("verified");
    expect(formatCatalog(catalog)).not.toContain("pw-");
  });

  it("marks an account without a password as typed at login", () => {
    const text = formatCatalog(redactCatalog(catalog));
    expect(text.match(/password: — \(typed at login\)/g)).toHaveLength(2);
    expect(text).toMatch(
      /- project-admin {2}pa@example\.test\n {6}password: — \(typed at login\)/,
    );
  });

  it("fills the E2E slots: first admin, first and second user, first project admin", () => {
    expect(playwrightVars(main)).toEqual({
      E2E_WEBSERVER_ENDPOINT: "https://main.example.test:8090",
      E2E_ADMIN_EMAIL: "admin@example.test",
      E2E_ADMIN_PASSWORD: "pw-admin",
      E2E_USER_EMAIL: "user@example.test",
      E2E_USER_PASSWORD: "pw-user",
      E2E_USER2_EMAIL: "user2@example.test",
      E2E_USER2_PASSWORD: null,
      E2E_PROJECT_ADMIN_EMAIL: "pa@example.test",
      E2E_PROJECT_ADMIN_PASSWORD: null,
    });
    expect(playwrightVars(findServer(catalog, "lts"))).toMatchObject({
      E2E_ADMIN_EMAIL: null,
      E2E_USER_EMAIL: "lts-user@example.test",
      E2E_USER2_EMAIL: null,
      E2E_PROJECT_ADMIN_EMAIL: null,
    });
  });

  it("names the E2E slots that fall back to defaults, or none", () => {
    expect(e2eFallbackWarning(main, playwrightVars(main))).toBe(
      "warning: main has no password for E2E_USER2, E2E_PROJECT_ADMIN. " +
        "e2e will fall back to the sample default credentials for E2E_USER2. " +
        "(E2E_PROJECT_ADMIN is not read by e2e yet.)",
    );
    const lts = findServer(catalog, "lts");
    expect(e2eFallbackWarning(lts, playwrightVars(lts))).toBe(
      "warning: lts has no account for E2E_ADMIN, E2E_USER2, E2E_PROJECT_ADMIN. " +
        "e2e will fall back to the sample default credentials for E2E_ADMIN, E2E_USER2. " +
        "(E2E_PROJECT_ADMIN is not read by e2e yet.)",
    );
    const complete = {
      E2E_ADMIN_EMAIL: "a",
      E2E_ADMIN_PASSWORD: "x",
      E2E_USER_EMAIL: "u",
      E2E_USER_PASSWORD: "x",
      E2E_USER2_EMAIL: "u2",
      E2E_PROJECT_ADMIN_EMAIL: "pa",
      E2E_PROJECT_ADMIN_PASSWORD: "x",
    };
    // E2E_USER2_PASSWORD omitted = a hand-written one is kept, so the slot is complete.
    expect(e2eFallbackWarning(main, complete)).toBeNull();
  });

  it("leaves E2E_MONITOR_* and E2E_DOMAIN_ADMIN_* lines untouched", () => {
    const before = [
      "E2E_MONITOR_EMAIL=monitor@example.test",
      "E2E_MONITOR_PASSWORD=hand-written",
      "E2E_DOMAIN_ADMIN_EMAIL=da@example.test",
      "E2E_DOMAIN_ADMIN_PASSWORD=hand-written",
      "",
    ].join("\n");
    const after = upsertEnv(before, playwrightVars(main));
    expect(after.startsWith(before)).toBe(true);
  });

  it("drops the password line from the login pre-fill on request", () => {
    const user = findAccount(main, "user");
    expect(loginPrefillVars(main, user).VITE_DEFAULT_PASSWORD).toBe("pw-user");
    expect(
      loginPrefillVars(main, user, { password: false }).VITE_DEFAULT_PASSWORD,
    ).toBeNull();
  });

  it("never writes an empty password key", () => {
    const pa = findAccount(main, "project-admin");
    expect(loginPrefillVars(main, pa).VITE_DEFAULT_PASSWORD).toBeNull();
    const written = upsertEnv(
      "E2E_PROJECT_ADMIN_PASSWORD=old\n",
      playwrightVars(main),
    );
    expect(written).not.toMatch(/PASSWORD=\s*$/m);
    expect(written).not.toContain("E2E_PROJECT_ADMIN_PASSWORD");
    expect(written).toContain("E2E_PROJECT_ADMIN_EMAIL=pa@example.test");
  });
});

describe("dev-env hand-written passwords", () => {
  const catalog = parseCatalog(BODY, NOW);
  const main = findServer(catalog, "main");
  const pa = findAccount(main, "project-admin");
  const user = findAccount(main, "user");

  it("keeps a password written for the same email", () => {
    const existing = {
      VITE_DEFAULT_EMAIL: "  PA@Example.test ",
      VITE_DEFAULT_PASSWORD: "hand-written",
    };
    const prefill = loginPrefillVars(main, pa, { existing });
    expect(prefill).not.toHaveProperty("VITE_DEFAULT_PASSWORD");
    expect(keptPasswordEmails(prefill)).toEqual(["pa@example.test"]);
    expect(
      upsertEnv(
        "VITE_DEFAULT_EMAIL=pa@example.test\nVITE_DEFAULT_PASSWORD=hand-written\n",
        prefill,
      ),
    ).toContain("VITE_DEFAULT_PASSWORD=hand-written");

    const vars = playwrightVars(main, {
      existing: {
        E2E_USER2_EMAIL: "user2@example.test",
        E2E_USER2_PASSWORD: "hand-written-2",
        E2E_PROJECT_ADMIN_EMAIL: "pa@example.test",
        E2E_PROJECT_ADMIN_PASSWORD: "hand-written-pa",
      },
    });
    expect(vars).not.toHaveProperty("E2E_USER2_PASSWORD");
    expect(vars).not.toHaveProperty("E2E_PROJECT_ADMIN_PASSWORD");
    expect(keptPasswordEmails(vars)).toEqual([
      "user2@example.test",
      "pa@example.test",
    ]);
  });

  it("removes a password written for a different email", () => {
    const existing = {
      VITE_DEFAULT_EMAIL: "someone-else@example.test",
      VITE_DEFAULT_PASSWORD: "theirs",
      E2E_PROJECT_ADMIN_EMAIL: "someone-else@example.test",
      E2E_PROJECT_ADMIN_PASSWORD: "theirs",
    };
    expect(
      loginPrefillVars(main, pa, { existing }).VITE_DEFAULT_PASSWORD,
    ).toBeNull();
    expect(
      playwrightVars(main, { existing }).E2E_PROJECT_ADMIN_PASSWORD,
    ).toBeNull();
  });

  it("removes the password key when there is no existing line", () => {
    const existing = { VITE_DEFAULT_EMAIL: "pa@example.test" };
    const prefill = loginPrefillVars(main, pa, { existing });
    expect(prefill.VITE_DEFAULT_PASSWORD).toBeNull();
    expect(keptPasswordEmails(prefill)).toEqual([]);
    expect(
      playwrightVars(main, {
        existing: { E2E_PROJECT_ADMIN_EMAIL: "pa@example.test" },
      }).E2E_PROJECT_ADMIN_PASSWORD,
    ).toBeNull();
  });

  it("lets a catalog password override the existing one", () => {
    const existing = {
      VITE_DEFAULT_EMAIL: "user@example.test",
      VITE_DEFAULT_PASSWORD: "old",
      E2E_USER_EMAIL: "user@example.test",
      E2E_USER_PASSWORD: "old",
    };
    expect(
      loginPrefillVars(main, user, { existing }).VITE_DEFAULT_PASSWORD,
    ).toBe("pw-user");
    expect(playwrightVars(main, { existing }).E2E_USER_PASSWORD).toBe(
      "pw-user",
    );
  });

  it("removes the password with --no-password even for the same email", () => {
    const existing = {
      VITE_DEFAULT_EMAIL: "pa@example.test",
      VITE_DEFAULT_PASSWORD: "hand-written",
    };
    expect(
      loginPrefillVars(main, pa, { existing, password: false })
        .VITE_DEFAULT_PASSWORD,
    ).toBeNull();
  });

  it("removes the password of a slot the server cannot fill", () => {
    const vars = playwrightVars(findServer(catalog, "lts"), {
      existing: {
        E2E_ADMIN_EMAIL: "admin@example.test",
        E2E_ADMIN_PASSWORD: "x",
      },
    });
    expect(vars.E2E_ADMIN_EMAIL).toBeNull();
    expect(vars.E2E_ADMIN_PASSWORD).toBeNull();
  });
});

const UP_CONFIG = {
  general: {
    connectionMode: "SESSION",
    enableModelFolders: true,
    signupSupport: false,
    maxCountForPreopenPorts: 10,
    apiEndpointText: "Main cluster",
  },
  plugin: { page: "a,b" },
  wsproxy: { proxyURL: "http://127.0.0.1:5050/" },
};

describe("dev-env manager settings", () => {
  const rows = (config) =>
    Object.fromEntries(
      managerSettings(config).map(({ key, value, present }) => [
        key,
        [value, present],
      ]),
    );

  it("reports each listed key as present or absent", () => {
    const result = rows(UP_CONFIG);
    expect(result["general.connectionMode"]).toEqual(["SESSION", true]);
    expect(result["general.signupSupport"]).toEqual([false, true]);
    expect(result["general.force2FA"]).toEqual([null, false]);
    expect(result["resources.openPortToPublic"]).toEqual([null, false]);
    expect(result).not.toHaveProperty("general.apiEndpointText");
    expect(result).not.toHaveProperty("wsproxy.proxyURL");
  });

  it("expands a present `section.*` and keeps an absent one as one row", () => {
    const result = rows(UP_CONFIG);
    expect(result["plugin.page"]).toEqual(["a,b", true]);
    expect(result).not.toHaveProperty("plugin.*");
    expect(result["pipeline.*"]).toEqual([null, false]);
  });

  it("keeps the list order and covers every key for a missing config", () => {
    const keys = managerSettings(null).map((row) => row.key);
    expect(keys).toEqual(MANAGER_CONFIG_KEYS);
    expect(managerSettings(null).every((row) => !row.present)).toBe(true);
  });

  it("flattens every leaf for --all", () => {
    expect(allSettings(UP_CONFIG).map((row) => row.key)).toEqual([
      "general.connectionMode",
      "general.enableModelFolders",
      "general.signupSupport",
      "general.maxCountForPreopenPorts",
      "general.apiEndpointText",
      "plugin.page",
      "wsproxy.proxyURL",
    ]);
    expect(allSettings(null)).toEqual([]);
  });
});

describe("dev-env server probe status", () => {
  const server = (name, status) => ({
    name,
    endpoint: `https://${name}.example.test`,
    status,
    accounts: [],
  });
  const BODY_WITH_STATUS = {
    version: 1,
    servers: [
      server("up", {
        live: true,
        checked_at: "2026-10-01T23:57:00Z",
        last_live_at: "2026-10-01T23:57:00Z",
        manager_version: "25.15.0",
        api_version: "v9.20250722",
        latency_ms: 42,
        error: null,
        config: UP_CONFIG,
        config_fetched_at: "2026-10-01T23:57:00Z",
        config_error: null,
        config_truncated: false,
      }),
      server("down", {
        live: false,
        checked_at: "2026-10-01T23:58:00Z",
        last_live_at: "2026-10-01T20:00:00Z",
        manager_version: "25.14.2",
        api_version: "v9.20250601",
        latency_ms: null,
        error: "connect ECONNREFUSED",
        config: null,
        config_fetched_at: null,
        config_error: "HTTP 404",
        config_truncated: false,
      }),
      server("fresh", null),
      server("old", {
        live: true,
        checked_at: "2026-10-01T20:00:00Z",
        manager_version: "25.15.0",
      }),
      server("weird", { live: "yes" }),
      { name: "absent", endpoint: "https://absent.example.test" },
    ],
  };
  const catalog = parseCatalog(BODY_WITH_STATUS, NOW);
  const byName = (name) => findServer(catalog, name);

  it("normalizes the probe result to camelCase", () => {
    expect(byName("up").status).toEqual({
      live: true,
      checkedAt: "2026-10-01T23:57:00Z",
      lastLiveAt: "2026-10-01T23:57:00Z",
      managerVersion: "25.15.0",
      apiVersion: "v9.20250722",
      latencyMs: 42,
      error: null,
      config: UP_CONFIG,
      configFetchedAt: "2026-10-01T23:57:00Z",
      configError: null,
      configTruncated: false,
      expectedVersion: null,
      freshness: null,
    });
    expect(byName("up").tracks).toBeNull();
    expect(byName("down").status).toMatchObject({
      live: false,
      managerVersion: "25.14.2",
      error: "connect ECONNREFUSED",
    });
  });

  it("treats a missing, null or malformed status as unknown, warning once for malformed", () => {
    expect(byName("fresh").status).toBeNull();
    expect(byName("absent").status).toBeNull();
    expect(byName("weird").status).toBeNull();
    expect(catalog.warnings).toEqual([
      'server "weird": "status" is malformed, treated as unknown',
    ]);
  });

  it("classifies health, with an old probe counted as unknown", () => {
    expect(
      Object.fromEntries(
        catalog.servers.map((s) => [s.name, serverHealth(s, NOW)]),
      ),
    ).toEqual({
      absent: "unknown",
      down: "down",
      fresh: "unknown",
      old: "unknown",
      up: "live",
      weird: "unknown",
    });
  });

  it("shows live, down and unchecked servers in the list text", () => {
    const text = formatCatalog(redactCatalog(catalog), NOW);
    expect(text).toContain(
      "up  https://up.example.test\n  live · manager 25.15.0 · checked 3m ago",
    );
    expect(text).toContain(
      "  DOWN since 2026-10-01T20:00:00Z (was 25.14.2): connect ECONNREFUSED",
    );
    expect(text).toContain(
      "fresh  https://fresh.example.test\n  not checked yet",
    );
    expect(text).toContain(
      "  live · manager 25.15.0 · checked 4h ago (probe stale)",
    );
    expect(formatStatus(byName("absent"), NOW)).toBe("not checked yet");
  });

  it("keeps the status in the redacted JSON", () => {
    const json = JSON.parse(JSON.stringify(redactCatalog(catalog)));
    expect(json.servers.find((s) => s.name === "down").status).toMatchObject({
      live: false,
      lastLiveAt: "2026-10-01T20:00:00Z",
      managerVersion: "25.14.2",
    });
  });

  it("prints one compact config line per server", () => {
    expect(formatConfigLine(byName("up"))).toBe(
      "config: SESSION -signupSupport +enableModelFolders maxCountForPreopenPorts=10 plugin.page=a,b",
    );
    expect(formatConfigLine(byName("down"))).toBe("config: none (HTTP 404)");
    expect(formatConfigLine(byName("fresh"))).toBe(
      "config: none (not checked yet)",
    );
    expect(formatConfigLine(byName("old"))).toBe("config: none (not served)");
    const text = formatCatalog(redactCatalog(catalog), NOW);
    expect(text).toContain(
      "  live · manager 25.15.0 · checked 3m ago\n  config: SESSION",
    );
  });

  it("marks a kept config whose last fetch failed, or a truncated one", () => {
    const status = {
      ...byName("up").status,
      configError: "timeout",
      configTruncated: true,
    };
    expect(formatConfigLine({ status })).toMatch(
      / \(truncated\) \(last fetch failed: timeout\)$/,
    );
  });

  it("ignores a malformed config with a warning", () => {
    const { servers, warnings } = parseCatalog(
      {
        version: 1,
        servers: [
          server("x", {
            live: true,
            config: "general.x = 1",
            config_truncated: "no",
          }),
        ],
      },
      NOW,
    );
    expect(servers[0].status).toMatchObject({
      live: true,
      config: null,
      configTruncated: false,
    });
    expect(warnings).toEqual([
      'server "x": "status.config" is not an object, ignored',
    ]);
  });

  it("warns about a down server only", () => {
    expect(downWarning(byName("down"))).toBe(
      "warning: down was down at the last probe (2026-10-01T23:58:00Z): " +
        "connect ECONNREFUSED; last live 2026-10-01T20:00:00Z.",
    );
    expect(downWarning(byName("up"))).toBeNull();
    expect(downWarning(byName("fresh"))).toBeNull();
  });
});

describe("dev-env manager compatibility policy", () => {
  const live = (name, managerVersion, tracks, freshness, expected = null) => ({
    name,
    endpoint: `https://${name}.example.test`,
    tracks,
    status: {
      live: true,
      checked_at: "2026-10-01T23:57:00Z",
      manager_version: managerVersion,
      expected_version: expected,
      freshness,
    },
    accounts: [],
  });
  const MAIN_LINES = [
    { line: "26.4", latest: "26.4.13", servers: ["staging-lts"] },
    { line: "26.5", latest: "26.5.3", servers: [] },
    { line: "26.7", latest: "26.7.2", servers: [] },
    { line: "26.8", latest: "26.8.9", servers: [] },
    { line: "26.9", latest: "26.9.4", servers: ["staging-latest"] },
    { line: "main", latest: "26.9.0rc1", servers: ["sujin", "sungchul-171"] },
  ];
  const POLICY_BODY = {
    version: 1,
    servers: [
      live("staging-lts", "26.4.13", "26.4", "current", "26.4.13"),
      live("staging-latest", "26.9.4", "26.9", "current", "26.9.4"),
      live("sujin", "26.9.0rc1", "main", "current", "26.9.0rc1"),
      live("sungchul-171", "26.8.9", "main", "behind", "26.9.0rc1"),
      live("old-box", "25.15.3", null, "unknown"),
      {
        name: "down-lts",
        endpoint: "https://down-lts.example.test",
        tracks: "26.4",
        status: { live: false, checked_at: "2026-10-01T23:57:00Z", manager_version: "26.4.12" },
        accounts: [],
      },
    ],
    upstream: {
      checked_at: "2026-10-01T23:50:00Z",
      main_version: "26.9.0rc1",
      lines: { "26.4": "26.4.13", "26.5": "26.5.3", "26.7": "26.7.2", "26.8": "26.8.9", "26.9": "26.9.4" },
      error: null,
    },
    policy: {
      updated_at: "2026-10-01T12:00:00Z",
      webui: {
        branches: {
          main: {
            min_manager_line: "26.4",
            notes: "",
            resolved: {
              upper: "main",
              floor_version: "26.4.13",
              upper_version: "26.9.0rc1",
              lines: MAIN_LINES,
              below_floor_servers: ["old-box"],
            },
          },
          "26.9": { min_manager_line: "26.8", notes: "LTS candidate" },
        },
      },
    },
  };
  const catalog = parseCatalog(POLICY_BODY, NOW);

  it("lines and their order", () => {
    expect(versionLine("26.9.0rc1")).toBe("26.9");
    expect(versionLine("26.4.13")).toBe("26.4");
    expect(versionLine("v26.10.0")).toBe("26.10");
    expect(versionLine("26.04.1")).toBe("26.4");
    expect(versionLine("x.y.z")).toBeNull();
    expect(versionLine("2412")).toBeNull();
    expect(versionLine(null)).toBeNull();
    expect(compareLines("26.4", "26.10")).toBeLessThan(0);
    expect(compareLines("26.9", "26.9")).toBe(0);
    expect(compareLines("27.0", "26.12")).toBeGreaterThan(0);
    // "main" closes every range.
    expect(compareLines("main", "27.0")).toBeGreaterThan(0);
    expect(compareLines("26.4", "main")).toBeLessThan(0);
    expect(compareLines("main", "main")).toBe(0);
    expect(upperLineOf("main")).toBe("main");
    expect(upperLineOf("26.9")).toBe("26.9");
  });

  it("maps the contract's policy, upstream, tracks and freshness", () => {
    expect(catalog.warnings).toEqual([]);
    expect(catalog.upstream).toEqual({
      checkedAt: "2026-10-01T23:50:00Z",
      mainVersion: "26.9.0rc1",
      lines: { "26.4": "26.4.13", "26.5": "26.5.3", "26.7": "26.7.2", "26.8": "26.8.9", "26.9": "26.9.4" },
      error: null,
    });
    expect(catalog.policy.updatedAt).toBe("2026-10-01T12:00:00Z");
    expect(catalog.policy.webui.branches.main).toEqual({
      minManagerLine: "26.4",
      notes: null,
      resolved: {
        upper: "main",
        floorVersion: "26.4.13",
        upperVersion: "26.9.0rc1",
        lines: MAIN_LINES,
        belowFloorServers: ["old-box"],
      },
    });
    expect(catalog.policy.webui.branches["26.9"]).toEqual({
      minManagerLine: "26.8",
      notes: "LTS candidate",
      resolved: null,
    });
    expect(findServer(catalog, "sungchul-171")).toMatchObject({
      tracks: "main",
      status: { freshness: "behind", expectedVersion: "26.9.0rc1" },
    });
    expect(findServer(catalog, "old-box")).toMatchObject({
      tracks: null,
      status: { freshness: "unknown", expectedVersion: null },
    });
  });

  it("reads an old board without policy, upstream or tracks as having none", () => {
    const old = parseCatalog({ version: 1, servers: [live("x", "26.9.4", undefined, undefined)] }, NOW);
    expect(old.policy).toBeNull();
    expect(old.upstream).toBeNull();
    expect(old.servers[0].tracks).toBeNull();
    expect(old.servers[0].status.freshness).toBeNull();
    expect(old.warnings).toEqual([]);
    expect(compatReport(old, "main")).toEqual({
      branch: "main",
      maintained: false,
      maintainedBranches: [],
    });
  });

  it("ignores a stored target from the retired contract, without a warning", () => {
    const { policy, warnings } = parseCatalog(
      {
        version: 1,
        servers: [],
        policy: { webui: { branches: { main: { min_manager_line: "26.4", target: "main" } } } },
      },
      NOW,
    );
    expect(warnings).toEqual([]);
    expect(policy.webui.branches.main).toEqual({ minManagerLine: "26.4", notes: null, resolved: null });
    expect(policy.webui.branches.main).not.toHaveProperty("target");
  });

  it("skips a malformed branch, floor, tracks or freshness with a warning", () => {
    const { policy, servers, warnings } = parseCatalog(
      {
        version: 1,
        servers: [
          { ...live("a", "26.9.4", "latest", "fresh"), status: { live: true, freshness: "fresh" } },
        ],
        upstream: { main_version: "26.9.0rc1", lines: { "26.9": "26.9.4", bad: 1 } },
        policy: {
          webui: {
            branches: {
              main: {
                min_manager_line: "26.4",
                resolved: { upper: "main", lines: "all", below_floor_servers: [] },
              },
              "26.9": { min_manager_line: "26.4.0" },
              "26.8": "26.4",
              "feat/x": { min_manager_line: "26.4" },
            },
          },
        },
      },
      NOW,
    );
    expect(Object.keys(policy.webui.branches)).toEqual(["main"]);
    expect(policy.webui.branches.main.resolved).toBeNull();
    expect(servers[0].tracks).toBeNull();
    expect(servers[0].status.freshness).toBeNull();
    expect(warnings).toEqual([
      'server "a": "tracks" "latest" is not "main" or a line like "26.9", ignored',
      'server "a": "status.freshness" "fresh" is not one of current, behind, unknown, ignored',
      '"upstream.lines" entry "bad" is malformed, ignored',
      'policy branch "main": "resolved" has no "lines" or "below_floor_servers" list, computed here instead',
      'policy branch "26.9": "min_manager_line" "26.4.0" is not "main" or a line like "26.4", skipped',
      'policy branch "26.8": not an object, skipped',
      'policy branch "feat/x": not "main" or a release branch like "26.9", skipped',
    ]);
  });

  it("resolves the policy branch from the git branch", () => {
    expect(resolveCompatBranch("main")).toBe("main");
    expect(resolveCompatBranch("26.9")).toBe("26.9");
    expect(resolveCompatBranch("feat/gh-10345-compat-floor-catalog")).toBe("main");
    expect(resolveCompatBranch("26.9.1")).toBe("main");
    expect(resolveCompatBranch(null)).toBe("main");
  });

  it("reports the board's resolved range when it sent one", () => {
    expect(compatReport(catalog, "main")).toEqual({
      branch: "main",
      maintained: true,
      floor: "26.4",
      notes: null,
      upper: "main",
      floorVersion: "26.4.13",
      upperVersion: "26.9.0rc1",
      lines: MAIN_LINES,
      belowFloorServers: ["old-box"],
      gateFloorLine: "26.4",
    });
  });

  it("resolves the range itself from upstream, live servers and tracks otherwise", () => {
    // 26.9's floor is 26.8: lines 26.8 and 26.9, no "main" entry for a release branch.
    expect(compatReport(catalog, "26.9")).toEqual({
      branch: "26.9",
      maintained: true,
      floor: "26.8",
      notes: "LTS candidate",
      upper: "26.9",
      floorVersion: "26.8.9",
      upperVersion: "26.9.4",
      lines: [
        { line: "26.8", latest: "26.8.9", servers: [] },
        { line: "26.9", latest: "26.9.4", servers: ["staging-latest"] },
      ],
      belowFloorServers: ["old-box", "staging-lts"],
      gateFloorLine: "26.8",
    });
    // sungchul-171 runs 26.8.9 but tracks main, so it sits on the "main" entry, not on 26.8.
    const body = structuredClone(POLICY_BODY);
    delete body.policy.webui.branches.main.resolved;
    expect(compatReport(parseCatalog(body, NOW), "main")).toMatchObject({
      upper: "main",
      floorVersion: "26.4.13",
      upperVersion: "26.9.0rc1",
      lines: MAIN_LINES,
      belowFloorServers: ["old-box"],
      gateFloorLine: "26.4",
    });
  });

  it("treats a floor of main as the single line main's VERSION names", () => {
    const body = structuredClone(POLICY_BODY);
    body.policy.webui.branches.main = { min_manager_line: "main" };
    const report = compatReport(parseCatalog(body, NOW), "main");
    expect(report).toMatchObject({
      floor: "main",
      upper: "main",
      floorVersion: "26.9.0rc1",
      upperVersion: "26.9.0rc1",
      lines: [{ line: "main", latest: "26.9.0rc1", servers: ["sujin", "sungchul-171"] }],
      // Below main = below 26.9 among servers not built from main.
      belowFloorServers: ["old-box", "staging-lts"],
      gateFloorLine: "26.9",
    });
    delete body.upstream;
    expect(compatReport(parseCatalog(body, NOW), "main")).toMatchObject({
      floorVersion: null,
      lines: [{ line: "main", latest: null, servers: ["sujin", "sungchul-171"] }],
      belowFloorServers: [],
      gateFloorLine: null,
    });
  });

  it("falls back to the lines live servers run when upstream is unknown", () => {
    const body = structuredClone(POLICY_BODY);
    delete body.upstream;
    delete body.policy.webui.branches.main.resolved;
    expect(compatReport(parseCatalog(body, NOW), "main")).toMatchObject({
      floorVersion: null,
      upperVersion: null,
      lines: [
        { line: "26.4", latest: null, servers: ["staging-lts"] },
        { line: "26.9", latest: null, servers: ["staging-latest"] },
        { line: "main", latest: null, servers: ["sujin", "sungchul-171"] },
      ],
      belowFloorServers: ["old-box"],
      gateFloorLine: "26.4",
    });
  });

  it("names the maintained branches for one the policy lacks", () => {
    expect(compatReport(catalog, "26.5")).toEqual({
      branch: "26.5",
      maintained: false,
      maintainedBranches: ["main", "26.9"],
    });
    expect(formatCompatReport(compatReport(catalog, "26.5"), [])).toBe(
      'branch: 26.5\npolicy: not maintained — the catalog policy has no entry for "26.5"; maintained: main, 26.9',
    );
  });

  it("finds every gate form with its line, ignoring versions that are not numeric", () => {
    const source = [
      "const a = baiClient.isManagerVersionCompatibleWith('26.9.0');",
      'const b = client.isManagerVersionCompatibleWith("26.4.4rc9");',
      "const c = baiClient.isManagerVersionCompatibleWith(",
      "  ['26.4.5', '26.8.2'],",
      ");",
      "const d = baiClient.isManagerVersionCompatibleWith('x.y.z');",
      "graphql`",
      '  field @since(version: "26.7.0")',
      '  old @deprecatedSince(version: "26.4.0")',
      '  multi @sinceMultiple(versions: ["26.4.5", "26.9.0"])',
      '  gone @deprecatedSinceMultiple(versions: ["26.4.3", "26.8.1"])',
      "`;",
    ].join("\n");
    const gates = findVersionGates(source);
    expect(gates).toEqual([
      { line: 1, kind: "isManagerVersionCompatibleWith", versions: ["26.9.0"], lines: ["26.9"] },
      { line: 2, kind: "isManagerVersionCompatibleWith", versions: ["26.4.4rc9"], lines: ["26.4"] },
      { line: 3, kind: "isManagerVersionCompatibleWith", versions: ["26.4.5", "26.8.2"], lines: ["26.4", "26.8"] },
      { line: 6, kind: "isManagerVersionCompatibleWith", versions: ["x.y.z"], lines: [] },
      { line: 8, kind: "@since", versions: ["26.7.0"], lines: ["26.7"] },
      { line: 9, kind: "@deprecatedSince", versions: ["26.4.0"], lines: ["26.4"] },
      { line: 10, kind: "@sinceMultiple", versions: ["26.4.5", "26.9.0"], lines: ["26.4", "26.9"] },
      { line: 11, kind: "@deprecatedSinceMultiple", versions: ["26.4.3", "26.8.1"], lines: ["26.4", "26.8"] },
    ]);
    const atOrBelow = gates.filter((g) => isGateAtOrBelowFloor(g, "26.4")).map((g) => g.line);
    // The backport arrays keep their newer entry, so they stay (ADR 0010).
    expect(atOrBelow).toEqual([2, 9]);
    expect(gates.filter((g) => isGateAtOrBelowFloor(g, "26.8")).map((g) => g.line)).toEqual([2, 3, 8, 9, 11]);
  });

  it("scans application sources only", () => {
    expect(GATE_SCAN_DIRS).toEqual([
      "react/src",
      "packages/backend.ai-ui/src",
      "packages/backend.ai-client/src",
    ]);
    expect(isGateScanFile("react/src/components/A.tsx")).toBe(true);
    expect(isGateScanFile("packages/backend.ai-client/src/client.ts")).toBe(true);
    expect(isGateScanFile("react/src/__generated__/A.graphql.ts")).toBe(false);
    expect(isGateScanFile("react/src/components/A.test.tsx")).toBe(false);
    expect(isGateScanFile("react/src/components/A.stories.tsx")).toBe(false);
    expect(isGateScanFile("react/src/components/A.spec.ts")).toBe(false);
    // A component's Astryx catalog entry carries examples, not gates.
    expect(isGateScanFile("packages/backend.ai-ui/src/components/fragments/BAIDomainSelectV2.doc.ts")).toBe(false);
    expect(isGateScanFile("react/src/locale/en.json")).toBe(false);
  });

  it("prints the floor, the range with its gaps, the warnings and the gate list", () => {
    const text = formatCompatReport(
      compatReport(catalog, "main"),
      [{ file: "react/src/A.tsx", line: 12, kind: "@since", versions: ["26.4.0"] }],
      { gitBranch: "feat/x" },
    );
    expect(text).toBe(
      [
        "branch: main (git branch feat/x)",
        "floor: 26.4 line (latest patch 26.4.13)",
        "range: 26.4 … main (26.9.0rc1), every line at its latest patch",
        "  26.4 (26.4.13)    staging-lts",
        "  26.5 (26.5.3)     — no server",
        "  26.7 (26.7.2)     — no server",
        "  26.8 (26.8.9)     — no server",
        "  26.9 (26.9.4)     staging-latest",
        "  main (26.9.0rc1)  sujin, sungchul-171",
        "below the floor: old-box",
        "warning: no live server on 26.5, 26.7, 26.8 — coverage gap",
        "",
        "gates at or below the 26.4 line (1; deletable per ADR 0010):",
        "  react/src/A.tsx:12  @since(26.4.0)",
      ].join("\n"),
    );
    const floorMain = structuredClone(POLICY_BODY);
    floorMain.policy.webui.branches.main = { min_manager_line: "main" };
    expect(formatCompatReport(compatReport(parseCatalog(floorMain, NOW), "main"), [])).toBe(
      [
        "branch: main",
        "floor: main (backend.ai main branch, 26.9.0rc1)",
        "range: main … main, every line at its latest patch",
        "  main (26.9.0rc1)  sujin, sungchul-171",
        "below the floor: old-box, staging-lts",
        "",
        "gates at or below the 26.9 line (main's VERSION): none",
      ].join("\n"),
    );
    const empty = parseCatalog(
      { version: 1, servers: [], policy: { webui: { branches: { "26.9": { min_manager_line: "26.9" } } } } },
      NOW,
    );
    expect(formatCompatReport(compatReport(empty, "26.9"), [])).toBe(
      [
        "branch: 26.9",
        "floor: 26.9 line",
        "range: 26.9 … 26.9, every line at its latest patch",
        "  26.9 (?)  — no server",
        "warning: no live server on 26.9 — coverage gap",
        "",
        "gates at or below the 26.9 line: none",
      ].join("\n"),
    );
  });

  it("shows tracks and freshness in the list", () => {
    expect(formatTracks(findServer(catalog, "sujin"))).toBe("tracks main (current)");
    expect(formatTracks(findServer(catalog, "sungchul-171"))).toBe(
      "tracks main (behind: expected 26.9.0rc1)",
    );
    expect(formatTracks(findServer(catalog, "old-box"))).toBeNull();
    expect(formatStatus(findServer(catalog, "staging-lts"), NOW)).toBe(
      "live · manager 26.4.13 · tracks 26.4 (current) · checked 3m ago",
    );
    expect(formatCatalog(redactCatalog(catalog), NOW)).toContain(
      "staging-latest  https://staging-latest.example.test\n  live · manager 26.9.4 · tracks 26.9 (current) · checked 3m ago",
    );
  });
});

describe("dev-env env files", () => {
  const AWKWARD = [
    "plain-1",
    "has space",
    "a#b",
    `it's`,
    `"q" 'q'`,
    "a$b",
    "x\\ny",
    // Backslashes next to `$` (CodeQL "incomplete string escaping").
    "\\$",
    "\\\\$",
    "a\\",
    "\\${HOME}",
    "$\\",
    "${HOME}",
    "$$",
    "\\",
    `p\\a$s'w"d`,
  ];

  it("round-trips awkward passwords through dotenv", () => {
    for (const value of AWKWARD) {
      const parsed = dotenv.parse(`K=${quoteEnvValue(value)}\n`);
      expect(parsed.K).toBe(value);
    }
  });

  it("round-trips awkward passwords through Vite's loadEnv (dotenv-expand)", async () => {
    // The real reader of .env.development.local, resolved from react/ where Vite is a dependency.
    const require = createRequire(
      path.join(process.cwd(), "react", "package.json"),
    );
    const { loadEnv } = await import(require.resolve("vite"));
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dev-env-vite-"));
    try {
      for (const value of AWKWARD) {
        fs.writeFileSync(
          path.join(dir, ".env.development.local"),
          `VITE_DEFAULT_PASSWORD=${quoteEnvValue(value, { expand: true })}\n`,
        );
        expect(
          loadEnv("development", dir, "VITE_").VITE_DEFAULT_PASSWORD,
          JSON.stringify(value),
        ).toBe(value);
      }
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("escapes $ for files Vite expands", () => {
    expect(quoteEnvValue("a$b", { expand: true })).toBe("'a\\$b'");
  });

  it("refuses a value it cannot represent", () => {
    expect(() => quoteEnvValue("a\nb")).toThrow();
    expect(() => quoteEnvValue(`' " \``)).toThrow();
  });

  it("replaces keys in place, appends new ones and removes null ones", () => {
    const before = [
      "# theme",
      "VITE_THEME_HEADER_COLOR=#7C3AED",
      "VITE_DEFAULT_EMAIL=old@example.test",
      "VITE_DEFAULT_PASSWORD=old",
      "",
    ].join("\n");
    const after = upsertEnv(before, {
      VITE_DEFAULT_API_ENDPOINT: "https://main.example.test",
      VITE_DEFAULT_EMAIL: "new@example.test",
      VITE_DEFAULT_PASSWORD: null,
    });
    expect(after).toBe(
      [
        "# theme",
        "VITE_THEME_HEADER_COLOR=#7C3AED",
        "VITE_DEFAULT_EMAIL=new@example.test",
        "",
        "VITE_DEFAULT_API_ENDPOINT=https://main.example.test",
        "",
      ].join("\n"),
    );
  });

  it("leaves commented-out keys alone and collapses a repeated key", () => {
    expect(upsertEnv("# A=1\nA=2\nA=3\n", { A: "9" })).toBe("# A=1\nA=9\n");
  });

  it("starts an empty file cleanly", () => {
    expect(upsertEnv("", { A: "1" })).toBe("A=1\n");
  });
});

describe("config.toml", () => {
  const SAMPLE = [
    "[general]",
    '# Set apiEndpoint only to a Webserver address.',
    'apiEndpoint = "[Default API Endpoint.]"',
    'connectionMode = "[Connection mode. API or SESSION]"',
    "debug = false                 # README",
    '#singleSignOnVendors = "saml"  # Comma-separated',
    "",
    "[resources]",
    "openPortToPublic = false  # Show option to open app proxy port to anyone.",
    'tags = ["a", "b#c"]  # inline array',
    "",
    "[plugin]",
    '#login = "signup-cloud"',
    "",
  ].join("\n");

  describe("parseConfigSet", () => {
    it("reads TOML literals and falls back to a string", () => {
      expect(parseConfigSet("resources.openPortToPublic=true")).toEqual({
        key: "resources.openPortToPublic",
        value: true,
      });
      expect(parseConfigSet("general.maxCountForPreopenPorts=3")).toEqual({
        key: "general.maxCountForPreopenPorts",
        value: 3,
      });
      expect(parseConfigSet('general.connectionMode="SESSION"').value).toBe(
        "SESSION",
      );
      expect(parseConfigSet("general.connectionMode=SESSION").value).toBe(
        "SESSION",
      );
      expect(parseConfigSet("wsproxy.proxyURL=http://x:1/").value).toBe(
        "http://x:1/",
      );
    });

    it("rejects a key without a section or with an empty component", () => {
      for (const arg of ["debug=true", "nope", "a..b=true", "resources.=true", ".x=1"]) {
        expect(() => parseConfigSet(arg), arg).toThrow(/<section>\.<key>/);
      }
    });
  });

  describe("setTomlValue", () => {
    it("rewrites the key's line and keeps its inline comment", () => {
      const out = setTomlValue(SAMPLE, "resources.openPortToPublic", true);
      expect(out).toContain(
        "openPortToPublic = true  # Show option to open app proxy port to anyone.",
      );
      expect(out.split("\n").length).toBe(SAMPLE.split("\n").length);
    });

    it("keeps a comment after an inline array containing '#'", () => {
      const out = setTomlValue(SAMPLE, "resources.tags", ["x"]);
      expect(out).toContain('tags = [ "x" ]  # inline array');
    });

    it("uncomments a commented-out key instead of appending", () => {
      const out = setTomlValue(SAMPLE, "general.singleSignOnVendors", "saml");
      expect(out).toContain('singleSignOnVendors = "saml"  # Comma-separated');
      expect(out).not.toContain("#singleSignOnVendors");
    });

    it("appends a new key at the end of its section", () => {
      const out = setTomlValue(SAMPLE, "general.newKey", "v");
      const lines = out.split("\n");
      const at = lines.indexOf('newKey = "v"');
      expect(at).toBeGreaterThan(lines.indexOf("[general]"));
      expect(lines[at + 1]).toBe("");
      expect(lines[at + 2]).toBe("[resources]");
    });

    it("creates a missing section at the end", () => {
      const out = setTomlValue(SAMPLE, "pipeline.endpoint", "http://x/");
      expect(out.trimEnd().split("\n").slice(-2)).toEqual([
        "[pipeline]",
        'endpoint = "http://x/"',
      ]);
    });

    it("does not touch a same-named key in another section", () => {
      const text = "[a]\nkey = 1\n\n[b]\nkey = 2\n";
      expect(setTomlValue(text, "b.key", 3)).toBe("[a]\nkey = 1\n\n[b]\nkey = 3\n");
    });
  });

  it("disablePlaceholders comments out the sample's [description] values only", () => {
    const out = disablePlaceholders(SAMPLE);
    expect(out).toContain('#apiEndpoint = "[Default API Endpoint.]"');
    expect(out).toContain('#connectionMode = "[Connection mode. API or SESSION]"');
    expect(out).toContain("debug = false                 # README");
    expect(out).toContain('tags = ["a", "b#c"]');
  });

  describe("renderConfigToml", () => {
    const server = {
      name: "main",
      status: {
        configFetchedAt: "2026-10-12T03:00:00Z",
        config: {
          general: {
            apiEndpoint: "https://main.example.test",
            apiEndpointText: "Main",
            connectionMode: "SESSION",
            debug: true,
            enableModelFolders: true,
          },
          resources: { openPortToPublic: false },
          plugin: { login: "signup-cloud" },
          pipeline: { endpoint: "http://mlops.example.test/" },
        },
      },
    };

    it("layers sample < probed switches < overrides under a generated header", () => {
      const out = renderConfigToml({
        sample: SAMPLE,
        server,
        overrides: [parseConfigSet("resources.openPortToPublic=true")],
      });
      const lines = out.split("\n");
      expect(isGeneratedConfig(out)).toBe(true);
      expect(lines[0].startsWith(CONFIG_GENERATED_MARKER)).toBe(true);
      expect(lines[1]).toBe(
        "# base: config.toml.sample · switches: main (probed 2026-10-12T03:00:00Z) · overrides: resources.openPortToPublic = true",
      );
      expect(lines[2]).toBe("");
      expect(lines[3]).toBe("[general]");
      expect(out).toContain('connectionMode = "SESSION"');
      expect(out).toContain("debug = true  # README");
      expect(out).toContain("enableModelFolders = true");
      expect(out).toContain("openPortToPublic = true  # Show option");
      expect(out).toContain('[pipeline]\nendpoint = "http://mlops.example.test/"');
    });

    it("never copies the endpoint or the plugin table", () => {
      const out = renderConfigToml({ sample: SAMPLE, server });
      expect(out).toContain('#apiEndpoint = "[Default API Endpoint.]"');
      expect(out).not.toContain("https://main.example.test");
      expect(out).not.toContain("apiEndpointText = ");
      expect(out).toContain('#login = "signup-cloud"');
      expect(out).not.toContain('\nlogin = "signup-cloud"');
    });

    it("falls back to the sample defaults when the server serves no config.toml", () => {
      const out = renderConfigToml({
        sample: SAMPLE,
        server: { name: "bare", status: { config: null } },
      });
      expect(out.split("\n")[1]).toBe(
        "# base: config.toml.sample · switches: sample defaults (bare serves no config.toml)",
      );
      expect(out).toContain('#connectionMode = "[Connection mode. API or SESSION]"');
      expect(out).toContain("openPortToPublic = false  # Show option");
    });

    it("isGeneratedConfig is false for a hand-written file", () => {
      expect(isGeneratedConfig("[general]\ndebug = true\n")).toBe(false);
      expect(isGeneratedConfig("")).toBe(false);
    });
  });
});
