// FR-4119: the project-admin session page lists the project's members. The
// admin console half is in e2e/admin/session/admin-user-select-scope-by-role.spec.ts.
import { createAdminApiContext, gqlAdmin } from '../../utils/admin-api';
import { getE2EDomainName } from '../../utils/e2e-scope';
import {
  loginAsUser,
  logout,
  navigateTo,
  userInfo,
} from '../../utils/test-util';
import {
  recordUserSelectOperations,
  searchAndPickUser,
  skipUnlessManager269,
  toRawUUID,
} from '../../utils/user-select-util';
import test, { APIRequestContext, expect } from '@playwright/test';

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
        // The e2e accounts' domain: it is not `default` on every server.
        const domainName = await getE2EDomainName(api);
        const created = await gqlAdmin<{
          create_group: { group: { id: string } };
        }>(
          api,
          `mutation ($name: String!, $domain: String!) {
            create_group(name: $name, props: { domain_name: $domain }) {
              group { id }
            }
          }`,
          { name: projectName, domain: domainName },
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
        await loginAsUser(page, request, { fresh: true });
        await skipUnlessManager269(page);
        // Seeded after the version check so an older manager skips cleanly, and
        // before a fresh login so the new project is in the user's project list.
        await seedProject();
        await logout(page);
        await loginAsUser(page, request, { fresh: true });

        await navigateTo(page, `project/${projectName}/admin/session`);
        await page.getByRole('combobox', { name: 'Search filters' }).click();
        await page.getByRole('option', { name: 'Owner', exact: true }).click();

        // Exactly the project's two members, no one else in the domain.
        await searchAndPickUser(
          page,
          page.getByRole('combobox', { name: 'Owner', exact: true }),
          'Owner',
          userInfo.user2.email,
          [userInfo.user.email, userInfo.user2.email],
        );
        await expect(
          page.getByRole('combobox', { name: 'Owner', exact: true }),
        ).toHaveText(userInfo.user2.email);
        await page.getByRole('button', { name: 'Apply', exact: true }).click();
        await expect(
          page.getByRole('group', { name: 'Search filters' }),
        ).toContainText(userInfo.user2.email);

        const scoped = operations.filter(
          (op) => op.name === 'BAIScopedUserSelectPaginatedQuery',
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
