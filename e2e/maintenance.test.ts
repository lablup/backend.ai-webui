import { loginAsAdmin } from './test-util';
import test from '@playwright/test';

test.beforeAll(async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole('menuitem', { name: '' });
});
