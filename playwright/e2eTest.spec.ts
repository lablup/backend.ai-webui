import { createUser, deleteUser } from './pages/CredentialPage.spec';
import { createVfolder, deleteVfolder } from './pages/DataStoragePage.spec';
import { login } from './pages/LoginPage.spec';
import { createSession, deleteSession } from './pages/SessionPage.spec';
import { test } from '@playwright/test';

test('E2E test', async ({ page }) => {
  await page.goto('http://localhost:9081/');
  await login(page, 'test@lablup.com', 'test123!', 'http://127.0.0.1:8090');
  await createVfolder(page, 'test2');
  await createSession(
    page,
    'Ubuntu 20.04 aarch64',
    'testvfolder',
    'testSession',
  );
  await deleteSession(page, 'test@lablup.com', 'testSession');
  await deleteVfolder(page, 'test2');
  await createUser(page, 'test9@lablup.com', 'test9', 'test123!');
  await deleteUser(page, 'test9\\@lablup\\.com');
});
