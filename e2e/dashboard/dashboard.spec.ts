// spec: e2e/.agent-output/test-plan-start-dashboard.md
// scenarios: 6 (Widget Rendering), 7 (Session Count Widget), 8 (My Resources Widget),
//            9 (My Activity Widget, replaces My Resources in Resource Group),
//            10 (Agent Stats Widget), 11 (Recently Created Sessions Widget),
//            12 (Board Layout)
// plus: custom panel add flow (edit sider -> panel modal) and the project admin
// dashboard cards (#10585), added after the plan.
// The member dashboard reads only the viewer's own data (#10584); Agent Stats
// and Recently Created Sessions live on the superadmin dashboard.
import { loginAsAdmin, loginAsUser, navigateTo } from '../utils/test-util';
import { test, expect, type Locator, type Page } from '@playwright/test';

// Timeout for widget visibility checks - widgets load after GraphQL data fetches,
// which may be slow when multiple workers run in parallel.
const WIDGET_TIMEOUT = 30_000;

// Resolves with the first successful GraphQL response of `operation` whose
// variables pass `matches`; rejects on a GraphQL error.
const waitForGraphQL = async (
  page: Page,
  operation: string,
  matches: (variables: any) => boolean = () => true,
  timeout = WIDGET_TIMEOUT,
) => {
  const response = await page.waitForResponse(
    (res) => {
      if (res.request().method() !== 'POST') return false;
      let body: { query?: string; variables?: unknown } | null = null;
      try {
        body = res.request().postDataJSON();
      } catch {
        return false;
      }
      return (
        !!body?.query?.match(
          new RegExp(`(query|mutation)\\s+${operation}\\b`),
        ) && matches(body.variables)
      );
    },
    { timeout },
  );
  expect(response.ok()).toBe(true);
  const json = await response.json();
  expect(json.errors ?? []).toEqual([]);
};

// Clicks a board-saved "Show failures only" switch to `checked` and waits
// until the board write lands. Other board writes share the mutation, so match
// the filter payload; a board that already holds the value (a concurrent run
// on the shared account) sends no write.
const setFailuresOnly = async (
  page: Page,
  toggle: Locator,
  checked: boolean,
) => {
  if ((await toggle.isChecked()) === checked) return;
  const saved = waitForGraphQL(
    page,
    'useAppConfigMyUpsertMutation',
    (variables) => JSON.stringify(variables).includes('DENIED') === checked,
    10_000,
  ).catch((error: Error) => {
    if (error.name !== 'TimeoutError') throw error;
  });
  await toggle.click();
  await expect(toggle).toBeChecked({ checked });
  await saved;
};

test.describe(
  'Dashboard Page',
  { tag: ['@regression', '@dashboard', '@functional'] },
  () => {
    // -----------------------------------------------------------------------
    // 6. Widget Rendering
    // -----------------------------------------------------------------------
    test.describe('Widget Rendering', () => {
      test(
        'Admin can see all expected dashboard widgets',
        { tag: ['@smoke', '@smoke-admin'] },
        async ({ page, request }) => {
          // 1. Login as admin and navigate to /summary
          await loginAsAdmin(page, request);
          await navigateTo(page, 'summary');

          // 2. Verify the "My Sessions" widget is visible (own sessions, for every role)
          await expect(
            page
              .locator('.uic-board-item')
              .filter({ hasText: 'My Sessions' })
              .first(),
          ).toBeVisible({ timeout: WIDGET_TIMEOUT });

          // 3. Verify the "My Resources" widget is visible with CPU and Memory statistics
          await expect(
            page
              .locator('.uic-board-item')
              .filter({ hasText: 'My Total Resource Usage' })
              .first(),
          ).toBeVisible({ timeout: WIDGET_TIMEOUT });

          // 4. Verify the "My Recent Sessions" widget is visible
          await expect(
            page
              .locator('.uic-board-item')
              .filter({ hasText: 'My Recent Sessions' })
              .first(),
          ).toBeVisible({ timeout: WIDGET_TIMEOUT });
        },
      );

      test('Regular user sees "My Sessions" title instead of "Active Sessions" on the session count widget', async ({
        page,
        request,
      }) => {
        // 1. Login as regular user and navigate to /summary
        await loginAsUser(page, request);
        await navigateTo(page, 'summary');

        // 2. Verify the widget title reads "My Sessions" (not "Active Sessions")
        await expect(
          page
            .locator('.uic-board-item')
            .filter({ hasText: 'My Sessions' })
            .first(),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });
        await expect(
          page
            .locator('.uic-board-item')
            .filter({ hasText: 'Active Sessions' })
            .first(),
        ).not.toBeVisible();
      });

      test('Regular user sees dashboard without admin-only widgets', async ({
        page,
        request,
      }) => {
        // 1. Login as regular user and navigate to /summary
        await loginAsUser(page, request);
        await navigateTo(page, 'summary');

        // 2. Verify the "My Sessions" widget is visible
        await expect(
          page
            .locator('.uic-board-item')
            .filter({ hasText: 'My Sessions' })
            .first(),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 3. Verify the "My Resources" widget is visible
        await expect(
          page
            .locator('.uic-board-item')
            .filter({ hasText: 'My Total Resource Usage' })
            .first(),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 4. Verify the "Agent Stats" widget is NOT present (admin only)
        await expect(
          page
            .locator('.uic-board-item')
            .filter({ hasText: 'Agent Statistics' })
            .first(),
        ).not.toBeVisible();

        // 5. Verify the "My Recent Sessions" table is visible
        await expect(
          page
            .locator('.uic-board-item')
            .filter({ hasText: 'My Recent Sessions' })
            .first(),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });
      });
    });

    // -----------------------------------------------------------------------
    // 7. Session Count Widget
    // -----------------------------------------------------------------------
    test.describe('Session Count Widget', () => {
      test.beforeEach(async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'summary');
      });

      test('Admin can see session type breakdown in the session count widget', async ({
        page,
      }) => {
        // 1. Locate the "My Sessions" widget
        const widget = page
          .locator('.uic-board-item')
          .filter({ hasText: 'My Sessions' })
          .first();
        await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 2. Verify the donut legend lists the four session types
        await expect(widget.getByText('Interactive')).toBeVisible();
        await expect(widget.getByText('Batch')).toBeVisible();
        await expect(widget.getByText('Inference')).toBeVisible();
        // The fourth session type (SYSTEM) is labelled "Upload"
        await expect(widget.getByText('Upload', { exact: true })).toBeVisible();
      });

      test('Admin can refresh the dashboard and the session count widget keeps rendering', async ({
        page,
      }) => {
        // 1. Locate the "My Sessions" widget
        const widget = page
          .locator('.uic-board-item')
          .filter({ hasText: 'My Sessions' })
          .first();
        await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 2. Click the dashboard's refresh button (cards have none of their own)
        const refreshButton = page
          .getByTestId('dashboard-filter-bar')
          .getByRole('button', { name: 'Refresh', exact: true });
        await refreshButton.click();

        // 3. Verify the widget data remains visible after refresh
        await expect(widget.getByText('Interactive')).toBeVisible();
        await expect(widget.getByText('Batch')).toBeVisible();
      });
    });

    // -----------------------------------------------------------------------
    // 8. My Resources Widget
    // -----------------------------------------------------------------------
    test.describe('My Resources Widget', () => {
      test.beforeEach(async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'summary');
      });

      test('Admin can view CPU and Memory usage in the My Resources widget', async ({
        page,
      }) => {
        // 1. Locate the "My Resources" widget
        const widget = page
          .locator('.uic-board-item')
          .filter({ hasText: 'My Total Resource Usage' })
          .first();
        await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 2. Verify the CPU usage statistic is displayed
        await expect(widget.getByText(/CPU/i).first()).toBeVisible();

        // 3. Verify the Memory usage statistic is displayed
        await expect(widget.getByText(/Memory|RAM/i).first()).toBeVisible();
      });

      test('Admin can refresh the dashboard and the My Resources widget keeps rendering', async ({
        page,
      }) => {
        // 1. Locate the "My Resources" widget
        const widget = page
          .locator('.uic-board-item')
          .filter({ hasText: 'My Total Resource Usage' })
          .first();
        await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 2. Click the dashboard's refresh button (cards have none of their own)
        const refreshButton = page
          .getByTestId('dashboard-filter-bar')
          .getByRole('button', { name: 'Refresh', exact: true });
        await refreshButton.click();

        // 3. Verify the widget still renders CPU/Memory after refresh
        await expect(widget.getByText(/CPU/i).first()).toBeVisible();
      });
    });

    // -----------------------------------------------------------------------
    // 9. My Activity Widget
    // -----------------------------------------------------------------------
    test.describe('My Activity Widget', () => {
      // The switch is saved on the shared admin account's board.
      const myActivityWidget = (page: Page) =>
        page
          .locator('.uic-board-item')
          .filter({ hasText: 'My Activity' })
          .first();
      const failuresOnlySwitch = (page: Page) =>
        myActivityWidget(page).getByRole('switch', {
          name: 'Show failures only',
        });

      test.beforeEach(async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'summary');
      });

      test.afterEach(async ({ page }) => {
        const toggle = failuresOnlySwitch(page);
        if (await toggle.isVisible().catch(() => false)) {
          await setFailuresOnly(page, toggle, false);
        }
      });

      test('Admin can toggle "Show failures only" on the My Activity widget', async ({
        page,
      }) => {
        // 1. Locate the "My Activity" widget, starting from the switch off
        const widget = myActivityWidget(page);
        await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });
        const failuresOnly = failuresOnlySwitch(page);
        await setFailuresOnly(page, failuresOnly, false);
        await expect(failuresOnly).not.toBeChecked();

        // 2. The header switch is saved on the board, so turn it on and back off
        await setFailuresOnly(page, failuresOnly, true);
        await expect(failuresOnly).toBeChecked();
        await setFailuresOnly(page, failuresOnly, false);
        await expect(failuresOnly).not.toBeChecked();
      });
    });

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

    // -----------------------------------------------------------------------
    // 13. Project Admin Dashboard (/project/:name/admin/dashboard)
    // -----------------------------------------------------------------------
    test.describe('Project Admin Dashboard', () => {
      const adminDashboardUrl = (name: string) =>
        new RegExp(
          `/project/${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/admin/dashboard`,
        );
      let projectName = '';
      let selectedProject = '';

      test.beforeEach(async ({ page, request }) => {
        // The superadmin intro tour (AdminViewSwitchTour) otherwise covers
        // the admin page.
        await page.addInitScript(() => {
          localStorage.setItem(
            'backendaiwebui.settings.user.has_opened_tour_back_to_user_view',
            'true',
          );
          localStorage.setItem(
            'backendaiwebui.settings.user.has_opened_tour_back_to_admin_settings',
            'true',
          );
        });
        await loginAsAdmin(page, request);
        // /summary replace-redirects to /project/:name/dashboard.
        await navigateTo(page, 'summary');
        await expect(page).toHaveURL(/\/project\/[^/]+\/dashboard/, {
          timeout: WIDGET_TIMEOUT,
        });
        projectName =
          new URL(page.url()).pathname.match(/^\/project\/([^/]+)\//)?.[1] ??
          '';
        expect(projectName).not.toBe('');
        const projectSelector = page.getByRole('button', {
          name: 'Select Project',
        });
        await expect(projectSelector).not.toHaveText('');
        selectedProject = (await projectSelector.innerText()).trim();
        await navigateTo(page, `project/${projectName}/admin/dashboard`);
        await expect(page).toHaveURL(adminDashboardUrl(projectName));
      });

      test('Admin can view the project admin dashboard cards', async ({
        page,
      }) => {
        // 1. Every default card of the project admin board is shown
        for (const title of [
          'Session Status',
          'Pending Sessions and Reasons',
          'Resource Allocation',
          'Deployments',
          'Project Folders',
          'Project Users',
          'Audit Log',
        ]) {
          await expect(
            page.getByRole('heading', { name: title, exact: true }),
          ).toBeVisible({ timeout: WIDGET_TIMEOUT });
        }

        // 2. The header project selector stays on the URL's project
        await expect(page).toHaveURL(adminDashboardUrl(projectName));
        await expect(
          page.getByRole('button', { name: 'Select Project' }),
        ).toHaveText(selectedProject);
      });

      test.describe('Audit Log failures only', () => {
        // The switch is saved on the shared admin account's board.
        const auditLogCard = (page: Page) =>
          page
            .locator('.uic-board-item')
            .filter({
              has: page.getByRole('heading', {
                name: 'Audit Log',
                exact: true,
              }),
            })
            .first();
        const failuresOnlySwitch = (page: Page) =>
          auditLogCard(page).getByRole('switch', {
            name: 'Show failures only',
          });
        test.afterEach(async ({ page }) => {
          const toggle = failuresOnlySwitch(page);
          if (await toggle.isVisible().catch(() => false)) {
            await setFailuresOnly(page, toggle, false);
          }
        });

        test('Admin can toggle "Show failures only" on the project admin Audit Log card', async ({
          page,
        }) => {
          // 1. Locate the "Audit Log" card, starting from the switch off
          const widget = auditLogCard(page);
          await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });
          const failuresOnly = failuresOnlySwitch(page);
          await setFailuresOnly(page, failuresOnly, false);

          // 2. Turning the switch on reloads the list with the failure statuses
          const filteredList = waitForGraphQL(
            page,
            'AuditLogPanelScopedListQuery',
            (variables) =>
              JSON.stringify(variables?.filter?.status ?? null).includes(
                'DENIED',
              ),
          );
          await setFailuresOnly(page, failuresOnly, true);
          await filteredList;
          await expect(
            widget.getByRole('group', { name: 'Table' }).getByRole('table'),
          ).toBeVisible({ timeout: WIDGET_TIMEOUT });

          // 3. Turning it off again saves the board without the filter
          await setFailuresOnly(page, failuresOnly, false);
          await expect(failuresOnly).not.toBeChecked();
        });
      });
    });

    // -----------------------------------------------------------------------
    // 12. Board Layout (always rearrangeable; the edit sider manages panels)
    // -----------------------------------------------------------------------
    test.describe('Board Layout', () => {
      test('Admin sees drag and resize handles on the dashboard board', async ({
        page,
        request,
      }) => {
        // 1. Login as admin and navigate to /summary
        await loginAsAdmin(page, request);
        await navigateTo(page, 'summary');

        // 2. Wait for the dashboard to load by checking for a known widget heading
        await expect(
          page.getByRole('heading', { name: 'My Sessions' }),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 3. Verify board container exists with multiple widgets
        const boardItems = page.locator('.uic-board-item');
        await expect(boardItems.first()).toBeVisible();
        const count = await boardItems.count();
        expect(count).toBeGreaterThanOrEqual(3);

        // 4. Panels are rearrangeable at all times — no mode to enter first
        await expect(
          page.locator('.uic-board-item__drag-handle').first(),
        ).toBeVisible();
        await expect(
          page.locator('.uic-board-item__resize-handle').first(),
        ).toBeVisible();
      });

      test('Admin can open and close the dashboard edit sider', async ({
        page,
        request,
      }) => {
        // 1. Login as admin and navigate to /summary
        await loginAsAdmin(page, request);
        await navigateTo(page, 'summary');
        await expect(
          page.getByRole('heading', { name: 'My Sessions' }),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 2. The edit toggle sits in the dashboard bar beside the refresh
        //    control and opens the sider (it does NOT gate dragging).
        const dashboardBar = page.getByTestId('dashboard-filter-bar');
        await dashboardBar.getByRole('button', { name: 'Edit' }).click();
        await expect(
          page.getByRole('button', { name: 'Add', exact: true }),
        ).toBeVisible();

        // 3. Closing it hides the sider again
        await dashboardBar.getByRole('button', { name: 'Close' }).click();
        await expect(
          page.getByRole('button', { name: 'Add', exact: true }),
        ).not.toBeVisible();
      });

      test('Admin can add a custom table panel from the dashboard edit sider', async ({
        page,
        request,
      }) => {
        // 1. Login as admin, open the dashboard, and enter edit mode
        await loginAsAdmin(page, request);
        await navigateTo(page, 'summary');
        await expect(
          page.getByRole('heading', { name: 'My Sessions' }),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });
        await page
          .getByTestId('dashboard-filter-bar')
          .getByRole('button', { name: 'Edit' })
          .click();

        // 2. The edit sider opens beside the board; its "Add" button opens the
        //    panel modal (a native <dialog> via BAIModal)
        await page.getByRole('button', { name: 'Add', exact: true }).click();
        const modal = page.getByRole('dialog').filter({ hasText: 'Add panel' });
        await expect(modal).toBeVisible();

        // 3. Pick the "Sessions" data source (project-scoped, available to every
        //    role). The Selector for the `resourceType` field is
        //    labelled `t('dashboard.panelModal.DataSource')` = "Data source"
        //    (`DashboardPanelModal.tsx`); the other combobox in the dialog is
        //    the condition property filter ("Search filters").
        await modal.getByRole('combobox', { name: 'Data source' }).click();
        await page
          .getByRole('option', { name: 'Sessions', exact: true })
          .click();

        // 4. Title the panel with a unique name — the title is how the panel's
        //    condition is expressed on the board.
        const panelTitle = `e2e-panel-${Date.now()}`;
        await modal
          .getByRole('textbox', { name: 'Title', exact: true })
          .fill(panelTitle);

        // 5. Confirm — the modal's OK button is labelled "Add" in create mode
        await modal.getByRole('button', { name: 'Add', exact: true }).click();
        await expect(modal).toBeHidden();

        // 6. The new panel appears as a board item titled with the panel title.
        await expect(
          page.locator('.uic-board-item').filter({ hasText: panelTitle }),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 7. Clean up: the board is saved in the account's app config, so the
        //    panel would otherwise follow the admin account into later runs.
        await page
          .getByText(panelTitle, { exact: true })
          // The board item renders the title first; the sider row comes last.
          .last()
          .locator('xpath=ancestor::*[.//button[@aria-label="Delete"]][1]')
          .getByRole('button', { name: 'Delete' })
          .click();
        // The board hides the panel before the debounced write: wait for the
        // upsert that no longer carries it, so the context does not close first.
        const deletePersisted = page.waitForResponse(
          (response) => {
            const body = response.request().postData() ?? '';
            return (
              body.includes('useAppConfigMyUpsertMutation') &&
              !body.includes(panelTitle) &&
              response.ok()
            );
          },
          { timeout: WIDGET_TIMEOUT },
        );
        await page
          .getByRole('button', { name: 'Confirm', exact: true })
          .click();
        await expect(
          page.locator('.uic-board-item').filter({ hasText: panelTitle }),
        ).toHaveCount(0);
        await deletePersisted;
      });
    });
  },
);
