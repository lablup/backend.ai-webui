import { loginAsVisualRegressionUser, navigateTo } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

// FIXME(FR-3111/stale-baseline): The 'NEO Session list' usersettings toggle was removed
// (NEO is now the only session list), so this beforeEach/afterEach toggle logic is dead
// and the spec should navigate straight to `/session` instead of the legacy `/job`
// redirect. Rewrite + baseline refresh deferred to FR-3115 (frozen backend).
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
    // FIXME(FR-3111/stale-baseline): NEO session list is now the default; the session
    // launcher UI changed since `snapshot/step1.png`–`step5.png` were captured.
    // Spec rewrite + baseline refresh deferred to FR-3115 (frozen backend).
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

    // FIXME(FR-3111/stale-baseline): Same NEO-default change —
    // `snapshot/session-page.png` is stale. Deferred to FR-3115.
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
