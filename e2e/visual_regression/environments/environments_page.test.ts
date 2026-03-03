import {
  loginAsVisualRegressionAdmin,
  navigateTo,
} from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await page.setViewportSize({
    width: 1800,
    height: 1400,
  });
  await loginAsVisualRegressionAdmin(page, request);
  await navigateTo(page, 'environment');
  // Wait for the BAIPropertyFilter (replaces removed .ant-input-affix-wrapper wait)
  await page
    .locator('.ant-space-compact')
    .first()
    .waitFor({ state: 'visible' });
});

test.describe(
  'Environments page Visual Regression Test',
  { tag: ['@regression', '@environment', '@visual'] },
  () => {
    // FIXME: Modal locator times out - 'div.ant-modal.css-dev-only-do-not-override-1wkvdan.bai-modal' cannot find the modal
    // May need to update modal locator to use getByRole('dialog') instead
    test.fixme(`images table`, async ({ page }) => {
      // full page
      await expect(page).toHaveScreenshot('images_table.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.03,
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

    // FIXME: Strict mode violation - getByText('Name', { exact: true }) resolves to 2 elements
    // Need to use more specific locator, e.g., getByRole('columnheader', { name: 'Name' })
    test.fixme(`resource presets table`, async ({ page }) => {
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

    // FIXME: Modal locator times out - 'div.ant-modal-content' cannot find the add registry modal
    // May need to wait longer or use getByRole('dialog') instead
    test.fixme('registries table', async ({ page }) => {
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
  },
);
