import {
  loginAsVisualRegressionAdmin,
  navigateTo,
} from '../../utils/test-util';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await loginAsVisualRegressionAdmin(page, request);
  await page.setViewportSize({
    width: 1500,
    height: 1400,
  });
  await navigateTo(page, 'information');
  await expect(page.getByText('Core')).toBeVisible();
});

test.describe(
  'Information page Visual Regression Test',
  { tag: ['@regression', '@visual'] },
  () => {
    // FIXME: Login fails - user-dropdown-button not visible after login
    test.fixme('Information page screenshot', async ({ page }) => {
      await expect(page).toHaveScreenshot('information_page.png', {
        fullPage: true,
      });
    });
  },
);
