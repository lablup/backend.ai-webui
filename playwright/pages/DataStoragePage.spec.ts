import { generateRandomString } from '../helper/helper';
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

test.describe('Create vfolder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9081');
    await page.locator('#id_user_id label').click();
    await page
      .locator('#id_user_id label')
      .fill(process.env.SUPER_ADMIN_EMAIL as string);
    await page.locator('#id_password label').click();
    await page
      .locator('#id_password label')
      .fill(process.env.SUPER_ADMIN_PASSWORD as string);
    await page.locator('#id_api_endpoint label').click();
    await page
      .locator('#id_api_endpoint label')
      .fill(process.env.ENDPOINT as string);
    await page.locator('#login-button').click();
    await page.getByTestId('data').click();
    await page.waitForURL('**/data');
  });
  test('User can create vfolder', async ({ page }) => {
    const randomVfolderName = generateRandomString(); //Make random vfolder name
    await page.locator('#add-folder').click();
    await page.locator('#add-folder-name').click();
    await page.locator('#add-folder-name label').fill(randomVfolderName);
    await page.locator('#add-button').click();
    await page.waitForResponse(
      (response) =>
        response.url() ===
          'http://localhost:8090/func/folders?group_id=2de2b969-1d04-48a6-af16-0bc8adb3c831' &&
        response.status() === 200,
      { timeout: 0 },
    );
    await page
      .getByRole('treegrid')
      .evaluate(async (e) => (e.scrollTop = e.scrollHeight));
    await page.waitForSelector(`div[folder-name="${randomVfolderName}"]`);
    await expect(
      page.getByText(`folder_open ${randomVfolderName}`, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByTestId(randomVfolderName).getByText('ready'),
    ).toBeVisible();
  });
});

test.describe('Delete Vfolder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9081');
    await page.locator('#id_user_id label').click();
    await page
      .locator('#id_user_id label')
      .fill(process.env.SUPER_ADMIN_EMAIL as string);
    await page.locator('#id_password label').click();
    await page
      .locator('#id_password label')
      .fill(process.env.SUPER_ADMIN_PASSWORD as string);
    await page.locator('#id_api_endpoint label').click();
    await page
      .locator('#id_api_endpoint label')
      .fill(process.env.ENDPOINT as string);
    await page.locator('#login-button').click();
    await page.getByTestId('data').click();
    await page.waitForURL('**/data');
  });
  test('User can delete vfolder', async ({ page }) => {
    const deleteVfolderName =
      '51A28jtJ2sggtOUxceAv9KOJdSQaIQELddXxhaVhyFA1QAgP2EXjf1WMRoMvRXMC'; //Write vfolder name you want to delete
    await page
      .getByRole('treegrid')
      .evaluate(async (e) => (e.scrollTop = e.scrollHeight));
    await page.waitForSelector(`div[folder-name="${deleteVfolderName}"]`);
    await page
      .locator(`#controls[folder-name="${deleteVfolderName}"]`)
      .locator('mwc-icon-button[icon="delete"]')
      .click();
    await page.locator('#delete-folder-name').click();
    await page.locator('#delete-folder-name label').fill(deleteVfolderName);
    await page.locator('#delete-button').click();
    await page.waitForResponse(
      (response) =>
        response.url() ===
          'http://localhost:8090/func/folders?group_id=2de2b969-1d04-48a6-af16-0bc8adb3c831' &&
        response.status() === 200,
      { timeout: 0 },
    );
    await page
      .getByRole('treegrid')
      .evaluate(async (e) => (e.scrollTop = e.scrollHeight));
    await page.waitForSelector(`div[folder-name="${deleteVfolderName}"]`);
    await expect(
      page.getByTestId(deleteVfolderName).getByText('deleted-complete'),
    ).toBeVisible();
  });
});
