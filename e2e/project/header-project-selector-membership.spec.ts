// FR-4108 (#10000): the header project selector reads membership from
// ProjectV2 — it lists only the active projects the user belongs to.
// #10490: it also offers the user's personal project under a "Personal" group.
import {
  createAdminApiContext,
  createProjectViaApi,
  purgeProjectViaApi,
  sweepStaleProjectsViaApi,
} from '../utils/admin-api';
import { getE2EDomainName } from '../utils/e2e-scope';
import {
  loginAsAdmin,
  loginAsUser,
  navigateTo,
  notFoundPageHeading,
  userInfo,
} from '../utils/test-util';
import { navigateToUsersPage } from '../utils/user-profile-util';
import { expect, test, type APIRequestContext } from '@playwright/test';

const PROJECT_PREFIX = 'e2e-membership-';

test.describe(
  'Header ProjectSelect - Project Membership',
  {
    tag: ['@regression', '@project', '@functional', '@requires-manager-v26.2'],
  },
  () => {
    let api: APIRequestContext;
    const projectIds: string[] = [];
    let memberProject: string;
    let inactiveMemberProject: string;
    let nonMemberProject: string;

    test.beforeEach(async ({ page, request }) => {
      api = await createAdminApiContext();
      await sweepStaleProjectsViaApi(api, new RegExp(`^${PROJECT_PREFIX}`));
      const suffix = `${Date.now().toString(36)}${Math.random()
        .toString(36)
        .slice(2, 6)}`;
      memberProject = `${PROJECT_PREFIX}member-${suffix}`;
      inactiveMemberProject = `${PROJECT_PREFIX}inactive-${suffix}`;
      nonMemberProject = `${PROJECT_PREFIX}other-${suffix}`;
      // Push each id as soon as it exists so a later failure cannot leak it.
      projectIds.push(
        await createProjectViaApi(api, memberProject, {
          memberEmails: [userInfo.user.email],
        }),
      );
      projectIds.push(
        await createProjectViaApi(api, inactiveMemberProject, {
          memberEmails: [userInfo.user.email],
          isActive: false,
        }),
      );
      // Same domain as the user, so only the missing membership hides it.
      projectIds.push(
        await createProjectViaApi(api, nonMemberProject, {
          domainName: await getE2EDomainName(api),
        }),
      );
      await loginAsUser(page, request);
    });

    test.afterEach(async () => {
      for (const id of projectIds.splice(0)) {
        await purgeProjectViaApi(api, id);
      }
      await api?.dispose();
    });

    test('User can switch only between active member projects in the header project selector', async ({
      page,
    }) => {
      await navigateTo(page, 'session');
      const selector = page.getByRole('button', { name: 'Select Project' });
      await expect(selector).toBeVisible({ timeout: 15000 });
      await selector.click();

      const projectList = page.getByRole('listbox', {
        name: 'Select Project',
      });
      await expect(
        projectList.getByRole('option', { name: memberProject }),
      ).toBeVisible({ timeout: 15000 });
      await expect(
        projectList.getByRole('option', { name: inactiveMemberProject }),
      ).toHaveCount(0);
      await expect(
        projectList.getByRole('option', { name: nonMemberProject }),
      ).toHaveCount(0);

      await projectList.getByRole('option', { name: memberProject }).click();
      await expect(page).toHaveURL((url) =>
        url.pathname.endsWith(`/project/${memberProject}/session`),
      );
      await expect(selector).toHaveText(memberProject);
    });
  },
);

test.describe(
  'Header ProjectSelect - Personal Project',
  {
    tag: ['@regression', '@project', '@functional', '@requires-manager-v26.2'],
  },
  () => {
    test('User can switch to their personal project from the header project selector', async ({
      page,
      request,
    }) => {
      await loginAsUser(page, request);
      await navigateTo(page, 'data');
      const selector = page.getByRole('button', { name: 'Select Project' });
      await expect(selector).toBeVisible({ timeout: 15000 });
      await selector.click();

      const personalOption = page
        .getByRole('listbox', { name: 'Select Project' })
        .getByRole('group', { name: 'Personal' })
        .getByRole('option');
      await expect(personalOption).toHaveCount(1, { timeout: 15000 });
      await expect(personalOption).toBeEnabled();
      const personalProject = (await personalOption.innerText()).trim();
      expect(personalProject).not.toBe('');

      // The reload can add a trailing slash.
      const isPersonalDataPage = (url: URL) =>
        url.pathname
          .replace(/\/$/, '')
          .endsWith(`/project/${personalProject}/data`);
      await personalOption.click();
      await expect(page).toHaveURL(isPersonalDataPage);
      await expect(selector).toHaveText(personalProject);

      await page.reload();
      await expect(selector).toHaveText(personalProject, { timeout: 15000 });
      await expect(page).toHaveURL(isPersonalDataPage);
      await expect(notFoundPageHeading(page)).toBeHidden();
      await expect(
        page.getByText(`Project ‘${personalProject}’ was not found`),
      ).toBeHidden();
    });

    test('Admin cannot remove the personal project in the user project editor', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await navigateToUsersPage(page);
      const userRow = page
        .getByRole('row')
        .filter({ hasText: userInfo.user.email });
      await expect(userRow).toBeVisible({ timeout: 20000 });
      await userRow.hover();
      await userRow.getByRole('button', { name: 'Edit', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'Edit User Detail' });
      await expect(dialog).toBeVisible();

      await dialog.getByRole('button', { name: /^Projects/ }).click();
      const personalOption = page
        .getByRole('listbox', { name: /^Projects/ })
        .getByRole('group', { name: 'Personal' })
        .getByRole('option');
      await expect(personalOption).toHaveCount(1, { timeout: 15000 });
      await expect(personalOption).toBeDisabled();
      await expect(personalOption).toHaveAttribute('aria-selected', 'true');

      await personalOption.hover();
      await expect(
        page.getByRole('tooltip', {
          name: 'The personal project assigned to the user cannot be removed.',
        }),
      ).toBeVisible();

      await page.keyboard.press('Escape');
      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(dialog).toBeHidden();
    });
  },
);
