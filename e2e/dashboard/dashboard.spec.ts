// spec: e2e/.agent-output/test-plan-start-dashboard.md
// scenarios: 6 (Widget Rendering), 7 (Session Count Widget), 8 (My Resources Widget),
//            9 (My Activity Widget, replaces My Resources in Resource Group),
//            10 (Agent Stats Widget), 11 (Recently Created Sessions Widget),
//            12 (Board Layout)
// plus: custom panel add flow (edit sider -> panel modal), added after the plan.
// The member dashboard reads only the viewer's own data (#10584); Agent Stats
// and Recently Created Sessions live on the superadmin dashboard.
import { loginAsAdmin, loginAsUser, navigateTo } from '../utils/test-util';
import { test, expect } from '@playwright/test';

// Timeout for widget visibility checks - widgets load after GraphQL data fetches,
// which may be slow when multiple workers run in parallel.
const WIDGET_TIMEOUT = 30_000;

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

        // 4. Verify the "Resource Presets" widget is visible
        await expect(
          page
            .locator('.uic-board-item')
            .filter({ hasText: 'Resource Presets' })
            .first(),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 5. Verify the "Agent Stats" widget is NOT present (admin only)
        await expect(
          page
            .locator('.uic-board-item')
            .filter({ hasText: 'Agent Statistics' })
            .first(),
        ).not.toBeVisible();

        // 6. Verify the "My Recent Sessions" table is visible
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
        // The fourth session type is "Upload Sessions" (not "System")
        await expect(widget.getByText('Upload Sessions')).toBeVisible();
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
          .getByRole('button', { name: 'Refresh' });
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
        await expect(widget.getByText(/CPU/i)).toBeVisible();

        // 3. Verify the Memory usage statistic is displayed
        await expect(widget.getByText(/Memory|RAM/i)).toBeVisible();
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
          .getByRole('button', { name: 'Refresh' });
        await refreshButton.click();

        // 3. Verify the widget still renders CPU/Memory after refresh
        await expect(widget.getByText(/CPU/i)).toBeVisible();
      });
    });

    // -----------------------------------------------------------------------
    // 9. My Activity Widget
    // -----------------------------------------------------------------------
    test.describe('My Activity Widget', () => {
      test.beforeEach(async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'summary');
      });

      test('Admin can toggle "Show failures only" on the My Activity widget', async ({
        page,
      }) => {
        // 1. Locate the "My Activity" widget
        const widget = page
          .locator('.uic-board-item')
          .filter({ hasText: 'My Activity' })
          .first();
        await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 2. The header switch is saved on the board, so turn it on and back off
        const failuresOnly = widget.getByRole('switch', {
          name: 'Show failures only',
        });
        await expect(failuresOnly).not.toBeChecked();
        await failuresOnly.click();
        await expect(failuresOnly).toBeChecked();
        await failuresOnly.click();
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
            .getByRole('button', { name: 'Refresh' });
          await refreshButton.click();

          // 3. Verify the widget still renders after refresh (no error state)
          await expect(widget).toBeVisible();
        });
      },
    );

    // -----------------------------------------------------------------------
    // 11. Recently Created Sessions Widget
    // -----------------------------------------------------------------------
    test.describe('Recently Created Sessions Widget', () => {
      test.beforeEach(async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'admin/dashboard');
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
          .getByRole('button', { name: 'Refresh' });
        await refreshButton.click();

        // 3. Verify the widget still renders after refresh
        await expect(widget.getByRole('table')).toBeVisible();
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

        // 2. The edit toggle lives in the breadcrumb bar and opens the sider that
        //    manages custom panels (it does NOT gate dragging).
        const breadcrumb = page.getByTestId('webui-breadcrumb');
        await breadcrumb.getByRole('button', { name: 'Edit' }).click();
        await expect(
          page.getByRole('button', { name: 'Add', exact: true }),
        ).toBeVisible();

        // 3. Closing it hides the sider again
        await breadcrumb.getByRole('button', { name: 'Close' }).click();
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
          .getByTestId('webui-breadcrumb')
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
          .getByRole('textbox', { name: 'Title (optional)' })
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
        await page
          .getByRole('button', { name: 'Confirm', exact: true })
          .click();
        await expect(
          page.locator('.uic-board-item').filter({ hasText: panelTitle }),
        ).toHaveCount(0);
      });
    });
  },
);
