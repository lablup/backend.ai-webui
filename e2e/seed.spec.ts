// This is a seed file for Playwright MCP test generator.
// It is not an actual E2E test and should be skipped in test runs.
import { loginAsUser } from './utils/test-util';
import { test } from '@playwright/test';

test.describe.skip('Test group', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsUser(page, request);
    // setup code here.
  });
  test('seed', async () => {
    // generate code here.
  });
});
