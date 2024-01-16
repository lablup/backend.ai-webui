import { test, expect } from '@playwright/test';

test.describe('Create account', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9081');
    await page.locator('#id_user_id label').click();
    await page.locator('#id_user_id label').fill('test@lablup.com');
    await page.locator('#id_password label').click();
    await page.locator('#id_password label').fill('test123!');
    await page.locator('#id_api_endpoint label').click();
    await page.locator('#id_api_endpoint label').fill('http://localhost:8090');
    await page.locator('#login-button').click();
    await page.locator('#credential').click();
    await page.waitForURL('**/credential');
    await page.getByRole('tab', { name: 'Users' }).click();
    await page.getByRole('tab', { name: 'Active', exact: true }).click();
    await page.waitForTimeout(1000);
  });
  test('Admin can create account', async ({ page }) => {
    const email = 'test4@lablup.com';
    const userName = 'test4';
    const password = 'test123!';
    await page.locator('#add-user').click();
    await page.locator('#new-user-dialog #id_user_email').click();
    await page.locator('#new-user-dialog #id_user_email label').fill(email);
    await page.locator('#new-user-dialog #id_user_name').click();
    await page.locator('#new-user-dialog #id_user_name label').fill(userName);
    await page.locator('#new-user-dialog #id_user_password').click();
    await page
      .locator('#new-user-dialog #id_user_password label')
      .fill(password);
    await page.locator('#new-user-dialog #id_user_confirm').click();
    await page
      .locator('#new-user-dialog #id_user_confirm label')
      .fill(password);
    await page.locator('#new-user-dialog #create-user-button').click();
    await page.waitForTimeout(5000);
    expect(
      await page
        .locator('#active-user-list vaadin-grid-cell-content')
        .filter({ hasText: email })
        .isVisible(),
    ).toBe(true);
    await page.getByRole('tab', { name: 'Credentials' }).click();
    await page.getByRole('tab', { name: 'Active', exact: true }).click();
    await page.waitForTimeout(1000);
    expect(
      await page
        .locator('#active-credential-list vaadin-grid-cell-content')
        .filter({ hasText: email })
        .isVisible(),
    ).toBe(true);
  });
});

test.describe('Delete account', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9081');
    await page.locator('#id_user_id label').click();
    await page.locator('#id_user_id label').fill('test@lablup.com');
    await page.locator('#id_password label').click();
    await page.locator('#id_password label').fill('test123!');
    await page.locator('#id_api_endpoint label').click();
    await page.locator('#id_api_endpoint label').fill('http://localhost:8090');
    await page.locator('#login-button').click();
    await page.locator('#credential').click();
    await page.waitForURL('**/credential');
    await page.getByRole('tab', { name: 'Users' }).click();
    await page.getByRole('tab', { name: 'Active', exact: true }).click();
    await page.waitForTimeout(1000);
  });
  test('Admin can delete account', async ({ page }) => {
    const email = 'test4@lablup.com';
    await page
      .locator(`#controls[user-id="${email}"]`)
      .locator('mwc-icon-button[icon="delete_forever"]')
      .click();
    await page.locator('#active-user-list #deleteOk').click();
    await page.waitForTimeout(5000);
    expect(
      await page.getByRole('gridcell', { name: email, exact: true }).isHidden(),
    ).toBe(true);
    await page.getByRole('tab', { name: 'Inactive' }).click();
    await page.waitForTimeout(1000);
    expect(
      await page
        .getByRole('gridcell', { name: email, exact: true })
        .isVisible(),
    ).toBe(true);
    await page.getByRole('tab', { name: 'Credentials' }).click();
    await page.waitForTimeout(1000);
    expect(
      await page
        .locator('#active-credential-list vaadin-grid-cell-content')
        .filter({ hasText: email })
        .isHidden(),
    ).toBe(true);
    await page.getByRole('tab', { name: 'Inactive' }).click();
    await page.waitForTimeout(1000);
    expect(
      await page
        .locator('#inactive-credential-list vaadin-grid-cell-content')
        .filter({ hasText: email })
        .isVisible(),
    ).toBe(true);
  });
});
