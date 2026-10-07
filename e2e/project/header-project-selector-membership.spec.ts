// FR-4108 (#10000): the header project selector reads membership from
// ProjectV2 — it lists only the active projects the user belongs to.
import {
  createAdminApiContext,
  createProjectViaApi,
  purgeProjectViaApi,
  sweepStaleProjectsViaApi,
} from '../utils/admin-api';
import { loginAsUser, navigateTo, userInfo } from '../utils/test-util';
import { expect, test, type APIRequestContext } from '@playwright/test';

const PROJECT_PREFIX = 'e2e-membership-';

test.describe(
  'Header ProjectSelect - Project Membership',
  {
    tag: ['@regression', '@project', '@functional'],
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
      projectIds.push(
        await createProjectViaApi(api, nonMemberProject, {
          domainName: 'default',
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
