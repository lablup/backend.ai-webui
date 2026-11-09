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
  return createAccountApiContext(userInfo.admin, 'Admin');
}

/**
 * Same as `createAdminApiContext`, signed in as `account` instead — for reads
 * that must reflect what that account itself is allowed (e.g. its storage
 * hosts). The caller owns the context and must `dispose()` it.
 */
export async function createAccountApiContext(
  account: { email: string; password: string },
  label = account.email,
): Promise<APIRequestContext> {
  const api = await request.newContext({ baseURL: webServerEndpoint });
  const res = await api.post('/server/login', {
    data: {
      username: account.email,
      password: account.password,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok() || !body?.authenticated) {
    await api.dispose();
    // Only surface a minimal, known-safe subset of the response — never dump
    // the full login body into CI logs (it may gain sensitive fields later).
    throw new Error(
      `${label} API login failed (status=${res.status()}, authenticated=${String(
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
 * Deployment statuses that mean the deployment is already gone or going away.
 * `deleteModelDeployment` is a soft-delete (the row stays, as STOPPING then
 * STOPPED), so sweeps and per-test cleanup skip these instead of re-deleting
 * them and over-counting. DESTROYING/DESTROYED are not in the current
 * `DeploymentStatus` enum; they are listed only for the client-side check so
 * an older or newer manager that reports them is handled the same way.
 */
const TERMINAL_DEPLOYMENT_STATUSES = new Set([
  'STOPPING',
  'STOPPED',
  'DESTROYING',
  'DESTROYED',
]);

/** Server-side filter that leaves soft-deleted deployments out of a listing. */
const LIVE_DEPLOYMENT_STATUS_FILTER = { notIn: ['STOPPING', 'STOPPED'] };

/**
 * Lists every deployment whose display name matches `pattern`. `limit: 300`
 * comfortably covers realistic leak volumes without needing offset
 * pagination. With `liveOnly`, soft-deleted (STOPPING/STOPPED) deployments are
 * filtered out server-side, so the accumulated stopped rows of earlier runs
 * cannot fill the 300-row window and hide a live leak.
 */
export async function listDeploymentsByPattern(
  api: APIRequestContext,
  pattern: RegExp,
  options: { liveOnly?: boolean } = {},
): Promise<
  Array<{ id: string; name: string; status: string; createdAt: string }>
> {
  const data = await gqlAdmin<{
    adminDeployments: {
      edges: Array<{
        node: {
          id: string;
          metadata: { name: string; status: string; createdAt: string };
        };
      }>;
    };
  }>(
    api,
    `query($filter: DeploymentFilter) {
      adminDeployments(filter: $filter, limit: 300) {
        edges { node { id metadata { name status createdAt } } }
      }
    }`,
    {
      filter: options.liveOnly
        ? { status: LIVE_DEPLOYMENT_STATUS_FILTER }
        : null,
    },
  );
  return (data.adminDeployments?.edges ?? [])
    .map((e) => ({
      id: e.node.id,
      name: e.node.metadata.name,
      status: e.node.metadata.status,
      createdAt: e.node.metadata.createdAt,
    }))
    .filter((d) => pattern.test(d.name))
    .filter(
      (d) => !options.liveOnly || !TERMINAL_DEPLOYMENT_STATUSES.has(d.status),
    );
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

/** Looks a deployment up by its exact name, server-side. */
export async function findDeploymentByName(
  api: APIRequestContext,
  name: string,
): Promise<{ id: string; status: string } | null> {
  const data = await gqlAdmin<{
    adminDeployments: {
      edges: Array<{ node: { id: string; metadata: { status: string } } }>;
    };
  }>(
    api,
    `query($name: String!) {
      adminDeployments(filter: { name: { equals: $name } }) {
        edges { node { id metadata { status } } }
      }
    }`,
    { name },
  );
  const node = data.adminDeployments?.edges?.[0]?.node;
  return node ? { id: node.id, status: node.metadata.status } : null;
}

/** Replaces a deployment's tags via `updateModelDeployment`. */
export async function setDeploymentTagsViaApi(
  api: APIRequestContext,
  id: string,
  tags: string[],
): Promise<void> {
  await gqlAdmin(
    api,
    `mutation($input: UpdateDeploymentInput!) {
      updateModelDeployment(input: $input) { deployment { id } }
    }`,
    { input: { id: toRawUUID(id), tags } },
  );
}

/**
 * Deletes every live (not yet STOPPING/STOPPED) deployment named exactly
 * `name`. Used by `createTestResources().cleanup()`. Returns how many live
 * deployments it found and how many of those it deleted; `found: 0` means the
 * deployment was already gone (not an error), and `deleted < found` means a
 * delete failed. Throws only when the lookup itself fails; a failed delete is
 * reported through `deleteDeploymentViaApi`'s warning.
 */
export async function deleteDeploymentsByNameViaApi(
  api: APIRequestContext,
  name: string,
): Promise<{ found: number; deleted: number }> {
  const data = await gqlAdmin<{
    adminDeployments: {
      edges: Array<{ node: { id: string; metadata: { status: string } } }>;
    };
  }>(
    api,
    `query($filter: DeploymentFilter) {
      adminDeployments(filter: $filter, limit: 50) {
        edges { node { id metadata { status } } }
      }
    }`,
    {
      filter: {
        name: { equals: name },
        status: LIVE_DEPLOYMENT_STATUS_FILTER,
      },
    },
  );
  const live = (data.adminDeployments?.edges ?? [])
    .map((e) => e.node)
    .filter((n) => !TERMINAL_DEPLOYMENT_STATUSES.has(n.metadata.status));
  let deleted = 0;
  for (const { id } of live) {
    if (await deleteDeploymentViaApi(api, id)) deleted++;
  }
  return { found: live.length, deleted };
}

/**
 * Display-name prefixes of the deployments e2e specs create:
 * `e2e-plan-*` / `e2e-token-*` (deployment-lifecycle / deployment-access-token
 * / preset-integration) and the ticket-scoped `e2e-fr<N>-*` / `e2e-gh<N>-*`
 * shells (add-revision-command-shell / add-revision-runtime-defaults).
 */
export const E2E_DEPLOYMENT_PATTERN = /^e2e-(plan|token|fr\d+|gh\d+)-/i;

/**
 * Sweep-deletes every live deployment whose display name matches `pattern` —
 * by default every e2e deployment prefix in `E2E_DEPLOYMENT_PATTERN` — and that
 * is older than `minAgeMs`, so a concurrent run's in-use deployments survive
 * (same age gate as `sweepStaleProjectsViaApi`). These
 * names are NOT covered by sweepServices'/sweepVFolders' `/e2e-svc-/`
 * `/e2e-mod-/` patterns in global-cleanup.teardown.ts, and a per-test
 * UI-delete flow (same fragility as the test body it backstops) can itself
 * fail when a test already failed mid-modal — leaking a PENDING deployment.
 * Already soft-deleted (STOPPING/STOPPED) deployments are skipped, so the
 * returned count is the number of deployments this sweep actually deleted.
 * API-based and pagination-immune for the same reason
 * `sweepProfileTestUsersViaApi` is.
 */
export async function sweepLeftoverDeploymentsViaApi(
  api: APIRequestContext,
  pattern: RegExp = E2E_DEPLOYMENT_PATTERN,
  minAgeMs = 60 * 60 * 1000,
): Promise<number> {
  const matches = await listDeploymentsByPattern(api, pattern, {
    liveOnly: true,
  });
  const stale = matches.filter(({ createdAt }) => {
    const created = new Date(createdAt).getTime();
    return Number.isFinite(created) && Date.now() - created > minAgeMs;
  });
  let deleted = 0;
  for (const { id } of stale) {
    if (await deleteDeploymentViaApi(api, id)) deleted++;
  }
  if (deleted > 0) {
    console.log(`Swept ${deleted} leftover deployment(s) matching ${pattern}`);
  }
  return deleted;
}

// Past the trash: the manager is deleting it or already has, so nothing is left to do.
const PURGED_VFOLDER_STATUSES = new Set([
  'delete-ongoing',
  'delete-complete',
  'delete-error',
]);

// The manager leaves these on its own; no delete can succeed until it does.
const TRANSITIONAL_VFOLDER_STATUSES = new Set(['cloning']);
const VFOLDER_PURGE_DEADLINE_MS = 15_000;
const VFOLDER_PURGE_POLL_MS = 1_000;

async function listVFoldersByName(
  api: APIRequestContext,
  name: string,
): Promise<Array<{ id: string; status: string }>> {
  const data = await gqlAdmin<{
    vfolder_list: { items: Array<{ id: string; status: string }> };
  }>(
    api,
    `query($filter: String) {
      vfolder_list(limit: 100, offset: 0, filter: $filter) {
        items { id status }
      }
    }`,
    { filter: `name == ${JSON.stringify(name)}` },
  );
  return data.vfolder_list.items;
}

async function purgeVFolderViaApi(
  api: APIRequestContext,
  name: string,
): Promise<void> {
  const deadline = Date.now() + VFOLDER_PURGE_DEADLINE_MS;
  for (;;) {
    const remaining = (await listVFoldersByName(api, name)).filter(
      ({ status }) => !PURGED_VFOLDER_STATUSES.has(status),
    );
    if (remaining.length === 0) return;
    if (Date.now() >= deadline) {
      const states = remaining.map((f) => `${f.id}: ${f.status}`).join(', ');
      throw new Error(
        `folder "${name}" not deleted after ${VFOLDER_PURGE_DEADLINE_MS}ms (${states})`,
      );
    }
    let shouldWait = false;
    for (const { id, status } of remaining) {
      if (TRANSITIONAL_VFOLDER_STATUSES.has(status)) {
        shouldWait = true;
        continue;
      }
      const step = status === 'delete-pending' ? 'purge' : 'trash';
      const res =
        step === 'trash'
          ? await api.delete('/func/folders', { data: { vfolder_id: id } })
          : await api.post('/func/folders/delete-from-trash-bin', {
              data: { vfolder_id: id },
            });
      if (res.ok()) continue;
      const failure = `${step} of folder "${name}" (${id}) failed: ${res.status()} ${(await res.text()).slice(0, 300)}`;
      // Only a folder the manager moved on meanwhile is worth another look.
      const current = (await listVFoldersByName(api, name)).find(
        (folder) => folder.id === id,
      );
      if (current?.status === status) throw new Error(failure);
      shouldWait = true;
    }
    if (shouldWait) {
      await new Promise((resolve) =>
        setTimeout(resolve, VFOLDER_PURGE_POLL_MS),
      );
    }
  }
}

/**
 * Permanently deletes the e2e folders named exactly `names`, whatever their
 * current state; a name with no folder is not an error. Trashed folders still
 * count toward `max_vfolder_count`, so both steps must succeed. Tries every
 * name, then throws: a leak fills the project's quota for later runs.
 */
export async function purgeVFoldersByNameViaApi(
  names: string[],
): Promise<void> {
  if (names.length === 0) return;
  const api = await createAdminApiContext();
  const failures: string[] = [];
  try {
    for (const name of names) {
      try {
        if (!name.startsWith('e2e-')) {
          throw new Error(`refusing to purge non-e2e folder "${name}"`);
        }
        await purgeVFolderViaApi(api, name);
      } catch (error) {
        failures.push(error instanceof Error ? error.message : String(error));
      }
    }
  } finally {
    await api.dispose();
  }
  if (failures.length > 0) {
    throw new Error(`Folder cleanup failed:\n${failures.join('\n')}`);
  }
}

interface PrometheusQueryPresetRow {
  entityId: string;
  name: string;
  createdAt: string;
}

/**
 * Lists Prometheus query presets (auto-scaling rule presets) matching a
 * server-side `QueryDefinitionFilter`, paging with limit/offset in creation
 * order, before anything is purged.
 */
async function listPrometheusQueryPresets(
  api: APIRequestContext,
  filter: Record<string, unknown>,
): Promise<PrometheusQueryPresetRow[]> {
  const pageSize = 100;
  const rows: PrometheusQueryPresetRow[] = [];
  for (let offset = 0; offset < 10_000; offset += pageSize) {
    const data = await gqlAdmin<{
      prometheusQueryPresets: {
        edges: Array<{ node: PrometheusQueryPresetRow }>;
      } | null;
    }>(
      api,
      `query($filter: QueryDefinitionFilter, $limit: Int, $offset: Int) {
        prometheusQueryPresets(
          filter: $filter
          orderBy: [{ field: CREATED_AT, direction: ASC }]
          limit: $limit
          offset: $offset
        ) {
          edges { node { entityId name createdAt } }
        }
      }`,
      { filter, limit: pageSize, offset },
    );
    const page = (data.prometheusQueryPresets?.edges ?? []).map((e) => e.node);
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

/**
 * Purges one Prometheus query preset by its raw UUID with
 * `purgePrometheusQueryPreset` (what the preset list's Delete action uses).
 * Defensive: returns `false` and warns instead of throwing.
 */
export async function purgePrometheusQueryPresetViaApi(
  api: APIRequestContext,
  entityId: string,
): Promise<boolean> {
  try {
    const data = await gqlAdmin<{
      purgePrometheusQueryPreset: { entityId: string } | null;
    }>(
      api,
      `mutation($id: UUID!) { purgePrometheusQueryPreset(id: $id) { entityId } }`,
      { id: entityId },
    );
    return !!data.purgePrometheusQueryPreset?.entityId;
  } catch (error) {
    console.warn(
      `[admin-api] could not purge Prometheus query preset ${entityId}:`,
      error,
    );
    return false;
  }
}

/**
 * Purges every Prometheus query preset named exactly `name`. `found: 0` means
 * it was already gone (not an error). Throws only when the lookup fails.
 */
export async function purgePrometheusQueryPresetsByNameViaApi(
  api: APIRequestContext,
  name: string,
): Promise<{ found: number; deleted: number }> {
  const matches = await listPrometheusQueryPresets(api, {
    name: { equals: name },
  });
  let deleted = 0;
  for (const { entityId } of matches) {
    if (await purgePrometheusQueryPresetViaApi(api, entityId)) deleted++;
  }
  return { found: matches.length, deleted };
}

/**
 * Purges Prometheus query presets whose name starts with `prefix` and that are
 * older than `minAgeMs` — the global-cleanup backstop for `e2e-preset-*`
 * presets a hard-killed run left behind. The age gate leaves a concurrent
 * run's fresh presets alone. Returns the number purged.
 */
export async function sweepStalePrometheusQueryPresetsViaApi(
  api: APIRequestContext,
  prefix = 'e2e-preset-',
  minAgeMs = 60 * 60 * 1000,
): Promise<number> {
  const rows = await listPrometheusQueryPresets(api, {
    name: { startsWith: prefix },
  });
  const stale = rows.filter((row) => {
    const createdAt = new Date(row.createdAt).getTime();
    return (
      row.name.startsWith(prefix) &&
      Number.isFinite(createdAt) &&
      Date.now() - createdAt > minAgeMs
    );
  });
  let purged = 0;
  for (const { entityId } of stale) {
    if (await purgePrometheusQueryPresetViaApi(api, entityId)) purged++;
  }
  if (purged > 0) {
    console.log(
      `Swept ${purged} stale Prometheus query preset(s) starting with "${prefix}"`,
    );
  }
  return purged;
}

export interface RoleRow {
  id: string;
  name: string;
  source: string;
  status: string;
  createdAt: string;
}

/**
 * Custom roles only: sweeps and by-name cleanup must never reach a system role.
 * Every status is requested explicitly, so a soft-deleted role left behind by a
 * killed run is found whatever the manager's default listing returns. `id`, not
 * `entityId`, because `entityId` needs manager 26.9.0.
 */
export async function listCustomRolesViaApi(
  api: APIRequestContext,
  name: { equals: string } | { startsWith: string },
): Promise<RoleRow[]> {
  const pageSize = 100;
  const rows: RoleRow[] = [];
  for (let offset = 0; offset < 10_000; offset += pageSize) {
    const data = await gqlAdmin<{
      adminRoles: { edges: Array<{ node: RoleRow }> } | null;
    }>(
      api,
      `query($filter: RoleFilter, $limit: Int, $offset: Int) {
        adminRoles(
          filter: $filter
          orderBy: [{ field: CREATED_AT, direction: ASC }]
          limit: $limit
          offset: $offset
        ) {
          edges { node { id name source status createdAt } }
        }
      }`,
      {
        filter: {
          name,
          source: { equals: 'CUSTOM' },
          status: { in: ['ACTIVE', 'INACTIVE', 'DELETED'] },
        },
        limit: pageSize,
        offset,
      },
    );
    const page = (data.adminRoles?.edges ?? []).map((e) => e.node);
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows.filter((row) => row.source === 'CUSTOM');
}

/**
 * Soft-deletes a role unless it already is, then purges it. Assignments and
 * permissions go with it by FK cascade, so they cannot block the purge.
 *
 * Uses `adminDeleteRole` / `adminPurgeRole`, deprecated since 26.10.0, because
 * `deleteRole` / `purgeRole` do not exist on the LTS manager (26.4) and the
 * RBAC page itself still calls the admin mutations.
 *
 * Defensive: returns `false` and warns instead of throwing.
 */
export async function purgeRoleViaApi(
  api: APIRequestContext,
  role: Pick<RoleRow, 'id' | 'status'>,
): Promise<boolean> {
  try {
    const input = { id: toRawUUID(role.id) };
    if (role.status !== 'DELETED') {
      await gqlAdmin(
        api,
        `mutation($input: DeleteRoleInput!) { adminDeleteRole(input: $input) { id } }`,
        { input },
      );
    }
    const data = await gqlAdmin<{ adminPurgeRole: { id: string } | null }>(
      api,
      `mutation($input: PurgeRoleInput!) { adminPurgeRole(input: $input) { id } }`,
      { input },
    );
    return !!data.adminPurgeRole?.id;
  } catch (error) {
    console.warn(`[admin-api] could not purge role ${role.id}:`, error);
    return false;
  }
}

/**
 * Purges every custom role named exactly `name`, in any status. `found: 0`
 * means it was already gone (not an error). Throws only when the lookup fails.
 */
export async function purgeRolesByNameViaApi(
  api: APIRequestContext,
  name: string,
): Promise<{ found: number; deleted: number }> {
  const matches = await listCustomRolesViaApi(api, { equals: name });
  let deleted = 0;
  for (const role of matches) {
    if (await purgeRoleViaApi(api, role)) deleted++;
  }
  return { found: matches.length, deleted };
}

/**
 * Name prefixes of the roles the e2e specs create: `e2e-role-*` (including
 * `e2e-role-edited-*`, rbac-role-crud), `e2e-detail-role-*`, `e2e-scope-role-*`,
 * `e2e-granted-role-*` (rbac-role-detail), and `e2e-skip-role-*` (the closed
 * #10783, whose runs may have left some).
 */
export const E2E_ROLE_PATTERN =
  /^e2e-(role|detail-role|scope-role|granted-role|skip-role)-/;

/**
 * Purges custom roles matching `pattern` that are older than `minAgeMs` — the
 * global-cleanup backstop for roles a hard-killed run left behind. The age gate
 * leaves a concurrent run's fresh roles alone. Returns the number purged.
 */
export async function sweepStaleRolesViaApi(
  api: APIRequestContext,
  pattern: RegExp = E2E_ROLE_PATTERN,
  minAgeMs = 60 * 60 * 1000,
): Promise<number> {
  const rows = await listCustomRolesViaApi(api, { startsWith: 'e2e-' });
  const stale = rows.filter((row) => {
    const createdAt = new Date(row.createdAt).getTime();
    return (
      pattern.test(row.name) &&
      Number.isFinite(createdAt) &&
      Date.now() - createdAt > minAgeMs
    );
  });
  let purged = 0;
  for (const role of stale) {
    if (await purgeRoleViaApi(api, role)) purged++;
  }
  if (purged > 0) {
    console.log(`Swept ${purged} stale e2e role(s) matching ${pattern}`);
  }
  return purged;
}

/**
 * Creates a GENERAL project in `domainName` (default: the first member's
 * domain; one of the two is required) and adds `memberEmails` to it. Returns
 * the project's raw UUID for `purgeProjectViaApi`.
 */
export async function createProjectViaApi(
  api: APIRequestContext,
  name: string,
  options: {
    memberEmails?: string[];
    isActive?: boolean;
    domainName?: string;
  } = {},
): Promise<string> {
  const members = await Promise.all(
    (options.memberEmails ?? []).map(async (email) => {
      const data = await gqlAdmin<{
        user: { id: string; domain_name: string } | null;
      }>(
        api,
        `query($email: String) { user(email: $email) { id domain_name } }`,
        {
          email,
        },
      );
      if (!data.user) throw new Error(`User ${email} not found`);
      return data.user;
    }),
  );
  const domainName = options.domainName ?? members[0]?.domain_name;
  if (!domainName) {
    // No literal fallback: the e2e accounts are not in `default` everywhere.
    // Pass `getE2EDomainName()` (e2e-scope.ts) for a project without members.
    throw new Error(
      `createProjectViaApi("${name}") needs domainName or memberEmails`,
    );
  }
  const created = await gqlAdmin<{
    create_group: { ok: boolean; msg: string; group: { id: string } | null };
  }>(
    api,
    `mutation($name: String!, $props: GroupInput!) {
      create_group(name: $name, props: $props) { ok msg group { id } }
    }`,
    {
      name,
      props: { domain_name: domainName, is_active: options.isActive ?? true },
    },
  );
  const gid = created.create_group?.group?.id;
  if (!created.create_group?.ok || !gid) {
    throw new Error(`create_group failed: ${created.create_group?.msg}`);
  }
  if (members.length > 0) {
    const modified = await gqlAdmin<{
      modify_group: { ok: boolean; msg: string };
    }>(
      api,
      `mutation($gid: UUID!, $props: ModifyGroupInput!) {
        modify_group(gid: $gid, props: $props) { ok msg }
      }`,
      {
        gid,
        props: {
          user_update_mode: 'add',
          user_uuids: members.map((m) => m.id),
        },
      },
    );
    if (!modified.modify_group?.ok) {
      await purgeProjectViaApi(api, gid);
      throw new Error(`modify_group failed: ${modified.modify_group?.msg}`);
    }
  }
  return gid;
}

/**
 * Deletes then purges a project. Defensive like `purgeUserViaApi`: returns
 * `false` instead of throwing so teardown never masks the test result.
 */
export async function purgeProjectViaApi(
  api: APIRequestContext,
  gid: string,
): Promise<boolean> {
  await gqlAdmin(
    api,
    `mutation($gid: UUID!) { delete_group(gid: $gid) { ok msg } }`,
    { gid },
  ).catch(() => {
    /* already inactive — purge below still applies */
  });
  try {
    const result = await gqlAdmin<{
      purge_group: { ok: boolean; msg: string };
    }>(api, `mutation($gid: UUID!) { purge_group(gid: $gid) { ok msg } }`, {
      gid,
    });
    if (!result.purge_group?.ok) {
      console.warn(
        `purge_group did not succeed for ${gid}: ${result.purge_group?.msg}`,
      );
    }
    return result.purge_group?.ok === true;
  } catch (error) {
    console.warn(`[admin-api] could not purge project ${gid}:`, error);
    return false;
  }
}

/**
 * Purges every project (any status) named exactly `name`. `found: 0` means it
 * was already gone (not an error). Throws only when the lookup fails.
 */
export async function purgeProjectsByNameViaApi(
  api: APIRequestContext,
  name: string,
): Promise<{ found: number; deleted: number }> {
  const data = await gqlAdmin<{
    groups: Array<{ id: string; name: string }>;
  }>(api, `query { groups(is_active: null) { id name } }`);
  const matches = (data.groups ?? []).filter((g) => g.name === name);
  let deleted = 0;
  for (const { id } of matches) {
    if (await purgeProjectViaApi(api, id)) deleted++;
  }
  return { found: matches.length, deleted };
}

/**
 * Purges projects matching `pattern` that are older than `minAgeMs`, so a
 * hard-killed run cannot leak them while a concurrent worker's fresh
 * fixtures are left alone.
 */
export async function sweepStaleProjectsViaApi(
  api: APIRequestContext,
  pattern: RegExp,
  minAgeMs = 60 * 60 * 1000,
): Promise<number> {
  const data = await gqlAdmin<{
    groups: Array<{ id: string; name: string; created_at: string }>;
  }>(api, `query { groups(is_active: null) { id name created_at } }`);
  const stale = (data.groups ?? []).filter((g) => {
    const createdAt = new Date(g.created_at).getTime();
    return (
      pattern.test(g.name) &&
      Number.isFinite(createdAt) &&
      Date.now() - createdAt > minAgeMs
    );
  });
  let purged = 0;
  for (const { id } of stale) {
    if (await purgeProjectViaApi(api, id)) purged++;
  }
  return purged;
}

/**
 * Creates an active, public, empty resource group (no agents) so a test can
 * edit its options without touching the groups other specs schedule on.
 */
export async function createResourceGroupViaApi(
  api: APIRequestContext,
  name: string,
  description = 'e2e',
): Promise<void> {
  const data = await gqlAdmin<{
    create_scaling_group: { ok: boolean; msg: string };
  }>(
    api,
    `mutation($name: String!, $props: CreateScalingGroupInput!) {
      create_scaling_group(name: $name, props: $props) { ok msg }
    }`,
    {
      name,
      props: {
        description,
        is_active: true,
        is_public: true,
        driver: 'static',
        driver_opts: '{}',
        scheduler: 'fifo',
        scheduler_opts: '{}',
        wsproxy_addr: '',
        use_host_network: false,
      },
    },
  );
  if (!data.create_scaling_group?.ok) {
    throw new Error(
      `create_scaling_group failed: ${data.create_scaling_group?.msg}`,
    );
  }
}

/**
 * Deletes a resource group. Returns `false` instead of throwing so teardown
 * never masks the test result.
 */
export async function deleteResourceGroupViaApi(
  api: APIRequestContext,
  name: string,
): Promise<boolean> {
  try {
    const data = await gqlAdmin<{
      delete_scaling_group: { ok: boolean; msg: string };
    }>(
      api,
      `mutation($name: String!) { delete_scaling_group(name: $name) { ok msg } }`,
      { name },
    );
    return data.delete_scaling_group?.ok === true;
  } catch (error) {
    console.warn(`[admin-api] could not delete resource group ${name}:`, error);
    return false;
  }
}

/**
 * Deletes resource groups matching `pattern` that are older than `minAgeMs`,
 * so a hard-killed run cannot leak them.
 */
export async function sweepStaleResourceGroupsViaApi(
  api: APIRequestContext,
  pattern: RegExp,
  minAgeMs = 60 * 60 * 1000,
): Promise<number> {
  const data = await gqlAdmin<{
    scaling_groups: Array<{ name: string; created_at: string }>;
  }>(api, `query { scaling_groups(is_active: null) { name created_at } }`);
  const stale = (data.scaling_groups ?? []).filter((g) => {
    const createdAt = new Date(g.created_at).getTime();
    return (
      pattern.test(g.name) &&
      Number.isFinite(createdAt) &&
      Date.now() - createdAt > minAgeMs
    );
  });
  let deleted = 0;
  for (const { name } of stale) {
    if (await deleteResourceGroupViaApi(api, name)) deleted++;
  }
  return deleted;
}
