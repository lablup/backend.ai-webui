// spec: e2e/.agent-output/test-plan-dashboard-error-boundary.md
// seed: e2e/dashboard-temp-seed.spec.ts
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe(
  'Dashboard Board Items Visibility',
  { tag: ['@critical', '@regression', '@dashboard', '@functional', '@smoke'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'summary');
      // Wait for redirect from /summary to /dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    });

    test('Admin can see all expected board items on the dashboard', async ({
      page,
    }) => {
      // Verify Active Sessions heading is visible
      await expect(
        page.getByRole('heading', { name: 'Active Sessions' }),
      ).toBeVisible({ timeout: 15_000 });

      // Verify My Total Resources Limit heading is visible
      await expect(
        page.getByRole('heading', { name: 'My Total Resources Limit' }),
      ).toBeVisible();

      // Verify My Resources in heading is visible (contains resource group selector)
      await expect(page.getByText('My Resources in')).toBeVisible();

      // Verify Recently Created Sessions heading is visible
      await expect(
        page.getByRole('heading', { name: 'Recently Created Sessions' }),
      ).toBeVisible();
    });

    test('Admin can see superadmin-only board items on the dashboard', async ({
      page,
    }) => {
      // Wait for page to fully load
      await expect(
        page.getByRole('heading', { name: 'Active Sessions' }),
      ).toBeVisible({ timeout: 15_000 });

      // Verify Agent Statistics text is visible
      await expect(page.getByText('Agent Statistics')).toBeVisible();

      // Verify Active Agents heading is visible
      await expect(
        page.getByRole('heading', { name: 'Active Agents' }),
      ).toBeVisible();

      // Verify Total Resources in text is visible
      await expect(page.getByText('Total Resources in')).toBeVisible();
    });

    test('Admin can see session count data in the Active Sessions board item', async ({
      page,
    }) => {
      // Wait for Active Sessions heading to be visible
      await expect(
        page.getByRole('heading', { name: 'Active Sessions' }),
      ).toBeVisible({ timeout: 15_000 });

      // Verify Interactive label is visible within session count board item
      await expect(
        page.getByText('Interactive', { exact: true }),
      ).toBeVisible();

      // Verify Batch label is visible
      await expect(page.getByText('Batch', { exact: true })).toBeVisible();

      // Verify Inference label is visible
      await expect(page.getByText('Inference')).toBeVisible();

      // Verify Upload Sessions label is visible
      await expect(page.getByText('Upload Sessions')).toBeVisible();

      // Verify reload button is present next to the heading
      await expect(
        page.getByRole('button', { name: 'reload' }).first(),
      ).toBeVisible();
    });

    test('Admin can manually reload a board item using the reload button', async ({
      page,
    }) => {
      // Wait for Active Sessions heading to be visible
      await expect(
        page.getByRole('heading', { name: 'Active Sessions' }),
      ).toBeVisible({ timeout: 15_000 });

      // Click the first reload button (Active Sessions board item's reload button)
      await page.getByRole('button', { name: 'reload' }).first().click();

      // Verify Active Sessions data is still visible after reload (no crash, no empty state)
      await expect(
        page.getByRole('heading', { name: 'Active Sessions' }),
      ).toBeVisible();

      // Verify session count labels are still visible after reload
      await expect(
        page.getByText('Interactive', { exact: true }),
      ).toBeVisible();
    });
  },
);
