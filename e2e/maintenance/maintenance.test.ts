import { loginAsAdmin } from './utils/test-util';
import {
  getNotificationDescriptionBox,
  getNotificationMessageBox,
} from './utils/test-util-antd';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await loginAsAdmin(page, request);
  await page.getByRole('menuitem', { name: 'Admin Settings' }).click();
  await page.getByRole('menuitem', { name: 'tool Maintenance' }).click();
  await page.waitForLoadState('networkidle');
});

test.describe(
  'test maintenance page',
  { tag: ['@regression', '@maintenance', '@functional'] },
  () => {
    test.describe('Recalculate Usage', () => {
      test('click the Recalculate Usage button', async ({ page }) => {
        await page.getByRole('button', { name: 'Recalculate Usage' }).click();

        await expect(getNotificationMessageBox(page)).toContainText(
          'Recalculate Usage',
        );
        // skip the Recalculating message because it's too fast
        await expect(getNotificationDescriptionBox(page)).toContainText(
          'Recalculation finished',
        );
      });
    });

    test.describe('Rescan Images', () => {
      test.setTimeout(90 * 1000);
      test('click the Rescan Images button', async ({ page }) => {
        await page.getByRole('button', { name: 'Rescan Images' }).click();

        await expect(getNotificationMessageBox(page)).toContainText(
          'Rescan Images',
        );

        await expect(getNotificationDescriptionBox(page)).toContainText(
          'Rescanning...',
        );
        await expect(getNotificationDescriptionBox(page)).toContainText(
          'Rescanning image finished.',
          {
            timeout: 60 * 1000,
          },
        );
      });
    });
  },
);
