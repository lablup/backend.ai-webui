// spec: e2e/.agent-output/test-plan-start-dashboard.md
// scenarios: 10 (Agent Stats Widget), 11 (Recently Created Sessions Widget), and the
// admin dashboard entry. Split from e2e/project/dashboard/dashboard.spec.ts.
import { WIDGET_TIMEOUT, waitForGraphQL } from '../../utils/dashboard-util';
import {
  loginAsAdmin,
  navigateTo,
  webServerEndpoint,
} from '../../utils/test-util';
import { test, expect, request, type Page } from '@playwright/test';

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
          await recordFailedLogin();
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

    // -----------------------------------------------------------------------
    // Audit Log: Top Failure Causes Widget
    // -----------------------------------------------------------------------
    // The card reads adminAuditLogsV2 (manager 26.3.0).
    test.describe(
      'Audit Log Top Failure Causes Widget',
      { tag: ['@requires-manager-v26.3'] },
      () => {
        // Both tests toggle the same card on the shared admin board.
        test.describe.configure({ mode: 'serial' });
        const CARD_TITLE = 'Audit Log: Top Failure Causes';
        const CARD_KEY = 'topFailureCauses';
        // Whether a board write puts the card on the admin page's active board.
        const writeShowsCard = (value: unknown): boolean | undefined => {
          if (typeof value === 'string') {
            try {
              return writeShowsCard(JSON.parse(value));
            } catch {
              return undefined;
            }
          }
          if (!value || typeof value !== 'object') return undefined;
          const page = (value as any).dashboard?.admin;
          if (page && Array.isArray(page.boards)) {
            const board =
              page.boards.find((b: any) => b.id === page.active) ??
              page.boards[0];
            return (board?.panels ?? []).some((p: any) => p.key === CARD_KEY);
          }
          for (const child of Object.values(value)) {
            const shows = writeShowsCard(child);
            if (shows !== undefined) return shows;
          }
          return undefined;
        };
        // A stored board may hide the card, so each test shows it from the
        // edit sider (personal userConfig) and hides it again afterwards.
        let addedCard = false;
        const setCardShown = async (page: Page, shown: boolean) => {
          const dashboardBar = page.getByTestId('dashboard-filter-bar');
          await dashboardBar.getByRole('button', { name: 'Edit' }).click();
          const checkbox = page.getByRole('checkbox', {
            name: CARD_TITLE,
            exact: true,
          });
          await expect(checkbox).toBeVisible({ timeout: WIDGET_TIMEOUT });
          const wasShown = await checkbox.isChecked();
          // Wait for the board write so the afterEach restore is not lost.
          const saved =
            wasShown !== shown
              ? waitForGraphQL(
                  page,
                  'useAppConfigMyUpsertMutation',
                  (variables) => writeShowsCard(variables) === shown,
                  10_000,
                ).catch((error: Error) => {
                  if (error.name !== 'TimeoutError') throw error;
                })
              : undefined;
          try {
            if (wasShown !== shown) await checkbox.click();
            await dashboardBar.getByRole('button', { name: 'Close' }).click();
          } finally {
            await saved;
          }
          return wasShown;
        };
        const failureCausesWidget = (page: Page) =>
          page.locator('.uic-board-item').filter({
            has: page.getByRole('heading', { name: CARD_TITLE, exact: true }),
          });
        // A login with an unknown account is recorded as a failed `authorize`
        // ("Log in") entry, so the card always has a cause to show.
        const FAILED_LOGIN_REASON =
          'Credential/signature mismatch. (User credential mismatch.)';
        const recordFailedLogin = async () => {
          const api = await request.newContext({ baseURL: webServerEndpoint });
          try {
            const res = await api.post('/server/login', {
              data: {
                username: `e2e-no-such-user-${Date.now()}@lablup.com`,
                password: 'e2e-wrong-password',
              },
            });
            expect(res.status()).toBe(401);
          } finally {
            await api.dispose();
          }
        };
        const failedLoginRow = (page: Page) =>
          failureCausesWidget(page)
            .getByRole('row')
            .filter({ has: page.getByRole('button', { name: 'Log in' }) })
            .filter({ hasText: FAILED_LOGIN_REASON });

        test.beforeEach(async ({ page, request }) => {
          await recordFailedLogin();
          await loginAsAdmin(page, request);
          await navigateTo(page, 'admin/dashboard');
          addedCard = !(await setCardShown(page, true));
        });

        test.afterEach(async ({ page }) => {
          if (addedCard) await setCardShown(page, false);
        });

        test('Admin can view the Audit Log Top Failure Causes card on the superadmin dashboard', async ({
          page,
        }) => {
          // 1. Locate the card and its table
          const widget = failureCausesWidget(page);
          await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });
          const table = widget.getByRole('table');
          await expect(table).toBeVisible({ timeout: WIDGET_TIMEOUT });

          // 2. Verify the Action / Reason / Count / Share columns
          for (const column of ['Action', 'Reason', 'Count', 'Share']) {
            await expect(
              table.getByRole('columnheader', { name: column, exact: true }),
            ).toBeVisible();
          }

          // 3. Verify the failed login recorded before the test is listed
          await expect(failedLoginRow(page)).toBeVisible({
            timeout: WIDGET_TIMEOUT,
          });
        });

        test('Admin can open and close the failed entries of an action from the Top Failure Causes card', async ({
          page,
        }) => {
          // 1. Click the failed login cause and verify its failed entries modal
          const row = failedLoginRow(page);
          await expect(row).toBeVisible({ timeout: WIDGET_TIMEOUT });
          await row.getByRole('button', { name: 'Log in' }).click();
          const modal = page.getByRole('dialog', {
            name: 'Failed entries: Log in',
          });
          await expect(modal).toBeVisible();
          await expect(
            modal
              .getByRole('row')
              .filter({ hasText: FAILED_LOGIN_REASON })
              .first(),
          ).toBeVisible({ timeout: WIDGET_TIMEOUT });

          // 2. Close the modal and verify it disappears
          await modal.getByRole('button', { name: 'Close' }).click();
          await expect(modal).toBeHidden();
        });
      },
    );
  },
);
