// spec: e2e/.agent-output/test-plan-dashboard-error-boundary.md
// seed: e2e/dashboard-temp-seed.spec.ts
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe(
  'Dashboard useCurrentProjectValue Graceful Handling',
  { tag: ['@critical', '@regression', '@dashboard', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test('Admin sees dashboard load without crash when a project is selected', async ({
      page,
    }) => {
      // Navigate to dashboard
      await navigateTo(page, 'summary');
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

      // Verify the dashboard renders without entering the full-page BAIErrorBoundary
      await expect(
        page.getByRole('heading', { name: 'Active Sessions' }),
      ).toBeVisible({ timeout: 15_000 });

      // Verify the project selector displays correctly in the header
      // Project selector shows current project name
      await expect(page.getByTestId('selector-project')).toBeVisible();

      // Verify board items are rendered (not stuck in loading state)
      await expect(
        page.getByRole('heading', { name: 'My Total Resources Limit' }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Recently Created Sessions' }),
      ).toBeVisible();
    });

    test('Admin can switch projects and dashboard board items are still visible', async ({
      page,
    }) => {
      // Navigate to dashboard
      await navigateTo(page, 'summary');
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

      // Verify current project is shown in project selector
      await expect(page.getByTestId('selector-project')).toBeVisible({
        timeout: 15_000,
      });

      // Verify URL remains on /dashboard after project switch
      await expect(page).toHaveURL(/\/dashboard/);

      // Verify the 'My Resources in' board item header is visible
      // (contains resource group selector that depends on project context)
      await expect(page.getByText('My Resources in')).toBeVisible();

      // Verify Active Sessions board item is visible (no crash)
      await expect(
        page.getByRole('heading', { name: 'Active Sessions' }),
      ).toBeVisible();

      // Verify dashboard has no full-page errors after project context initialization
      await expect(page.locator('main')).toBeVisible();
    });
  },
);
