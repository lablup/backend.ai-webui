import { generateRandomString } from '../helper/helper';
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

test.describe('Create vfolder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PAGE_URL as string);
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
    await page.getByRole('menu').getByTestId('data').click();
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
        response.url() === `${process.env.ENDPOINT}/func/folders` &&
        response.status() === 201,
      { timeout: 0 },
    ); //POST vfolder create
    await page.waitForResponse(
      (response) =>
        response
          .url()
          .includes(`${process.env.ENDPOINT}/func/folders?group_id`) &&
        response.status() === 200,
      { timeout: 0 },
    ); //GET vfolder list
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
    await page.goto(process.env.PAGE_URL as string);
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
    await page.getByRole('menu').getByTestId('data').click();
    await page.waitForURL('**/data');
  });
  test('User can delete vfolder', async ({ page }) => {
    await page
      .getByRole('treegrid')
      .evaluate(async (e) => (e.scrollTop = e.scrollHeight));
    await page.waitForSelector(
      `div[folder-name="${process.env.DELETE_VFOLDER}"]`,
    );
    await page
      .locator(`#controls[folder-name="${process.env.DELETE_VFOLDER}"]`)
      .locator('mwc-icon-button[icon="delete"]')
      .click();
    await page.locator('#delete-folder-name').click();
    await page
      .locator('#delete-folder-name label')
      .fill(process.env.DELETE_VFOLDER as string);
    await page.locator('#delete-button').click();
    await page.waitForResponse(
      (response) =>
        response.url() ===
          `${process.env.ENDPOINT}/func/folders/${process.env.DELETE_VFOLDER}` &&
        response.status() === 204,
      { timeout: 0 },
    ); //DELETE vfolder
    await page.waitForResponse(
      (response) =>
        response
          .url()
          .includes(`${process.env.ENDPOINT}/func/folders?group_id`) &&
        response.status() === 200,
      { timeout: 0 },
    ); //GET vfolder list
    await page
      .getByRole('treegrid')
      .evaluate(async (e) => (e.scrollTop = e.scrollHeight));
    await page.waitForSelector(
      `div[folder-name="${process.env.DELETE_VFOLDER}"]`,
    );
    await expect(
      page
        .getByTestId(process.env.DELETE_VFOLDER as string)
        .getByText('deleted-complete'),
    ).toBeVisible();
  });
});
