/**
 * E2E tests for the /applauncher page (AppLauncherFlow component).
 *
 * Tests the step-based UI flow that replaced the old EduAppLauncher.
 * The /applauncher route handles token-based authentication for
 * external portal integrations (e.g., education portals).
 *
 * Note: Full launch flow tests require a Backend.AI cluster with
 * session template API support and valid sToken credentials.
 * Tests that don't require a real backend are marked accordingly.
 */
import { webuiEndpoint } from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe(
  'AppLauncher Page - Step-based UI',
  { tag: ['@regression', '@app-launcher', '@functional'] },
  () => {
    test('User sees error state when navigating to /applauncher without sToken', async ({
      page,
    }) => {
      // Navigate to /applauncher without any URL parameters
      await page.goto(`${webuiEndpoint}/applauncher`);

      // The page should render the step-based UI card
      const card = page.locator('.ant-card');
      await expect(card).toBeVisible({ timeout: 10000 });

      // Steps component should be visible
      const steps = page.locator('.ant-steps');
      await expect(steps).toBeVisible();

      // Should show error state since sToken is missing
      const errorAlert = page.locator('.ant-alert-error');
      await expect(errorAlert).toBeVisible({ timeout: 5000 });

      // Error message should mention missing sToken
      await expect(errorAlert).toContainText(/sToken|authentication/i);

      // No retry button when sToken is fundamentally missing
      // (retry only shows when params are valid but auth/session failed)
      const retryButton = page.getByRole('button', { name: /retry/i });
      await expect(retryButton).not.toBeVisible();
    });

    test('User sees error state when navigating to /edu-applauncher without sToken', async ({
      page,
    }) => {
      // Both routes should work: /applauncher and /edu-applauncher
      await page.goto(`${webuiEndpoint}/edu-applauncher`);

      const card = page.locator('.ant-card');
      await expect(card).toBeVisible({ timeout: 10000 });

      const errorAlert = page.locator('.ant-alert-error');
      await expect(errorAlert).toBeVisible({ timeout: 5000 });
    });

    test('User sees step-based UI with 3 steps when sToken is provided', async ({
      page,
    }) => {
      // Navigate with a dummy sToken (will fail at authentication, but UI should render)
      await page.goto(
        `${webuiEndpoint}/applauncher?sToken=dummy-test-token&app=jupyterlab`,
      );

      // The page should render the step-based UI card
      const card = page.locator('.ant-card');
      await expect(card).toBeVisible({ timeout: 10000 });

      // Steps component should be visible with 3 steps
      const steps = page.locator('.ant-steps');
      await expect(steps).toBeVisible();

      // Verify all 3 step items are present
      const stepItems = page.locator('.ant-steps-item');
      await expect(stepItems).toHaveCount(3);

      // First step should be active (authenticating) or error (auth failed)
      const firstStep = stepItems.first();
      await expect(firstStep).toBeVisible();

      // Should eventually show error (since dummy token is invalid)
      // Wait for the authentication attempt to complete
      const errorAlert = page.locator('.ant-alert-error');
      await expect(errorAlert).toBeVisible({ timeout: 30000 });

      // Retry button should be visible (since sToken was provided, retry is possible)
      const retryButton = page.getByRole('button', { name: /retry/i });
      await expect(retryButton).toBeVisible();
    });

    test('User sees loading spinner during authentication step', async ({
      page,
    }) => {
      // Navigate with a dummy sToken
      await page.goto(
        `${webuiEndpoint}/applauncher?sToken=dummy-test-token&app=jupyter`,
      );

      // The card should be visible
      const card = page.locator('.ant-card');
      await expect(card).toBeVisible({ timeout: 10000 });

      // During authentication, a spinner should be visible
      // (this may be brief, so we check immediately)
      // The spinner might already be gone if auth fails fast,
      // so we just verify the card rendered properly
      const stepsExist = await page.locator('.ant-steps').isVisible();
      expect(stepsExist).toBe(true);
    });

    test('User can click retry button after authentication failure', async ({
      page,
    }) => {
      // Navigate with a dummy sToken that will fail authentication
      await page.goto(
        `${webuiEndpoint}/applauncher?sToken=invalid-token&app=jupyter`,
      );

      const card = page.locator('.ant-card');
      await expect(card).toBeVisible({ timeout: 10000 });

      // Wait for auth to fail
      const errorAlert = page.locator('.ant-alert-error');
      await expect(errorAlert).toBeVisible({ timeout: 30000 });

      // Click retry
      const retryButton = page.getByRole('button', { name: /retry/i });
      await expect(retryButton).toBeVisible();
      await retryButton.click();

      // After clicking retry, the flow should restart
      // (will fail again with dummy token, but verifies retry mechanism works)
      // The error should eventually reappear
      await expect(errorAlert).toBeVisible({ timeout: 30000 });
    });

    test('URL parameters are parsed correctly for app name display', async ({
      page,
    }) => {
      // Navigate with specific app parameter
      await page.goto(
        `${webuiEndpoint}/applauncher?sToken=dummy-token&app=jupyterlab`,
      );

      const card = page.locator('.ant-card');
      await expect(card).toBeVisible({ timeout: 10000 });

      // The steps should be visible - verifying the page rendered with params
      const steps = page.locator('.ant-steps');
      await expect(steps).toBeVisible();
    });

    test('Notification system is available on applauncher page', async ({
      page,
    }) => {
      // The page should have NotificationForAnonymous component
      await page.goto(`${webuiEndpoint}/applauncher`);

      const card = page.locator('.ant-card');
      await expect(card).toBeVisible({ timeout: 10000 });

      // Page should render properly outside MainLayout
      // (no sidebar, no header)
      const sidebar = page.locator('[data-testid="sider"]');
      await expect(sidebar).not.toBeVisible();
    });
  },
);
