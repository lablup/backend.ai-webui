import { loginAsUser } from './utils/test-util';
import { test } from '@playwright/test';

test.describe('Test group', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsUser(page, request);
    // setup code here.
  });
  test('seed', async () => {
    // generate code here.
  });
});
