import { expect } from '@playwright/test';

export async function createUser(
  page: Page,
  email: string,
  userName: string,
  password: string,
) {
  await page.locator('#credential').click();
  await page.waitForURL('**/credential');
  await page.getByRole('tab', { name: 'Users' }).click();
  await page.getByRole('tab', { name: 'Active', exact: true }).click();
  await page.locator('#add-user').click();
  await page.locator('#new-user-dialog #id_user_email').click();
  await page.locator('#new-user-dialog #id_user_email label').fill(email);
  await page.locator('#new-user-dialog #id_user_name').click();
  await page.locator('#new-user-dialog #id_user_name label').fill(userName);
  await page.locator('#new-user-dialog #id_user_password').click();
  await page.locator('#new-user-dialog #id_user_password label').fill(password);
  await page.locator('#new-user-dialog #id_user_confirm').click();
  await page.locator('#new-user-dialog #id_user_confirm label').fill(password);
  await page.locator('#new-user-dialog #create-user-button').click();
  await expect(
    page
      .locator('#active-user-list vaadin-grid-cell-content')
      .filter({ hasText: email }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Credentials' }).click();
  await page.getByRole('tab', { name: 'Active', exact: true }).click();
  await expect(
    page
      .locator('#active-credential-list vaadin-grid-cell-content')
      .filter({ hasText: email }),
  ).toBeVisible();
}

export async function deleteUser(page: Page, email: string) {
  const emailText = email.replace(/\\/g, '');
  await page.locator('#credential').click();
  await page.waitForURL('**/credential');
  await page.getByRole('tab', { name: 'Users' }).click();
  await page.getByRole('tab', { name: 'Active', exact: true }).click();
  await page
    .locator(`#controls[user-id=${email}]`)
    .locator('mwc-icon-button[icon="delete_forever"]')
    .click();
  await page.locator('#active-user-list #deleteOk').click();
  await expect(
    page
      .locator('#active-user-list vaadin-grid-cell-content')
      .filter({ hasText: emailText }),
  ).toBeHidden();
  await page.getByRole('tab', { name: 'Inactive' }).click();
  await expect(
    page
      .locator('#inactive-user-list vaadin-grid-cell-content')
      .filter({ hasText: emailText }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Credentials' }).click();
  await expect(
    page
      .locator('#active-credential-list vaadin-grid-cell-content')
      .filter({ hasText: emailText }),
  ).toBeHidden();
  await page.getByRole('tab', { name: 'Inactive' }).click();
  await expect(
    page
      .locator('#inactive-credential-list vaadin-grid-cell-content')
      .filter({ hasText: emailText }),
  ).toBeVisible();
}
