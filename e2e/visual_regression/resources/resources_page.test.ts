import {
  loginAsVisualRegressionAdmin,
  navigateTo,
} from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await page.setViewportSize({
    width: 2000,
    height: 1200,
  });
  await loginAsVisualRegressionAdmin(page, request);
  await navigateTo(page, 'agent');
  // FIXME: Agent tab is not visible - page might have changed or renamed
  await expect(page.getByRole('tab', { name: 'Agent' })).toBeVisible();
});

test.describe(
  'Resources page Visual Regression Test',
  { tag: ['@regression', '@agent', '@visual'] },
  () => {
    // FIXME: Test skipped due to beforeEach failure (Agent tab not visible)
    // Agent table
    test.fixme(`Agent table`, async ({ page }) => {
      await page.getByRole('tab', { name: 'Agent' }).click();
      await expect(
        page.getByRole('button', { name: 'setting' }).nth(1),
      ).toBeVisible();
      await page.getByRole('button', { name: 'setting' }).nth(1).click();

      const checkboxes = page.locator('input.ant-checkbox-input');
      const count = await checkboxes.count();
      for (let i = 0; i < count; i++) {
        await checkboxes.nth(i).check();
      }
      await page.getByRole('button', { name: 'OK' }).click();

      await expect(page).toHaveScreenshot('agent_table.png', {
        fullPage: true,
        mask: [
          page.locator('span.ant-tag').nth(3),
          page.locator('td.ant-table-cell').nth(2),
          page.locator('td.ant-table-cell').nth(4),
          page.locator('td.ant-table-cell').nth(5),
          page.locator('td.ant-table-cell').nth(6),
        ],
      });

      // setting modal
      await page
        .getByRole('table')
        .getByRole('button', { name: 'setting' })
        .click();
      await expect(page.getByRole('dialog')).toBeVisible();
      const agentSettingModal = page.getByRole('dialog');
      await expect(agentSettingModal).toHaveScreenshot(
        'agent_setting_modal.png',
      );
      await page.getByRole('button', { name: 'Cancel' }).click();
    });

    // Storages table
    test('Storages table', async ({ page }) => {
      await page.getByRole('tab', { name: 'Storages' }).click();
      await page.getByText('local:volume1').waitFor();
      await expect(page).toHaveScreenshot('user_table.png', {
        fullPage: true,
        mask: [page.locator('td.ant-table-cell').nth(2)],
      });

      // storage setting page
      await page.getByRole('button', { name: 'setting' }).click();
      await page.getByText('Quota Settings').waitFor();
      await expect(page).toHaveScreenshot('storage_setting_page.png', {
        fullPage: true,
        mask: [page.locator('td.ant-descriptions-item-content').first()],
      });
    });
  },
);
