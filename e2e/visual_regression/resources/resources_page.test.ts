// 1. agent table(항목 마스크 처리)
// 2. storages table(항목 마스크 처리)
// 2-1. storage setting page
// 3. Resource Group
// 3-1. create resource modal
// 3-2. resource group detail modal
// 3-3. modify resource group modal
// 3-4. delete modal
import { loginAsAdmin } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.describe('Resource Policy page Visual Regression Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({
      width: 1800,
      height: 1400,
    });
    await loginAsAdmin(page);
    await page.getByRole('link', { name: 'Resources', exact: true }).click();
    await page.getByText('Region', { exact: true }).waitFor();
  });

  // Agent table
  test(`agent table`, async ({ page }) => {
    await page.getByRole('tab', { name: 'Agent' }).click();
    await page.getByText('Connected').waitFor();
    await expect(page).toHaveScreenshot('agent_table.png', {
      fullPage: true,
      mask: [page.getByRole('cell')],
    });

    await page.getByRole('button', { name: 'info-circle' }).click();
  });

  // Storages table
  test(`storages table`, async ({ page }) => {
    await page.getByRole('tab', { name: 'Storages' }).click();
    await expect(page).toHaveScreenshot('storages_table.png', {
      fullPage: true,
      mask: [page.getByRole('cell')],
    });
  });
});
