// spec: FR-3972
import {
  createAdminApiContext,
  createVFolderViaApi,
  purgeVFolderViaApi,
} from '../utils/admin-api';
import {
  getClientProperty,
  skipUnlessAllowedVFolderType,
} from '../utils/feature-gate-util';
import {
  clearAllFilters,
  getVFolderRow,
  loginAsAdmin,
  navigateTo,
  selectPropertyFilter,
} from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

async function switchProjectFromHeader(page: Page, projectName: string) {
  const selector = page.getByTestId('selector-project');
  await selector.click();
  // Filter on text, not accessible name: a project-admin option also carries
  // a badge icon that joins its accessible name.
  const escaped = projectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  await page
    .getByRole('option')
    .filter({ hasText: new RegExp(`^${escaped}$`) })
    .click();
  await expect(selector).toContainText(projectName);
}

async function filterFoldersByName(page: Page, name: string) {
  await clearAllFilters(page);
  await selectPropertyFilter(page, 'Name', name);
}

test.describe(
  'Project Switcher - Data Scope',
  {
    tag: [
      '@regression',
      '@project',
      '@functional',
      '@requires-vfolder-type-group',
      '@requires-seeded-data',
    ],
  },
  () => {
    test('Admin sees only the selected project folders after switching projects from the header', async ({
      page,
      request,
    }) => {
      // 1. Log in and read the projects the header switcher offers
      await loginAsAdmin(page, request);
      await skipUnlessAllowedVFolderType(
        page,
        'group',
        'Requires Project-type vfolders to be enabled (@requires-vfolder-type-group)',
      );
      await expect
        .poll(
          async () =>
            ((await getClientProperty(page, 'groups')) as string[] | undefined)
              ?.length ?? 0,
        )
        .toBeGreaterThan(0);
      const originalProject = (await getClientProperty(
        page,
        'current_group',
      )) as string;
      const groups = (await getClientProperty(page, 'groups')) as string[];
      const projectIds = (await getClientProperty(page, 'groupIds')) as Record<
        string,
        string
      >;
      const otherProject = groups.find((name) => name !== originalProject);
      test.skip(
        !otherProject,
        'Requires the admin account to belong to at least 2 projects (@requires-seeded-data)',
      );

      // 2. Create one folder in each project, sharing a per-run prefix
      const prefix = `e2e-scope-${Date.now()}`;
      const originalFolder = `${prefix}-original`;
      const otherFolder = `${prefix}-other`;
      const api = await createAdminApiContext();
      const createdIds: string[] = [];
      try {
        createdIds.push(
          await createVFolderViaApi(api, {
            name: originalFolder,
            projectId: projectIds[originalProject],
          }),
        );
        createdIds.push(
          await createVFolderViaApi(api, {
            name: otherFolder,
            projectId: projectIds[otherProject as string],
          }),
        );

        // 3. On the original project, only its own folder is listed
        await navigateTo(page, 'data');
        await filterFoldersByName(page, prefix);
        // The positive check comes first: it proves this scope's result has
        // rendered, so the absence check below cannot pass on a stale list.
        await expect(getVFolderRow(page, originalFolder)).toBeVisible();
        await expect(getVFolderRow(page, otherFolder)).toHaveCount(0);

        // 4. Switch to the other project from the header
        await switchProjectFromHeader(page, otherProject as string);

        // 5. Now only the other project's folder is listed
        await filterFoldersByName(page, prefix);
        await expect(getVFolderRow(page, otherFolder)).toBeVisible();
        await expect(getVFolderRow(page, originalFolder)).toHaveCount(0);
      } finally {
        // The selection is account-scoped, so restore it for later specs.
        await switchProjectFromHeader(page, originalProject).catch(() => {});
        for (const id of createdIds) {
          await purgeVFolderViaApi(api, id);
        }
        await api.dispose();
      }
    });
  },
);
