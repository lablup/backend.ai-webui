// Seed file for mock-DOM screenshot capture.
// Navigates to the dev server but does NOT require backend login —
// the page is replaced with mock HTML that uses antd CSS already loaded.
import { test } from '@playwright/test';

test.describe('Mock screenshot seed', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://fr-2743.localhost:1355/start');
    // Allow CSS / antd to load. We don't require a logged-in app state for mock injection.
    await page.waitForTimeout(3000);
  });
  test('seed', async () => {
    // Ready for mock DOM injection.
  });
});
