import {
  loginAsAdmin,
  loginAsCreatedAccount,
  logout,
  webuiEndpoint,
} from './utils/test-util';
import test, { expect } from '@playwright/test';

const EMAIL = 'e2e-test-user@lablup.com';
const PASSWORD = 'testing@123';
const NEW_PASSWORD = 'new-password@123';

test.describe('Create user', () => {
  test.afterEach(async ({ page, request }, testInfo) => {
    // check if the test failed because the created user is already exist
    if (['failed', 'timedOut'].includes(testInfo.status ?? '')) {
      await loginAsAdmin(page, request);
      await page.getByRole('menuitem', { name: 'Users' }).click();
      await page
        .locator('vaadin-grid-cell-content')
        .filter({ hasText: 'User ID' })
        .first()
        .locator('input')
        .last()
        .fill(EMAIL);
      await page.waitForTimeout(1000);
      // check if the user is already exist in the active user list
      expect(
        page.getByRole('gridcell', { name: EMAIL }),
        'User already exist. Please check the user list',
      ).not.toBeVisible();
      // check if the user is already exist in the inactive user list
      await page.getByRole('tab', { name: 'Inactive' }).click();
      await page
        .locator('vaadin-grid-cell-content')
        .filter({ hasText: 'User ID' })
        .last()
        .locator('input')
        .last()
        .fill(EMAIL);
      await page.waitForTimeout(1000);
      expect(
        page.getByRole('gridcell', { name: EMAIL }),
        'User already exist. Please check the user list',
      ).not.toBeVisible();
    }
  });
  test.skip('admin should be able to create a new user', async ({
    page,
    request,
  }) => {
    await loginAsAdmin(page, request);
    await page.getByRole('menuitem', { name: 'Users' }).click();
    await page.getByRole('button', { name: 'Create User' }).click();
    // Create a User
    const emailInput = await page
      .locator('#new-user-dialog label')
      .filter({ hasText: 'Email' })
      .locator('input');
    const passwordInput = await page
      .locator('#new-user-dialog label')
      .filter({ hasText: 'Password' })
      .locator('input');

    await emailInput.fill(EMAIL);
    await passwordInput.first().fill(PASSWORD);
    await passwordInput.last().fill(PASSWORD);
    await page
      .locator('#new-user-dialog button')
      .filter({ hasText: 'Create User' })
      .click();
    //Login as the created user
    await logout(page);
    await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
  });
});

test.describe('Delete user', () => {
  test.skip('admin should be able to delete a user', async ({
    page,
    request,
  }) => {
    await loginAsAdmin(page, request);
    await page.getByRole('menuitem', { name: 'Users' }).click();
    await page
      .locator('#active-user-list vaadin-grid-cell-content')
      .filter({ hasText: 'User ID' })
      .locator('input')
      .last()
      .fill(EMAIL);
    await page.waitForTimeout(1000);
    await expect(page.getByRole('gridcell', { name: EMAIL })).toBeVisible();
    await page.getByRole('button', { name: 'delete' }).click();
    await page.getByRole('button', { name: 'Okay' }).click();
    await expect(
      page
        .locator('.ant-notification-notice')
        .getByText('Signout is seccessfully'),
    ).toBeVisible();
    // check if the user is deleted
    //TODO: find a better way to check the test is failed. The below code is not working
    // expect(
    //   await loginAsCreatedAccount(page, EMAIL, PASSWORD),
    // ).toThrow();
    await logout(page);
    await page.getByLabel('Email or Username').fill(EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
    await page.getByRole('textbox', { name: 'Endpoint' }).fill(webuiEndpoint);
    await page.getByLabel('Login', { exact: true }).click();
    await expect(page).not.toHaveURL(/.*summary/);
  });
});

test.describe('Update user', () => {
  test.skip('admin should be able to update a user', async ({
    page,
    request,
  }) => {
    // undo delete user
    await loginAsAdmin(page, request);
    await page.getByRole('menuitem', { name: 'Users' }).click();
    await page.getByRole('tab', { name: 'INACTIVE' }).click();
    await page
      .locator('vaadin-grid-cell-content')
      .filter({ hasText: 'User ID' })
      .locator('input')
      .last()
      .fill(EMAIL);
    await page.getByRole('button', { name: 'settings' }).click();
    await page.waitForTimeout(1000);
    await page.getByLabel('Modify User Detail').getByText('Deleted').click();
    await page
      .getByLabel('Modify User Detail')
      .getByText('Active', { exact: true })
      .click();
    await page.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('tab', { name: 'CREDENTIALS' }).click();
    await page.getByRole('tab', { name: 'INACTIVE' }).click();
    await page
      .locator('vaadin-grid-cell-content')
      .filter({ hasText: 'User ID' })
      .last()
      .locator('input')
      .last()
      .fill(EMAIL);
    await page.waitForTimeout(1000);
    await page.getByLabel('redo').scrollIntoViewIfNeeded();
    await page.getByLabel('redo').click();
    // update active user information
    await page.getByRole('tab', { name: 'USERS' }).click();
    await page.getByRole('tab', { name: 'ACTIVE' }).first().click();
    await page
      .locator('vaadin-grid-cell-content')
      .filter({ hasText: 'User ID' })
      .first()
      .locator('input')
      .last()
      .fill(EMAIL);
    await page.waitForTimeout(1000);
    // modify the user information
    await page.getByRole('button', { name: 'settings' }).click();
    await page.getByLabel('User Name').fill('modified-e2e-test-user');
    await page.getByLabel('New Password').first().fill(NEW_PASSWORD);
    await page.getByLabel('New Password (again)').first().fill(NEW_PASSWORD);
    await page.getByRole('button', { name: 'OK' }).click();
    // check if the user information is updated
    await page.getByRole('button', { name: 'assignment' }).click();
    await expect(
      page.getByLabel('User Detail').getByText('modified-e2e-test-user'),
      'User name is not updated',
    ).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();
    await logout(page);
    await loginAsCreatedAccount(page, request, EMAIL, NEW_PASSWORD);
    await expect(page).toHaveURL(/.*summary/);
    // Delete the user. Same test as above 'Delete user'
    await logout(page);
    await loginAsAdmin(page, request);
    await page.getByRole('menuitem', { name: 'Users' }).click();
    await page
      .locator('#active-user-list vaadin-grid-cell-content')
      .filter({ hasText: 'User ID' })
      .locator('input')
      .last()
      .fill(EMAIL);
    await page.waitForTimeout(1000);
    await expect(page.getByRole('gridcell', { name: EMAIL })).toBeVisible();
    await page.getByRole('button', { name: 'delete' }).click();
    await page.getByRole('button', { name: 'Okay' }).click();
    await expect(
      page
        .locator('.ant-notification-notice')
        .getByText('Signout is seccessfully'),
    ).toBeVisible();
    // check if the user is deleted
    //TODO: find a better way to check the test is failed. The below code is not working
    // expect(
    //   await loginAsCreatedAccount(page, EMAIL, PASSWORD),
    // ).toThrow();
    await logout(page);
    await page.getByLabel('Email or Username').fill(EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(NEW_PASSWORD);
    await page.getByRole('textbox', { name: 'Endpoint' }).fill(webuiEndpoint);
    await page.getByLabel('Login', { exact: true }).click();
    await expect(page).not.toHaveURL(/.*summary/);
  });
});
