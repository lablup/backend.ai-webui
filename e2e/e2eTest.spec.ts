import { test, expect } from '@playwright/test';
import { login } from '../tests-examples/login.spec';
import { createVfolder, deleteVfolder } from '../tests-examples/DataStoragePage.spec';
import { createSession, deleteSession } from '../tests-examples/SessionStoragePage.spec';
import { createUser, deleteUser } from '../tests-examples/CredentialPage.spec';

test('E2E test', async ({ page }) => {
  await page.goto('http://localhost:9081/');
  await login(page, 'test@lablup.com', 'test123!', 'http://127.0.0.1:8090');
  await createVfolder(page, 'test2');
  await createSession(page, 'Ubuntu 20.04 aarch64', 'testvfolder', 'testSession');
  await deleteSession(page, 'test@lablup.com', 'testSession');
  await deleteVfolder(page, 'test2');
  await createUser(page, 'test9@lablup.com', 'test9', 'test123!');
  await deleteUser(page, 'test9\\@lablup\\.com');
});
