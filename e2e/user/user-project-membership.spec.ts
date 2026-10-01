// Regression for FR-4060: the Edit User Detail modal sends `groupIds` as the
// full membership list, so it must load every project the user belongs to.
// Before the fix it read only the connection's default page of 10, and saving
// any other field silently dropped the rest.
import {
  createAdminApiContext,
  gqlAdmin,
  purgeUserViaApi,
} from '../utils/admin-api';
import { loginAsAdmin } from '../utils/test-util';
import { navigateToUsersPage } from '../utils/user-profile-util';
import { test, expect, type APIRequestContext, Page } from '@playwright/test';
import { randomBytes } from 'node:crypto';

const EXTRA_PROJECT_COUNT = 11;

async function listUserProjectIds(
  api: APIRequestContext,
  email: string,
): Promise<string[]> {
  const data = await gqlAdmin<{ user: { groups: Array<{ id: string }> } }>(
    api,
    `query($email: String) { user(email: $email) { groups { id } } }`,
    { email },
  );
  return (data.user?.groups ?? []).map((g) => g.id).sort();
}

async function openEditUserModal(page: Page, email: string) {
  const userRow = page.getByRole('row').filter({ hasText: email });
  await expect(userRow).toBeVisible({ timeout: 20000 });
  await userRow.hover();
  await userRow.getByRole('button', { name: 'Edit', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit User Detail' });
  await expect(dialog).toBeVisible();
  return dialog;
}

/**
 * The Projects multi-select summarises its value as "a, b, c, +N"; returns the
 * number of selected projects it represents.
 */
function countSummarisedProjects(summary: string): number {
  const parts = summary.split(',').map((part) => part.trim());
  const overflow = /^\+(\d+)$/.exec(parts[parts.length - 1] ?? '');
  return overflow
    ? parts.length - 1 + Number(overflow[1])
    : parts.filter(Boolean).length;
}

test.describe(
  'User project membership',
  { tag: ['@regression', '@user', '@functional'] },
  () => {
    let api: APIRequestContext | null = null;
    let email: string;
    const projectIds: string[] = [];

    test.beforeEach(async () => {
      const runId = `${Date.now().toString(36)}${randomBytes(3).toString('hex')}`;
      email = `e2e-many-proj-${runId}@lablup.com`;
      api = await createAdminApiContext();
      const adminApi = api;
      for (let i = 0; i < EXTRA_PROJECT_COUNT; i++) {
        const data = await gqlAdmin<{
          create_group: { ok: boolean; msg: string; group: { id: string } };
        }>(
          adminApi,
          `mutation($name: String!, $props: GroupInput!) {
            create_group(name: $name, props: $props) { ok msg group { id } }
          }`,
          {
            name: `e2e-mp-${runId}-${String(i).padStart(2, '0')}`,
            props: { domain_name: 'default' },
          },
        );
        expect(data.create_group.ok, data.create_group.msg).toBe(true);
        projectIds.push(data.create_group.group.id);
      }
      const created = await gqlAdmin<{
        create_user: { ok: boolean; msg: string };
      }>(
        adminApi,
        `mutation($email: String!, $props: UserInput!) {
          create_user(email: $email, props: $props) { ok msg }
        }`,
        {
          email,
          props: {
            username: `e2e-many-proj-${runId}`,
            password: `e2e-${randomBytes(12).toString('hex')}@Pw`,
            need_password_change: false,
            domain_name: 'default',
            group_ids: projectIds,
          },
        },
      );
      expect(created.create_user.ok, created.create_user.msg).toBe(true);
    });

    test.afterEach(async () => {
      if (!api) return;
      const adminApi = api;
      api = null;
      await purgeUserViaApi(adminApi, email).catch((error) =>
        console.warn(`could not purge ${email}:`, error),
      );
      for (const gid of projectIds.splice(0)) {
        try {
          await gqlAdmin(
            adminApi,
            `mutation($gid: UUID!) { delete_group(gid: $gid) { ok } }`,
            { gid },
          );
          const purged = await gqlAdmin<{
            purge_group: { ok: boolean; msg: string };
          }>(
            adminApi,
            `mutation($gid: UUID!) { purge_group(gid: $gid) { ok msg } }`,
            { gid },
          );
          if (!purged.purge_group?.ok) {
            console.warn(
              `could not purge project ${gid}: ${purged.purge_group?.msg}`,
            );
          }
        } catch (error) {
          console.warn(`could not purge project ${gid}:`, error);
        }
      }
      await adminApi.dispose();
    });

    test('Admin can save a user in more than 10 projects without losing memberships', async ({
      page,
      request,
    }) => {
      const adminApi = api;
      if (!adminApi) throw new Error('admin API context was not created');
      const membershipBefore = await listUserProjectIds(adminApi, email);
      expect(membershipBefore).toEqual(expect.arrayContaining(projectIds));
      expect(membershipBefore.length).toBeGreaterThan(10);

      await loginAsAdmin(page, request);
      await navigateToUsersPage(page);

      // Change an unrelated field only and save.
      let dialog = await openEditUserModal(page, email);
      const projectSelect = dialog.getByRole('button', {
        name: 'Select Project',
      });
      await expect
        .poll(async () =>
          countSummarisedProjects((await projectSelect.textContent()) ?? ''),
        )
        .toBe(membershipBefore.length);
      await dialog.getByLabel('Full Name').fill('E2E Many Projects');
      await dialog.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(dialog).toBeHidden({ timeout: 10000 });

      // The manager still has every membership.
      await expect
        .poll(() => listUserProjectIds(adminApi, email))
        .toEqual(membershipBefore);

      // Reopening the modal shows the same full project list.
      await page.reload();
      await navigateToUsersPage(page);
      dialog = await openEditUserModal(page, email);
      await expect(dialog.getByLabel('Full Name')).toHaveValue(
        'E2E Many Projects',
      );
      await expect
        .poll(async () =>
          countSummarisedProjects(
            (await dialog
              .getByRole('button', { name: 'Select Project' })
              .textContent()) ?? '',
          ),
        )
        .toBe(membershipBefore.length);
    });
  },
);
