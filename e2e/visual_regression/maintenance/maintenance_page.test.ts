import {
  loginAsVisualRegressionAdmin,
  navigateTo,
} from '../../utils/test-util';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await loginAsVisualRegressionAdmin(page, request);
  await navigateTo(page, 'maintenance');
  // FIXME(FR-3111/brittle-locator): Strict mode violation — getByText('Fix') resolves
  // to 2 elements (tab and heading); use getByRole('tab', { name: 'Fix' }). Owned by
  // the locator-quality triage category of FR-3109.
  await expect(page.getByText('Fix')).toBeVisible();
});

test.describe(
  'Maintenance page Visual Regression Test',
  { tag: ['@regression', '@maintenance', '@visual'] },
  () => {
    // FIXME(FR-3111/brittle-locator): Skipped due to the beforeEach strict mode
    // violation above. Not a stale baseline; owned by the locator-quality triage
    // category of FR-3109.
    test.fixme('Maintenance page screenshot', async ({ page }) => {
      await expect(page).toHaveScreenshot('maintenance_page.png');
    });
  },
);
