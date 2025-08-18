import { loginAsVisualRegressionUser2 } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // login to visual regression server
  await loginAsVisualRegressionUser2(page);
  await page.waitForLoadState('networkidle');
  await page.setViewportSize({
    width: 1920,
    height: 2100,
  });

  // Run the test using the Neo Session list
  await page.getByTestId('user-dropdown-button').click();
  await page.getByRole('menuitem', { name: 'setting Preferences' }).click();
  await page
    .locator('div')
    .filter({ hasText: /^NEO Session listEnabled$/ })
    .getByLabel('Enabled')
    .check();
  await page.getByRole('link', { name: 'Sessions' }).click();
});

test.afterEach(async ({ page }) => {
  // uncheck the Neo Session list
  await page.getByTestId('user-dropdown-button').click();
  await page.getByRole('menuitem', { name: 'setting Preferences' }).click();
  await page
    .locator('div')
    .filter({ hasText: /^NEO Session listEnabled$/ })
    .getByLabel('Enabled')
    .uncheck();
});

test.describe('Visual Regression Test for NEO Session Page', () => {
  test('Create a new session step by step', async ({ page }) => {
    // step1.png
    await page.getByRole('button', { name: 'Start Session' }).nth(1).click();
    await page.getByText('Session Type').first().waitFor();
    await expect(page).toHaveScreenshot('step1.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.005,
    });

    // step2.png
    await page.getByRole('button', { name: 'Next right' }).click();
    await page.getByText('Environments', { exact: true }).waitFor();
    await expect(page).toHaveScreenshot('step2.png', {
      fullPage: true,
      mask: [
        page
          .locator(
            '.ant-form-item-control-input-content > .ant-select > .ant-select-selector',
          )
          .first(),
        page
          .locator(
            'div:nth-child(3) > .ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-select > .ant-select-selector',
          )
          .first(),
        page.locator('.ant-select').nth(4),
        page.locator('.ant-card-body').nth(3),
      ],
      maxDiffPixelRatio: 0.005,
    });

    // step3.png
    await page.getByRole('button', { name: 'Next right' }).click();
    await expect(page).toHaveScreenshot('step3.png', {
      fullPage: true,
    });

    // step4.png
    await page.getByRole('button', { name: 'Next right' }).click();
    await expect(page).toHaveScreenshot('step4.png', {
      fullPage: true,
    });

    // step5.png
    await page.getByRole('button', { name: 'Next right' }).click();
    await expect(page).toHaveScreenshot('step5.png', {
      mask: [page.locator('div.ant-card-body').nth(10)],
      fullPage: true,
    });
  });

  test('Before create a new session', async ({ page }) => {
    await page.getByText('Create a Session').waitFor();
    await expect(page).toHaveScreenshot('session_page.png', {
      mask: [
        page.locator('div.ant-card-body').nth(1),
        page.locator('tbody.ant-table-tbody'),
      ],
      fullPage: true,
      maxDiffPixelRatio: 0.005,
    });
  });
});
