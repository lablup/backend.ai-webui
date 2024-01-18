import { generateRandomString } from '../helper/helper';
import { test, expect } from '@playwright/test';

test.describe('Create vfolder', () => {
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
    const randomVfolderName = generateRandomString(); //Make random vfolder name
    await page.locator('#add-folder').click();
    await page.locator('#add-folder-name').click();
    await page.locator('#add-folder-name label').fill(randomVfolderName);
    await page.locator('#add-button').click();
    await page
      .getByRole('treegrid')
      .evaluate(async (e) => (e.scrollTop = e.scrollHeight));
    await page.waitForSelector(`div[folder-name="${randomVfolderName}"]`);
    await expect(
      page.getByText(`folder_open ${randomVfolderName}`, { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator(
        `lablup-shields[folder-name="${randomVfolderName}"][description="ready"]`,
      ),
    ).toBeVisible();
  });
});

test.describe('Delete Vfolder', () => {
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
    const deleteVfolderName =
      'PzHsLEJkWPXPdMirzYpR7Dpr530VbEuxX7bAJKSEuN60hSJzv6Q6m5wUh9h0PIKg'; //Write vfolder name you want to delete
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
    await page
      .getByRole('treegrid')
      .evaluate(async (e) => (e.scrollTop = e.scrollHeight));
    await page.waitForSelector(`div[folder-name="${deleteVfolderName}"]`);
    await expect(
      page.locator(
        `lablup-shields[folder-name="${deleteVfolderName}"][description="deleted-complete"]`,
      ),
    ).toBeVisible();
  });
});
