// @ts-nocheck
import {
  findAccount,
  findServer,
  formatCatalog,
  loginPrefillVars,
  parseCatalog,
  playwrightVars,
  quoteEnvValue,
  redactCatalog,
  upsertEnv,
} from "./dev-env-lib.mjs";
import dotenv from "dotenv";

const NOW = new Date("2026-10-02T00:00:00Z");

const login = (name, username, password, extra = {}) => ({
  type: 1,
  name,
  login: { username, password, uris: [{ uri: "https://main.example.test/" }] },
  ...extra,
});

const ITEMS = [
  {
    type: 2,
    name: "webui-dev/main",
    notes: "Tracks manager main.\nReset every Monday.",
    fields: [
      { name: "endpoint", value: "https://main.example.test:8090/" },
      { name: "Tags", value: "plugin:fair-share, nightly" },
      { name: "verified_at", value: "2026-09-20" },
    ],
  },
  login("webui-dev/main/user", "user@example.test", "pw-user", {
    notes: "Member of three projects.",
    fields: [
      { name: "tags", value: "multi-project" },
      { name: "verified_at", value: "2026-01-01" },
    ],
  }),
  login("webui-dev/main/admin", "admin@example.test", "pw-admin"),
  login("webui-dev/main/project-admin", "pa@example.test", "pw-pa"),
  login("webui-dev/lts/user", "lts-user@example.test", "pw-lts"),
  login("Some unrelated login", "x", "y"),
];

describe("dev-env catalog", () => {
  const catalog = parseCatalog(ITEMS, NOW);

  it("groups accounts under their server and ignores unrelated items", () => {
    expect(catalog.servers.map((s) => s.name)).toEqual(["lts", "main"]);
    expect(findServer(catalog, "main").accounts.map((a) => a.role)).toEqual([
      "admin",
      "project-admin",
      "user",
    ]);
    expect(catalog.warnings).toEqual([]);
  });

  it("reads endpoint, tags and notes from the server item", () => {
    const main = findServer(catalog, "main");
    expect(main.endpoint).toBe("https://main.example.test:8090");
    expect(main.tags).toEqual(["plugin:fair-share", "nightly"]);
    expect(main.notes).toContain("Reset every Monday.");
    expect(main.stale).toBe(false);
  });

  it("falls back to the login URI when the server has no item of its own", () => {
    expect(findServer(catalog, "lts").endpoint).toBe(
      "https://main.example.test",
    );
  });

  it("marks a note stale when it is old or was never verified", () => {
    const main = findServer(catalog, "main");
    expect(findAccount(main, "user").stale).toBe(true);
    expect(findAccount(main, "admin").stale).toBe(true);
  });

  it("warns about malformed names, non-login accounts, duplicates and missing endpoints", () => {
    const { servers, warnings } = parseCatalog(
      [
        { type: 1, name: "webui-dev/a/b/c" },
        { type: 2, name: "webui-dev/a/user" },
        { type: 1, name: "webui-dev/a/admin", login: { username: "one" } },
        { type: 1, name: "webui-dev/a/admin", login: { username: "two" } },
      ],
      NOW,
    );
    expect(servers[0].accounts.map((a) => a.email)).toEqual(["one"]);
    expect(warnings).toHaveLength(4);
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
    const text = formatCatalog(redacted);
    expect(text).toContain("main  https://main.example.test:8090");
    expect(text).toContain("- user  user@example.test");
    expect(text).toContain("verified: 2026-01-01 (stale)");
    expect(text).toContain("verified: never");
    expect(formatCatalog(catalog)).not.toContain("pw-");
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
      E2E_MONITOR_EMAIL: null,
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
