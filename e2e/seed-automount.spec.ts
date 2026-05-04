import { loginAsAdmin } from './utils/test-util';
import { test } from '@playwright/test';

test.describe.skip('Test group', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsAdmin(page, request);
  });
  test('seed', async () => {
    // generate code here.
  });
});
