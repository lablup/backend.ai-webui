import { loginAsUser2, webuiEndpoint } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

// Skip this test because this page will be replaced with a NEO design
test.describe.skip('Summary page Visual Regression Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({
      width: 1500,
      height: 1200,
    });
    await loginAsUser2(page);
  });

  test(`Test in light mode`, async ({ page }) => {
    await page.goto(`${webuiEndpoint}/summary`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot(`summary_light.png`, {
      mask: [
        page.locator('lablup-progress-bar'),
        page.locator('span.percentage.start-bar'),
        page.locator('span.percentage.end-bar'),
      ],
      fullPage: true,
    });
  });

  test(`Test in dark mode`, async ({ page }) => {
    await page.goto(`${webuiEndpoint}/summary`);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'moon' }).click();

    await expect(page).toHaveScreenshot('summary_dark.png', {
      mask: [
        page.locator('lablup-progress-bar'),
        page.locator('span.percentage.start-bar'),
        page.locator('span.percentage.end-bar'),
      ],
      fullPage: true,
    });
    await page.getByRole('button', { name: 'sun' }).click();
  });
});
