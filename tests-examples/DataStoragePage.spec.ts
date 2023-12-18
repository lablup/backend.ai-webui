import { expect } from '@playwright/test';

export async function createVfolder(page: Page, vfolderName: string) {
  await page.locator('#data').click();
  await page.getByRole('button', { name: 'add' }).click();
  await page.locator('#add-folder-name label').click();
  await page.getByRole('textbox', { name: 'Folder name*' }).fill('testvfolder');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByText('testvfolder')).toBeVisible();
}