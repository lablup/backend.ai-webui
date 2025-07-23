import { loginAsUser2, webuiEndpoint } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.describe('Import & Run page Visual Regression Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({
      width: 1500,
      height: 1500,
    });
    await loginAsUser2(page);
    await page.getByRole('menuitem', { name: 'Import & Run' }).click();
  });

  test('Full screen', async ({ page }) => {
    await page.goto(`${webuiEndpoint}/import`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('import_page.png', {
      mask: [
        page.locator('#cpu-usage-bar #front'),
        page.locator('#cpu-usage-bar-2 #front'),
        page.locator('#mem-usage-bar'),
        page.locator('#mem-usage-bar-2'),
        page.locator('#concurrency-usage-bar'),
      ],
      fullPage: true,
    });
  });
});
