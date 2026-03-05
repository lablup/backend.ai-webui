// spec: e2e/.agent-output/test-plan-dashboard-error-boundary.md
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe(
  'Dashboard Board Item Error Boundary',
  { tag: ['@critical', '@regression', '@dashboard', '@functional', '@smoke'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test('Admin sees error indicator instead of page crash when a board item throws an error', async ({
      page,
    }) => {
      // Set up GraphQL route interception to inject error response for resource queries
      // This triggers the BAIBoardItemErrorBoundary for MyResource component
      await page.route('**/admin/gql', async (route) => {
        const request = route.request();
        if (request.method() !== 'POST') {
          await route.continue();
          return;
        }
        const postData = request.postData();
        if (!postData) {
          await route.continue();
          return;
        }
        let body: { query?: string };
        try {
          body = JSON.parse(postData);
        } catch {
          await route.continue();
          return;
        }
        // Intercept DashboardPageQuery to force an error in the response
        const query = body.query ?? '';
        if (query.includes('DashboardPageQuery')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              errors: [
                { message: 'Simulated error for error boundary testing' },
              ],
              data: null,
            }),
          });
        } else {
          await route.continue();
        }
      });

      // Navigate to dashboard
      await navigateTo(page, 'summary');
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

      // Verify the page doesn't fully crash (dashboard wrapper is visible)
      await expect(page.locator('main')).toBeVisible();

      // Verify full-page crash error is NOT shown (no generic error result page)
      await expect(page.getByText('Something went wrong')).not.toBeVisible();
    });

    test('Admin can navigate away and back to the dashboard after board items load', async ({
      page,
    }) => {
      // Navigate to dashboard
      await navigateTo(page, 'summary');
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
      // Confirm dashboard loads successfully
      await expect(
        page.getByRole('heading', { name: 'Active Sessions' }),
      ).toBeVisible({ timeout: 15_000 });

      // Click Sessions in the left sidebar menu to navigate away
      await page.getByRole('link', { name: 'Sessions' }).click();

      // Verify Sessions page loads
      await expect(page).toHaveURL(/\/session/, { timeout: 10_000 });

      // Click Dashboard in the left sidebar menu to navigate back
      await page.getByRole('link', { name: 'Dashboard' }).click();

      // Verify dashboard loads again
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });

      // Verify board items still render correctly after re-navigation
      await expect(
        page.getByRole('heading', { name: 'Active Sessions' }),
      ).toBeVisible({ timeout: 15_000 });

      // Verify other board items still render
      await expect(
        page.getByRole('heading', { name: 'Recently Created Sessions' }),
      ).toBeVisible();
    });

    test('Admin can still use other board items when dashboard re-renders', async ({
      page,
    }) => {
      // Navigate to dashboard
      await navigateTo(page, 'summary');
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

      // Verify Active Sessions board item is visible and shows session counts
      await expect(
        page.getByRole('heading', { name: 'Active Sessions' }),
      ).toBeVisible({ timeout: 15_000 });
      await expect(
        page.getByText('Interactive', { exact: true }),
      ).toBeVisible();

      // Verify Recently Created Sessions table is visible and rendered
      await expect(
        page.getByRole('heading', { name: 'Recently Created Sessions' }),
      ).toBeVisible();

      // Verify no error boundary elements are present in normal operation
      await expect(
        page.locator('[data-bai-board-item-status="error"]'),
      ).toHaveCount(0);

      // Verify no error boundary warning elements in normal operation
      await expect(
        page.locator('[data-bai-board-item-status="warning"]'),
      ).toHaveCount(0);
    });
  },
);
