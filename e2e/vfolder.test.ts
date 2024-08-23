import { test } from '@playwright/test';
import { createVFolderAndVerify, deleteVFolderAndVerify, loginAsUser } from './test-util';


test.describe('VFolder ', () => {
  test('User can create and delete vFolder', async ({ page }) => {
    await loginAsUser(page);
    await createVFolderAndVerify(page, 'e2e-test-folder');
    await deleteVFolderAndVerify(page, 'e2e-test-folder');
  });
});