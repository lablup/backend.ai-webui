// spec: e2e/.agent-output/test-plan-start-dashboard.md
// scenarios: 1 (Card Rendering), 2 (Create Folder), 3 (Start Session Navigation),
//            4 (Start From URL Modal), 5 (Board Item Drag-and-Drop)
import { StartPage } from '../utils/classes/common/StartPage';
import { FolderCreationModal } from '../utils/classes/vfolder/FolderCreationModal';
import {
  loginAsAdmin,
  loginAsUser,
  moveToTrashAndVerify,
  deleteForeverAndVerifyFromTrash,
  navigateTo,
} from '../utils/test-util';
import { test, expect } from '@playwright/test';

// Timeout for card/widget visibility checks - the Start page board loads items
// asynchronously after GraphQL queries, which may be slow when multiple workers
// run in parallel.
const CARD_TIMEOUT = 30_000;

test.describe(
  'Start Page',
  { tag: ['@regression', '@start', '@functional'] },
  () => {
    // -----------------------------------------------------------------------
    // 1. Card Rendering
    // -----------------------------------------------------------------------
    test.describe('Card Rendering', () => {
      test('Admin can see all expected quick-action cards on the Start page', async ({
        page,
        request,
      }) => {
        // 1. Login as admin and navigate to /start
        await loginAsAdmin(page, request);
        await navigateTo(page, 'start');

        // 2. Verify the "Create New Storage Folder" card is visible
        await expect(
          page
            .locator('.bai_grid_item')
            .filter({ hasText: 'Create New Storage Folder' }),
        ).toBeVisible({ timeout: CARD_TIMEOUT });

        // 3. Verify the "Start Interactive Session" card is visible
        await expect(
          page
            .locator('.bai_grid_item')
            .filter({ hasText: 'Start Interactive Session' }),
        ).toBeVisible({ timeout: CARD_TIMEOUT });

        // 4. Verify the "Start Batch Session" card is visible
        await expect(
          page
            .locator('.bai_grid_item')
            .filter({ hasText: 'Start Batch Session' }),
        ).toBeVisible({ timeout: CARD_TIMEOUT });

        // 5. Verify the "Start From URL" card is visible
        await expect(
          page.locator('.bai_grid_item').filter({ hasText: 'Start From URL' }),
        ).toBeVisible({ timeout: CARD_TIMEOUT });

        // 6. Verify the board is not empty (no empty-state alert visible)
        // Note: the actual UI text contains a typo "availiable" instead of "available"
        await expect(
          page.getByText('No availiable Start items.'),
        ).not.toBeVisible();
      });

      test('User can see all expected quick-action cards on the Start page', async ({
        page,
        request,
      }) => {
        // 1. Login as regular user and navigate to /start
        await loginAsUser(page, request);
        await navigateTo(page, 'start');

        // 2. Verify the "Create New Storage Folder" card is visible
        await expect(
          page
            .locator('.bai_grid_item')
            .filter({ hasText: 'Create New Storage Folder' }),
        ).toBeVisible({ timeout: CARD_TIMEOUT });

        // 3. Verify the "Start Interactive Session" card is visible
        await expect(
          page
            .locator('.bai_grid_item')
            .filter({ hasText: 'Start Interactive Session' }),
        ).toBeVisible({ timeout: CARD_TIMEOUT });

        // 4. Verify the "Start Batch Session" card is visible
        await expect(
          page
            .locator('.bai_grid_item')
            .filter({ hasText: 'Start Batch Session' }),
        ).toBeVisible({ timeout: CARD_TIMEOUT });

        // 5. Verify the "Start From URL" card is visible
        await expect(
          page.locator('.bai_grid_item').filter({ hasText: 'Start From URL' }),
        ).toBeVisible({ timeout: CARD_TIMEOUT });
      });
    });

    // -----------------------------------------------------------------------
    // 2. Create Folder Action
    // -----------------------------------------------------------------------
    test.describe('Create Folder Action', () => {
      test('Admin can open the Create Folder modal from the Start page', async ({
        page,
        request,
      }) => {
        // 1. Login as admin and navigate to /start
        await loginAsAdmin(page, request);
        await navigateTo(page, 'start');

        // 2. Locate the "Create New Storage Folder" card and click the "Create Folder" button
        const card = page
          .locator('.bai_grid_item')
          .filter({ hasText: 'Create New Storage Folder' });
        await card.getByRole('button', { name: 'Create Folder' }).click();

        // 3. Verify the "Create Folder" modal opens
        const modal = new FolderCreationModal(page);
        await modal.modalToBeVisible();

        // 4. Verify the folder name input field is visible
        await expect(page.getByLabel('Folder name')).toBeVisible();

        // 5. Close the modal without submitting
        await page
          .getByRole('dialog')
          .getByRole('button', { name: 'Cancel' })
          .click();
        await expect(page.getByRole('dialog')).not.toBeVisible();
      });

      test.describe('Folder creation with cleanup', () => {
        // Set longer timeout because cleanup (moveToTrash + deleteForever) can be slow
        // when running in parallel with other tests.
        test.setTimeout(180_000);

        const folderName = `e2e-start-folder-${Date.now()}`;
        let folderCreated = false;

        test.afterEach(async ({ page }) => {
          if (folderCreated) {
            try {
              await moveToTrashAndVerify(page, folderName);
              await deleteForeverAndVerifyFromTrash(page, folderName);
            } catch {
              /* ignore cleanup errors */
            }
            folderCreated = false;
          }
        });

        test('Admin can create a folder from the Start page and be redirected to the Data page', async ({
          page,
          request,
        }) => {
          // 1. Login as admin and navigate to /start
          await loginAsAdmin(page, request);
          await navigateTo(page, 'start');

          // 2. Click the "Create Folder" button on the "Create New Storage Folder" card
          const card = page
            .locator('.bai_grid_item')
            .filter({ hasText: 'Create New Storage Folder' });
          await card.getByRole('button', { name: 'Create Folder' }).click();

          // 3. Fill in the folder name field with a unique test name
          const modal = new FolderCreationModal(page);
          await modal.modalToBeVisible();
          await modal.fillFolderName(folderName);

          // 4. Click the "Create" button in the modal
          await (await modal.getCreateButton()).click();
          folderCreated = true;

          // 5. Verify the modal closes and browser URL changes to /data
          await expect(page).toHaveURL(/\/data/);

          // 6. Verify the newly created folder appears in the Data page list
          await expect(
            page
              .getByRole('cell', { name: `VFolder Identicon ${folderName}` })
              .filter({ hasText: folderName }),
          ).toBeVisible({ timeout: 10_000 });
        });
      });

      test('Admin sees validation error when submitting Create Folder modal with empty name', async ({
        page,
        request,
      }) => {
        // 1. Login as admin and navigate to /start
        await loginAsAdmin(page, request);
        await navigateTo(page, 'start');

        // 2. Click the "Create Folder" button on the "Create New Storage Folder" card
        const card = page
          .locator('.bai_grid_item')
          .filter({ hasText: 'Create New Storage Folder' });
        await card.getByRole('button', { name: 'Create Folder' }).click();

        // 3. Leave the folder name field empty and click the "Create" button
        const modal = new FolderCreationModal(page);
        await modal.modalToBeVisible();
        await (await modal.getCreateButton()).click();

        // 4. Verify a validation error message appears near the folder name field
        await expect(
          page
            .getByRole('dialog')
            .getByText(/Please enter folder name|required/i),
        ).toBeVisible();

        // 5. Modal remains open - close it
        await page
          .getByRole('dialog')
          .getByRole('button', { name: 'Cancel' })
          .click();
      });
    });

    // -----------------------------------------------------------------------
    // 3. Start Session Navigation
    // -----------------------------------------------------------------------
    test.describe('Start Session Navigation', () => {
      test.beforeEach(async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'start');
      });

      test('Admin can navigate to the Session Launcher from the "Start Interactive Session" card', async ({
        page,
      }) => {
        // 1. Locate the "Start Interactive Session" card and click "Start Session"
        const card = page
          .locator('.bai_grid_item')
          .filter({ hasText: 'Start Interactive Session' });
        await card.getByRole('button', { name: 'Start Session' }).click();

        // 2. Verify the URL changes to /session/start
        await expect(page).toHaveURL(/\/session\/start/);
      });

      test('Admin can navigate to the Session Launcher in batch mode from the "Start Batch Session" card', async ({
        page,
      }) => {
        // 1. Locate the "Start Batch Session" card and click "Start Session"
        const card = page
          .locator('.bai_grid_item')
          .filter({ hasText: 'Start Batch Session' });
        await card.getByRole('button', { name: 'Start Session' }).click();

        // 2. Verify the URL changes to /session/start with batch sessionType
        await expect(page).toHaveURL(/\/session\/start/);
        await expect(page).toHaveURL(/sessionType.*batch|batch.*sessionType/);
      });

      test('Admin can navigate to the Model Service creation page from the "Start Model Service" card', async ({
        page,
      }) => {
        const startPage = new StartPage(page);

        // 1. Check if the "Start Model Service" card is visible (depends on enableModelFolders config)
        const card = startPage.getModelServiceCard();

        // Skip test explicitly if the card is not available in the current configuration
        test.skip(
          !(await card.isVisible()),
          'Model service card not available in current configuration',
        );

        // 2. Click the "Start Service" button within the card
        await startPage.getStartServiceButton(card).click();

        // 3. Verify the URL changes to /service/start
        await expect(page).toHaveURL(/\/service\/start/);
      });
    });

    // -----------------------------------------------------------------------
    // 4. Start From URL Modal
    // -----------------------------------------------------------------------
    test.describe('Start From URL Modal', () => {
      test.beforeEach(async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'start');
      });

      test('Admin can open the "Start From URL" modal from the Start page', async ({
        page,
      }) => {
        // 1. Locate the "Start From URL" card and click the "Start Now" button
        const card = page
          .locator('.bai_grid_item')
          .filter({ hasText: 'Start From URL' });
        await card.getByRole('button', { name: 'Start Now' }).click();

        // 2. Verify the "Start From URL" modal opens
        await expect(
          page.getByRole('dialog').filter({ hasText: 'Start From URL' }),
        ).toBeVisible();

        // 3. Verify three tabs are visible
        await expect(
          page.getByRole('tab', { name: /Import Notebook/i }),
        ).toBeVisible();
        await expect(
          page.getByRole('tab', { name: /Import GitHub Repository/i }),
        ).toBeVisible();
        await expect(
          page.getByRole('tab', { name: /Import GitLab Repository/i }),
        ).toBeVisible();

        // 4. Verify the "Import Notebook" tab is active by default
        await expect(
          page
            .locator('.ant-tabs-tab-active')
            .filter({ hasText: /Import Notebook/i }),
        ).toBeVisible();

        // 5. Close the modal
        await page
          .getByRole('dialog')
          .getByRole('button', { name: 'close' })
          .click();
        await expect(
          page.getByRole('dialog').filter({ hasText: 'Start From URL' }),
        ).not.toBeVisible();
      });

      test('Admin can switch between tabs in the Start From URL modal', async ({
        page,
      }) => {
        // 1. Open the Start From URL modal
        const card = page
          .locator('.bai_grid_item')
          .filter({ hasText: 'Start From URL' });
        await card.getByRole('button', { name: 'Start Now' }).click();
        await expect(
          page.getByRole('dialog').filter({ hasText: 'Start From URL' }),
        ).toBeVisible();

        // 2. Click the "Import GitHub Repository" tab
        await page
          .getByRole('tab', { name: /Import GitHub Repository/i })
          .click();

        // 3. Verify the GitHub tab is active
        await expect(
          page.locator('.ant-tabs-tab-active').filter({ hasText: /GitHub/i }),
        ).toBeVisible();

        // 4. Click the "Import GitLab Repository" tab
        await page
          .getByRole('tab', { name: /Import GitLab Repository/i })
          .click();

        // 5. Verify the GitLab tab is active
        await expect(
          page.locator('.ant-tabs-tab-active').filter({ hasText: /GitLab/i }),
        ).toBeVisible();

        // 6. Click the "Import Notebook" tab to return to default
        await page.getByRole('tab', { name: /Import Notebook/i }).click();

        // 7. Verify the notebook tab is active
        await expect(
          page
            .locator('.ant-tabs-tab-active')
            .filter({ hasText: /Import Notebook/i }),
        ).toBeVisible();

        // 8. Close the modal
        await page
          .getByRole('dialog')
          .getByRole('button', { name: 'close' })
          .click();
      });

      test('Admin can open the Start From URL modal pre-filled via query parameters', async ({
        page,
      }) => {
        // 1. Navigate directly to /start with type=url and data query params
        const notebookUrl =
          'https://github.com/example/repo/blob/main/notebook.ipynb';
        const data = JSON.stringify({ url: notebookUrl });
        await navigateTo(
          page,
          `start?type=url&data=${encodeURIComponent(data)}`,
        );

        // 2. Verify the "Start From URL" modal opens automatically
        await expect(
          page.getByRole('dialog').filter({ hasText: 'Start From URL' }),
        ).toBeVisible();

        // 3. Verify the "Import Notebook" tab is active
        await expect(
          page
            .locator('.ant-tabs-tab-active')
            .filter({ hasText: /Import Notebook/i }),
        ).toBeVisible();

        // 4. Verify the URL input field is pre-filled with the notebook URL
        const urlInput = page.getByRole('dialog').getByRole('textbox').first();
        await expect(urlInput).toHaveValue(notebookUrl);

        // 5. Verify the URL query parameters are cleared from the address bar after modal opens
        await expect(page).toHaveURL(/\/start(?!\?type)/);

        // 6. Close the modal
        await page
          .getByRole('dialog')
          .getByRole('button', { name: 'close' })
          .click();
      });
    });

    // -----------------------------------------------------------------------
    // 5. Board Layout (smoke test - verify board and drag handles exist)
    // -----------------------------------------------------------------------
    test.describe('Board Layout', () => {
      test('Admin can see draggable cards on the Start page board', async ({
        page,
        request,
      }) => {
        // 1. Login as admin and navigate to /start
        await loginAsAdmin(page, request);
        await navigateTo(page, 'start');

        // 2. Verify at least two cards are visible
        const cards = page.locator('.bai_grid_item');
        await expect(cards.first()).toBeVisible({ timeout: CARD_TIMEOUT });
        const cardCount = await cards.count();
        expect(cardCount).toBeGreaterThanOrEqual(2);

        // 3. Verify drag handles exist on board items
        const dragHandles = page.locator('.bai_board_handle');
        await expect(dragHandles.first()).toBeVisible();
      });
    });
  },
);
