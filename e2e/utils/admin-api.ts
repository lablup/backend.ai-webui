import { userInfo, webServerEndpoint } from './test-util';
import { request, type APIRequestContext } from '@playwright/test';

/**
 * Admin-side GraphQL helpers used by E2E scaffolding (setup/teardown).
 *
 * These talk to the manager directly over HTTP instead of driving the
 * credential UI. The credential table is paginated (100 rows/page), so any
 * UI-based "find this user and delete it" loop silently misses off-page rows
 * and can hang. The admin GraphQL `users` query returns the *full* user list
 * regardless of pagination, which makes cleanup deterministic and
 * pagination-immune — a hard requirement for guaranteed teardown. See FR-3138.
 */

/**
 * Creates an authenticated admin `APIRequestContext`.
 *
 * Logs in via `/server/login` (plain JSON — the browser-side AES payload
 * encryption is optional and not required for the server session) so the
 * returned context carries the manager session cookie for subsequent
 * `/func/admin/gql` calls. The caller owns the context and must `dispose()` it.
 */
export async function createAdminApiContext(): Promise<APIRequestContext> {
  const api = await request.newContext({ baseURL: webServerEndpoint });
  const res = await api.post('/server/login', {
    data: {
      username: userInfo.admin.email,
      password: userInfo.admin.password,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok() || !body?.authenticated) {
    await api.dispose();
    // Only surface a minimal, known-safe subset of the response — never dump
    // the full login body into CI logs (it may gain sensitive fields later).
    throw new Error(
      `Admin API login failed (status=${res.status()}, authenticated=${String(
        body?.authenticated ?? false,
      )})`,
    );
  }
  return api;
}

/**
 * Runs an admin GraphQL operation and returns its `data`. Throws on transport
 * errors or GraphQL `errors`, so callers can decide whether to swallow them.
 */
export async function gqlAdmin<T = any>(
  api: APIRequestContext,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await api.post('/func/admin/gql', {
    data: { query, variables },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok() || json?.errors) {
    throw new Error(
      `GraphQL error (${res.status()}): ${JSON.stringify(json?.errors ?? json).slice(0, 300)}`,
    );
  }
  return json.data as T;
}

/**
 * Lists every user whose email matches `pattern`, across all statuses
 * (`is_active: null` returns active + inactive). Pagination-immune.
 */
export async function listUsersByPattern(
  api: APIRequestContext,
  pattern: RegExp,
): Promise<Array<{ email: string }>> {
  const data = await gqlAdmin<{ users: Array<{ email: string }> }>(
    api,
    `query { users(is_active: null) { email } }`,
  );
  return (data.users ?? []).filter((u) => pattern.test(u.email));
}

/**
 * Permanently removes a single user by email: deactivate, then purge (with
 * shared vfolders). Deactivating first keeps purge well-defined regardless of
 * the user's current status. Defensive — a missing/already-gone user does not
 * throw, so teardown never masks the real test result. See FR-3138.
 *
 * @returns `true` if the purge mutation reported `ok`, `false` if the user did
 * not exist or the server rejected the purge (`ok: false`). A rejected purge is
 * surfaced via `console.warn` rather than thrown, so teardown never masks the
 * real test result while still making a silent cleanup failure visible.
 */
export async function purgeUserViaApi(
  api: APIRequestContext,
  email: string,
): Promise<boolean> {
  const existing = await listUsersByPattern(
    api,
    new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
  );
  if (existing.length === 0) return false;

  // Deactivate first so purge is well-defined irrespective of current status.
  await gqlAdmin(
    api,
    `mutation($email: String!, $props: ModifyUserInput!) {
      modify_user(email: $email, props: $props) { ok msg }
    }`,
    { email, props: { status: 'inactive' } },
  ).catch(() => {
    /* already inactive or transient — purge below still applies */
  });

  const result = await gqlAdmin<{
    purge_user?: { ok?: boolean; msg?: string };
  }>(
    api,
    `mutation($email: String!, $props: PurgeUserInput!) {
      purge_user(email: $email, props: $props) { ok msg }
    }`,
    { email, props: { purge_shared_vfolders: true } },
  );

  // The mutation can return HTTP 200 with `ok: false` (permission/validation
  // failure). Treat that as an unsuccessful purge instead of reporting success.
  const ok = result?.purge_user?.ok === true;
  if (!ok) {
    console.warn(
      `purge_user did not succeed for ${email}: ${
        result?.purge_user?.msg ?? 'unknown reason'
      }`,
    );
  }
  return ok;
}

/**
 * Sweep-purges every disposable profile-test user whose email matches
 * `pattern`. Used both as a `beforeAll` catch-all (so a previous hard-killed
 * run cannot leak its `e2e-profile-<id>@lablup.com` account) and as an
 * `afterAll` belt-and-suspenders. Returns the number of accounts purged.
 *
 * Because the admin `users` query is not paginated, this finds *every* match
 * on the deployment regardless of how many users exist — the UI-pagination
 * blind spot that motivated FR-3138 cannot occur here.
 */
export async function sweepProfileTestUsersViaApi(
  api: APIRequestContext,
  pattern: RegExp = /^e2e-profile-[a-z0-9]+@lablup\.com$/i,
): Promise<number> {
  const matches = await listUsersByPattern(api, pattern);
  let purged = 0;
  for (const { email } of matches) {
    if (await purgeUserViaApi(api, email)) purged++;
  }
  if (purged > 0) {
    console.log(
      `Swept ${purged} stale profile-test user(s) matching ${pattern}`,
    );
  }
  return purged;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Strawberry Node ids are base64 `TypeName:<uuid>` global ids, but
 * `deleteModelDeployment`'s input takes the raw UUID (the same decode
 * documented on `toRawUUID` in deployment-fixtures.ts — duplicated here
 * rather than imported so this foundational, dependency-free module doesn't
 * take on a dependency on a higher-level fixture module).
 */
function toRawUUID(id: string): string {
  if (UUID_RE.test(id)) return id;
  const decoded = Buffer.from(id, 'base64').toString('utf-8');
  const raw = decoded.split(':').pop() ?? '';
  if (!UUID_RE.test(raw)) {
    throw new Error(`Cannot extract a raw UUID from id "${id}" ("${decoded}")`);
  }
  return raw;
}

/**
 * Lists every deployment whose display name matches `pattern`. `limit: 300`
 * comfortably covers realistic leak volumes without needing offset
 * pagination.
 */
export async function listDeploymentsByPattern(
  api: APIRequestContext,
  pattern: RegExp,
): Promise<Array<{ id: string; name: string }>> {
  const data = await gqlAdmin<{
    adminDeployments: {
      edges: Array<{ node: { id: string; metadata: { name: string } } }>;
    };
  }>(
    api,
    `query { adminDeployments(limit: 300) { edges { node { id metadata { name } } } } }`,
  );
  return (data.adminDeployments?.edges ?? [])
    .map((e) => ({ id: e.node.id, name: e.node.metadata.name }))
    .filter((d) => pattern.test(d.name));
}

/**
 * Deletes a single deployment by its (possibly base64 global) id via
 * `deleteModelDeployment`. This is a soft-delete on the manager side (status
 * transitions to STOPPED), so it is safe to call even on an
 * already-terminated deployment. Defensive: swallows a GraphQL error and
 * returns `false` rather than throwing, so one bad id never blocks the rest
 * of a sweep.
 */
export async function deleteDeploymentViaApi(
  api: APIRequestContext,
  id: string,
): Promise<boolean> {
  try {
    await gqlAdmin(
      api,
      `mutation($id: ID!) { deleteModelDeployment(input: { id: $id }) { id } }`,
      { id: toRawUUID(id) },
    );
    return true;
  } catch (error) {
    console.warn(`[admin-api] could not delete deployment id=${id}:`, error);
    return false;
  }
}

/**
 * Sweep-deletes every deployment whose display name matches `pattern` — by
 * default the `e2e-plan-*` / `e2e-token-*` shells the deployment specs
 * create (deployment-lifecycle.spec.ts / deployment-access-token.spec.ts).
 * These names are NOT covered by sweepServices'/sweepVFolders' `/e2e-svc-/`
 * `/e2e-mod-/` patterns in global-cleanup.teardown.ts, and the per-test
 * `cleanupDeploymentSafely` (a UI-delete flow, same fragility as the test
 * body it backstops) can itself fail when a test already failed mid-modal —
 * leaking a PENDING deployment with no other safety net. API-based and
 * pagination-immune for the same reason `sweepProfileTestUsersViaApi` is.
 * Returns the number of deployments deleted.
 */
export async function sweepLeftoverDeploymentsViaApi(
  api: APIRequestContext,
  pattern: RegExp = /^e2e-(plan|token)-/i,
): Promise<number> {
  const matches = await listDeploymentsByPattern(api, pattern);
  let deleted = 0;
  for (const { id } of matches) {
    if (await deleteDeploymentViaApi(api, id)) deleted++;
  }
  if (deleted > 0) {
    console.log(`Swept ${deleted} leftover deployment(s) matching ${pattern}`);
  }
  return deleted;
}
