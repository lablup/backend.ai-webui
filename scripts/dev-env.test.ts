// @ts-nocheck
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "dev-env.mjs",
);

const ITEMS = [
  {
    type: 2,
    name: "webui-dev/main",
    notes: "Tracks manager main.",
    fields: [{ name: "endpoint", value: "https://main.example.test:8090" }],
  },
  {
    type: 1,
    name: "webui-dev/main/user",
    login: { username: "user@example.test", password: "pw-user" },
  },
  {
    type: 1,
    name: "webui-dev/main/admin",
    login: { username: "admin@example.test", password: "pw-admin" },
  },
];

describe("dev-env CLI", () => {
  let root;
  let catalogPath;

  const run = (args, env = {}) => {
    const childEnv = {
      ...process.env,
      WEBUI_DEV_ENV_ROOT: root,
      WEBUI_DEV_ENV_CATALOG: catalogPath,
      ...env,
    };
    for (const key of Object.keys(childEnv)) {
      if (childEnv[key] === undefined || key.startsWith("VITE_DEFAULT_")) {
        delete childEnv[key];
      }
    }
    return spawnSync(process.execPath, [SCRIPT, ...args], {
      encoding: "utf8",
      env: childEnv,
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
    fs.writeFileSync(catalogPath, JSON.stringify(ITEMS));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("lists servers and accounts without passwords", () => {
    const result = run(["list"]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("main  https://main.example.test:8090");
    expect(result.stdout).toContain("- user [team]  user@example.test");
    expect(result.stdout).not.toContain("pw-");
  });

  it("prints the redacted catalog as JSON", () => {
    const result = run(["list", "--json"]);
    expect(result.status).toBe(0);
    const catalog = JSON.parse(result.stdout);
    expect(catalog.servers).toHaveLength(1);
    expect(catalog.servers[0]).toMatchObject({
      name: "main",
      endpoint: "https://main.example.test:8090",
    });
    expect(catalog.servers[0].accounts.map((a) => a.role)).toEqual([
      "admin",
      "user",
    ]);
    expect(result.stdout).not.toContain("pw-");
    expect(result.stdout).not.toContain(`"password":`);
    expect(catalog.warnings).toEqual([]);
  });

  it("gets one account with its password", () => {
    const result = run(["get", "main", "admin", "--json"]);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      server: "main",
      endpoint: "https://main.example.test:8090",
      role: "admin",
      email: "admin@example.test",
      password: "pw-admin",
    });
  });

  it("writes both env files and keeps unrelated lines", () => {
    const result = run(["use", "main"]);
    expect(result.status).toBe(0);
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
    expect(playwright).not.toContain("E2E_MONITOR_EMAIL");
  });

  it("drops the password line with --no-password", () => {
    run(["use", "main"]);
    const result = run(["use", "main", "admin", "--no-password"]);
    expect(result.status).toBe(0);
    const dev = read(".env.development.local");
    expect(dev).toContain("VITE_DEFAULT_EMAIL=admin@example.test");
    expect(dev).not.toContain("VITE_DEFAULT_PASSWORD");
  });

  it("exits 1 and names the known servers for an unknown one", () => {
    const result = run(["use", "nope"]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Unknown server "nope". Known: main');
  });

  it("exits 2 with usage when `use` has no server", () => {
    const result = run(["use"]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Usage: pnpm run dev-env");
  });

  it("points at `dev-gw enroll` when the gateway refuses the box", () => {
    const bin = path.join(root, "bin");
    fs.mkdirSync(bin);
    fs.writeFileSync(
      path.join(bin, "dev-gw"),
      "#!/bin/sh\n# usage: dev-gw catalog\necho 'not enrolled: run dev-gw enroll' >&2\nexit 3\n",
      { mode: 0o755 },
    );
    const result = run(["list"], {
      WEBUI_DEV_ENV_CATALOG: undefined,
      PATH: `${bin}${path.delimiter}${process.env.PATH}`,
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Run `dev-gw enroll`");
    expect(result.stderr).toContain("not enrolled: run dev-gw enroll");
  });

  describe("through a stub dev-gw", () => {
    const PUBLIC_ITEMS = [
      ITEMS[0],
      {
        ...ITEMS[1],
        login: { username: "user@example.test", password: null },
        password_in: "bitwarden",
      },
      {
        ...ITEMS[2],
        login: { username: "admin@example.test", password: null },
        password_in: "bitwarden",
      },
    ];
    // Records its arguments, then plays `dev-gw catalog --fallback-public`.
    const stub = (items, { fellBack }) => {
      const bin = path.join(root, "bin");
      fs.mkdirSync(bin, { recursive: true });
      fs.writeFileSync(path.join(root, "items.json"), JSON.stringify(items));
      fs.writeFileSync(
        path.join(bin, "dev-gw"),
        [
          "#!/bin/sh",
          "# usage: dev-gw catalog [--public] [--fallback-public]",
          `echo "$@" > '${path.join(root, "args")}'`,
          fellBack
            ? "echo 'no catalog key at ~/.ssh/dev-gw-catalog — run: dev-gw enroll' >&2\n" +
              "echo 'falling back to the redacted copy (http://dev-gw.example.test/api/catalog)' >&2"
            : "",
          `cat '${path.join(root, "items.json")}'`,
          "",
        ].join("\n"),
        { mode: 0o755 },
      );
      return {
        WEBUI_DEV_ENV_CATALOG: undefined,
        PATH: `${bin}${path.delimiter}${process.env.PATH}`,
      };
    };

    it("reports the public view and writes no password for a team account", () => {
      const env = stub(PUBLIC_ITEMS, { fellBack: true });

      const status = run(["status"], env);
      expect(status.status).toBe(0);
      expect(fs.readFileSync(path.join(root, "args"), "utf8").trim()).toBe(
        "catalog --fallback-public",
      );
      expect(status.stdout).toContain(
        "view: public view — run dev-gw enroll for team passwords",
      );
      expect(status.stdout).toContain("2 without a password");

      const use = run(["use", "main", "user"], env);
      expect(use.status).toBe(0);
      expect(use.stdout).toContain("main/user is a team-tier account");
      expect(use.stdout).toContain("dev-gw enroll");
      const dev = read(".env.development.local");
      expect(dev).toContain("VITE_DEFAULT_EMAIL=user@example.test");
      expect(dev).not.toContain("VITE_DEFAULT_PASSWORD");
      const playwright = read("e2e/envs/.env.playwright");
      expect(playwright).toContain("E2E_ADMIN_EMAIL=admin@example.test");
      expect(playwright).not.toContain("PASSWORD");

      const get = run(["get", "main", "admin", "--json"], env);
      expect(get.status).toBe(0);
      expect(JSON.parse(get.stdout)).toMatchObject({
        email: "admin@example.test",
        password: null,
        passwordAvailable: false,
      });
      expect(get.stderr).toContain("main/admin is a team-tier account");
    });

    it("reports the full view and writes the password", () => {
      const env = stub(ITEMS, { fellBack: false });

      const status = run(["status"], env);
      expect(status.status).toBe(0);
      expect(status.stdout).toContain("view: full (team) view");

      const use = run(["use", "main", "user"], env);
      expect(use.status).toBe(0);
      expect(use.stdout).not.toContain("team-tier");
      expect(read(".env.development.local")).toContain(
        "VITE_DEFAULT_PASSWORD=pw-user",
      );
      expect(read("e2e/envs/.env.playwright")).toContain(
        "E2E_ADMIN_PASSWORD=pw-admin",
      );
    });
  });

  it("refuses a dev-gw too old to know `catalog` instead of running it", () => {
    const bin = path.join(root, "bin");
    const marker = path.join(root, "ran");
    fs.mkdirSync(bin);
    fs.writeFileSync(
      path.join(bin, "dev-gw"),
      `#!/bin/sh\ntouch '${marker}'\n`,
      { mode: 0o755 },
    );
    const result = run(["list"], {
      WEBUI_DEV_ENV_CATALOG: undefined,
      PATH: `${bin}${path.delimiter}${process.env.PATH}`,
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("predates `dev-gw catalog`");
    expect(fs.existsSync(marker)).toBe(false);
  });
});
