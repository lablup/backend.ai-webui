// FR-4119: admin pages list the signed-in admin's domain (the WebUI assumes a
// single domain); the project-admin session page lists the project's members.
import { createAdminApiContext, gqlAdmin } from '../utils/admin-api';
import {
  loginAsAdmin,
  loginAsDomainAdmin,
  loginAsUser,
  logout,
  navigateTo,
  userInfo,
} from '../utils/test-util';
import test, {
  APIRequestContext,
  expect,
  Locator,
  Page,
} from '@playwright/test';

type UserSelectOperation = {
  name: string;
  variables: Record<string, any>;
  response: Record<string, any> | null;
};

/** Records every `BAIUserSelect*` / `BAIAdminUserSelect*` operation the page sends. */
function recordUserSelectOperations(page: Page): Array<UserSelectOperation> {
  const operations: Array<UserSelectOperation> = [];
  page.on('response', async (response) => {
    const req = response.request();
    if (req.method() !== 'POST' || !req.url().includes('/admin/gql')) return;
    let body: { query?: string; variables?: Record<string, any> } | null;
    try {
      body = req.postDataJSON();
    } catch {
      return;
    }
    const name = body?.query?.match(
      /query\s+(BAI(?:Admin)?UserSelect\w+)/,
    )?.[1];
    if (!name) return;
    operations.push({
      name,
      variables: body?.variables ?? {},
      response: await response.json().catch(() => null),
    });
  });
  return operations;
}

const operationNames = (operations: Array<UserSelectOperation>) =>
  operations.map((op) => op.name);

/** The global id of a Strawberry node is base64 `Type:<uuid>`. */
const toRawUUID = (globalId: string) =>
  Buffer.from(globalId, 'base64').toString().split(':')[1];

async function skipUnlessManager269(page: Page) {
  await page.waitForFunction(
    () => (globalThis as any).backendaiclient?.ready === true,
  );
  const supported = await page.evaluate(() =>
    (globalThis as any).backendaiclient.isManagerVersionCompatibleWith(
      '26.9.0',
    ),
  );
  test.skip(
    !supported,
    'scopedUsersV2 needs a Backend.AI manager >= 26.9.0 (@requires-manager-v26.9)',
  );
}

const optionOf = (listbox: Locator, email: string) =>
  listbox.getByRole('option', { name: new RegExp(`^${email}`) });

/**
 * Opens the picker labelled `label`, checks the list loaded (exactly
 * `listedEmails` when given), narrows it by typing part of `email`, and
 * picks that user.
 */
async function searchAndPickUser(
  page: Page,
  trigger: Locator,
  label: string,
  email: string,
  listedEmails?: Array<string>,
) {
  await trigger.click();
  const popup = page.getByRole('dialog', { name: label, exact: true });
  const listbox = popup.getByRole('listbox');
  await expect(listbox.getByRole('option').first()).toBeVisible({
    timeout: 30000,
  });
  if (listedEmails) {
    await expect(listbox.getByRole('option')).toHaveCount(listedEmails.length);
    for (const listed of listedEmails) {
      await expect(optionOf(listbox, listed)).toBeVisible();
    }
  }
  await popup
    .getByRole('combobox', { name: 'Search options' })
    .fill(email.split('@')[0]);
  await expect(listbox.getByRole('option')).toHaveCount(1, { timeout: 15000 });
  await optionOf(listbox, email).click();
}

/** Opens Admin Settings > Credentials > Create Credential and returns its User picker. */
async function openCreateCredentialUserPicker(page: Page) {
  await navigateTo(page, 'admin/users?tab=credentials');
  await page.getByRole('button', { name: 'Create Credential' }).click();
  const modal = page.getByRole('dialog', { name: 'Create Credential' });
  await expect(modal).toBeVisible();
  return {
    modal,
    trigger: modal.getByRole('button', { name: 'User', exact: true }),
  };
}

test.describe(
  'User picker - Users each role can list',
  {
    tag: [
      '@user',
      '@admin',
      '@critical',
      '@functional',
      '@requires-manager-v26.9',
    ],
  },
  () => {
    for (const [role, login] of [
      ['Superadmin', loginAsAdmin],
      ['Domain admin', loginAsDomainAdmin],
    ] as const) {
      test(`${role} can pick users of their domain from the credential form user picker`, async ({
        page,
        request,
      }) => {
        const operations = recordUserSelectOperations(page);
        await login(page, request);
        await skipUnlessManager269(page);

        const domainName = await page.evaluate(
          () => (globalThis as any).backendaiclient._config.domainName,
        );
        const api = await createAdminApiContext();
        const { domainV2 } = await gqlAdmin<{
          domainV2: { entityId: string };
        }>(
          api,
          `query ($name: String!) { domainV2(domainName: $name) { entityId } }`,
          { name: domainName },
        ).finally(() => api.dispose());

        const { modal, trigger } = await openCreateCredentialUserPicker(page);
        await searchAndPickUser(page, trigger, 'User', userInfo.user2.email);
        await expect(trigger).toHaveText(userInfo.user2.email);

        // Both admin roles resolve the domain UUID, then read that domain only.
        expect(operationNames(operations)).toContain(
          'BAIAdminUserSelectDomainIdQuery',
        );
        const scoped = operations.filter(
          (op) => op.name === 'BAIUserSelectScopedPaginatedQuery',
        );
        expect(scoped.length).toBeGreaterThan(0);
        for (const op of scoped) {
          expect(op.variables.scope).toEqual({
            domain: [{ value: domainV2.entityId }],
          });
          expect(op.response?.errors).toBeUndefined();
        }
        expect(
          scoped.some((op) =>
            JSON.stringify(op.variables.filter ?? {}).includes('iContains'),
          ),
        ).toBe(true);

        await modal.getByRole('button', { name: 'Cancel' }).click();
      });
    }

    test.describe('Project admin', () => {
      const projectName = `e2e-user-select-${Date.now()}`;
      let api: APIRequestContext;
      let projectId: string;
      let roleId: string;
      let projectAdminId: string;
      let memberIds: Array<string> = [];

      /** Creates the project, adds two members and makes the first its admin. */
      async function seedProject() {
        api = await createAdminApiContext();
        const created = await gqlAdmin<{
          create_group: { group: { id: string } };
        }>(
          api,
          `mutation ($name: String!) {
            create_group(name: $name, props: { domain_name: "default" }) {
              group { id }
            }
          }`,
          { name: projectName },
        );
        projectId = created.create_group.group.id;

        const { adminUsersV2 } = await gqlAdmin<{
          adminUsersV2: {
            edges: Array<{
              node: { id: string; basicInfo: { email: string } };
            }>;
          };
        }>(
          api,
          `query ($emails: [String!]) {
            adminUsersV2(filter: { email: { in: $emails } }) {
              edges { node { id basicInfo { email } } }
            }
          }`,
          { emails: [userInfo.user.email, userInfo.user2.email] },
        );
        const idByEmail = Object.fromEntries(
          adminUsersV2.edges.map((e) => [
            e.node.basicInfo.email,
            toRawUUID(e.node.id),
          ]),
        );
        projectAdminId = idByEmail[userInfo.user.email];
        memberIds = Object.values(idByEmail);
        await gqlAdmin(
          api,
          `mutation ($gid: UUID!, $uids: [String]) {
            modify_group(gid: $gid, props: { user_update_mode: "add", user_uuids: $uids }) { ok }
          }`,
          { gid: projectId, uids: memberIds },
        );

        // The project's own admin role, as 'Set Project Admin' grants it on 26.9.
        const { adminRoles } = await gqlAdmin<{
          adminRoles: { edges: Array<{ node: { id: string } }> };
        }>(
          api,
          `query ($filter: RoleFilter) {
            adminRoles(filter: $filter, first: 50) { edges { node { id } } }
          }`,
          {
            filter: {
              status: { equals: 'ACTIVE' },
              mappedScope: {
                scopeType: { iEquals: 'project' },
                scopeId: { equals: projectId },
              },
              permissions: {
                some: { entityType: { iEquals: 'scope_admin' } },
              },
            },
          },
        );
        roleId = toRawUUID(adminRoles.edges[0].node.id);
        await gqlAdmin(
          api,
          `mutation ($input: BulkAssignRoleInput!) {
            adminBulkAssignRole(input: $input) { failed { message } }
          }`,
          { input: { roleId, userIds: [projectAdminId], projectId } },
        );
      }

      test.afterAll(async () => {
        if (!api || !projectId) return;
        const steps: Array<[string, Record<string, unknown>]> = [
          [
            `mutation ($input: RevokeRoleInput!) { adminRevokeRole(input: $input) { id } }`,
            { input: { userId: projectAdminId, roleId } },
          ],
          [
            `mutation ($gid: UUID!, $uids: [String]) {
              modify_group(gid: $gid, props: { user_update_mode: "remove", user_uuids: $uids }) { ok }
            }`,
            { gid: projectId, uids: memberIds },
          ],
          [
            `mutation ($gid: UUID!) { delete_group(gid: $gid) { ok } }`,
            { gid: projectId },
          ],
          [
            `mutation ($gid: UUID!) { purge_group(gid: $gid) { ok } }`,
            { gid: projectId },
          ],
        ];
        for (const [query, variables] of steps) {
          if (!projectId) break;
          await gqlAdmin(api, query, variables).catch((error) =>
            console.warn(`[user-select cleanup] ${String(error)}`),
          );
        }
        await api.dispose();
      });

      test('Project admin can pick only members of their project from the session owner filter', async ({
        page,
        request,
      }) => {
        const operations = recordUserSelectOperations(page);
        await loginAsUser(page, request);
        await skipUnlessManager269(page);
        // Seeded after the version check so an older manager skips cleanly, and
        // before a fresh login so the new project is in the user's project list.
        await seedProject();
        await logout(page);
        await loginAsUser(page, request);

        await navigateTo(page, `project/${projectName}/admin/session`);
        await page.getByRole('combobox', { name: 'Search filters' }).click();
        await page.getByRole('option', { name: 'Owner', exact: true }).click();

        // Exactly the project's two members, no one else in the domain.
        await searchAndPickUser(
          page,
          page.getByRole('button', { name: 'Owner', exact: true }),
          'Owner',
          userInfo.user2.email,
          [userInfo.user.email, userInfo.user2.email],
        );
        await expect(
          page.getByRole('button', { name: 'Owner', exact: true }),
        ).toHaveText(userInfo.user2.email);
        await page.getByRole('button', { name: 'Apply', exact: true }).click();
        await expect(
          page.getByRole('group', { name: 'Search filters' }),
        ).toContainText(userInfo.user2.email);

        const names = operationNames(operations);
        expect(names).not.toContain('BAIAdminUserSelectDomainIdQuery');
        const scoped = operations.filter(
          (op) => op.name === 'BAIUserSelectScopedPaginatedQuery',
        );
        expect(scoped.length).toBeGreaterThan(0);
        for (const op of scoped) {
          expect(op.variables.scope).toEqual({
            project: [{ value: projectId }],
          });
          expect(op.response?.errors).toBeUndefined();
        }
      });
    });
  },
);
