import { loginAsVisualRegressionUser2 } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.describe('Serving page Visual Regression Test', () => {
  test.describe('Serving page', () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsVisualRegressionUser2(page, request);
      await page.getByRole('link', { name: 'Serving' }).click();
      await page.getByText('Active', { exact: true }).waitFor();
    });

    test('serving full page', async ({ page }) => {
      await page.setViewportSize({
        width: 1920,
        height: 1200,
      });
      await expect(page).toHaveScreenshot('serving_page.png', {
        fullPage: true,
      });
    });

    test('Create a new service page', async ({ page }) => {
      await page.setViewportSize({
        width: 1300,
        height: 2300,
      });
      await page.getByRole('button', { name: 'Start Service' }).click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('create_service_page.png', {
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

    test('Update Service', async ({ page }) => {
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

    test('Delete modal', async ({ page }) => {
      await page.getByRole('button', { name: 'delete' }).click();
      const deleteModal = page.locator('div.ant-modal-content').first();
      await expect(deleteModal).toHaveScreenshot('delete_modal.png');
    });
  });

  test.describe('Routing Info page', () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsVisualRegressionUser2(page, request);
      await page.getByRole('link', { name: 'Serving' }).click();
      await page.getByText('Active', { exact: true }).waitFor();
      await page.getByRole('link', { name: 'service_test2' }).click();
      await page.waitForLoadState('networkidle');
    });

    test('Routing Info page', async ({ page }) => {
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

    test('Add Auto Scaling Rule modal', async ({ page }) => {
      await page.getByRole('button', { name: 'plus Add Rules' }).click();
      await page.getByText('Add Auto Scaling Rule').waitFor();
      const addRuleModal = page.locator('div.ant-modal-content').first();
      await expect(addRuleModal).toHaveScreenshot(
        'add_auto_scaling_rule_modal.png',
      );
    });

    test('generate token modal', async ({ page }) => {
      await page.getByRole('button', { name: 'plus Generate Token' }).click();
      await page.getByText('Generate new Token').waitFor();
      const tokenModal = page.locator('div.ant-modal').first();
      await expect(tokenModal).toHaveScreenshot('generate_token_modal.png', {
        mask: [page.locator('div.ant-picker')],
      });
    });
  });
});
