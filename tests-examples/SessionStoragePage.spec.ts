import { expect } from '@playwright/test';

export async function createSession(
  page: Page,
  environmnet: string,
  mountVfolderName: string,
  sessionName: string,) {
    await page.locator('#session').click();
    await page.getByRole('heading', { name: 'more_horiz power_settings_new' }).getByLabel('power_settings_new').click();
    await page.getByRole('combobox', { name: 'Version*' }).click();
    await page.getByRole('option', { name: environmnet }).click();
    await page.getByRole('textbox', { name: 'label' }).click();
    await page.locator('backend-ai-session-view label').filter({ hasText: 'label' }).click();
    await page.getByRole('textbox', { name: 'label' }).fill(sessionName);
    await page.getByRole('button', { name: 'arrow_forward' }).click();
    await page.locator('backend-ai-session-view').getByText(mountVfolderName).click();
    await page.getByRole('button', { name: 'arrow_forward' }).click();
    await page.getByRole('button', { name: 'arrow_forward' }).click();
    await page.getByRole('button', { name: 'rowing' }).click();
    await page.waitForTimeout(5000);
    await page.getByRole('button', { name: 'close' }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByText(sessionName)).toBeVisible();
}

export async function deleteSession(page: Page, email: string, sessionName: string,) {
  await page.locator('#session').click();
  await page.locator('#testSession-power').getByLabel('power_settings_new').click();
  await page.getByRole('button', { name: 'Okay' }).click();
  await page.waitForTimeout(5000);
  await expect(page.getByText(sessionName)).toBeHidden();
  await page.getByRole('tab', { name: 'Finished' }).click();
  await expect(page.getByRole('row', { name: `1 ${email} ${sessionName}` }).locator('#vaadin-grid-cell-36')).toBeVisible();
}