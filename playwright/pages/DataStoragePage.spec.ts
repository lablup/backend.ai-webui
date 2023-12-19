import { expect } from '@playwright/test';

export async function createVfolder(page: Page, vfolderName: string) {
  await page.locator('#data').click();
  await page.waitForURL('**/data');
  await page.locator('#add-folder').click();
  await page.locator('#add-folder-name').click();
  await page.locator('#add-folder-name label').fill(vfolderName);
  await page.locator('#add-button').click();
  await expect(page.getByText(vfolderName)).toBeVisible();
}

export async function deleteVfolder(page: Page, vfolderName: string) {
  await page.locator('#data').click();
  await page.waitForURL('**/data');
  await page
    .locator(`#controls[folder-name=${vfolderName}]`)
    .locator('mwc-icon-button[icon="delete"]')
    .click();
  await page.locator('#delete-folder-name').click();
  await page.locator('#delete-folder-name label').fill(vfolderName);
  await page.locator('#delete-button').click();
  await expect(
    page.locator(
      `lablup-shields[folder-name=${vfolderName}][description="deleted-complete"]`,
    ),
  ).toBeVisible();
}
