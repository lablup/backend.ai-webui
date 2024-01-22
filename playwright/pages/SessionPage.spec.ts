import { generateRandomString } from '../helper/helper';
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

test.describe('Create Session', () => {
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
    await page.getByTestId('session').click();
    await page.waitForURL('**/job');
  });
  test('User can create session', async ({ page }) => {
    const randomSessionName = generateRandomString(
      4,
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    ); //Make random vfolder name
    const version = 'Ubuntu 20.04 aarch64'; //Write version
    const mountVfolderName = 'test'; //Write mount vfolder
    await page
      .locator('backend-ai-session-view')
      .locator('#launch-session')
      .click();
    await page.locator('backend-ai-session-view').locator('#version').click();
    await page
      .locator('backend-ai-session-view')
      .getByRole('option', { name: version })
      .click();
    await page
      .locator('backend-ai-session-view')
      .locator('#session-name')
      .click();
    await page
      .locator('backend-ai-session-view')
      .locator('#session-name label')
      .fill(randomSessionName);
    await page
      .locator('backend-ai-session-view')
      .locator('#next-button')
      .click();
    await page.getByText(`${mountVfolderName} local:volume1`).click();
    await page
      .locator('backend-ai-session-view')
      .locator('#next-button')
      .click();
    await page
      .locator('backend-ai-session-view')
      .locator('#next-button')
      .click();
    await page
      .locator('backend-ai-session-view')
      .locator('#launch-button')
      .click();
    await page.waitForResponse(
      (response) =>
        response.url() === 'http://localhost:8090/func/session' &&
        response.status() === 201,
      { timeout: 0 },
    );
    await page.getByRole('button', { name: 'close' }).click();
    await expect(
      page.getByTestId(randomSessionName).getByText('RUNNING'),
    ).toBeVisible();
  });
});

test.describe('Delete Session', () => {
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
    await page.getByTestId('session').click();
    await page.waitForURL('**/job');
  });
  test('User can delete session', async ({ page }) => {
    const deleteSessionName = 'kxCW'; //Write session name you want to delete
    await page.getByTestId(deleteSessionName + '-delete').click();
    await page
      .locator(`#terminate-session-dialog`)
      .locator('mwc-button[class="ok"]')
      .click();
    await page.waitForRequest(
      async (request) =>
        request.method() === 'DELETE' &&
        (await request.response())?.status() === 200,
      { timeout: 0 },
    );
    await expect(page.getByText(deleteSessionName)).toBeHidden();
    await page.locator('mwc-tab[title="finished"]').click();
    await expect(
      page.getByTestId(deleteSessionName).getByText('TERMINATED'),
    ).toBeVisible();
  });
});
