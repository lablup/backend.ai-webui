/**
 * Per-test resource registry for e2e-agent tests. A test declares every
 * resource it uses through the `resources` fixture, runs only against those,
 * and the fixture removes them after the test, including when the test failed
 * or timed out.
 *
 *   import { test } from "../utils/test-resources";
 *
 *   test("...", { session: "admin" }, async ({ agent, resources }) => {
 *     const folder = resources.vfolder("rename"); // the flow creates it
 *     const member = await resources.createUser("rename"); // the API creates it
 *     await agent.act("Create a folder named {name}", {
 *       params: { name: unique(folder) },
 *     });
 *   });
 *
 * Removal goes through the admin API, signed in from Node, so it does not
 * depend on the page or on who the browser is signed in as. `cleanup()` is
 * idempotent: a declared resource that does not exist (never created, or
 * deleted by the flow under test) is a no-op. It never throws, so it cannot
 * mask the test's own result: a failed removal is warned by name and stays
 * registered. The nightly runner's leak check reports what is still there.
 *
 * Names are prefixed so that only disposable resources can be declared:
 * `e2e-agent-*` for sessions, folders and projects, `test-agent-*@lablup.com`
 * for users. User emails must not start with `e2e-`: that prefix is the global
 * Playwright teardown's sweep pattern (`e2e/global-cleanup.teardown.ts`), which
 * can purge an account while a test on another machine is still using it, so
 * these users are removed only by this fixture and the runner's backstop.
 *
 * Purging a user leaves its PERSONAL project behind: the manager keeps it for
 * its retention sweep and refuses to purge it through the API. That row is the
 * one thing a test user leaves, so sign in as admin when the flow does not
 * depend on who the user is.
 */
import { test as base } from "./cleanup";
import { randomBytes } from "node:crypto";

export type TestResourceKind = "session" | "vfolder" | "user" | "project";

export interface TestUser {
  email: string;
  /** The email's local part, also the name of the user's personal project. */
  username: string;
  password: string;
  domain: string;
  /** The GENERAL project the user was added to. */
  project: string;
}

export interface TestProject {
  id: string;
  name: string;
}

export interface TestResources {
  /** Declares a compute session name the flow will create. */
  session(slug: string): string;
  /** Declares a storage folder name the flow will create. */
  vfolder(slug: string): string;
  /** Declares a project name the flow will create. */
  project(slug: string): string;
  /** Declares a user email the flow will create. */
  user(slug: string): string;
  /** Declares an exact name, e.g. the dot-prefixed `.e2e-agent-*` auto-mount folder. */
  declare(kind: TestResourceKind, name: string): string;
  /** Creates and declares an active user with no pending password change. */
  createUser(
    slug: string,
    options?: { role?: "user" | "admin" | "superadmin"; project?: string },
  ): Promise<TestUser>;
  /** Creates and declares a GENERAL project in the e2e domain. */
  createProject(
    slug: string,
    options?: { memberEmails?: string[] },
  ): Promise<TestProject>;
  /** Registers removal of a kind this file does not cover; runs first, last registered first. */
  onCleanup(label: string, remove: () => Promise<void>): void;
  /** Names still registered under `kind`. */
  declared(kind: TestResourceKind): readonly string[];
  /** Removes everything registered. Never throws; resolves to what is left. */
  cleanup(): Promise<string[]>;
}

const REQUEST_TIMEOUT_MS = 20_000;
const SESSION_GONE_TIMEOUT_MS = 30_000;
const FOLDER_TRASHED_TIMEOUT_MS = 10_000;

// Every status from which a session still holds its mounts.
const ACTIVE_SESSION_STATUSES =
  "PENDING,SCHEDULED,PREPARING,PULLING,PREPARED,CREATING,RUNNING,RESTARTING,RUNNING_DEGRADED,ERROR,TERMINATING";
const GONE_FOLDER_STATUSES = new Set([
  "delete-ongoing",
  "delete-complete",
  "deleted",
  "purge-ongoing",
]);

const NAME_PATTERNS: Record<TestResourceKind, RegExp> = {
  session: /^e2e-agent-[\w.-]+$/,
  vfolder: /^\.?e2e-agent-[\w.-]+$/,
  project: /^e2e-agent-[\w.-]+$/,
  user: /^test-agent-[\w.-]+@lablup\.com$/,
};

// Removal order: a session mounts folders, and a user or a project owns them.
const REMOVAL_ORDER: TestResourceKind[] = [
  "session",
  "vfolder",
  "user",
  "project",
];

const quote = (value: string) => JSON.stringify(value);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

// A 404 means another path already removed it.
const expectOk = (response: Response, action: string) => {
  if (!response.ok && response.status !== 404) {
    throw new Error(`${action} failed (status=${response.status})`);
  }
};

/** An admin session on the webserver, for one batch of calls. */
class AdminApi {
  private readonly endpoint: string;
  private cookie = "";

  constructor() {
    const endpoint = process.env.E2E_WEBSERVER_ENDPOINT;
    if (!endpoint) throw new Error("E2E_WEBSERVER_ENDPOINT is not set");
    this.endpoint = endpoint.replace(/\/+$/, "");
  }

  async login() {
    const response = await this.send("POST", "/server/login", {
      username: process.env.E2E_ADMIN_EMAIL,
      password: process.env.E2E_ADMIN_PASSWORD,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body?.authenticated) {
      // Status only: the body is never logged, in case it gains sensitive fields.
      throw new Error(`admin API login failed (status=${response.status})`);
    }
    this.cookie = response.headers
      .getSetCookie()
      .map((cookie) => cookie.split(";")[0])
      .join("; ");
  }

  async logout() {
    await this.send("POST", "/server/logout", {}).catch(() => {});
  }

  send(method: string, path: string, body?: unknown) {
    return fetch(`${this.endpoint}${path}`, {
      method,
      headers: { "content-type": "application/json", cookie: this.cookie },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  }

  async gql<T = any>(query: string, variables?: Record<string, unknown>) {
    const response = await this.send("POST", "/func/admin/gql", {
      query,
      variables,
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok || json?.errors) {
      throw new Error(
        `GraphQL error (${response.status}): ${JSON.stringify(json?.errors ?? json).slice(0, 300)}`,
      );
    }
    return json.data as T;
  }

  async domainName() {
    const override = process.env.E2E_DOMAIN_NAME?.trim();
    if (override) return override;
    const data = await this.gql(`query { user { domain_name } }`);
    if (!data.user?.domain_name) throw new Error("the admin has no domain");
    return data.user.domain_name as string;
  }

  async activeSessions(filter: string) {
    const data = await this.gql(
      `query($status: String, $filter: String) {
        compute_session_list(limit: 100, offset: 0, status: $status, filter: $filter) {
          items { name status access_key }
        }
      }`,
      { status: ACTIVE_SESSION_STATUSES, filter },
    );
    return (data.compute_session_list?.items ?? []) as Array<{
      name: string;
      status: string;
      access_key: string;
    }>;
  }

  /** Force-terminates what `filter` matches and waits until it has stopped. */
  async terminateSessions(filter: string) {
    for (const session of await this.activeSessions(filter)) {
      if (session.status === "TERMINATING") continue;
      const query = new URLSearchParams({
        forced: "true",
        owner_access_key: session.access_key,
      });
      expectOk(
        await this.send(
          "DELETE",
          `/func/session/${encodeURIComponent(session.name)}?${query}`,
        ),
        "terminating",
      );
    }
    const deadline = Date.now() + SESSION_GONE_TIMEOUT_MS;
    let left = await this.activeSessions(filter);
    while (left.length > 0 && Date.now() < deadline) {
      await sleep(1_000);
      left = await this.activeSessions(filter);
    }
    if (left.length > 0) {
      throw new Error(`still ${left.map((s) => s.status).join(", ")}`);
    }
  }

  async folder(name: string) {
    const data = await this.gql(
      `query($filter: String) {
        vfolder_list(limit: 100, offset: 0, filter: $filter) {
          items { id name status }
        }
      }`,
      { filter: `name == ${quote(name)}` },
    );
    return ((data.vfolder_list?.items ?? []) as any[]).find(
      (folder) => !GONE_FOLDER_STATUSES.has(folder.status),
    ) as { id: string; status: string } | undefined;
  }

  async removeFolder(name: string) {
    let folder = await this.folder(name);
    if (!folder) return;
    if (folder.status !== "delete-pending") {
      expectOk(
        await this.send("DELETE", "/func/folders", { vfolder_id: folder.id }),
        "moving to trash",
      );
      const deadline = Date.now() + FOLDER_TRASHED_TIMEOUT_MS;
      while (folder?.status === "ready" && Date.now() < deadline) {
        await sleep(500);
        folder = await this.folder(name);
      }
      if (!folder) return;
    }
    expectOk(
      await this.send("POST", "/func/folders/delete-from-trash-bin", {
        vfolder_id: folder.id,
      }),
      "deleting from trash",
    );
  }

  async removeUser(email: string) {
    const data = await this.gql(
      `query($email: String) { user(email: $email) { email } }`,
      { email },
    );
    if (!data.user) return;
    // A session the user started blocks the purge, declared or not.
    await this.terminateSessions(`user_email == ${quote(email)}`);
    await this.gql(
      `mutation($email: String!, $props: ModifyUserInput!) {
        modify_user(email: $email, props: $props) { ok msg }
      }`,
      { email, props: { status: "inactive" } },
    ).catch(() => {});
    // Also removes the user's folders. The manager keeps the personal project
    // for its retention sweep and refuses to purge it through the API.
    const purged = await this.gql(
      `mutation($email: String!, $props: PurgeUserInput!) {
        purge_user(email: $email, props: $props) { ok msg }
      }`,
      { email, props: { purge_shared_vfolders: true } },
    );
    if (!purged.purge_user?.ok) throw new Error(purged.purge_user?.msg);
  }

  async projectId(name: string, domain: string) {
    const data = await this.gql(
      `query($domain: String) {
        groups(domain_name: $domain, is_active: null, type: ["GENERAL"]) { id name }
      }`,
      { domain },
    );
    return ((data.groups ?? []) as any[]).find((group) => group.name === name)
      ?.id as string | undefined;
  }

  async removeProject(name: string) {
    const gid = await this.projectId(name, await this.domainName());
    if (!gid) return;
    await this.gql(`mutation($gid: UUID!) { delete_group(gid: $gid) { ok } }`, {
      gid,
    }).catch(() => {});
    const purged = await this.gql(
      `mutation($gid: UUID!) { purge_group(gid: $gid) { ok msg } }`,
      { gid },
    );
    if (!purged.purge_group?.ok) throw new Error(purged.purge_group?.msg);
  }

  async remove(kind: TestResourceKind, name: string) {
    switch (kind) {
      case "session":
        return this.terminateSessions(`name == ${quote(name)}`);
      case "vfolder":
        return this.removeFolder(name);
      case "user":
        return this.removeUser(name);
      case "project":
        return this.removeProject(name);
    }
  }

  /** `E2E_PROJECT_NAME`, else the admin's first GENERAL project by name. */
  async defaultProject(domain: string) {
    const override = process.env.E2E_PROJECT_NAME?.trim();
    const data = await this.gql(
      `query($domain: String) {
        user { groups { id } }
        groups(domain_name: $domain, is_active: true, type: ["GENERAL"]) { id name }
      }`,
      { domain },
    );
    const memberOf = new Set(
      ((data.user?.groups ?? []) as any[]).map((group) => group.id),
    );
    const projects = ((data.groups ?? []) as any[])
      .filter((group) =>
        override ? group.name === override : memberOf.has(group.id),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
    if (!projects[0]) {
      throw new Error(
        `no e2e project in domain "${domain}"; set E2E_PROJECT_NAME`,
      );
    }
    return projects[0] as { id: string; name: string };
  }
}

async function withAdminApi<T>(fn: (api: AdminApi) => Promise<T>) {
  const api = new AdminApi();
  await api.login();
  try {
    return await fn(api);
  } finally {
    await api.logout();
  }
}

export function createTestResources(): TestResources {
  const registry = new Map<TestResourceKind, Set<string>>(
    REMOVAL_ORDER.map((kind) => [kind, new Set<string>()]),
  );
  const customRemovals: Array<{
    label: string;
    remove: () => Promise<void>;
  }> = [];

  const declare = (kind: TestResourceKind, name: string) => {
    if (!NAME_PATTERNS[kind].test(name)) {
      throw new Error(
        `test-resources: "${name}" is not a disposable ${kind} name (${NAME_PATTERNS[kind]})`,
      );
    }
    registry.get(kind)!.add(name);
    return name;
  };

  const generate = (kind: TestResourceKind, slug: string) => {
    const clean = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 30);
    const base = `${kind === "user" ? "test-agent" : "e2e-agent"}-${clean}-${Date.now()}`;
    const suffix = kind === "user" ? "@lablup.com" : "";
    let name = `${base}${suffix}`;
    for (let n = 2; registry.get(kind)!.has(name); n++) {
      name = `${base}-${n}${suffix}`;
    }
    return declare(kind, name);
  };

  return {
    session: (slug) => generate("session", slug),
    vfolder: (slug) => generate("vfolder", slug),
    project: (slug) => generate("project", slug),
    user: (slug) => generate("user", slug),
    declare,
    declared: (kind) => [...registry.get(kind)!],
    onCleanup(label, remove) {
      customRemovals.push({ label, remove });
    },

    async createUser(slug, options = {}) {
      const email = generate("user", slug);
      const username = email.split("@")[0];
      const password = `Aa1!${randomBytes(18).toString("base64url")}`;
      return withAdminApi(async (api) => {
        const domain = await api.domainName();
        const project = options.project
          ? {
              id: await api.projectId(options.project, domain),
              name: options.project,
            }
          : await api.defaultProject(domain);
        if (!project.id) {
          throw new Error(`project "${options.project}" not found`);
        }
        const created = await api.gql(
          `mutation($email: String!, $props: UserInput!) {
            create_user(email: $email, props: $props) { ok msg }
          }`,
          {
            email,
            props: {
              username,
              password,
              need_password_change: false,
              full_name: username,
              description: "Disposable e2e-agent test user",
              is_active: true,
              status: "active",
              domain_name: domain,
              role: options.role ?? "user",
              group_ids: [project.id],
            },
          },
        );
        if (!created.create_user?.ok) {
          throw new Error(`create_user failed: ${created.create_user?.msg}`);
        }
        return { email, username, password, domain, project: project.name };
      });
    },

    async createProject(slug, options = {}) {
      const name = generate("project", slug);
      return withAdminApi(async (api) => {
        const created = await api.gql(
          `mutation($name: String!, $props: GroupInput!) {
            create_group(name: $name, props: $props) { ok msg group { id } }
          }`,
          {
            name,
            props: { domain_name: await api.domainName(), is_active: true },
          },
        );
        const id = created.create_group?.group?.id as string | undefined;
        if (!created.create_group?.ok || !id) {
          throw new Error(`create_group failed: ${created.create_group?.msg}`);
        }
        const members = await Promise.all(
          (options.memberEmails ?? []).map(async (email) => {
            const data = await api.gql(
              `query($email: String) { user(email: $email) { id } }`,
              { email },
            );
            if (!data.user) throw new Error(`user ${email} not found`);
            return data.user.id as string;
          }),
        );
        if (members.length > 0) {
          const modified = await api.gql(
            `mutation($gid: UUID!, $props: ModifyGroupInput!) {
              modify_group(gid: $gid, props: $props) { ok msg }
            }`,
            {
              gid: id,
              props: { user_update_mode: "add", user_uuids: members },
            },
          );
          if (!modified.modify_group?.ok) {
            throw new Error(
              `modify_group failed: ${modified.modify_group?.msg}`,
            );
          }
        }
        return { id, name };
      });
    },

    async cleanup() {
      const failed: string[] = [];
      for (const custom of customRemovals.splice(0).reverse()) {
        try {
          await custom.remove();
          console.log(`[test-resources] removed ${custom.label}`);
        } catch (error) {
          console.warn(
            `[test-resources] could not remove ${custom.label}: ${message(error)}`,
          );
          customRemovals.unshift(custom);
          failed.push(custom.label);
        }
      }
      const pending = REMOVAL_ORDER.flatMap((kind) =>
        [...registry.get(kind)!].map((name) => ({ kind, name })),
      );
      if (pending.length === 0) return failed;
      try {
        await withAdminApi(async (api) => {
          for (const { kind, name } of pending) {
            try {
              await api.remove(kind, name);
              registry.get(kind)!.delete(name);
              console.log(`[test-resources] removed ${kind} ${name}`);
            } catch (error) {
              console.warn(
                `[test-resources] could not remove ${kind} "${name}": ${message(error)}`,
              );
              failed.push(`${kind}:${name}`);
            }
          }
        });
      } catch (error) {
        const names = pending.map(({ kind, name }) => `${kind}:${name}`);
        console.warn(
          `[test-resources] could not remove ${names.join(", ")}: ${message(error)}`,
        );
        return [...failed, ...names];
      }
      return failed;
    },
  };
}

export const test = base.extend<{ resources: TestResources }>({
  resources: async (_fixtures, use) => {
    const resources = createTestResources();
    await use(resources);
    await resources.cleanup();
  },
});
