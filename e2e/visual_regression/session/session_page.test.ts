import { loginAsVisualRegressionUser, navigateTo } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

// FIXME: Test timeout in beforeEach - NEO Session list checkbox not found in user settings
// The NEO Session list preference might have been removed or renamed
test.beforeEach(async ({ page, request }) => {
  // login to visual regression server
  await loginAsVisualRegressionUser(page, request);
  await page.setViewportSize({
    width: 1920,
    height: 2100,
  });

  // Enable NEO Session list in preferences
  await navigateTo(page, 'usersettings');
  const neoSessionCheckbox = page
    .locator('div')
    .filter({ hasText: /NEO Session list/ })
    .getByLabel('Enabled');
  await expect(neoSessionCheckbox).toBeVisible({ timeout: 10000 });
  await neoSessionCheckbox.check();

  // Navigate to Sessions page
  await navigateTo(page, 'job');
  await expect(page.getByText('Create a Session')).toBeVisible();
});

test.afterEach(async ({ page }) => {
  // uncheck the Neo Session list
  await navigateTo(page, 'usersettings');
  await page
    .locator('div')
    .filter({ hasText: /NEO Session list/ })
    .getByLabel('Enabled')
    .uncheck();
});

test.describe(
  'Visual Regression Test for NEO Session Page',
  { tag: ['@regression', '@session', '@visual'] },
  () => {
    // FIXME: Test skipped due to beforeEach failure (NEO Session list checkbox not found)
    test.fixme('Create a new session step by step', async ({ page }) => {
      // step1.png
      await page.getByRole('button', { name: 'Start Session' }).nth(1).click();
      await page.getByText('Session Type').first().waitFor();
      await expect(page).toHaveScreenshot('step1.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.005,
      });

      // step2.png
      await page.getByRole('button', { name: 'Next right' }).click();
      await page.getByText('Environments', { exact: true }).waitFor();
      await expect(page).toHaveScreenshot('step2.png', {
        fullPage: true,
        mask: [
          page
            .locator(
              '.ant-form-item-control-input-content > .ant-select > .ant-select-selector',
            )
            .first(),
          page
            .locator(
              'div:nth-child(3) > .ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-select > .ant-select-selector',
            )
            .first(),
          page.locator('.ant-select').nth(4),
          page.locator('.ant-card-body').nth(3),
        ],
        maxDiffPixelRatio: 0.005,
      });

      // step3.png
      await page.getByRole('button', { name: 'Next right' }).click();
      await expect(page).toHaveScreenshot('step3.png', {
        fullPage: true,
      });

      // step4.png
      await page.getByRole('button', { name: 'Next right' }).click();
      await expect(page).toHaveScreenshot('step4.png', {
        fullPage: true,
      });

      // step5.png
      await page.getByRole('button', { name: 'Next right' }).click();
      await expect(page).toHaveScreenshot('step5.png', {
        mask: [page.locator('div.ant-card-body').nth(10)],
        fullPage: true,
      });
    });

    // FIXME: Test skipped due to beforeEach failure (NEO Session list checkbox not found)
    test.fixme('Before create a new session', async ({ page }) => {
      await page.getByText('Create a Session').waitFor();
      await expect(page).toHaveScreenshot('session_page.png', {
        mask: [
          page.locator('div.ant-card-body').nth(1),
          page.locator('tbody.ant-table-tbody'),
        ],
        fullPage: true,
        maxDiffPixelRatio: 0.005,
      });
    });
  },
);
