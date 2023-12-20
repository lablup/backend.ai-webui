import { expect } from '@playwright/test';

export async function createSession(
  page: Page,
  environmnet: string,
  mountVfolderName: string,
  sessionName: string,
) {
  await page.locator('#session').click();
  await page.waitForURL('**/job');
  await page.getByRole('tab', { name: 'Running' }).click();
  await page
    .locator('backend-ai-session-view')
    .locator('#launch-session')
    .click();
  await page.locator('backend-ai-session-view').locator('#version').click();
  await page
    .locator('backend-ai-session-view')
    .getByRole('option', { name: environmnet })
    .click();
  await page
    .locator('backend-ai-session-view')
    .locator('#session-name')
    .click();
  await page
    .locator('backend-ai-session-view')
    .locator('#session-name label')
    .fill(sessionName);
  await page.locator('backend-ai-session-view').locator('#next-button').click();
  await page.getByText(`${mountVfolderName} local:volume1`).click();
  await page.locator('backend-ai-session-view').locator('#next-button').click();
  await page.locator('backend-ai-session-view').locator('#next-button').click();
  await page
    .locator('backend-ai-session-view')
    .locator('#launch-button')
    .click();
  await page.waitForTimeout(5000);
  await page.getByRole('button', { name: 'close' }).click();
  await page.waitForTimeout(2000);
  await expect(page.getByText(sessionName)).toBeVisible();
}

export async function deleteSession(
  page: Page,
  email: string,
  sessionName: string,
) {
  await page.locator('#session').click();
  await page.waitForURL('**/job');
  await page.getByRole('tab', { name: 'Running' }).click();
  await page
    .locator(`#${sessionName}-power`)
    .getByLabel('power_settings_new')
    .click();
  await page
    .locator(`#terminate-session-dialog`)
    .locator('mwc-button[class="ok"]')
    .click();
  await page.waitForTimeout(5000);
  await expect(page.getByText(sessionName)).toBeHidden();
  await page.getByRole('tab', { name: 'Finished' }).click();
  await expect(
    page
      .getByRole('row', { name: `1 ${email} ${sessionName}` })
      .locator('#vaadin-grid-cell-36'),
  ).toBeVisible();
}
