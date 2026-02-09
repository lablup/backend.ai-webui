/**
 * Mocked Dashboard Visual Regression Tests
 *
 * These tests render the dashboard page using Playwright network interception
 * to mock ALL Backend.AI REST and GraphQL endpoints. No real cluster is needed.
 *
 * Two role variants are tested:
 * - User: sees "My Sessions", My Resource, session table
 * - Superadmin: sees "Active Sessions", Agent Stats, Active Agents panels
 *
 * The mock data is deterministic, so screenshots should be pixel-stable
 * across runs (modulo font rendering and animation timing).
 */
import { mockLogin } from '../../mocks/mock-api';
import { navigateTo } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.describe(
  'Mocked Dashboard - User Role',
  { tag: ['@regression', '@visual', '@mocked'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await page.setViewportSize({ width: 1500, height: 1500 });
      await mockLogin(page, request, { role: 'user' });
      await navigateTo(page, 'dashboard');
      await expect(page.getByText('My Sessions')).toBeVisible({
        timeout: 15_000,
      });
    });

    test('dashboard full page - user', async ({ page }) => {
      // Wait for network to settle (dashboard refetches on 15s interval)
      await page.waitForLoadState('networkidle');
      // Additional wait for any CSS transitions / skeleton fade-out
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('mocked_dashboard_user.png', {
        fullPage: true,
        // Mask table cells that may contain dynamic content
        mask: [page.locator('td.ant-table-cell')],
        maxDiffPixelRatio: 0.07,
      });
    });
  },
);

test.describe(
  'Mocked Dashboard - Superadmin Role',
  { tag: ['@regression', '@visual', '@mocked'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      // Taller viewport for superadmin (more panels: Agent Stats, Active Agents)
      await page.setViewportSize({ width: 1500, height: 2000 });
      await mockLogin(page, request, { role: 'superadmin' });
      await navigateTo(page, 'dashboard');
      await expect(page.getByText('Active Sessions')).toBeVisible({
        timeout: 15_000,
      });
    });

    test('dashboard full page - superadmin', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('mocked_dashboard_superadmin.png', {
        fullPage: true,
        mask: [page.locator('td.ant-table-cell')],
        maxDiffPixelRatio: 0.07,
      });
    });
  },
);
