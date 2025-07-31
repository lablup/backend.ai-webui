import { loginAsUser2, webuiEndpoint } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.describe('Start page Visual Regression Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({
      width: 1500,
      height: 1000,
    });
    await loginAsUser2(page);
  });

  test('Full screen', async ({ page }) => {
    await page.goto(`${webuiEndpoint}/start`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('start_page.png', {
      fullPage: true,
    });
  });
});
