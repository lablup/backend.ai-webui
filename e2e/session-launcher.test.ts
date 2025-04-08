import {
  createSession,
  deleteSession,
  loginAsAdmin,
  loginAsUser,
  navigateTo,
} from './utils/test-util';
import { test, expect } from '@playwright/test';

test.describe('NEO Sessions Launcher', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // session test code needs more time to run
    testInfo.setTimeout(60_000);
    await loginAsUser(page);
  });

  const sessionName = 'e2e-test-session' + new Date().getTime();
  test('User can create session in NEO', async ({ page }) => {
    await createSession(page, sessionName);
    await deleteSession(page, sessionName);
  });

  test('Sensitive environment variables are cleared when the browser is reloaded.', async ({
    page,
  }) => {
    await navigateTo(page, 'session/start');
    await page
      .getByRole('button', { name: '2 Environments & Resource' })
      .click();
    await page
      .getByRole('button', { name: 'plus Add environment variables' })
      .click();
    await page.getByPlaceholder('Variable').fill('abc');
    await page.getByPlaceholder('Variable').press('Tab');
    await page.getByPlaceholder('Value').fill('123');
    await page
      .getByRole('button', { name: 'plus Add environment variables' })
      .click();
    await page.locator('#envvars_1_variable').fill('password');
    await page.locator('#envvars_1_variable').press('Tab');
    await page.locator('#envvars_1_value').fill('hello');
    await page
      .getByRole('button', { name: 'plus Add environment variables' })
      .click();
    await page.locator('#envvars_2_variable').fill('api_key');
    await page.locator('#envvars_2_variable').press('Tab');
    await page.locator('#envvars_2_value').fill('secret');
    await page.waitForTimeout(1000); // Wait for the form state to be saved as query param.
    await page.reload();
    await expect(
      page.locator('#envvars_1_value_help').getByText('Please enter a value.'),
    ).toBeVisible();
    await expect(
      page.locator('#envvars_2_value_help').getByText('Please enter a value.'),
    ).toBeVisible();
  });
});

test.describe('Restrict resource policy and see resource warning message', () => {
  // TODO: fix this test
  test.skip('superadmin to modify keypair resource policy', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    // go to resource policy page
    await navigateTo(page, 'resource-policy');
    // modify resource limit (cpu, memory) to zero
    await page
      .getByRole('table')
      .getByRole('button', { name: 'setting' })
      .click();
    await page.locator('.ant-checkbox-input').first().uncheck();
    await page.getByLabel('CPU(optional)').click();
    await page.getByLabel('CPU(optional)').fill('0');
    await page
      .locator(
        'div:nth-child(2) > div > div > .ant-checkbox-wrapper > span:nth-child(2)',
      )
      .first()
      .uncheck();
    await page.getByLabel('Memory(optional)').click();
    await page.getByLabel('Memory(optional)').fill('0');
    await page.getByRole('button', { name: 'OK' }).click();
    // go back to session page and see message in resource allocation section
    await navigateTo(page, 'session/start');
    await page.getByRole('button', { name: 'Next right' }).click();
    const notEnoughCPUResourceMsg = await page
      .locator('#resource_cpu_help')
      .getByText('Allocatable resources falls')
      .textContent();
    const notEnoughRAMResourceMsg = await page
      .getByText('Allocatable resources falls')
      .nth(1)
      .textContent();
    expect(notEnoughCPUResourceMsg).toEqual(notEnoughRAMResourceMsg);
  });
});
