// @ts-nocheck
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "dev-env.mjs",
);

const minutesAgo = (minutes) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

const catalogBody = () => ({
  version: 1,
  updated_at: "2026-10-07T05:00:00Z",
  servers: [
    {
      name: "main",
      endpoint: "https://main.example.test:8090",
      tags: ["nightly"],
      notes: "Tracks manager main.",
      status: {
        live: true,
        checked_at: minutesAgo(3),
        last_live_at: minutesAgo(3),
        manager_version: "25.15.0",
        api_version: "v9.20250722",
        latency_ms: 42,
        error: null,
        config: {
          general: {
            connectionMode: "SESSION",
            enableModelFolders: true,
            signupSupport: false,
            apiEndpointText: "Main",
          },
          plugin: { page: "a,b" },
        },
        config_fetched_at: minutesAgo(3),
        config_error: null,
        config_truncated: false,
      },
      accounts: [
        {
          role: "user",
          email: "user@example.test",
          password: "pw-user",
          tags: [],
          notes: "",
        },
        {
          role: "admin",
          email: "admin@example.test",
          password: "pw-admin",
          tags: [],
          notes: "",
        },
        {
          role: "project-admin",
          email: "pa@example.test",
          password: null,
          tags: [],
          notes: "",
        },
        {
          role: "user",
          email: "user2@example.test",
          password: "pw-user2",
          tags: [],
          notes: "",
        },
      ],
    },
    {
      name: "lts",
      endpoint: "https://lts.example.test",
      tags: [],
      notes: "",
      status: {
        live: false,
        checked_at: minutesAgo(2),
        last_live_at: "2026-10-06T22:00:00Z",
        manager_version: "25.14.2",
        api_version: "v9.20250601",
        latency_ms: null,
        error: "connect ECONNREFUSED",
        config: null,
        config_fetched_at: null,
        config_error: "HTTP 404",
        config_truncated: false,
      },
      accounts: [
        {
          role: "user",
          email: "lts-user@example.test",
          password: "pw-lts",
          tags: [],
          notes: "",
        },
      ],
    },
    {
      name: "new",
      endpoint: "https://new.example.test",
      status: null,
      accounts: [],
    },
  ],
});

describe("dev-env CLI", () => {
  let root;
  let catalogPath;

  // Async on purpose: a blocking spawn would starve the in-process HTTP server.
  const run = (args, env = {}) => {
    const childEnv = {
      ...process.env,
      HOME: root,
      WEBUI_DEV_ENV_ROOT: root,
      WEBUI_DEV_ENV_CATALOG: catalogPath,
      ...env,
    };
    for (const key of Object.keys(childEnv)) {
      if (
        childEnv[key] === undefined ||
        key.startsWith("VITE_DEFAULT_") ||
        (key === "DEV_GW_CONFIG" && !("DEV_GW_CONFIG" in env)) ||
        (key === "WEBUI_DEV_ENV_CATALOG_URL" &&
          !("WEBUI_DEV_ENV_CATALOG_URL" in env))
      ) {
        delete childEnv[key];
      }
    }
    return new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [SCRIPT, ...args], {
        env: childEnv,
      });
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (chunk) => (stdout += chunk));
      child.stderr.on("data", (chunk) => (stderr += chunk));
      child.on("error", reject);
      child.on("close", (status) => resolve({ status, stdout, stderr }));
    });
  };
  const read = (relativePath) =>
    fs.readFileSync(path.join(root, relativePath), "utf8");

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "dev-env-test-"));
    fs.mkdirSync(path.join(root, "e2e", "envs"), { recursive: true });
    fs.writeFileSync(
      path.join(root, "e2e", "envs", ".env.playwright.sample"),
      "# sample\nE2E_WEBSERVER_ENDPOINT=http://127.0.0.1:8090\n",
    );
    fs.writeFileSync(
      path.join(root, ".env.development.local"),
      "VITE_THEME_HEADER_COLOR=#7C3AED\n",
    );
    fs.writeFileSync(
      path.join(root, "config.toml.sample"),
      [
        "[general]",
        'apiEndpointText = "[Placeholder text]"',
        'connectionMode = "[API or SESSION]"',
        "enableModelFolders = false   # Enable model folders",
        "",
        "[resources]",
        "openPortToPublic = false     # Show option to open app proxy port to anyone.",
        "",
        "[plugin]",
        '#page = "test-plugin1"',
        "",
      ].join("\n"),
    );
    catalogPath = path.join(root, "catalog.json");
    fs.writeFileSync(catalogPath, JSON.stringify(catalogBody()));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  describe("from a WEBUI_DEV_ENV_CATALOG file", () => {
    it("lists servers, accounts and probe status without passwords", async () => {
      const result = await run(["list"]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("main  https://main.example.test:8090");
      expect(result.stdout).toContain(
        "  live · manager 25.15.0 · checked 3m ago",
      );
      expect(result.stdout).toContain(
        "  DOWN since 2026-10-06T22:00:00Z (was 25.14.2): connect ECONNREFUSED",
      );
      expect(result.stdout).toContain(
        "new  https://new.example.test\n  not checked yet",
      );
      expect(result.stdout).toContain("- user  user@example.test");
      expect(result.stdout).toContain("password: — (typed at login)");
      expect(result.stdout).not.toContain("pw-");
    });

    it("prints the redacted catalog, status included, as JSON", async () => {
      const result = await run(["list", "--json"]);
      expect(result.status).toBe(0);
      const catalog = JSON.parse(result.stdout);
      expect(catalog.servers.map((s) => s.name)).toEqual([
        "lts",
        "main",
        "new",
      ]);
      const [lts, main, fresh] = catalog.servers;
      expect(main.accounts.map((a) => a.role)).toEqual([
        "user",
        "admin",
        "project-admin",
        "user",
      ]);
      expect(main.status).toMatchObject({
        live: true,
        managerVersion: "25.15.0",
      });
      expect(lts.status).toMatchObject({
        live: false,
        managerVersion: "25.14.2",
        error: "connect ECONNREFUSED",
      });
      expect(fresh.status).toBeNull();
      expect(result.stdout).not.toContain("pw-");
      expect(result.stdout).not.toContain(`"password":`);
      expect(catalog.warnings).toEqual([]);
    });

    it("reports source, counts, missing passwords and probe health", async () => {
      const result = await run(["status"]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(
        `source: ${catalogPath} (WEBUI_DEV_ENV_CATALOG)`,
      );
      expect(result.stdout).toContain("updated: 2026-10-07T05:00:00Z");
      expect(result.stdout).toContain(
        "catalog: 3 server(s), 5 account(s), 1 without a password",
      );
      expect(result.stdout).toContain("probe: 1 live, 1 down, 1 unknown");
    });

    it("gets one account with its password", async () => {
      const result = await run(["get", "main", "admin", "--json"]);
      expect(result.status).toBe(0);
      expect(JSON.parse(result.stdout)).toMatchObject({
        server: "main",
        endpoint: "https://main.example.test:8090",
        role: "admin",
        email: "admin@example.test",
        password: "pw-admin",
      });
      expect(result.stderr).toBe("");
    });

    it("writes both env files and keeps unrelated lines", async () => {
      fs.writeFileSync(
        path.join(root, "e2e", "envs", ".env.playwright"),
        "# mine\nE2E_MONITOR_EMAIL=mon@example.test\nE2E_MONITOR_PASSWORD=hand\n" +
          "E2E_DOMAIN_ADMIN_EMAIL=da@example.test\nE2E_DOMAIN_ADMIN_PASSWORD=hand\n",
      );
      const result = await run(["use", "main"]);
      expect(result.status).toBe(0);
      expect(result.stdout.match(/^warning:/gm)).toHaveLength(1);
      expect(result.stdout).toContain(
        "warning: main has no password for E2E_PROJECT_ADMIN. (E2E_PROJECT_ADMIN is not read by e2e yet.)",
      );
      expect(result.stdout).toContain(
        "also: user2@example.test — pass the email to pick one",
      );
      const dev = read(".env.development.local");
      expect(dev).toContain("VITE_THEME_HEADER_COLOR=#7C3AED");
      expect(dev).toContain(
        "VITE_DEFAULT_API_ENDPOINT=https://main.example.test:8090",
      );
      expect(dev).toContain("VITE_DEFAULT_EMAIL=user@example.test");
      expect(dev).toContain("VITE_DEFAULT_PASSWORD=pw-user");
      const playwright = read("e2e/envs/.env.playwright");
      expect(playwright).toMatch(
        /^# mine\nE2E_MONITOR_EMAIL=mon@example\.test\nE2E_MONITOR_PASSWORD=hand\nE2E_DOMAIN_ADMIN_EMAIL=da@example\.test\nE2E_DOMAIN_ADMIN_PASSWORD=hand\n/,
      );
      expect(playwright).toContain(
        "E2E_WEBSERVER_ENDPOINT=https://main.example.test:8090",
      );
      expect(playwright).toContain("E2E_ADMIN_PASSWORD=pw-admin");
      expect(playwright).toContain("E2E_USER_EMAIL=user@example.test");
      expect(playwright).toContain("E2E_USER2_EMAIL=user2@example.test");
      expect(playwright).toContain("E2E_USER2_PASSWORD=pw-user2");
      expect(playwright).toContain("E2E_PROJECT_ADMIN_EMAIL=pa@example.test");
      expect(playwright).not.toContain("E2E_PROJECT_ADMIN_PASSWORD");
    });

    it("writes config.toml from the sample, the server's switches and --set", async () => {
      const result = await run([
        "use",
        "main",
        "--set",
        "resources.openPortToPublic=true",
        "--set=general.maxCountForPreopenPorts=3",
      ]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(
        'wrote config.toml (switches of main, set resources.openPortToPublic=true, general.maxCountForPreopenPorts=3)',
      );
      const config = read("config.toml");
      expect(config.startsWith("# Written by `pnpm run dev-env use`")).toBe(true);
      expect(config).toContain(
        "overrides: resources.openPortToPublic = true, general.maxCountForPreopenPorts = 3",
      );
      expect(config).toContain('connectionMode = "SESSION"');
      expect(config).toContain("enableModelFolders = true  # Enable model folders");
      expect(config).toContain("signupSupport = false");
      expect(config).toContain("maxCountForPreopenPorts = 3");
      expect(config).toContain(
        "openPortToPublic = true  # Show option to open app proxy port to anyone.",
      );
      expect(config).toContain('#apiEndpointText = "[Placeholder text]"');
      expect(config).toContain('#page = "test-plugin1"');
      expect(config).not.toContain('page = "a,b"');

      // A second `use` rewrites the generated file; the overrides are gone.
      const again = await run(["use", "lts"]);
      expect(again.status).toBe(0);
      expect(again.stdout).toContain("wrote config.toml (sample defaults)");
      const rewritten = read("config.toml");
      expect(rewritten).toContain("sample defaults (lts serves no config.toml)");
      expect(rewritten).toContain('#connectionMode = "[API or SESSION]"');
      expect(rewritten).toContain("openPortToPublic = false");
    });

    it("keeps a hand-written config.toml and applies --set to it in place", async () => {
      fs.writeFileSync(
        path.join(root, "config.toml"),
        '[general]\nconnectionMode = "API" # mine\n\n[resources]\n#openPortToPublic = false\n',
      );
      const kept = await run(["use", "main"]);
      expect(kept.status).toBe(0);
      expect(kept.stdout).toContain("kept config.toml (hand-written;");
      expect(read("config.toml")).toBe(
        '[general]\nconnectionMode = "API" # mine\n\n[resources]\n#openPortToPublic = false\n',
      );
      const set = await run(["use", "main", "--set", "resources.openPortToPublic=true"]);
      expect(set.status).toBe(0);
      expect(set.stdout).toContain(
        "kept config.toml (hand-written), set resources.openPortToPublic=true",
      );
      expect(read("config.toml")).toBe(
        '[general]\nconnectionMode = "API" # mine\n\n[resources]\nopenPortToPublic = true\n',
      );
    });

    it("rejects a malformed --set with usage, writing nothing", async () => {
      for (const args of [
        ["use", "main", "--set"],
        ["use", "main", "--set", "debug=true"],
        ["use", "main", "--set", "a..b=true"],
        ["use", "main", "--set", "resources.=true"],
        ["use", "main", "--set", "resources.openPortToPublic"],
      ]) {
        const result = await run(args);
        expect(result.status, args.join(" ")).toBe(2);
        expect(result.stderr).toContain("<section>.<key>=<value>");
        expect(result.stderr).toContain("Usage: pnpm run dev-env");
        expect(result.stdout).toBe("");
      }
      expect(fs.existsSync(path.join(root, "config.toml"))).toBe(false);
    });

    it("seeds a new E2E file from the sample", async () => {
      const result = await run(["use", "lts"]);
      expect(result.status).toBe(0);
      const playwright = read("e2e/envs/.env.playwright");
      expect(playwright).toContain("# sample");
      expect(playwright).toContain("E2E_USER_EMAIL=lts-user@example.test");
      expect(playwright).not.toContain("E2E_USER2_EMAIL");
    });

    it("picks an account by email, or the first of a role with a note", async () => {
      const byEmail = await run(["use", "main", "USER2@example.test"]);
      expect(byEmail.status).toBe(0);
      expect(byEmail.stdout).not.toContain("also:");
      expect(read(".env.development.local")).toContain(
        "VITE_DEFAULT_EMAIL=user2@example.test",
      );

      const get = await run(["get", "main", "user", "--json"]);
      expect(get.status).toBe(0);
      expect(JSON.parse(get.stdout).email).toBe("user@example.test");
      expect(get.stderr).toContain(
        "also: user2@example.test — pass the email to pick one",
      );

      const unknown = await run(["use", "main", "monitor"]);
      expect(unknown.status).toBe(1);
      expect(unknown.stderr).toContain(
        'Server "main" has no account "monitor". Roles: user, admin, project-admin; emails: ',
      );
      expect(unknown.stderr).toContain("pa@example.test");
    });

    it("writes no password line for an account without one, with one note", async () => {
      await run(["use", "main"]);
      const result = await run(["use", "main", "project-admin"]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("password not pre-filled");
      expect(
        result.stdout.match(/note: the catalog has no password/g),
      ).toHaveLength(1);
      const dev = read(".env.development.local");
      expect(dev).toContain("VITE_DEFAULT_EMAIL=pa@example.test");
      expect(dev).not.toContain("VITE_DEFAULT_PASSWORD");
      expect(dev).not.toMatch(/PASSWORD=\s*$/m);
    });

    it("keeps a hand-written password for the same email and drops it when the account changes", async () => {
      const body = catalogBody();
      const mainUser = body.servers
        .find((s) => s.name === "main")
        .accounts.find((a) => a.role === "user");
      mainUser.password = null;
      fs.writeFileSync(catalogPath, JSON.stringify(body));
      fs.writeFileSync(
        path.join(root, "e2e", "envs", ".env.playwright"),
        "E2E_USER_EMAIL=User@Example.test\nE2E_USER_PASSWORD=hand-written\n",
      );

      const kept = await run(["use", "main", "user"]);
      expect(kept.status).toBe(0);
      expect(kept.stdout).toContain(
        "kept the password already in e2e/envs/.env.playwright for user@example.test",
      );
      const playwright = read("e2e/envs/.env.playwright");
      expect(playwright).toContain("E2E_USER_EMAIL=user@example.test");
      expect(playwright).toContain("E2E_USER_PASSWORD=hand-written");

      mainUser.email = "other-user@example.test";
      fs.writeFileSync(catalogPath, JSON.stringify(body));
      const changed = await run(["use", "main", "user"]);
      expect(changed.status).toBe(0);
      expect(changed.stdout).not.toContain("kept the password");
      const after = read("e2e/envs/.env.playwright");
      expect(after).toContain("E2E_USER_EMAIL=other-user@example.test");
      expect(after).not.toContain("E2E_USER_PASSWORD");
    });

    it("keeps a hand-written pre-fill password instead of printing the note", async () => {
      fs.writeFileSync(
        path.join(root, ".env.development.local"),
        "VITE_DEFAULT_EMAIL=pa@example.test\nVITE_DEFAULT_PASSWORD=hand-written\n",
      );
      const result = await run(["use", "main", "project-admin"]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(
        "kept the password already in .env.development.local for pa@example.test",
      );
      expect(result.stdout).not.toContain("note: the catalog has no password");
      expect(result.stdout).not.toContain("password not pre-filled");
      expect(read(".env.development.local")).toContain(
        "VITE_DEFAULT_PASSWORD=hand-written",
      );

      const noPassword = await run([
        "use",
        "main",
        "project-admin",
        "--no-password",
      ]);
      expect(noPassword.status).toBe(0);
      expect(read(".env.development.local")).not.toContain(
        "VITE_DEFAULT_PASSWORD",
      );
    });

    it("drops the password line with --no-password, without a note", async () => {
      await run(["use", "main"]);
      const result = await run(["use", "main", "admin", "--no-password"]);
      expect(result.status).toBe(0);
      expect(result.stdout).not.toContain("note: the catalog has no password");
      const dev = read(".env.development.local");
      expect(dev).toContain("VITE_DEFAULT_EMAIL=admin@example.test");
      expect(dev).not.toContain("VITE_DEFAULT_PASSWORD");
    });

    it("still uses a down server, warning once with the error and last live time", async () => {
      const result = await run(["use", "lts"]);
      expect(result.status).toBe(0);
      const warnings = result.stdout
        .split("\n")
        .filter((line) => line.startsWith("warning: lts was down"));
      expect(warnings).toEqual([
        expect.stringMatching(
          /^warning: lts was down at the last probe \(.+\): connect ECONNREFUSED; last live 2026-10-06T22:00:00Z\.$/,
        ),
      ]);
      expect(read(".env.development.local")).toContain(
        "VITE_DEFAULT_API_ENDPOINT=https://lts.example.test",
      );

      const get = await run(["get", "lts", "user", "--json"]);
      expect(get.status).toBe(0);
      expect(JSON.parse(get.stdout).password).toBe("pw-lts");
      expect(get.stderr).toContain("warning: lts was down at the last probe");
    });

    it("shows each server's manager settings in list", async () => {
      const result = await run(["list"]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(
        "  config: SESSION -signupSupport +enableModelFolders plugin.page=a,b\n",
      );
      expect(result.stdout).toContain("  config: none (HTTP 404)");
      expect(result.stdout).toContain("  config: none (not checked yet)");
      const json = JSON.parse((await run(["list", "--json"])).stdout);
      expect(json.servers.find((s) => s.name === "main").status.config).toEqual(
        catalogBody().servers[0].status.config,
      );
    });

    it("prints the manager settings table with `config`", async () => {
      const result = await run(["config", "main"]);
      expect(result.status).toBe(0);
      expect(result.stdout).toMatch(/^ {2}general\.connectionMode +SESSION$/m);
      expect(result.stdout).toMatch(/^ {2}general\.enableModelFolders +true$/m);
      expect(result.stdout).toMatch(/^ {2}general\.force2FA +— \(not set\)$/m);
      expect(result.stdout).toMatch(/^ {2}plugin\.page +a,b$/m);
      expect(result.stdout).not.toContain("apiEndpointText");

      const all = await run(["config", "main", "--all"]);
      expect(all.status).toBe(0);
      expect(all.stdout).toMatch(/^ {2}general\.apiEndpointText +Main$/m);
      expect(all.stdout).not.toContain("force2FA");

      const json = JSON.parse((await run(["config", "main", "--json"])).stdout);
      expect(json).toMatchObject({ server: "main", configError: null });
      expect(json.settings).toContainEqual({
        key: "general.signupSupport",
        value: false,
        present: true,
      });
      expect(json.settings).toContainEqual({
        key: "pipeline.*",
        value: null,
        present: false,
      });

      const none = await run(["config", "lts"]);
      expect(none.status).toBe(0);
      expect(none.stdout).toContain("config: none (HTTP 404)");
    });

    it("exits 1 for `config` on an unknown server and 2 without one", async () => {
      const unknown = await run(["config", "nope"]);
      expect(unknown.status).toBe(1);
      expect(unknown.stderr).toContain('Unknown server "nope"');
      expect((await run(["config"])).status).toBe(2);
    });

    it("exits 1 and names the known servers for an unknown one", async () => {
      const result = await run(["use", "nope"]);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(
        'Unknown server "nope". Known: lts, main, new',
      );
    });

    it("warns about E2E slots that fall back to the sample defaults", async () => {
      const result = await run(["use", "lts"]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(
        "warning: lts has no account for E2E_ADMIN, E2E_USER2, E2E_PROJECT_ADMIN. " +
          "e2e will fall back to the sample default credentials for E2E_ADMIN, E2E_USER2. " +
          "(E2E_PROJECT_ADMIN is not read by e2e yet.)",
      );
    });

    it("tightens an existing env file to 0600", async () => {
      const dev = path.join(root, ".env.development.local");
      const e2e = path.join(root, "e2e", "envs", ".env.playwright");
      fs.writeFileSync(e2e, "# mine\n");
      fs.chmodSync(dev, 0o644);
      fs.chmodSync(e2e, 0o644);
      expect((await run(["use", "main"])).status).toBe(0);
      expect(fs.statSync(dev).mode & 0o777).toBe(0o600);
      expect(fs.statSync(e2e).mode & 0o777).toBe(0o600);
    });

    it("rejects an option the command does not take, writing nothing", async () => {
      const before = read(".env.development.local");
      for (const args of [
        ["use", "main", "user", "--no-passwords"],
        ["use", "main", "--json"],
        ["status", "--json"],
        ["list", "--all"],
        ["get", "main", "user", "--no-password"],
        ["config", "main", "--no-password"],
      ]) {
        const result = await run(args);
        expect(result.status, args.join(" ")).toBe(2);
        expect(result.stderr).toContain(`Unknown option ${args.at(-1)}`);
        expect(result.stderr).toContain("Usage: pnpm run dev-env");
        expect(result.stdout).toBe("");
      }
      expect(read(".env.development.local")).toBe(before);
      expect(
        fs.existsSync(path.join(root, "e2e", "envs", ".env.playwright")),
      ).toBe(false);
    });

    it("exits 2 with usage when `use` has no server", async () => {
      const result = await run(["use"]);
      expect(result.status).toBe(2);
      expect(result.stderr).toContain("Usage: pnpm run dev-env");
    });
  });

  describe("over HTTP (WEBUI_DEV_ENV_CATALOG_URL)", () => {
    let server;
    let url;
    let respond;

    beforeEach(async () => {
      respond = (_req, res) => {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(catalogBody()));
      };
      server = http.createServer((req, res) => respond(req, res));
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      url = `http://127.0.0.1:${server.address().port}/api/catalog`;
    });

    afterEach(async () => {
      await new Promise((resolve) => server.close(resolve));
    });

    const viaUrl = (catalogUrl) => ({
      WEBUI_DEV_ENV_CATALOG: undefined,
      WEBUI_DEV_ENV_CATALOG_URL: catalogUrl,
    });

    it("reads the catalog from the URL", async () => {
      const requests = [];
      const serve = respond;
      respond = (req, res) => {
        requests.push(req.url);
        serve(req, res);
      };
      const status = await run(["status"], viaUrl(url));
      expect(status.status).toBe(0);
      expect(status.stdout).toContain(
        `source: ${url} (WEBUI_DEV_ENV_CATALOG_URL)`,
      );
      expect(status.stdout).toContain("catalog: 3 server(s), 5 account(s)");

      const use = await run(["use", "main", "admin"], viaUrl(url));
      expect(use.status).toBe(0);
      expect(read(".env.development.local")).toContain(
        "VITE_DEFAULT_PASSWORD=pw-admin",
      );
      expect(requests).toEqual(["/api/catalog", "/api/catalog"]);
    });

    it("rejects an unknown option before asking the board", async () => {
      let requests = 0;
      respond = (_req, res) => {
        requests += 1;
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(catalogBody()));
      };
      const result = await run(
        ["use", "main", "user", "--no-passwords"],
        viaUrl(url),
      );
      expect(result.status).toBe(2);
      expect(requests).toBe(0);
    });

    it("exits 1 naming the URL when the board answers 500", async () => {
      respond = (_req, res) => {
        res.writeHead(500);
        res.end("boom");
      };
      const result = await run(["list"], viaUrl(url));
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(url);
      expect(result.stderr).toContain("HTTP 500");
    });

    it("exits 1 naming the URL when the body is not JSON", async () => {
      respond = (_req, res) => {
        res.writeHead(200);
        res.end("<html>");
      };
      const result = await run(["list"], viaUrl(url));
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(`${url} did not return JSON`);
    });

    it("exits 1 naming the URL when nothing listens", async () => {
      const closed = url.replace(/:\d+\//, ":1/");
      const result = await run(["list"], viaUrl(closed));
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(
        `Could not reach the catalog at ${closed}`,
      );
    });
  });

  describe("compat", () => {
    const policyBody = () => ({
      ...catalogBody(),
      servers: [
        ...catalogBody().servers,
        {
          name: "lts-26-4",
          endpoint: "https://lts-26-4.example.test",
          tracks: "26.4",
          status: {
            live: true,
            checked_at: minutesAgo(1),
            manager_version: "26.4.13",
            expected_version: "26.4.13",
            freshness: "current",
          },
          accounts: [],
        },
      ],
      upstream: {
        main_version: "26.9.0rc1",
        lines: { "26.4": "26.4.13", "26.8": "26.8.9", "26.9": "26.9.4" },
      },
      policy: {
        updated_at: "2026-10-07T04:00:00Z",
        webui: {
          branches: {
            main: { min_manager_line: "26.4" },
            "26.9": { min_manager_line: "26.8" },
          },
        },
      },
    });
    const writeSource = (relativePath, lines) => {
      const target = path.join(root, relativePath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, lines.join("\n"));
    };

    beforeEach(() => {
      fs.writeFileSync(catalogPath, JSON.stringify(policyBody()));
      writeSource("react/src/components/Old.tsx", [
        "const supportsOld = baiClient.isManagerVersionCompatibleWith('26.4.2');",
        "const supportsNew = baiClient.isManagerVersionCompatibleWith('26.9.0');",
      ]);
      writeSource("react/src/components/Mid.tsx", [
        "graphql`",
        '  field @since(version: "26.7.0")',
        "`;",
      ]);
      writeSource("react/src/__generated__/Old.graphql.ts", [
        "// isManagerVersionCompatibleWith('26.4.2')",
      ]);
      writeSource("react/src/components/Old.test.tsx", [
        "isManagerVersionCompatibleWith('24.0.0')",
      ]);
      writeSource("packages/backend.ai-ui/src/components/Old.doc.ts", [
        "code: `baiClient.isManagerVersionCompatibleWith('24.0.0')`",
      ]);
      writeSource("packages/backend.ai-client/src/client.ts", [
        'const legacy = this.isManagerVersionCompatibleWith("26.4.0");',
      ]);
    });

    it("reports main's floor, its range with servers and gaps, and the gates at or below the floor", async () => {
      // The temp root is no git checkout, so the branch falls back to main.
      const result = await run(["compat"]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("branch: main\n");
      expect(result.stdout).toContain("floor: 26.4 line (latest patch 26.4.13)");
      expect(result.stdout).toContain("range: 26.4 … main (26.9.0rc1), every line at its latest patch");
      expect(result.stdout).toContain("  26.4 (26.4.13)    lts-26-4");
      expect(result.stdout).toContain("  26.8 (26.8.9)     — no server");
      expect(result.stdout).toContain("  main (26.9.0rc1)  — no server");
      expect(result.stdout).toContain("below the floor: main");
      expect(result.stdout).toContain("warning: no live server on 26.8, 26.9, main — coverage gap");
      expect(result.stdout).toContain(
        "gates at or below the 26.4 line (2; deletable per ADR 0010):\n" +
          "  packages/backend.ai-client/src/client.ts:1  isManagerVersionCompatibleWith(26.4.0)\n" +
          "  react/src/components/Old.tsx:1  isManagerVersionCompatibleWith(26.4.2)",
      );
      expect(result.stdout).not.toContain("isManagerVersionCompatibleWith(26.9.0)");
      expect(result.stdout).not.toContain("__generated__");
      expect(result.stdout).not.toContain("Old.test");
      expect(result.stdout).not.toContain("Old.doc");
      expect(result.stdout).not.toMatch(/target/i);
    });

    it("reads a release branch's own entry with --branch, as JSON", async () => {
      const result = await run(["compat", "--branch", "26.9", "--json"]);
      expect(result.status).toBe(0);
      const report = JSON.parse(result.stdout);
      expect(report).toMatchObject({
        available: true,
        branch: "26.9",
        maintained: true,
        floor: "26.8",
        upper: "26.9",
        floorVersion: "26.8.9",
        upperVersion: "26.9.4",
        lines: [
          { line: "26.8", latest: "26.8.9", servers: [] },
          { line: "26.9", latest: "26.9.4", servers: [] },
        ],
        belowFloorServers: ["lts-26-4", "main"],
        gateFloorLine: "26.8",
        policyUpdatedAt: "2026-10-07T04:00:00Z",
      });
      expect(report).not.toHaveProperty("target");
      expect(report.gates).toEqual([
        { file: "packages/backend.ai-client/src/client.ts", line: 1, kind: "isManagerVersionCompatibleWith", versions: ["26.4.0"] },
        { file: "react/src/components/Mid.tsx", line: 2, kind: "@since", versions: ["26.7.0"] },
        { file: "react/src/components/Old.tsx", line: 1, kind: "isManagerVersionCompatibleWith", versions: ["26.4.2"] },
      ]);
    });

    it("compares gates against main's VERSION line when the floor is main", async () => {
      const body = policyBody();
      body.policy.webui.branches.main = { min_manager_line: "main" };
      fs.writeFileSync(catalogPath, JSON.stringify(body));
      const result = await run(["compat"]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("floor: main (backend.ai main branch, 26.9.0rc1)");
      expect(result.stdout).toContain("gates at or below the 26.9 line (main's VERSION) (4; deletable per ADR 0010):");
      expect(result.stdout).toContain("react/src/components/Mid.tsx:2  @since(26.7.0)");
    });

    it("maps a feature branch to main and a missing release branch to not maintained", async () => {
      const feature = await run(["compat", "--branch=feat/gh-1-x"]);
      expect(feature.status).toBe(0);
      expect(feature.stdout).toContain("branch: main\n");
      const missing = await run(["compat", "--branch", "26.5"]);
      expect(missing.status).toBe(0);
      expect(missing.stdout).toContain(
        'policy: not maintained — the catalog policy has no entry for "26.5"; maintained: main, 26.9',
      );
      expect(missing.stdout).not.toContain("gates");
    });

    it("shows the policy in status without any target", async () => {
      const result = await run(["status"]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("policy: main floor 26.4; 26.9 floor 26.8");
      expect(result.stdout).not.toMatch(/target/i);
    });

    it("exits 0 with one notice for an old board without policy", async () => {
      fs.writeFileSync(catalogPath, JSON.stringify(catalogBody()));
      const result = await run(["compat"]);
      expect(result.status).toBe(0);
      expect(result.stdout.trim().split("\n")).toHaveLength(1);
      expect(result.stdout).toContain('has no "policy"');
      const json = await run(["compat", "--json"]);
      expect(JSON.parse(json.stdout)).toMatchObject({ available: false, branch: "main" });
    });

    it("exits 0 with one notice when there is no gateway or the board is unreachable", async () => {
      const none = await run(["compat"], { WEBUI_DEV_ENV_CATALOG: undefined });
      expect(none.status).toBe(0);
      expect(none.stdout).toContain("compat: no policy to read — No dev box gateway configured");
      expect(none.stderr).toBe("");
      const closed = await run(["compat"], {
        WEBUI_DEV_ENV_CATALOG: undefined,
        WEBUI_DEV_ENV_CATALOG_URL: "http://127.0.0.1:1/api/catalog",
      });
      expect(closed.status).toBe(0);
      expect(closed.stdout).toContain("compat: no policy to read — Could not reach the catalog");
    });

    it("rejects a --branch without a name, including one followed by another option", async () => {
      const result = await run(["compat", "--branch"]);
      expect(result.status).toBe(2);
      expect(result.stderr).toContain("--branch needs a branch name");
      const swallowed = await run(["compat", "--branch", "--json"]);
      expect(swallowed.status).toBe(2);
      expect(swallowed.stderr).toContain("--branch needs a branch name");
      expect(swallowed.stdout).toBe("");
    });
  });

  it("exits 1 with the join hint when no gateway is configured", async () => {
    const result = await run(["list"], { WEBUI_DEV_ENV_CATALOG: undefined });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("No dev box gateway configured");
    expect(result.stderr).toContain(
      path.join(root, ".config", "fw", "dev-gw.json"),
    );
    expect(result.stderr).toContain("dev-gw join");
    expect(result.stderr).toContain("WEBUI_DEV_ENV_CATALOG_URL");
  });

  it("derives the board's catalog URL from the dev-gw domain", async () => {
    // `.invalid` never resolves (RFC 2606), so no request leaves the box.
    const config = path.join(root, "dev-gw.json");
    fs.writeFileSync(config, JSON.stringify({ domain: "example.invalid" }));
    const result = await run(["status"], {
      WEBUI_DEV_ENV_CATALOG: undefined,
      DEV_GW_CONFIG: config,
    });
    expect(result.stdout).toContain(
      "source: http://board.example.invalid/api/catalog",
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "Could not reach the catalog at http://board.example.invalid/api/catalog",
    );
  });

  it("treats a dev-gw config without a domain as missing", async () => {
    const config = path.join(root, "dev-gw.json");
    fs.writeFileSync(config, JSON.stringify({ box: "x" }));
    const result = await run(["status"], {
      WEBUI_DEV_ENV_CATALOG: undefined,
      DEV_GW_CONFIG: config,
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(`${config} is missing or has no "domain"`);
  });
});
