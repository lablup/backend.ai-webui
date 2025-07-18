import { loginAsAdmin, webuiEndpoint } from './utils/test-util';
import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });
test.describe('Summary page Visual Regression Test', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test(`Test in light mode`, async ({ page }) => {
    await page.goto(`${webuiEndpoint}/summary`);
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => {
      function processAllElements(root) {
        const elements = root.querySelectorAll('*');
        elements.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.overflow = 'visible';
            el.style.height = 'auto';
            el.style.maxHeight = 'none';
          }
          if (el.shadowRoot) {
            processAllElements(el.shadowRoot);
          }
        });
      }
      processAllElements(document);
    });

    await expect(page).toHaveScreenshot('summary_light.png', {
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

    await page.evaluate(() => {
      function processAllElements(root) {
        const elements = root.querySelectorAll('*');
        elements.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.overflow = 'visible';
            el.style.height = 'auto';
            el.style.maxHeight = 'none';
          }
          if (el.shadowRoot) {
            processAllElements(el.shadowRoot);
          }
        });
      }
      processAllElements(document);
    });

    await expect(page).toHaveScreenshot('summary_dark.png', {
      mask: [
        page.locator('lablup-progress-bar'),
        page.locator('span.percentage.start-bar'),
        page.locator('span.percentage.end-bar'),
      ],
      fullPage: true,
    });
  });
});
