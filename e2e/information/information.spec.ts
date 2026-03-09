// spec: Information page tests
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect } from '@playwright/test';

test.describe('Information', { tag: ['@functional', '@information'] }, () => {
  test('Admin can see Information page with server details', async ({
    page,
    request,
  }) => {
    await loginAsAdmin(page, request);
    await navigateTo(page, 'information');

    // Verify page title in breadcrumb
    await expect(page.getByText('Information').first()).toBeVisible();

    // Verify Core section
    await expect(page.getByText('Core')).toBeVisible();
    await expect(page.getByText('Manager version')).toBeVisible();
    await expect(page.getByText('API version')).toBeVisible();

    // Verify Security section
    await expect(page.getByText('Security', { exact: true })).toBeVisible();

    // Verify Component section
    await expect(page.getByText('Component')).toBeVisible();
    await expect(
      page.getByText('Docker version', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText('PostgreSQL version', { exact: true }),
    ).toBeVisible();

    // Verify License section
    await expect(page.getByText('License', { exact: true })).toBeVisible();
    await expect(page.getByText('License Type', { exact: true })).toBeVisible();
  });
});
