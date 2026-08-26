// spec: e2e/.agent-output/test-plan-start-dashboard.md
// scenarios: 6 (Widget Rendering), 7 (Session Count Widget), 8 (My Resources Widget),
//            9 (My Resources in Resource Group Widget), 10 (Agent Stats Widget),
//            11 (Recently Created Sessions Widget), 12 (Board Layout)
// plus: custom panel add flow (edit sider -> panel modal), added after the plan
import { skipUnlessClientFeature } from '../utils/feature-gate-util';
import { loginAsAdmin, loginAsUser, navigateTo } from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

// Timeout for widget visibility checks - widgets load after GraphQL data fetches,
// which may be slow when multiple workers run in parallel.
const WIDGET_TIMEOUT = 30_000;

// Custom dashboard panels are an experimental opt-in. The user-settings atom
// reads localStorage at app boot, so write the flag and reload rather than
// toggling it through the settings UI.
const enableCustomDashboardPanels = async (page: Page) => {
  await page.evaluate(() => {
    localStorage.setItem(
      'backendaiwebui.settings.user.experimental_custom_dashboard_panels',
      'true',
    );
  });
  await page.reload();
  await page.waitForSelector('[data-testid="user-dropdown-button"]');
};

test.describe(
  'Dashboard Page',
  { tag: ['@regression', '@dashboard', '@functional'] },
  () => {
    // -----------------------------------------------------------------------
    // 6. Widget Rendering
    // -----------------------------------------------------------------------
    test.describe('Widget Rendering', () => {
      test('Admin can see all expected dashboard widgets', async ({
        page,
        request,
      }) => {
        // 1. Login as admin and navigate to /summary
        await loginAsAdmin(page, request);
        await navigateTo(page, 'summary');

        // 2. Verify the "Active Sessions" widget is visible (superadmin sees "Active Sessions")
        await expect(
          page
            .locator('.bai_grid_item')
            .filter({ hasText: 'Active Sessions' })
            .first(),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 3. Verify the "My Resources" widget is visible with CPU and Memory statistics
        await expect(
          page
            .locator('.bai_grid_item')
            .filter({ hasText: 'My Total Resource Usage' })
            .first(),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 4. Verify the "My Resources in Resource Group" widget is visible
        // The widget title is "My Resources in" followed by a resource group selector
        await expect(
          page
            .locator('.bai_grid_item')
            .filter({ hasText: 'My Resources in' })
            .first(),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 5. Verify the "Recently Created Sessions" widget is visible
        await expect(
          page
            .locator('.bai_grid_item')
            .filter({ hasText: 'Recently Created Sessions' })
            .first(),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });
      });

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
            .locator('.bai_grid_item')
            .filter({ hasText: 'My Sessions' })
            .first(),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });
        await expect(
          page
            .locator('.bai_grid_item')
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
            .locator('.bai_grid_item')
            .filter({ hasText: 'My Sessions' })
            .first(),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 3. Verify the "My Resources" widget is visible
        await expect(
          page
            .locator('.bai_grid_item')
            .filter({ hasText: 'My Total Resource Usage' })
            .first(),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 4. Verify the "My Resources in Resource Group" widget is visible
        // The widget title is "My Resources in" followed by a resource group selector
        await expect(
          page
            .locator('.bai_grid_item')
            .filter({ hasText: 'My Resources in' })
            .first(),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 5. Verify the "Agent Stats" widget is NOT present (admin only)
        await expect(
          page
            .locator('.bai_grid_item')
            .filter({ hasText: 'Agent Statistics' })
            .first(),
        ).not.toBeVisible();

        // 6. Verify the "Recently Created Sessions" table is visible
        await expect(
          page
            .locator('.bai_grid_item')
            .filter({ hasText: 'Recently Created Sessions' })
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
        // 1. Locate the "Active Sessions" widget
        const widget = page
          .locator('.bai_grid_item')
          .filter({ hasText: 'Active Sessions' })
          .first();
        await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 2. Verify four session type statistics are displayed
        await expect(widget.getByText('Interactive')).toBeVisible();
        await expect(widget.getByText('Batch')).toBeVisible();
        await expect(widget.getByText('Inference')).toBeVisible();
        // The fourth session type is "Upload Sessions" (not "System")
        await expect(widget.getByText('Upload Sessions')).toBeVisible();
      });

      test('Admin can manually refresh the session count widget', async ({
        page,
      }) => {
        // 1. Locate the "Active Sessions" widget
        const widget = page
          .locator('.bai_grid_item')
          .filter({ hasText: 'Active Sessions' })
          .first();
        await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 2. Click the refresh (BAIFetchKeyButton) in the widget's header area
        const refreshButton = widget.getByRole('button', { name: 'Refresh' });
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
          .locator('.bai_grid_item')
          .filter({ hasText: 'My Total Resource Usage' })
          .first();
        await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 2. Verify the CPU usage statistic is displayed
        await expect(widget.getByText(/CPU/i)).toBeVisible();

        // 3. Verify the Memory usage statistic is displayed
        await expect(widget.getByText(/Memory|RAM/i)).toBeVisible();
      });

      test('Admin can manually refresh the My Resources widget', async ({
        page,
      }) => {
        // 1. Locate the "My Resources" widget
        const widget = page
          .locator('.bai_grid_item')
          .filter({ hasText: 'My Total Resource Usage' })
          .first();
        await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 2. Click the refresh button in the widget header
        const refreshButton = widget.getByRole('button', { name: 'Refresh' });
        await refreshButton.click();

        // 3. Verify the widget still renders CPU/Memory after refresh
        await expect(widget.getByText(/CPU/i)).toBeVisible();
      });
    });

    // -----------------------------------------------------------------------
    // 9. My Resources in Resource Group Widget
    // -----------------------------------------------------------------------
    test.describe('My Resources in Resource Group Widget', () => {
      test.beforeEach(async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'summary');
      });

      test('Admin can view resource usage scoped to the current resource group', async ({
        page,
      }) => {
        // 1. Locate the "My Resources in Resource Group" widget
        // The widget title is "My Resources in" followed by a resource group selector
        const widget = page
          .locator('.bai_grid_item')
          .filter({ hasText: 'My Resources in' })
          .first();
        await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 2. Verify a resource group selector (dropdown or select) is visible within the widget
        await expect(widget.locator('.ant-select').first()).toBeVisible();

        // 3. Verify the resource content area has finished loading for the current resource group.
        // The widget may show CPU/RAM statistics when the admin user has resource quota allocated
        // in the resource group, or show an empty state ("No resource data available") when no
        // quota is assigned. The skeleton loader disappears once data has been fetched either way.
        // `MyResourceWithinResourceGroup.tsx` renders `BAISkeleton` while
        // loading, tagged `data-testid="my-resource-skeleton"` (Astryx
        // `Skeleton` has no default class to anchor on); the "paragraph"
        // variant renders several boxes sharing that testid, hence `.first()`.
        await expect(
          widget.getByTestId('my-resource-skeleton').first(),
        ).not.toBeVisible({
          timeout: WIDGET_TIMEOUT,
        });

        // 4. Verify a "Used" / "Free" segmented control is present.
        // `SegmentedControl` (`@astryxdesign/core/SegmentedControl`) is a
        // `role="radiogroup"` with `label="Used/Free"` (composed from the two
        // option labels — `MyResourceWithinResourceGroup.tsx`).
        const segmentedControl = widget.getByRole('radiogroup', {
          name: 'Used/Free',
        });
        await expect(segmentedControl).toBeVisible();
        await expect(segmentedControl.getByText('Used')).toBeVisible();
        await expect(segmentedControl.getByText('Free')).toBeVisible();
      });

      test('Admin can toggle between "Used" and "Free" resource views', async ({
        page,
      }) => {
        // 1. Locate the "My Resources in Resource Group" widget
        // The widget title is "My Resources in" followed by a resource group selector
        const widget = page
          .locator('.bai_grid_item')
          .filter({ hasText: 'My Resources in' })
          .first();
        await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 2. Locate the segmented control (Astryx `SegmentedControl`,
        // `role="radiogroup"`, `label="Used/Free"` — see the previous test).
        const segmentedControl = widget.getByRole('radiogroup', {
          name: 'Used/Free',
        });
        await expect(segmentedControl).toBeVisible();

        // 3. Click the "Used" segment
        await segmentedControl.getByRole('radio', { name: 'Used' }).click();

        // 4. Verify the "Used" segment is now selected
        await expect(
          segmentedControl.getByRole('radio', { name: 'Used' }),
        ).toBeChecked();

        // 5. Click the "Free" segment
        await segmentedControl.getByRole('radio', { name: 'Free' }).click();

        // 6. Verify the "Free" segment is now selected
        await expect(
          segmentedControl.getByRole('radio', { name: 'Free' }),
        ).toBeChecked();
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
          await navigateTo(page, 'summary');

          // Declarative feature gate (FR-3112): the Agent Statistics widget is
          // rendered only when the manager supports 'agent-stats'
          // (manager >= 25.15.0; widget introduced by FR-1575).
          await skipUnlessClientFeature(
            page,
            'agent-stats',
            "Agent Statistics widget requires the 'agent-stats' capability (Backend.AI manager >= 25.15.0, FR-1575)",
          );
        });

        test('Admin can view cluster-level resource statistics in the Agent Stats widget', async ({
          page,
        }) => {
          // 1. The backend is capable — the widget MUST be present; absence is a failure.
          const widget = page
            .locator('.bai_grid_item')
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

        test('Admin can manually refresh the Agent Stats widget', async ({
          page,
        }) => {
          // 1. The backend is capable — the widget MUST be present; absence is a failure.
          const widget = page
            .locator('.bai_grid_item')
            .filter({ hasText: 'Agent Statistics' });
          await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

          // 2. Click the refresh button in the widget header
          const refreshButton = widget.getByRole('button', { name: 'Refresh' });
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
        await navigateTo(page, 'summary');
      });

      test('Admin can view the recently created sessions list on the Dashboard', async ({
        page,
      }) => {
        // 1. Locate the "Recently Created Sessions" widget
        const widget = page
          .locator('.bai_grid_item')
          .filter({ hasText: 'Recently Created Sessions' });
        await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 2. Verify the sessions table container is displayed
        await expect(widget.getByRole('table')).toBeVisible();
      });

      test('Admin can manually refresh the Recently Created Sessions widget', async ({
        page,
      }) => {
        // 1. Locate the "Recently Created Sessions" widget
        const widget = page
          .locator('.bai_grid_item')
          .filter({ hasText: 'Recently Created Sessions' });
        await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 2. Click the refresh button in the widget header
        const refreshButton = widget.getByRole('button', { name: 'Refresh' });
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
          page.getByRole('heading', { name: 'Active Sessions' }),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 3. Verify board container exists with multiple widgets
        const boardItems = page.locator('.bai_grid_item');
        await expect(boardItems.first()).toBeVisible();
        const count = await boardItems.count();
        expect(count).toBeGreaterThanOrEqual(3);

        // 4. Panels are rearrangeable at all times — no mode to enter first
        await expect(page.locator('.bai_board_handle').first()).toBeVisible();
        await expect(page.locator('.bai_board_resizer').first()).toBeVisible();
      });

      test('Admin can open and close the dashboard edit sider', async ({
        page,
        request,
      }) => {
        // 1. Login as admin and navigate to /summary
        await loginAsAdmin(page, request);
        await navigateTo(page, 'summary');
        await enableCustomDashboardPanels(page);
        await expect(
          page.getByRole('heading', { name: 'Active Sessions' }),
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
        // 1. Login as admin, open the dashboard, opt in, and enter edit mode
        await loginAsAdmin(page, request);
        await navigateTo(page, 'summary');
        await enableCustomDashboardPanels(page);
        await expect(
          page.getByRole('heading', { name: 'Active Sessions' }),
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

        // 3. Pick the "Sessions" resource (project-scoped, available to every
        //    role). The "Resource" combobox is the AstryxFormSelector; the other
        //    combobox in the dialog is the condition property filter.
        await modal.getByRole('combobox', { name: 'Resource' }).click();
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
        //    (The panel is persisted in localStorage only, and each test runs in
        //    a fresh browser context, so no cleanup is needed.)
        await expect(
          page.locator('.bai_grid_item').filter({ hasText: panelTitle }),
        ).toBeVisible({ timeout: WIDGET_TIMEOUT });
      });
    });
  },
);
