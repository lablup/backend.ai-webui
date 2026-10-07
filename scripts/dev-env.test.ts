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
      verified_at: null,
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
          verified_at: null,
        },
        {
          role: "admin",
          email: "admin@example.test",
          password: "pw-admin",
          tags: [],
          notes: "",
          verified_at: null,
        },
        {
          role: "monitor",
          email: "monitor@example.test",
          password: null,
          tags: [],
          notes: "",
          verified_at: null,
        },
      ],
    },
    {
      name: "lts",
      endpoint: "https://lts.example.test",
      tags: [],
      notes: "",
      verified_at: null,
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
          verified_at: null,
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
        "admin",
        "monitor",
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
        "catalog: 3 server(s), 4 account(s), 1 without a password",
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
      const result = await run(["use", "main"]);
      expect(result.status).toBe(0);
      expect(result.stdout).not.toContain("warning:");
      const dev = read(".env.development.local");
      expect(dev).toContain("VITE_THEME_HEADER_COLOR=#7C3AED");
      expect(dev).toContain(
        "VITE_DEFAULT_API_ENDPOINT=https://main.example.test:8090",
      );
      expect(dev).toContain("VITE_DEFAULT_EMAIL=user@example.test");
      expect(dev).toContain("VITE_DEFAULT_PASSWORD=pw-user");
      const playwright = read("e2e/envs/.env.playwright");
      expect(playwright).toContain("# sample");
      expect(playwright).toContain(
        "E2E_WEBSERVER_ENDPOINT=https://main.example.test:8090",
      );
      expect(playwright).toContain("E2E_ADMIN_PASSWORD=pw-admin");
      expect(playwright).toContain("E2E_MONITOR_EMAIL=monitor@example.test");
      expect(playwright).not.toContain("E2E_MONITOR_PASSWORD");
      expect(playwright).not.toContain("E2E_USER2_EMAIL");
    });

    it("writes no password line for an account without one, with one note", async () => {
      await run(["use", "main"]);
      const result = await run(["use", "main", "monitor"]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("password not pre-filled");
      expect(
        result.stdout.match(/note: the catalog has no password/g),
      ).toHaveLength(1);
      const dev = read(".env.development.local");
      expect(dev).toContain("VITE_DEFAULT_EMAIL=monitor@example.test");
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
        "VITE_DEFAULT_EMAIL=monitor@example.test\nVITE_DEFAULT_PASSWORD=hand-written\n",
      );
      const result = await run(["use", "main", "monitor"]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(
        "kept the password already in .env.development.local for monitor@example.test",
      );
      expect(result.stdout).not.toContain("note: the catalog has no password");
      expect(result.stdout).not.toContain("password not pre-filled");
      expect(read(".env.development.local")).toContain(
        "VITE_DEFAULT_PASSWORD=hand-written",
      );

      const noPassword = await run(["use", "main", "monitor", "--no-password"]);
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
        .filter((line) => line.startsWith("warning:"));
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
      expect(status.stdout).toContain("catalog: 3 server(s), 4 account(s)");

      const use = await run(["use", "main", "admin"], viaUrl(url));
      expect(use.status).toBe(0);
      expect(read(".env.development.local")).toContain(
        "VITE_DEFAULT_PASSWORD=pw-admin",
      );
      expect(requests).toEqual(["/api/catalog", "/api/catalog"]);
    });

    it("exits 1 naming the URL when the gateway answers 500", async () => {
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
