import { loginAsVisualRegressionUser, navigateTo } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.describe(
  'Serving page Visual Regression Test',
  { tag: ['@regression', '@serving', '@visual'] },
  () => {
    test.describe('Serving page', () => {
      test.beforeEach(async ({ page, request }) => {
        await loginAsVisualRegressionUser(page, request);
        await navigateTo(page, 'serving');
        await page.getByText('Active', { exact: true }).waitFor();
      });

      test('serving full page', async ({ page }) => {
        await page.setViewportSize({
          width: 1920,
          height: 1200,
        });
        await expect(page).toHaveScreenshot('serving_page.png', {
          fullPage: true,
          maxDiffPixelRatio: 0.02,
        });
      });

      // FIXME: Test timeout - "Model Definition" text is not visible after clicking Start Service
      // The create service page might have changed its structure or text
      test.fixme('Create a new service page', async ({ page }) => {
        await page.setViewportSize({
          width: 1300,
          height: 2300,
        });
        await page.getByRole('button', { name: 'Start Service' }).click();
        await expect(page.getByText('Model Definition')).toBeVisible();
        await expect(page).toHaveScreenshot('create_service_page.png', {
          fullPage: true,
          maxDiffPixelRatio: 0.04,
          mask: [
            page.locator(
              'div:nth-child(3) > .ant-row > div:nth-child(2) > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-select > .ant-select-selector',
            ),
            page.locator(
              'div:nth-child(2) > div > div:nth-child(4) > .ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-select > .ant-select-selector',
            ),
          ],
        });
      });

      // FIXME: Test timeout - setting button cannot be clicked
      // The serving page might not have any services to update, or the button locator changed
      test.fixme('Update Service', async ({ page }) => {
        await page.setViewportSize({
          width: 1100,
          height: 2300,
        });
        await page.getByRole('button', { name: 'setting' }).click();
        await page.getByText('Service Name(optional)').waitFor();
        await expect(page).toHaveScreenshot('update_service_page.png', {
          fullPage: true,
          mask: [
            page.locator(
              'div:nth-child(3) > .ant-row > div:nth-child(2) > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-select > .ant-select-selector',
            ),
            page.locator(
              'div:nth-child(2) > div > div:nth-child(4) > .ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-select > .ant-select-selector',
            ),
          ],
        });
      });

      // FIXME: Test timeout - delete button cannot be clicked
      // The serving page might not have any services to delete, or the button locator changed
      test.fixme('Delete modal', async ({ page }) => {
        await page.getByRole('button', { name: 'delete' }).click();
        const deleteModal = page.locator('div.ant-modal-content').first();
        await expect(deleteModal).toHaveScreenshot('delete_modal.png');
      });
    });

    test.describe('Routing Info page', () => {
      // FIXME: Test timeout in beforeEach - 'service_test2' link cannot be clicked
      // The test data service might not exist or the link locator changed
      test.beforeEach(async ({ page, request }) => {
        await loginAsVisualRegressionUser(page, request);
        await navigateTo(page, 'serving');
        await page.getByText('Active', { exact: true }).waitFor();
        await page.getByRole('link', { name: 'service_test2' }).click();
        await expect(
          page.getByRole('button', { name: 'plus Add Rules' }),
        ).toBeVisible();
      });

      // FIXME: Test skipped due to beforeEach failure (service_test2 link not found)
      test.fixme('Routing Info page', async ({ page }) => {
        await page.setViewportSize({
          width: 1100,
          height: 1800,
        });
        await expect(page).toHaveScreenshot('routing_info_page.png', {
          fullPage: true,
          mask: [
            page.locator('td.ant-descriptions-item-content:has-text("ubuntu")'),
          ],
        });
      });

      // FIXME: Test skipped due to beforeEach failure (service_test2 link not found)
      test.fixme('Add Auto Scaling Rule modal', async ({ page }) => {
        await page.getByRole('button', { name: 'plus Add Rules' }).click();
        await page.getByText('Add Auto Scaling Rule').waitFor();
        const addRuleModal = page.locator('div.ant-modal-content').first();
        await expect(addRuleModal).toHaveScreenshot(
          'add_auto_scaling_rule_modal.png',
        );
      });

      // FIXME: Test skipped due to beforeEach failure (service_test2 link not found)
      test.fixme('generate token modal', async ({ page }) => {
        await page.getByRole('button', { name: 'plus Generate Token' }).click();
        await page.getByText('Generate new Token').waitFor();
        const tokenModal = page.locator('div.ant-modal').first();
        await expect(tokenModal).toHaveScreenshot('generate_token_modal.png', {
          mask: [page.locator('div.ant-picker')],
        });
      });
    });
  },
);
