import { loginAsVisualRegressionAdmin } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({
    width: 1800,
    height: 1400,
  });
  await loginAsVisualRegressionAdmin(page);
  await page.getByRole('link', { name: 'Environments', exact: true }).click();
  await page.locator('.ant-input-affix-wrapper').first().waitFor();
});

test.describe('Environments page Visual Regression Test', () => {
  test(`images table`, async ({ page }) => {
    // full page
    await expect(page).toHaveScreenshot('images_table.png', {
      fullPage: true,
    });

    // image resource limit modal
    await page
      .getByRole('row', { name: 'cr.backend' })
      .getByRole('button')
      .nth(1)
      .click();
    await page.getByText('Modify Minimum Image').waitFor();
    const imageResourceLimitModal = page.locator(
      'div.ant-modal.css-dev-only-do-not-override-1wkvdan.bai-modal',
    );
    await expect(imageResourceLimitModal).toHaveScreenshot(
      'image_resource_limit_modal.png',
    );
    await page.getByRole('button', { name: 'Close' }).click();
  });

  // resource presets table
  test(`resource presets table`, async ({ page }) => {
    await page.getByRole('tab', { name: 'Resource Presets' }).click();
    await page.getByText('Name', { exact: true }).waitFor();
    // full page
    await expect(page).toHaveScreenshot('resource_presets_table.png', {
      fullPage: true,
    });

    // modify resource preset
    await page
      .getByRole('row', { name: 'cpu01' })
      .getByRole('button')
      .first()
      .click();
    await page.getByText('Modify Resource Preset').waitFor();
    const modifyResourcePresetMdoal = page.locator(
      'div.ant-modal.css-dev-only-do-not-override-1wkvdan.bai-modal',
    );
    await expect(modifyResourcePresetMdoal).toHaveScreenshot(
      'modify_resource_preset_modal.png',
    );
    await page.getByRole('button', { name: 'Close' }).click();
  });

  // Registries table
  test('registries table', async ({ page }) => {
    await page.getByRole('tab', { name: 'Registries' }).click();
    await page.getByTitle('Registry Name').waitFor();
    await expect(page).toHaveScreenshot('registries_table.png', {
      fullPage: true,
    });

    // modify registry
    await page.getByRole('button', { name: 'setting' }).nth(1).click();
    const modifyRegistryModal = page.locator('div.ant-modal').first();
    await expect(modifyRegistryModal).toHaveScreenshot(
      'modify_registry_modal.png',
    );
    await page.getByRole('button', { name: 'Cancel' }).click();

    // add registry modal
    await page.getByRole('button', { name: 'plus Add Registry' }).click();
    await page.getByLabel('Add Registry').getByText('Add Registry').waitFor();
    const addRegistryModal = page.locator('div.ant-modal-content').first();
    await expect(addRegistryModal).toHaveScreenshot('add_registry_modal.png');
  });
});
