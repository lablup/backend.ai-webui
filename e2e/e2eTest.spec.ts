import { test, expect } from '@playwright/test';
import { login } from '../tests-examples/login.spec'
import { createVfolder, deleteVfolder } from '../tests-examples/DataStoragePage.spec';
import { createSession, deleteSession } from '../tests-examples/SessionStoragePage.spec';

test('E2E test', async ({ page }) => {
  await page.goto('http://localhost:9081/');
  await login(page, 'test@lablup.com', 'test123!', 'http://127.0.0.1:8090');
  await createVfolder(page, 'testvfolder')
  await createSession(page, 'Ubuntu 20.04 aarch64', 'testvfolder', 'testSession');
  await deleteSession(page, 'test@lablup.com', 'testSession')
  await deleteVfolder(page, 'testvfolder')
});
