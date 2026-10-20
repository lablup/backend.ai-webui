import { createAccountApiContext, gqlAdmin } from './admin-api';
import { userInfo } from './test-util';
import type { APIRequestContext } from '@playwright/test';

/**
 * Resolves the domain, project and storage host the e2e accounts actually
 * live in, instead of assuming the `default` domain / project and the `local`
 * storage host. The accounts sit in `default` on some clusters and in another
 * domain (e.g. `frontend`) on others, so a hard-coded name fails there.
 *
 * Each value is looked up once per worker and cached. There is no literal
 * fallback: if a lookup fails, the helper throws, so a misconfigured run fails
 * loudly instead of silently testing the wrong scope.
 *
 * Overrides: `E2E_DOMAIN_NAME`, `E2E_PROJECT_NAME`.
 */

let domainNamePromise: Promise<string> | undefined;
let projectNamePromise: Promise<string> | undefined;
const vfolderHostPromises = new Map<string, Promise<string>>();

/**
 * Caches `load` per worker. A rejected lookup is not cached, so the next
 * caller retries it.
 */
function cached(
  get: () => Promise<string> | undefined,
  set: (value: Promise<string> | undefined) => void,
  load: () => Promise<string>,
): Promise<string> {
  const existing = get();
  if (existing) return existing;
  const loading = load().catch((error) => {
    set(undefined);
    throw error;
  });
  set(loading);
  return loading;
}

/**
 * Runs `fn` with `api` when given, otherwise with a fresh admin API context
 * that is disposed afterwards.
 */
async function withAdminApi<T>(
  api: APIRequestContext | undefined,
  fn: (api: APIRequestContext) => Promise<T>,
): Promise<T> {
  if (api) return fn(api);
  const ownApi = await createAccountApiContext(userInfo.admin);
  try {
    return await fn(ownApi);
  } finally {
    await ownApi.dispose();
  }
}

/**
 * The domain of the signed-in e2e admin, read from its own user record. The
 * regular e2e users are expected to share it.
 */
export function getE2EDomainName(api?: APIRequestContext): Promise<string> {
  const override = process.env.E2E_DOMAIN_NAME?.trim();
  if (override) return Promise.resolve(override);
  return cached(
    () => domainNamePromise,
    (value) => (domainNamePromise = value),
    () =>
      withAdminApi(api, async (adminApi) => {
        const data = await gqlAdmin<{
          user: { domain_name?: string | null } | null;
        }>(adminApi, `query { user { domain_name } }`);
        const domainName = data.user?.domain_name;
        if (!domainName) {
          throw new Error(
            `Could not resolve the e2e domain: the admin ${userInfo.admin.email} has no domain_name. Set E2E_DOMAIN_NAME to override.`,
          );
        }
        return domainName;
      }),
  );
}

/**
 * An active GENERAL project in the e2e domain that the admin belongs to.
 * Prefers one the regular e2e user also belongs to (the accounts' common
 * project), then the first by name.
 */
export function getE2EProjectName(api?: APIRequestContext): Promise<string> {
  const override = process.env.E2E_PROJECT_NAME?.trim();
  if (override) return Promise.resolve(override);
  return cached(
    () => projectNamePromise,
    (value) => (projectNamePromise = value),
    () =>
      withAdminApi(api, async (adminApi) => {
        const domainName = await getE2EDomainName(adminApi);
        const memberships = async (email: string) => {
          const data = await gqlAdmin<{
            user: { groups: Array<{ id: string }> | null } | null;
          }>(
            adminApi,
            `query($email: String) { user(email: $email) { groups { id } } }`,
            { email },
          );
          return new Set((data.user?.groups ?? []).map((g) => g.id));
        };
        const [adminGroups, userGroups, projects] = await Promise.all([
          memberships(userInfo.admin.email),
          memberships(userInfo.user.email),
          gqlAdmin<{
            groups: Array<{ id: string; name: string; domain_name: string }>;
          }>(
            adminApi,
            `query($domain: String) {
              groups(domain_name: $domain, is_active: true, type: ["GENERAL"]) {
                id name domain_name
              }
            }`,
            { domain: domainName },
          ).then((data) => data.groups ?? []),
        ]);
        const candidates = projects
          .filter((p) => p.domain_name === domainName && adminGroups.has(p.id))
          .sort((a, b) => a.name.localeCompare(b.name));
        const project =
          candidates.find((p) => userGroups.has(p.id)) ?? candidates[0];
        if (!project) {
          throw new Error(
            `Could not resolve the e2e project: the admin ${userInfo.admin.email} belongs to no active GENERAL project in domain "${domainName}". Set E2E_PROJECT_NAME to override.`,
          );
        }
        return project.name;
      }),
  );
}

/**
 * A storage host `account` may create folders on, read from its own
 * `/folders/_/hosts`. Prefers an allowed host other than the account's default
 * host, so a test that picks a location really changes the selection; falls
 * back to the default host when it is the only one.
 */
export function getE2EVFolderHost(
  account: { email: string; password: string } = userInfo.user,
): Promise<string> {
  return cached(
    () => vfolderHostPromises.get(account.email),
    (value) =>
      value
        ? vfolderHostPromises.set(account.email, value)
        : vfolderHostPromises.delete(account.email),
    async () => {
      const api = await createAccountApiContext(account);
      try {
        const res = await api.get('/func/folders/_/hosts');
        const body = await res.json().catch(() => ({}));
        if (!res.ok()) {
          throw new Error(`GET /folders/_/hosts failed (${res.status()})`);
        }
        const allowed: string[] = Array.isArray(body?.allowed)
          ? body.allowed
          : [];
        const defaultHost: string | undefined = allowed.includes(body?.default)
          ? body.default
          : undefined;
        const host =
          [...allowed].sort().find((h) => h !== defaultHost) ?? defaultHost;
        if (!host) {
          throw new Error(
            `Could not resolve a storage host: ${account.email} is allowed none.`,
          );
        }
        return host;
      } finally {
        await api.dispose();
      }
    },
  );
}
