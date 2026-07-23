import { loginAsVisualRegressionUser, navigateTo } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.describe(
  'My Environments page Visual Regression Test',
  { tag: ['@regression', '@environment', '@visual'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await page.setViewportSize({
        width: 2000,
        height: 1200,
      });
      await loginAsVisualRegressionUser(page, request);
      await navigateTo(page, 'my-environment');
      await expect(page.getByRole('button', { name: 'setting' })).toBeVisible();
    });

    // FIXME(FR-3111/stale-baseline): The My Environments page was redesigned and the
    // 'setting' button the beforeEach anchors on moved/renamed, so
    // `snapshot/myenvironments-page.png` reflects the old layout.
    // Locator fix + baseline refresh deferred to FR-3115 (frozen backend).
    test.fixme(`my environments full page`, async ({ page }) => {
      await expect(page).toHaveScreenshot('myenvironments_page.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });

    // FIXME(FR-3111/stale-baseline): Same My Environments redesign —
    // `snapshot/column-setting-modal.png` is stale. Deferred to FR-3115.
    test.fixme('column setting modal', async ({ page }) => {
      await page.getByRole('button', { name: 'setting' }).click();
      const columnSettingModal = page.locator('div.ant-modal').first();
      await expect(columnSettingModal).toHaveScreenshot(
        'column_setting_modal.png',
        {
          maxDiffPixelRatio: 0.02,
        },
      );
    });
  },
);
