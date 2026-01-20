// Test to verify consecutive folder deletions work correctly with filter clearing
import { NotificationHandler } from './utils/classes/NotificationHandler';
import {
  loginAsUser,
  createVFolderAndVerify,
  moveToTrashAndVerify,
  deleteForeverAndVerifyFromTrash,
} from './utils/test-util';
import { test } from '@playwright/test';

test.describe.serial('VFolder Consecutive Deletion - User Operations', () => {
  const folder1Name = 'e2e-test-consecutive-1-' + new Date().getTime();
  const folder2Name = 'e2e-test-consecutive-2-' + new Date().getTime();
  const folder3Name = 'e2e-test-consecutive-3-' + new Date().getTime();

  test.beforeEach(async ({ page, request }) => {
    await loginAsUser(page, request);
  });

  test('User can create and permanently delete multiple VFolders consecutively', async ({
    page,
  }) => {
    // Create NotificationHandler instance for managing notifications throughout the test
    const notification = new NotificationHandler(page);

    // Create three folders
    // Dismiss notifications after each creation to prevent UI blocking
    await createVFolderAndVerify(page, folder1Name);
    await notification.closeAllNotifications();

    await createVFolderAndVerify(page, folder2Name);
    await notification.closeAllNotifications();

    await createVFolderAndVerify(page, folder3Name);
    await notification.closeAllNotifications();

    // Move all to trash
    await moveToTrashAndVerify(page, folder1Name);
    await notification.closeAllNotifications();

    await moveToTrashAndVerify(page, folder2Name);
    await notification.closeAllNotifications();

    await moveToTrashAndVerify(page, folder3Name);
    await notification.closeAllNotifications();

    // Delete all consecutively - this tests that filters are cleared properly
    // between each deletion, preventing the "folder not found" issue
    await deleteForeverAndVerifyFromTrash(page, folder1Name);
    await notification.closeAllNotifications();

    await deleteForeverAndVerifyFromTrash(page, folder2Name);
    await notification.closeAllNotifications();

    await deleteForeverAndVerifyFromTrash(page, folder3Name);
    await notification.closeAllNotifications();
  });
});
