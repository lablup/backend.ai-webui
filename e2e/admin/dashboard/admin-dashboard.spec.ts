// spec: e2e/.agent-output/test-plan-start-dashboard.md
// scenarios: 10 (Agent Stats Widget), 11 (Recently Created Sessions Widget), and the
// admin dashboard entry. Split from e2e/project/dashboard/dashboard.spec.ts.
import { WIDGET_TIMEOUT } from '../../utils/dashboard-util';
import { loginAsAdmin, navigateTo } from '../../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

test.describe(
  'Dashboard Page',
  { tag: ['@regression', '@dashboard', '@functional'] },
  () => {
    // -----------------------------------------------------------------------
    // 10. Agent Stats Widget (Admin Only)
    // -----------------------------------------------------------------------
    test.describe(
      'Agent Stats Widget',
      { tag: ['@requires-manager-v25.15'] },
      () => {
        test.beforeEach(async ({ page, request }) => {
          await loginAsAdmin(page, request);
          await navigateTo(page, 'admin/dashboard');
        });

        test('Admin can view cluster-level resource statistics in the Agent Stats widget', async ({
          page,
        }) => {
          // The widget ships with manager 25.15 (see the tag).
          const widget = page
            .locator('.uic-board-item')
            .filter({ hasText: 'Agent Statistics' });
          await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

          // 2. Verify a "Used" / "Free" segmented toggle is present.
          // `AgentStats.tsx` renders Astryx `SegmentedControl`
          // (`role="radiogroup"`, `label="Used/Free"`, composed from the two
          // option labels).
          const segmentedControl = widget.getByRole('radiogroup', {
            name: 'Used/Free',
          });
          await expect(segmentedControl).toBeVisible();

          // 3. Click the "Free" segment and verify it becomes selected
          await segmentedControl.getByRole('radio', { name: 'Free' }).click();
          await expect(
            segmentedControl.getByRole('radio', { name: 'Free' }),
          ).toBeChecked();

          // 4. Click the "Used" segment and verify it becomes selected
          await segmentedControl.getByRole('radio', { name: 'Used' }).click();
          await expect(
            segmentedControl.getByRole('radio', { name: 'Used' }),
          ).toBeChecked();
        });

        test('Admin can refresh the dashboard and the Agent Stats widget keeps rendering', async ({
          page,
        }) => {
          const widget = page
            .locator('.uic-board-item')
            .filter({ hasText: 'Agent Statistics' });
          await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

          // 2. Click the dashboard's refresh button (cards have none of their own)
          const refreshButton = page
            .getByTestId('dashboard-filter-bar')
            .getByRole('button', { name: 'Refresh', exact: true });
          await refreshButton.click();

          // 3. Verify the widget still renders after refresh (no error state)
          await expect(widget).toBeVisible();
        });
      },
    );

    // -----------------------------------------------------------------------
    // Admin Dashboard Entry (sidebar menu and legacy /admin-dashboard URL)
    // -----------------------------------------------------------------------
    test.describe(
      'Admin Dashboard Entry',
      { tag: ['@requires-manager-v25.15'] },
      () => {
        test.beforeEach(async ({ page }) => {
          // The superadmin intro tour (AdminViewSwitchTour) otherwise covers the page.
          await page.addInitScript(() => {
            for (const tour of [
              'back_to_user_view',
              'back_to_admin_settings',
            ]) {
              localStorage.setItem(
                `backendaiwebui.settings.user.has_opened_tour_${tour}`,
                'true',
              );
            }
          });
        });

        test('Admin can open the admin dashboard from the admin sidebar menu', async ({
          page,
          request,
        }) => {
          // 1. Login as admin and open another admin page
          await loginAsAdmin(page, request);
          await navigateTo(page, 'admin/users');

          // 2. Click the "Dashboard" entry in the admin side navigation
          const sideNav = page.getByRole('navigation', {
            name: 'Side navigation',
          });
          await sideNav
            .getByRole('link', { name: 'Dashboard', exact: true })
            .click();

          // 3. Verify the URL and the superadmin board
          await expect(page).toHaveURL(/\/admin\/dashboard\/?$/);
          await expect(page.getByTestId('dashboard-filter-bar')).toBeVisible({
            timeout: WIDGET_TIMEOUT,
          });
          await expect(
            page
              .locator('.uic-board-item')
              .filter({ hasText: 'Agent Statistics' }),
          ).toBeVisible({ timeout: WIDGET_TIMEOUT });
        });

        test('Admin is redirected from the legacy admin dashboard URL to the admin dashboard', async ({
          page,
          request,
        }) => {
          // 1. Login as admin and open the legacy /admin-dashboard URL
          await loginAsAdmin(page, request);
          await navigateTo(page, 'admin-dashboard');

          // 2. Verify the redirect and the superadmin board
          await expect(page).toHaveURL(/\/admin\/dashboard\/?$/, {
            timeout: WIDGET_TIMEOUT,
          });
          await expect(
            page
              .locator('.uic-board-item')
              .filter({ hasText: 'Agent Statistics' }),
          ).toBeVisible({ timeout: WIDGET_TIMEOUT });
        });
      },
    );

    // -----------------------------------------------------------------------
    // 11. Recently Created Sessions Widget
    // -----------------------------------------------------------------------
    test.describe('Recently Created Sessions Widget', () => {
      // The card is hidden on a new superadmin board, so each test shows it
      // from the edit sider and hides it again when it was not there before.
      let addedCard = false;
      const setCardShown = async (page: Page, shown: boolean) => {
        const dashboardBar = page.getByTestId('dashboard-filter-bar');
        await dashboardBar.getByRole('button', { name: 'Edit' }).click();
        const checkbox = page.getByRole('checkbox', {
          name: 'Recently Created Sessions',
          exact: true,
        });
        await expect(checkbox).toBeVisible({ timeout: WIDGET_TIMEOUT });
        const wasShown = await checkbox.isChecked();
        if (wasShown !== shown) await checkbox.click();
        await dashboardBar.getByRole('button', { name: 'Close' }).click();
        return wasShown;
      };

      test.beforeEach(async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'admin/dashboard');
        addedCard = !(await setCardShown(page, true));
      });

      test.afterEach(async ({ page }) => {
        if (addedCard) await setCardShown(page, false);
      });

      test('Admin can view the recently created sessions list on the superadmin dashboard', async ({
        page,
      }) => {
        // 1. Locate the "Recently Created Sessions" widget
        const widget = page
          .locator('.uic-board-item')
          .filter({ hasText: 'Recently Created Sessions' });
        await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 2. Verify the sessions table container is displayed
        await expect(widget.getByRole('table')).toBeVisible();
      });

      test('Admin can refresh the dashboard and the Recently Created Sessions widget keeps rendering', async ({
        page,
      }) => {
        // 1. Locate the "Recently Created Sessions" widget
        const widget = page
          .locator('.uic-board-item')
          .filter({ hasText: 'Recently Created Sessions' });
        await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 2. Click the dashboard's refresh button (cards have none of their own)
        const refreshButton = page
          .getByTestId('dashboard-filter-bar')
          .getByRole('button', { name: 'Refresh', exact: true });
        await refreshButton.click();

        // 3. Verify the widget still renders after refresh
        await expect(widget.getByRole('table')).toBeVisible();
      });
    });
  },
);
