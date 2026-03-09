// spec: Statistics page tests
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect } from '@playwright/test';

test.describe('Statistics', { tag: ['@functional', '@statistics'] }, () => {
  test('Admin can see Statistics page with Allocation History tab', async ({
    page,
    request,
  }) => {
    await loginAsAdmin(page, request);
    await navigateTo(page, 'statistics');

    // Verify Allocation History tab is selected by default
    await expect(
      page.getByRole('tab', { name: 'Allocation History', selected: true }),
    ).toBeVisible();

    // Verify Period selector exists
    await expect(page.getByText(/Period/)).toBeVisible();

    // Verify chart sections exist
    await expect(page.getByText('Sessions').first()).toBeVisible();
    await expect(page.getByText('CPU').first()).toBeVisible();
    await expect(page.getByText('Memory').first()).toBeVisible();
  });

  test('Admin can switch to User Session History tab', async ({
    page,
    request,
  }) => {
    await loginAsAdmin(page, request);
    await navigateTo(page, 'statistics');

    // User Session History tab is conditional (requires user-metrics support)
    const userSessionTab = page.getByRole('tab', {
      name: 'User Session History',
    });
    const isTabVisible = await userSessionTab
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    test.skip(!isTabVisible, 'User Session History tab not available');

    await userSessionTab.click();
    await expect(
      page.getByRole('tab', {
        name: 'User Session History',
        selected: true,
      }),
    ).toBeVisible();
  });
});
