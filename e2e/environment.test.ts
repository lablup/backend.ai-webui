import { loginAsAdmin, navigateTo } from './utils/test-util';
import { findColumnIndex } from './utils/test-util-antd';
import { expect, test } from '@playwright/test';

test.describe('environment ', () => {
  let imageListTable;
  test.beforeEach(async ({ page }) => {
    imageListTable = await page.locator('.ant-table');
  });
  test('Rendering Image List', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateTo(page, 'environment');
    const table = page.locator('.ant-table-content');
    await expect(table).toBeVisible();
  });

  // skip this test because there is no way to uninstall the image in WebUI
  test.skip('user can install image', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateTo(page, 'environment');
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
    await loginAsAdmin(page);
    await navigateTo(page, 'environment');
    await expect(imageListTable).toBeVisible();

    // Click resource limit button
    const rows = await imageListTable.locator('.ant-table-row');
    const firstRow = await rows.first();
    const controlColumnIndex = await findColumnIndex(imageListTable, 'Control');
    await firstRow
      .locator('.ant-table-cell')
      .nth(controlColumnIndex)
      .getByRole('button', { name: 'setting' })
      .click();

    // Modify resource limit
    const resourceValue = await page
      .getByRole('slider')
      .first()
      .getAttribute('aria-valuenow');
    let modifiedResourceValue;
    if (resourceValue === '0') {
      modifiedResourceValue = Number(resourceValue) + 1;
      await page.locator('.ant-slider-dot').nth(modifiedResourceValue).click();
    } else {
      modifiedResourceValue = Number(resourceValue) - 1;
      await page
        .locator('.ant-slider-dot.ant-slider-dot-active')
        .nth(modifiedResourceValue)
        .click();
    }

    // Click OK Button
    await page.getByRole('button', { name: 'OK' }).click();
    const reinstallationText = await page
      .getByText('Image reinstallation required')
      .count();
    if (reinstallationText > 0) {
      await page.getByRole('button', { name: 'OK' }).nth(1).click();
    }

    // Verify image is modified
    const resourceLimitControlIndex = await findColumnIndex(
      imageListTable,
      'Resource limit',
    );
    const resource = await firstRow
      .locator('.ant-table-cell')
      .nth(resourceLimitControlIndex);
    await expect(resource.getByText(`${modifiedResourceValue}`)).toBeVisible();

    // Reset resource limit
    await firstRow
      .locator('.ant-table-cell')
      .nth(controlColumnIndex)
      .getByRole('button', { name: 'setting' })
      .click();
    await page.locator('.ant-slider-dot').nth(Number(resourceValue)).click();
    await page.getByRole('button', { name: 'OK' }).click();
    if (reinstallationText > 0) {
      await page.getByRole('button', { name: 'OK' }).nth(1).click();
    }
  });

  test('user can manage apps', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateTo(page, 'environment');
    await expect(imageListTable).toBeVisible();
    // Click manage apps button

    const rows = await imageListTable.locator('.ant-table-row');
    const firstRow = await rows.first();
    const controlColumnIndex = await findColumnIndex(imageListTable, 'Control');
    await firstRow
      .locator('.ant-table-cell')
      .nth(controlColumnIndex)
      .getByRole('button', { name: 'appstore' })
      .click();

    // Add app
    const numberOfApps = await page
      .locator('.ant-form-item-control-input-content > div')
      .count();
    await page.getByRole('button', { name: 'plus Add' }).click();
    const addInfo = {
      app: 'e2e-test-app',
      protocol: 'tcp',
      port: '6006',
    };
    await page.locator(`#apps_${numberOfApps}_app`).fill(addInfo.app);
    await page.locator(`#apps_${numberOfApps}_protocol`).fill(addInfo.protocol);
    await page.locator(`#apps_${numberOfApps}_port`).fill(addInfo.port);

    // Click OK Button
    await page.getByRole('button', { name: 'OK' }).click();
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
    const numberOfAppsAfterAdd = await page
      .locator('.ant-form-item-control-input-content > div')
      .count();
    expect(numberOfAppsAfterAdd).toBe(numberOfApps + 1);
    const lastRow = page
      .locator('.ant-form-item-control-input-content > div')
      .last();
    await expect(lastRow.getByPlaceholder('App Name')).toHaveValue(addInfo.app);
    await expect(lastRow.getByPlaceholder('Protocol')).toHaveValue(
      addInfo.protocol,
    );
    await expect(lastRow.getByPlaceholder('Port')).toHaveValue(addInfo.port);

    // Reset apps
    await page
      .getByRole('button', { name: 'delete' })
      .nth(numberOfAppsAfterAdd - 1)
      .click();
    await page.getByRole('button', { name: 'OK' }).click();
    if (reinstallationText > 0) {
      await page.getByRole('button', { name: 'OK' }).nth(1).click();
    }
  });
});
