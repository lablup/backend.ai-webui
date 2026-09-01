// Verifies the experimental "Import Hugging Face Model" tab in the
// Start From URL modal (FR-3390):
// - hidden by default (experimental user setting off)
// - first tab and active by default when the setting is on
// - hidden when the deployments feature is disabled via menu blocklist
// - client-side validation of the model URL/ID input
import { loginAsAdmin, modifyConfigToml, navigateTo } from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

const HF_TAB_NAME = /Import Hugging Face Model/i;

const openStartFromURLModal = async (page: Page) => {
  const card = page
    .locator('.bai_grid_item')
    .filter({ hasText: 'Start From URL' });
  await card.getByRole('button', { name: 'Start Now' }).click();
  await expect(
    page.getByRole('dialog').filter({ hasText: 'Start From URL' }),
  ).toBeVisible();
};

// `BAITabs`/`BAITabList` renders Astryx `TabList` items as plain `<button>`s
// (class `astryx-tab`) inside a `navigation "Tabs"` landmark, not
// `role="tab"` (see `start-page.spec.ts`). The active tab carries
// `aria-current="true"` (no `aria-selected`).
const getTabs = (page: Page) =>
  page
    .getByRole('dialog')
    .filter({ hasText: 'Start From URL' })
    .getByRole('navigation', { name: 'Tabs' });

// The user-settings atom reads localStorage at app boot, so write the flag
// and reload instead of toggling through the settings UI.
const enableHuggingFaceImportSetting = async (page: Page) => {
  await page.evaluate(() => {
    localStorage.setItem(
      'backendaiwebui.settings.user.experimental_import_from_huggingface',
      'true',
    );
  });
  await page.reload();
  await page.waitForSelector('[data-testid="user-dropdown-button"]');
};

test.describe(
  'Start From URL Modal - Hugging Face Import Tab',
  { tag: ['@regression', '@start', '@functional'] },
  () => {
    test('User does not see the Hugging Face import tab by default', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'start');
      await openStartFromURLModal(page);

      const tabs = getTabs(page);
      await expect(tabs.getByRole('button', { name: HF_TAB_NAME })).toHaveCount(
        0,
      );
      // The Import Notebook tab stays the default active tab.
      await expect(
        tabs.getByRole('button', { name: /Import Notebook/i }),
      ).toHaveAttribute('aria-current', 'true');
    });

    test('User sees the Hugging Face import tab first and active after enabling the experimental setting', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await enableHuggingFaceImportSetting(page);
      await navigateTo(page, 'start');
      await openStartFromURLModal(page);

      const tabs = getTabs(page).getByRole('button');
      await expect(tabs.first()).toHaveText(HF_TAB_NAME);
      await expect(tabs.first()).toHaveAttribute('aria-current', 'true');

      // The form renders its key fields.
      await expect(
        page.getByLabel(/Hugging Face Model URL or ID/i),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /Download Model To Folder/i }),
      ).toBeVisible();
    });

    test('User cannot see the Hugging Face import tab when deployments are disabled', async ({
      page,
      request,
    }) => {
      // Blocklist the deployments menu before the app boots so the feature
      // is disabled for the whole session.
      await modifyConfigToml(page, request, {
        menu: { blocklist: 'deployments' },
      });
      await loginAsAdmin(page, request);
      await enableHuggingFaceImportSetting(page);
      await navigateTo(page, 'start');
      await openStartFromURLModal(page);

      const tabs = getTabs(page);
      await expect(tabs.getByRole('button', { name: HF_TAB_NAME })).toHaveCount(
        0,
      );
      await expect(
        tabs.getByRole('button', { name: /Import Notebook/i }),
      ).toBeVisible();
    });

    test('User sees a validation error for an invalid Hugging Face model URL', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await enableHuggingFaceImportSetting(page);
      await navigateTo(page, 'start');
      await openStartFromURLModal(page);

      await page
        .getByLabel(/Hugging Face Model URL or ID/i)
        .fill('https://github.com/owner/repo');
      await page
        .getByRole('button', { name: /Download Model To Folder/i })
        .click();

      await expect(page.getByText(/Invalid Hugging Face model/i)).toBeVisible();
    });
  },
);
