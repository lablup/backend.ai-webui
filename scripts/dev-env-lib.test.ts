// @ts-nocheck
import {
  MANAGER_CONFIG_KEYS,
  allSettings,
  downWarning,
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
  serverHealth,
  upsertEnv,
} from "./dev-env-lib.mjs";
import dotenv from "dotenv";

const NOW = new Date("2026-10-02T00:00:00Z");

const account = (role, email, password, extra = {}) => ({
  role,
  email,
  password,
  tags: [],
  notes: "",
  verified_at: null,
  ...extra,
});

const BODY = {
  version: 1,
  updated_at: "2026-10-01T05:00:00Z",
  servers: [
    {
      name: "main",
      endpoint: "https://main.example.test:8090",
      tags: ["plugin:fair-share", "nightly"],
      notes: "Tracks manager main.\nReset every Monday.",
      verified_at: "2026-09-20",
      accounts: [
        account("user", "user@example.test", "pw-user", {
          tags: ["multi-project"],
          notes: "Member of three projects.",
          verified_at: "2026-01-01",
        }),
        account("admin", "admin@example.test", "pw-admin"),
        account("project-admin", "pa@example.test", "pw-pa"),
        account("monitor", "monitor@example.test", null),
      ],
    },
    {
      name: "lts",
      endpoint: "http://lts.example.test",
      tags: [],
      notes: "",
      verified_at: null,
      accounts: [account("user", "lts-user@example.test", "pw-lts")],
    },
  ],
};

describe("dev-env catalog", () => {
  const catalog = parseCatalog(BODY, NOW);

  it("sorts servers and accounts and carries updated_at", () => {
    expect(catalog.servers.map((s) => s.name)).toEqual(["lts", "main"]);
    expect(findServer(catalog, "main").accounts.map((a) => a.role)).toEqual([
      "admin",
      "monitor",
      "project-admin",
      "user",
    ]);
    expect(catalog.updatedAt).toBe("2026-10-01T05:00:00Z");
    expect(catalog.warnings).toEqual([]);
  });

  it("maps the contract onto the catalog shape", () => {
    const main = findServer(catalog, "main");
    expect(main).toMatchObject({
      endpoint: "https://main.example.test:8090",
      tags: ["plugin:fair-share", "nightly"],
      verifiedAt: "2026-09-20",
      stale: false,
    });
    expect(main.notes).toContain("Reset every Monday.");
    expect(findAccount(main, "user")).toEqual({
      role: "user",
      email: "user@example.test",
      password: "pw-user",
      passwordAvailable: true,
      tags: ["multi-project"],
      notes: "Member of three projects.",
      verifiedAt: "2026-01-01",
      stale: true,
    });
    expect(findAccount(main, "admin").notes).toBeNull();
    expect(findAccount(main, "admin")).not.toHaveProperty("share");
  });

  it("treats a null or empty password as unavailable", () => {
    const main = findServer(catalog, "main");
    expect(findAccount(main, "monitor")).toMatchObject({
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

  it("marks a note stale when it is old or was never verified", () => {
    const main = findServer(catalog, "main");
    expect(findAccount(main, "user").stale).toBe(true);
    expect(findAccount(main, "admin").stale).toBe(true);
    expect(findServer(catalog, "lts").stale).toBe(true);
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
            verified_at: "yesterday",
            accounts: [
              account("admin", "one@example.test", "pw"),
              account("admin", "two@example.test", "pw"),
              account("Bad Role", "x@example.test", "pw"),
              { role: "user", email: "" },
              account("monitor", "m@example.test", 42),
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
    expect(a.verifiedAt).toBeNull();
    expect(a.accounts.map((acc) => [acc.role, acc.email])).toEqual([
      ["admin", "one@example.test"],
      ["monitor", "m@example.test"],
    ]);
    expect(findAccount(a, "monitor").passwordAvailable).toBe(false);
    expect(b.endpoint).toBe("https://b.example.test");
    expect(b.accounts).toEqual([]);
    expect(warnings).toHaveLength(13);
    expect(warnings[0]).toContain("catalog version 2");
  });

  it("refuses a body with no servers list", () => {
    expect(() => parseCatalog({ version: 1 }, NOW)).toThrow('"servers" list');
    expect(() => parseCatalog([], NOW)).toThrow('"servers" list');
  });

  it("names the known choices when a lookup misses", () => {
    expect(() => findServer(catalog, "nope")).toThrow("Known: lts, main");
    expect(() => findAccount(findServer(catalog, "lts"), "admin")).toThrow(
      "Known: user",
    );
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
    expect(text).toContain("- user  user@example.test");
    expect(text).toContain("verified: 2026-01-01 (stale)");
    expect(text).toContain("verified: never");
    expect(formatCatalog(catalog)).not.toContain("pw-");
  });

  it("marks an account without a password as typed at login", () => {
    const text = formatCatalog(redactCatalog(catalog));
    expect(text.match(/password: — \(typed at login\)/g)).toHaveLength(1);
    expect(text).toMatch(
      /- monitor {2}monitor@example\.test\n.*\n {6}password: — \(typed at login\)/,
    );
  });

  it("maps the roles the E2E suite reads and clears the ones the server lacks", () => {
    expect(playwrightVars(findServer(catalog, "main"))).toEqual({
      E2E_WEBSERVER_ENDPOINT: "https://main.example.test:8090",
      E2E_ADMIN_EMAIL: "admin@example.test",
      E2E_ADMIN_PASSWORD: "pw-admin",
      E2E_USER_EMAIL: "user@example.test",
      E2E_USER_PASSWORD: "pw-user",
      E2E_USER2_EMAIL: null,
      E2E_USER2_PASSWORD: null,
      E2E_MONITOR_EMAIL: "monitor@example.test",
      E2E_MONITOR_PASSWORD: null,
      E2E_DOMAIN_ADMIN_EMAIL: null,
      E2E_DOMAIN_ADMIN_PASSWORD: null,
    });
  });

  it("drops the password line from the login pre-fill on request", () => {
    const main = findServer(catalog, "main");
    const user = findAccount(main, "user");
    expect(loginPrefillVars(main, user).VITE_DEFAULT_PASSWORD).toBe("pw-user");
    expect(
      loginPrefillVars(main, user, { password: false }).VITE_DEFAULT_PASSWORD,
    ).toBeNull();
  });

  it("never writes an empty password key", () => {
    const main = findServer(catalog, "main");
    const monitor = findAccount(main, "monitor");
    expect(loginPrefillVars(main, monitor).VITE_DEFAULT_PASSWORD).toBeNull();
    const written = upsertEnv(
      "E2E_MONITOR_PASSWORD=old\n",
      playwrightVars(main),
    );
    expect(written).not.toMatch(/PASSWORD=\s*$/m);
    expect(written).not.toContain("E2E_MONITOR_PASSWORD");
    expect(written).toContain("E2E_MONITOR_EMAIL=monitor@example.test");
  });
});

describe("dev-env hand-written passwords", () => {
  const catalog = parseCatalog(BODY, NOW);
  const main = findServer(catalog, "main");
  const monitor = findAccount(main, "monitor");
  const user = findAccount(main, "user");

  it("keeps a password written for the same email", () => {
    const existing = {
      VITE_DEFAULT_EMAIL: "  Monitor@Example.test ",
      VITE_DEFAULT_PASSWORD: "hand-written",
    };
    const prefill = loginPrefillVars(main, monitor, { existing });
    expect(prefill).not.toHaveProperty("VITE_DEFAULT_PASSWORD");
    expect(keptPasswordEmails(prefill)).toEqual(["monitor@example.test"]);
    expect(
      upsertEnv(
        "VITE_DEFAULT_EMAIL=monitor@example.test\nVITE_DEFAULT_PASSWORD=hand-written\n",
        prefill,
      ),
    ).toContain("VITE_DEFAULT_PASSWORD=hand-written");

    const vars = playwrightVars(main, {
      existing: {
        E2E_MONITOR_EMAIL: "monitor@example.test",
        E2E_MONITOR_PASSWORD: "hand-written",
      },
    });
    expect(vars).not.toHaveProperty("E2E_MONITOR_PASSWORD");
    expect(keptPasswordEmails(vars)).toEqual(["monitor@example.test"]);
  });

  it("removes a password written for a different email", () => {
    const existing = {
      VITE_DEFAULT_EMAIL: "someone-else@example.test",
      VITE_DEFAULT_PASSWORD: "theirs",
      E2E_MONITOR_EMAIL: "someone-else@example.test",
      E2E_MONITOR_PASSWORD: "theirs",
    };
    expect(
      loginPrefillVars(main, monitor, { existing }).VITE_DEFAULT_PASSWORD,
    ).toBeNull();
    expect(playwrightVars(main, { existing }).E2E_MONITOR_PASSWORD).toBeNull();
  });

  it("removes the password key when there is no existing line", () => {
    const existing = { VITE_DEFAULT_EMAIL: "monitor@example.test" };
    const prefill = loginPrefillVars(main, monitor, { existing });
    expect(prefill.VITE_DEFAULT_PASSWORD).toBeNull();
    expect(keptPasswordEmails(prefill)).toEqual([]);
    expect(
      playwrightVars(main, {
        existing: { E2E_MONITOR_EMAIL: "monitor@example.test" },
      }).E2E_MONITOR_PASSWORD,
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
      VITE_DEFAULT_EMAIL: "monitor@example.test",
      VITE_DEFAULT_PASSWORD: "hand-written",
    };
    expect(
      loginPrefillVars(main, monitor, { existing, password: false })
        .VITE_DEFAULT_PASSWORD,
    ).toBeNull();
  });

  it("removes the password of a role the server lacks", () => {
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
    });
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

describe("dev-env env files", () => {
  it("round-trips awkward passwords through dotenv", () => {
    for (const value of [
      "plain-1",
      "has space",
      "a#b",
      `it's`,
      `"q" 'q'`,
      "a$b",
      "x\\ny",
    ]) {
      const parsed = dotenv.parse(`K=${quoteEnvValue(value)}\n`);
      expect(parsed.K).toBe(value);
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
