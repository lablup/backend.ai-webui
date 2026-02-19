// Seed file for Playwright MCP screenshot capture (admin login).
// It is not an actual E2E test and should be skipped in test runs.
import { loginAsAdmin } from './utils/test-util';
import { test } from '@playwright/test';

test.describe.skip('Screenshot seed', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsAdmin(page, request);
  });
  test('seed', async ({ page: _page }) => {
    // Ready for screenshot capture after admin login; no additional wait needed
  });
});
