// Covers the Model Store tab columns changed in #9639 (FR-3914): Project shows
// the project name instead of its UUID, and a hidden-by-default Updated At
// ("Modified At") column.
import { createAdminApiContext, gqlAdmin } from '../utils/admin-api';
import { AdminModelCardPage } from '../utils/classes/AdminModelCardPage';
import {
  deleteForeverAndVerifyFromTrash,
  getSortableColumnHeader,
  loginAsAdmin,
  moveToTrashAndVerify,
} from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

async function setColumnVisible(
  page: Page,
  column: string,
  visible: boolean,
): Promise<void> {
  await page.getByRole('button', { name: 'Table Settings' }).click();
  const settings = page.getByRole('dialog');
  await expect(settings).toBeVisible();
  await settings.getByRole('checkbox', { name: column }).setChecked(visible);
  await settings.getByRole('button', { name: 'Apply' }).click();
  await expect(settings).toBeHidden({ timeout: 30000 });
}

test.describe(
  'Admin Model Card Management - Project and Updated At columns',
  {
    tag: [
      '@admin-model-card',
      '@admin',
      '@regression',
      '@requires-manager-v26.4',
    ],
  },
  () => {
    let cardName: string;
    let folderName: string;

    test.beforeEach(async ({ page, request }, testInfo) => {
      const timestamp = Date.now();
      cardName = `e2e-test-project-col-${testInfo.workerIndex}-${timestamp}`;
      folderName = `e2e-test-project-col-folder-${testInfo.workerIndex}-${timestamp}`;
      await loginAsAdmin(page, request);
      const adminModelCardPage = new AdminModelCardPage(page);
      await adminModelCardPage.goto();
      await adminModelCardPage.createModelCard({
        name: cardName,
        createNewFolderName: folderName,
      });
    });

    test.afterEach(async ({ page }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      try {
        await setColumnVisible(page, 'Modified At', false);
      } catch {
        // The column may already be hidden, or the test never got that far.
      }
      try {
        await adminModelCardPage.goto();
        await adminModelCardPage.applyNameFilter(cardName);
        if ((await adminModelCardPage.getRowByName(cardName).count()) > 0) {
          await adminModelCardPage.deleteModelCardByName(cardName);
        }
      } catch {
        // Ignore cleanup errors
      }
      try {
        await moveToTrashAndVerify(page, folderName, 'admin-data', {
          skipTrashVerify: true,
        });
      } catch {
        // Folder may already be in Trash or may not exist
      }
      try {
        await deleteForeverAndVerifyFromTrash(page, folderName, 'admin-data');
      } catch {
        // Folder may not be in Trash (already purged or never created)
      }
    });

    test('Admin sees model card project names in the Model Store tab', async ({
      page,
    }) => {
      const api = await createAdminApiContext();
      const expected = await gqlAdmin(
        api,
        `query($filter: ModelCardV2Filter) {
          adminModelCardsV2(filter: $filter, limit: 1) {
            edges { node { projectId project { basicInfo { name } } } }
          }
        }`,
        { filter: { name: { equals: cardName } } },
      ).finally(() => api.dispose());
      const node = expected.adminModelCardsV2.edges[0]?.node;
      const projectName: string = node?.project?.basicInfo?.name;
      expect(projectName).toBeTruthy();

      const adminModelCardPage = new AdminModelCardPage(page);
      await adminModelCardPage.goto();
      await adminModelCardPage.applyNameFilter(cardName);
      const row = adminModelCardPage.getRowByName(cardName);
      await expect(row).toBeVisible({ timeout: 15000 });

      // The Project column shows the project name, not the raw UUID.
      await expect(
        row.getByRole('cell', { name: projectName, exact: true }),
      ).toBeVisible();
      await expect(row).not.toContainText(node.projectId);

      // Updated At is hidden until enabled from Table Settings.
      await expect(getSortableColumnHeader(page, 'Modified At')).toHaveCount(0);
      await setColumnVisible(page, 'Modified At', true);
      const modifiedAtHeader = getSortableColumnHeader(page, 'Modified At');
      await expect(modifiedAtHeader).toBeVisible();

      const headerIndex = await page
        .getByRole('columnheader')
        .evaluateAll((headers) =>
          headers.findIndex((h) => h.textContent?.trim() === 'Modified At'),
        );
      expect(headerIndex).toBeGreaterThanOrEqual(0);
      await expect(row.locator(`td:nth-child(${headerIndex + 1})`)).toHaveText(
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
      );
    });
  },
);
