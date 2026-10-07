// FR-4108 (#10000): the session owner's project select is a paginated,
// server-searched select over the owner's ProjectV2 memberships, and it no
// longer auto-selects the first project.
import {
  createAdminApiContext,
  createProjectViaApi,
  purgeProjectViaApi,
  sweepStaleProjectsViaApi,
} from '../utils/admin-api';
import { loginAsAdmin, navigateTo, userInfo } from '../utils/test-util';
import { expect, test, type APIRequestContext } from '@playwright/test';

const PROJECT_PREFIX = 'e2e-owner-proj-';

test.describe(
  'SessionLauncher - Session Owner Project',
  {
    tag: ['@regression', '@session', '@functional'],
  },
  () => {
    let api: APIRequestContext;
    let projectId: string | undefined;
    let projectName: string;

    test.beforeEach(async ({ page, request }) => {
      api = await createAdminApiContext();
      await sweepStaleProjectsViaApi(api, new RegExp(`^${PROJECT_PREFIX}`));
      projectName = `${PROJECT_PREFIX}${Date.now().toString(36)}${Math.random()
        .toString(36)
        .slice(2, 6)}`;
      projectId = await createProjectViaApi(api, projectName, {
        memberEmails: [userInfo.user.email],
      });
      await loginAsAdmin(page, request);
    });

    test.afterEach(async () => {
      if (projectId) await purgeProjectViaApi(api, projectId);
      projectId = undefined;
      await api?.dispose();
    });

    test('Superadmin can assign a session to another user in a project picked by searching the owner projects', async ({
      page,
    }) => {
      await navigateTo(page, 'session/start');
      await page.getByRole('switch', { name: 'Session owner' }).click();

      const ownerEmail = page.getByRole('textbox', { name: 'Owner Email' });
      await ownerEmail.fill(userInfo.user.email);
      await ownerEmail.press('Enter');

      const ownerProject = page.getByRole('button', { name: 'Owner project' });
      await expect(ownerProject).toBeEnabled({ timeout: 15000 });
      await expect(ownerProject).toHaveText('Select Project');
      const ownerResourceGroup = page.getByRole('combobox', {
        name: /^Owner resource group/,
      });
      await expect(ownerResourceGroup).toBeDisabled();

      await ownerProject.click();
      const projectList = page.getByRole('listbox', { name: 'Owner project' });
      await expect(
        projectList.getByRole('option', { name: projectName }),
      ).toBeVisible({ timeout: 15000 });

      await page
        .getByRole('dialog', { name: 'Owner project' })
        .getByRole('combobox', { name: 'Search options' })
        .fill(projectName);
      await expect(projectList.getByRole('option')).toHaveCount(1, {
        timeout: 15000,
      });
      await projectList.getByRole('option', { name: projectName }).click();

      await expect(ownerProject).toHaveText(projectName);
      const resourceGroupSelect = page.getByRole('button', {
        name: /^Owner resource group/,
      });
      await expect(resourceGroupSelect).toBeEnabled({ timeout: 15000 });
      await expect(resourceGroupSelect).not.toHaveText(/^\s*Select/);

      // The review step shows `owner.project`, which the launcher submits as
      // `group_name`. Launching itself is not exercised: it needs an
      // installed image, which the shared test cluster does not guarantee.
      await page.getByRole('button', { name: 'Skip to review' }).click();
      await expect(
        page
          .getByRole('term')
          .filter({ hasText: /^Owner project$/ })
          .locator('xpath=following-sibling::*[1]'),
      ).toHaveText(projectName, { timeout: 15000 });
    });
  },
);
