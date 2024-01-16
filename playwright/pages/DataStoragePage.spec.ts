import { generateRandomString } from '../helper/helper';
import { test, expect } from '@playwright/test';

test.describe('Vfolder creation', () => {
  const randomVfolderName = generateRandomString();
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9081');
    await page.locator('#id_user_id label').click();
    await page.locator('#id_user_id label').fill('test@lablup.com');
    await page.locator('#id_password label').click();
    await page.locator('#id_password label').fill('test123!');
    await page.locator('#id_api_endpoint label').click();
    await page.locator('#id_api_endpoint label').fill('http://localhost:8090');
    await page.locator('#login-button').click();
    await page.locator('#data').click();
    await page.waitForURL('**/data');
  });
  test('User can create vfolder', async ({ page }) => {
    await page.locator('#add-folder').click();
    await page.locator('#add-folder-name').click();
    await page.locator('#add-folder-name label').fill(randomVfolderName);
    await page.locator('#add-button').click();
    await page.waitForTimeout(5000);
    await page
      .getByRole('treegrid')
      .evaluate(async (e) => (e.scrollTop = e.scrollHeight));
    await page.waitForTimeout(1000);
    expect(
      await page
        .getByText(`folder_open ${randomVfolderName}`, { exact: true })
        .isVisible(),
    ).toBe(true);
    expect(
      await page
        .locator(
          `lablup-shields[folder-name=${randomVfolderName}][description="ready"]`,
        )
        .isVisible(),
    ).toBe(true);
  });
});

test.describe('Vfolder deletion', () => {
  const deleteVfolderName =
    'dBvGpQPVo4V6ArAM3qtwnERwV5W5iL3WKZOJKA3rXX0rm0RgC10r1bA14AQoWC9F';
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9081');
    await page.locator('#id_user_id label').click();
    await page.locator('#id_user_id label').fill('test@lablup.com');
    await page.locator('#id_password label').click();
    await page.locator('#id_password label').fill('test123!');
    await page.locator('#id_api_endpoint label').click();
    await page.locator('#id_api_endpoint label').fill('http://localhost:8090');
    await page.locator('#login-button').click();
    await page.locator('#data').click();
    await page.waitForURL('**/data');
  });
  test('User can delete vfolder', async ({ page }) => {
    await page
      .getByRole('treegrid')
      .evaluate(async (e) => (e.scrollTop = e.scrollHeight));
    await page.waitForTimeout(1000);
    await page
      .locator(`#controls[folder-name=${deleteVfolderName}]`)
      .locator('mwc-icon-button[icon="delete"]')
      .click();
    await page.locator('#delete-folder-name').click();
    await page.locator('#delete-folder-name label').fill(deleteVfolderName);
    await page.locator('#delete-button').click();
    await page.waitForTimeout(5000);
    expect(
      await page
        .locator(
          `lablup-shields[folder-name=${deleteVfolderName}][description="deleted-complete"]`,
        )
        .isVisible(),
    ).toBe(true);
  });
});
