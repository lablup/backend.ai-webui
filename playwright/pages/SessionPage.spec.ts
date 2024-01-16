import { generateRandomString } from '../helper/helper';
import { test, expect } from '@playwright/test';

test.describe('Create Session', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9081');
    await page.locator('#id_user_id label').click();
    await page.locator('#id_user_id label').fill('test@lablup.com');
    await page.locator('#id_password label').click();
    await page.locator('#id_password label').fill('test123!');
    await page.locator('#id_api_endpoint label').click();
    await page.locator('#id_api_endpoint label').fill('http://localhost:8090');
    await page.locator('#login-button').click();
    await page.locator('#session').click();
    await page.waitForURL('**/job');
    await page.waitForTimeout(1000);
  });
  test('User can create session', async ({ page }) => {
    const version = 'Ubuntu 20.04 aarch64';
    const randomSessionName = generateRandomString(
      4,
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    );
    const mountVfolderName = 'test';
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
    await page.waitForTimeout(5000);
    await page.getByRole('button', { name: 'close' }).click();
    await page.waitForTimeout(2000);
    expect(await page.getByText(randomSessionName).isVisible()).toBe(true);
  });
});

test.describe('Delete Session', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9081');
    await page.locator('#id_user_id label').click();
    await page.locator('#id_user_id label').fill('test@lablup.com');
    await page.locator('#id_password label').click();
    await page.locator('#id_password label').fill('test123!');
    await page.locator('#id_api_endpoint label').click();
    await page.locator('#id_api_endpoint label').fill('http://localhost:8090');
    await page.locator('#login-button').click();
    await page.locator('#session').click();
    await page.waitForURL('**/job');
    await page.waitForTimeout(1000);
  });
  test('User can delete session', async ({ page }) => {
    const sessionName = 'ssss';
    const sessionOwner = 'test@lablup.com';
    await page
      .locator(`[id="${sessionName}-power"]`)
      .getByLabel('power_settings_new')
      .click();
    await page
      .locator(`#terminate-session-dialog`)
      .locator('mwc-button[class="ok"]')
      .click();
    await page.waitForTimeout(5000);
    expect(await page.getByText(sessionName).isHidden()).toBe(true);
    await page.getByRole('tab', { name: 'Finished' }).click();
    await page.waitForTimeout(1000);
    expect(
      await page
        .getByRole('row', { name: `1 ${sessionOwner} ${sessionName}` })
        .isVisible(),
    ).toBe(true);
  });
});
