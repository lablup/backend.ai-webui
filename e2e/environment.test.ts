import { loginAsAdmin, navigateTo } from './utils/test-util';
import { findColumnIndex, getMenuItem } from './utils/test-util-antd';
import { expect, test } from '@playwright/test';

test.describe('environment ', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await getMenuItem(page, 'Environments').click();
    await expect(page).toHaveURL(/\/environment/);
    await page.waitForLoadState('networkidle');
  });
  test('Rendering Image List', async ({ page }) => {
    const table = page.locator('.ant-table-content');
    await expect(table).toBeVisible();
  });

  // skip this test because there is no way to uninstall the image in WebUI
  test.skip('user can install image', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateTo(page, 'environment');
    const imageListTable = page.locator('.ant-table-content');
    await expect(imageListTable).toBeVisible();
    // Sort installation status
    await page.locator('.ant-table-cell.ant-table-column-sort').first().click();

    // Find uninstalled item and select
    const uninstalledImage = page
      .locator('.ant-table-cell.ant-table-column-sort')
      .filter({
        hasNot: page.locator('.ant-tag-gold'),
      })
      .nth(1);
    // If all images are installed, skip the test
    const count = await uninstalledImage.count();
    if (count === 0) {
      test.skip();
    }
    await uninstalledImage.click();

    // Install image
    await page
      .getByRole('button', { name: 'vertical-align-bottom Install' })
      .click();
    await page.getByRole('button', { name: 'Install', exact: true }).click();
    await expect(
      page.getByText('It takes time so have a cup of coffee!'),
    ).toBeVisible();

    // Verify installing status
    const rows = await imageListTable.locator('.ant-table-row');
    const statusColumnIndex = await findColumnIndex(imageListTable, 'Status');

    const installingItem = await rows
      .locator('.ant-table-cell')
      .nth(statusColumnIndex)
      .first();
    await expect(installingItem.getByText('installing')).toBeVisible();
  });

  test('user can modify image resource limit', async ({ page }) => {
    const CPU_CORE = '5';
    const MEMORY_SIZE = '1';
    const imageListTable = page.locator('.ant-table-content');
    await expect(imageListTable).toBeVisible();

    // Click resource limit button
    const rows = imageListTable.locator('.ant-table-row');
    const firstRow = rows.first();
    const controlColumnIndex = await findColumnIndex(imageListTable, 'Control');
    await firstRow
      .locator('.ant-table-cell')
      .nth(controlColumnIndex)
      .getByRole('button', { name: 'setting' })
      .click();
    await page.waitForLoadState('networkidle');
    // get resource limit from control modal
    const resourceLimitControlModal = page.locator(
      '.ant-modal-content:has-text("Modify Minimum Image Resource Limit")',
    );
    await expect(resourceLimitControlModal).toBeVisible();

    const cpuFormItem = resourceLimitControlModal.locator(
      '.ant-form-item-row:has-text("CPU")',
    );
    const cpuFormItemInput = cpuFormItem.locator('input');
    const cpuValue = await cpuFormItemInput.getAttribute('value');

    const memoryFormItem = resourceLimitControlModal.locator(
      '.ant-form-item-row:has-text("Memory")',
    );
    const memoryFormItemInput = memoryFormItem.locator(
      '.ant-input-number input',
    );
    const memoryValue = await memoryFormItemInput.getAttribute('value');
    const memorySize = await memoryFormItem
      .locator('.ant-input-number-group-addon .ant-select-selection-item')
      .textContent();
    // modify resource limit
    await cpuFormItemInput.fill(CPU_CORE);
    await expect(cpuFormItemInput).toHaveValue(CPU_CORE);
    await memoryFormItemInput.fill(MEMORY_SIZE + 'g');
    await expect(memoryFormItemInput).toHaveValue(MEMORY_SIZE);
    // click ok button
    await resourceLimitControlModal.getByRole('button', { name: 'OK' }).click();
    const reinstallationText = await page
      .getByText('Image reinstallation required')
      .count();
    if (reinstallationText > 0) {
      await page.getByRole('button', { name: 'OK' }).nth(1).click();
    }
    // verify resource limit is modified
    await firstRow
      .locator('.ant-table-cell')
      .nth(controlColumnIndex)
      .getByRole('button', { name: 'setting' })
      .click();
    await page.waitForLoadState('networkidle');
    const modifiedResourceLimitControlModal = page.locator(
      '.ant-modal-content:has-text("Modify Minimum Image Resource Limit")',
    );
    await expect(modifiedResourceLimitControlModal).toBeVisible();
    const modifiedCpuFormItemInput = modifiedResourceLimitControlModal.locator(
      '.ant-form-item-row:has-text("CPU") input',
    );
    const modifiedMemoryFormItemInput =
      modifiedResourceLimitControlModal.locator(
        '.ant-form-item-row:has-text("Memory") .ant-input-number input',
      );
    await expect(modifiedCpuFormItemInput).toHaveValue(CPU_CORE);
    await expect(modifiedMemoryFormItemInput).toHaveValue(MEMORY_SIZE);
    await expect(
      memoryFormItem.locator(
        '.ant-input-number-group-addon .ant-select-selection-item',
      ),
    ).toHaveText('GiB');

    // reset resource limit
    modifiedCpuFormItemInput.fill(cpuValue as string);
    await expect(modifiedCpuFormItemInput).toHaveValue(cpuValue as string);
    modifiedMemoryFormItemInput.fill(memoryValue as string);
    await expect(modifiedMemoryFormItemInput).toHaveValue(
      memoryValue as string,
    );
    const memorySizeAddon = modifiedResourceLimitControlModal.locator(
      '.ant-form-item-row:has-text("Memory") .ant-select-selector',
    );
    await memorySizeAddon.click();
    await page
      .locator(`.ant-select-item-option-content:has-text("${memorySize}")`)
      .click();
    // click ok button
    await modifiedResourceLimitControlModal
      .getByRole('button', { name: 'OK' })
      .click();
    const reinstallationTextAfterReset = await page
      .getByText('Image reinstallation required')
      .count();
    if (reinstallationTextAfterReset > 0) {
      await page.getByRole('button', { name: 'OK' }).nth(1).click();
    }
  });

  test('user can manage apps', async ({ page }) => {
    const imageListTable = page.locator('.ant-table-content');
    await expect(imageListTable).toBeVisible();
    // Click manage apps button

    const rows = imageListTable.locator('.ant-table-row');
    const firstRow = rows.first();
    const controlColumnIndex = await findColumnIndex(imageListTable, 'Control');
    await firstRow
      .locator('.ant-table-cell')
      .nth(controlColumnIndex)
      .getByRole('button', { name: 'appstore' })
      .click();

    // Add app
    const modal = page.locator('.ant-modal-content:has-text("Manage Apps")');
    await expect(modal).toBeVisible();
    const numberOfAppsBeforeAdd = await modal.locator('.ant-form-item').count();
    await modal.getByRole('button', { name: 'plus Add' }).click();
    const addInfo = {
      app: 'e2e-test-app',
      protocol: 'tcp',
      port: '6006',
    };
    await modal.locator(`#apps_${numberOfAppsBeforeAdd}_app`).fill(addInfo.app);
    await modal
      .locator(`#apps_${numberOfAppsBeforeAdd}_protocol`)
      .fill(addInfo.protocol);
    await modal
      .locator(`#apps_${numberOfAppsBeforeAdd}_port`)
      .fill(addInfo.port);

    // Click OK Button
    await modal.getByRole('button', { name: 'OK' }).click();
    const reinstallationText = await page
      .getByText('Image reinstallation required')
      .count();
    if (reinstallationText > 0) {
      await page.getByRole('button', { name: 'OK' }).nth(1).click();
    }

    // Verify app is added
    await firstRow
      .locator('.ant-table-cell')
      .nth(controlColumnIndex)
      .getByRole('button', { name: 'appstore' })
      .click();
    const modalAfterAdd = page.locator(
      '.ant-modal-content:has-text("Manage Apps")',
    );
    await expect(modalAfterAdd).toBeVisible();
    const numberOfApps = await modalAfterAdd.locator('.ant-form-item').count();
    expect(numberOfApps).toBe(numberOfAppsBeforeAdd + 1);
    // Verify the last row has the added app info
    const lastRow = modalAfterAdd
      .locator('.ant-form-item-control-input-content > div')
      .last();
    await expect(lastRow.getByPlaceholder('App Name')).toHaveValue(addInfo.app);
    await expect(lastRow.getByPlaceholder('Protocol')).toHaveValue(
      addInfo.protocol,
    );
    await expect(lastRow.getByPlaceholder('Port')).toHaveValue(addInfo.port);

    // Reset apps
    await modalAfterAdd
      .getByRole('button', { name: 'delete' })
      .nth(numberOfApps - 1)
      .click();
    await modalAfterAdd.getByRole('button', { name: 'OK' }).click();
    if (reinstallationText > 0) {
      await page.getByRole('button', { name: 'OK' }).nth(1).click();
    }
  });
});
