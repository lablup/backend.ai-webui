import {
  createSession,
  deleteSession,
  loginAsAdmin,
  loginAsUser,
  navigateTo,
} from './test-util';
import { test, expect } from '@playwright/test';

test.describe('Sessions ', () => {
  const sessionName = 'e2e-test-session';
  test('User can create session in NEO', async ({ page }) => {
    await loginAsUser(page);
    await createSession(page, sessionName);
    await deleteSession(page, sessionName);
  });
});

test.describe('Restrict resource policy and see resource warning message', () => {
  test('superadmin to modify keypair resource policy', async ({ page }) => {
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
