import { test, expect } from '@playwright/test';
import { login } from '../tests-examples/login.spec'
import { createVfolder } from '../tests-examples/DataStoragePage.spec';
import { createSession, deleteSession } from '../tests-examples/SessionStoragePage.spec';

test('E2E test', async ({ page }) => {
  await page.goto('http://localhost:9081/');
  await login(page, 'test@lablup.com', 'test123!');
  await createVfolder(page, 'testvfolder')
  await createSession(page, 'Ubuntu 20.04 aarch64', 'testvfolder', 'testSession');
  await deleteSession(page, 'test@lablup.com', 'testSession')
});
