import { loginAsVisualRegressionUser, navigateTo } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await page.setViewportSize({
    width: 1500,
    height: 1500,
  });
  await loginAsVisualRegressionUser(page, request);
  await navigateTo(page, 'summary');
  await expect(page.getByText('My Sessions')).toBeVisible();
});

test.describe(
  'Dashboard page Visual Regression Test',
  { tag: ['@regression', '@visual'] },
  () => {
    // FIXME(FR-3111/stale-baseline): The Dashboard was redesigned (NEO) — the
    // "My Sessions" anchor is gone and the spec still navigates via the legacy
    // `/summary` redirect, so `snapshot/dashboard-page.png` reflects the old layout.
    // Navigation/locator fix + baseline refresh deferred to FR-3115 (frozen backend).
    test.fixme('dashboard full page', async ({ page }) => {
      await expect(page).toHaveScreenshot('dashboard_page.png', {
        fullPage: true,
        mask: [page.locator('td.ant-table-cell')],
        maxDiffPixelRatio: 0.07,
      });
    });
  },
);
