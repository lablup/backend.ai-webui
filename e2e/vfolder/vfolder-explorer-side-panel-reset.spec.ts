/**
 * Covers FR-4005 (PR #9793): `FolderExplorerOpener` wraps the explorer in
 * `BAIUnmountAfterClose`, so every explorer session starts from fresh local
 * state. The side panel's tab is the user-visible piece of that state.
 */
import { FolderExplorerModal } from '../utils/classes/vfolder/FolderExplorerModal';
import { cleanupVFolderSafely } from '../utils/cleanup-util';
import {
  createVFolderAndVerify,
  loginAsUser,
  navigateTo,
} from '../utils/test-util';
import { expect, Page, test } from '@playwright/test';

const openFolderExplorer = async (
  page: Page,
  folderName: string,
): Promise<FolderExplorerModal> => {
  await navigateTo(page, 'data');
  const folderLink = page.getByRole('link', { name: folderName }).first();
  await expect(folderLink).toBeVisible({ timeout: 15000 });
  await folderLink.click();
  const modal = new FolderExplorerModal(page);
  await modal.waitForOpen();
  await modal.verifyFileExplorerLoaded();
  return modal;
};

test.describe(
  'FolderExplorerModal - Side Panel Session State',
  { tag: ['@regression', '@vfolder', '@functional'] },
  () => {
    const runId = Date.now();
    const folderA = `e2e-test-folder-panel-a-${runId}`;
    const folderB = `e2e-test-folder-panel-b-${runId}`;

    test.beforeAll(async ({ browser, request }) => {
      test.setTimeout(120000);
      const context = await browser.newContext();
      const page = await context.newPage();
      await loginAsUser(page, request);
      await createVFolderAndVerify(page, folderA);
      await createVFolderAndVerify(page, folderB);
      await context.close();
    });

    test.afterAll(async ({ browser, request }) => {
      test.setTimeout(120000);
      const context = await browser.newContext();
      const page = await context.newPage();
      await loginAsUser(page, request);
      await cleanupVFolderSafely(page, folderA);
      await cleanupVFolderSafely(page, folderB);
      await context.close();
    });

    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
    });

    test('User sees the folder explorer side panel back on Metadata after reopening a folder', async ({
      page,
    }) => {
      test.setTimeout(120000);

      // 1. Open folder A; the side panel starts on Metadata.
      const modalA = await openFolderExplorer(page, folderA);
      await modalA.verifyFolderName(folderA);
      await modalA.verifyInfoPanelTabSelected('metadata');
      await modalA.verifyMetadataPanelContent();

      // 2. Switch the side panel to Audit Log within this session.
      await modalA.selectInfoPanelTab('auditLog');

      // 3. Close the explorer, ending the session.
      await modalA.close();

      // 4. Open a different folder: the side panel must start over on
      //    Metadata rather than remembering Audit Log (FR-4005).
      const modalB = await openFolderExplorer(page, folderB);
      await modalB.verifyFolderName(folderB);
      await modalB.verifyInfoPanelTabSelected('metadata');
      await modalB.verifyMetadataPanelContent();

      // 5. Reopening the SAME folder also starts fresh.
      await modalB.selectInfoPanelTab('auditLog');
      await modalB.close();

      const modalBAgain = await openFolderExplorer(page, folderB);
      await modalBAgain.verifyInfoPanelTabSelected('metadata');
      await modalBAgain.verifyMetadataPanelContent();
      await modalBAgain.close();
    });
  },
);
