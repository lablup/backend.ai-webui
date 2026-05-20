// spec: e2e/.agent-output/test-plan-admin-model-card.md
// section: 9. Access Control
import { loginAsUser, webuiEndpoint } from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe(
  'Admin Model Card Management - Access Control',
  { tag: ['@admin-model-card', '@admin', '@functional'] },
  () => {
    // 9.1 Non-superadmin user cannot access the Admin Model Store page
    test('Non-superadmin user cannot access the Admin Model Store page', async ({
      page,
      request,
    }) => {
      // Login as a regular user
      await loginAsUser(page, request);

      // Attempt to navigate directly to /admin-deployments?tab=model-store-management
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );

      // Verify the page does NOT show the Admin Model Card management table
      // The page should either redirect or show an access denied state
      await expect(
        page.getByRole('button', { name: 'Create Model Card' }),
      ).toBeHidden({ timeout: 5000 });
    });

    // 9.2 The Admin Model Store menu item is not visible to non-superadmin users
    test('Non-superadmin user does not see the Admin Model Store menu item in the sidebar', async ({
      page,
      request,
    }) => {
      // Login as a regular user
      await loginAsUser(page, request);

      // Wait for the sidebar to appear
      await page.waitForSelector('[data-testid="user-dropdown-button"]');

      // Verify no admin model store link appears in the navigation
      await expect(
        page.getByRole('link', { name: 'Model Cards' }),
      ).toBeHidden();

      await expect(
        page.getByRole('link', { name: 'Model Store Management' }),
      ).toBeHidden();
    });
  },
);
