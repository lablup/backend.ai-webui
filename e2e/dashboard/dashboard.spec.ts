// spec: e2e/.agent-output/test-plan-start-dashboard.md
// scenarios: 6 (Widget Rendering), 7 (Session Count Widget), 8 (My Resources Widget),
//            9 (My Resources in Resource Group Widget), 10 (Agent Stats Widget),
//            11 (Recently Created Sessions Widget), 12 (Board Layout)
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
            .filter({ hasText: 'My Total Resources Limit' })
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
            .filter({ hasText: 'My Total Resources Limit' })
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
        const refreshButton = widget.getByRole('button', { name: 'reload' });
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
          .filter({ hasText: 'My Total Resources Limit' })
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
          .filter({ hasText: 'My Total Resources Limit' })
          .first();
        await expect(widget).toBeVisible({ timeout: WIDGET_TIMEOUT });

        // 2. Click the refresh button in the widget header
        const refreshButton = widget.getByRole('button', { name: 'reload' });
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
        await expect(widget.locator('.ant-skeleton')).not.toBeVisible({
          timeout: WIDGET_TIMEOUT,
        });

        // 4. Verify a "Used" / "Free" segmented control is present
        const segmentedControl = widget.locator('.ant-segmented');
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

        // 2. Locate the segmented control
        const segmentedControl = widget.locator('.ant-segmented');
        await expect(segmentedControl).toBeVisible();

        // 3. Click the "Used" segment
        await segmentedControl.getByText('Used').click();

        // 4. Verify the "Used" segment is now selected
        await expect(
          segmentedControl.locator('.ant-segmented-item-selected'),
        ).toContainText('Used');

        // 5. Click the "Free" segment
        await segmentedControl.getByText('Free').click();

        // 6. Verify the "Free" segment is now selected
        await expect(
          segmentedControl.locator('.ant-segmented-item-selected'),
        ).toContainText('Free');
      });
    });

    // -----------------------------------------------------------------------
    // 10. Agent Stats Widget (Admin Only)
    // -----------------------------------------------------------------------
    test.describe('Agent Stats Widget', () => {
      test.beforeEach(async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'summary');
      });

      test('Admin can view cluster-level resource statistics in the Agent Stats widget', async ({
        page,
      }) => {
        // Agent Stats widget requires server >= 25.15.0
        const widget = page
          .locator('.bai_grid_item')
          .filter({ hasText: 'Agent Statistics' });

        // Skip test explicitly if widget is not available on this server version
        test.skip(
          !(await widget.isVisible({ timeout: WIDGET_TIMEOUT })),
          'Agent Statistics widget not available (requires server >= 25.15.0)',
        );

        // 2. Verify a "Used" / "Free" segmented toggle is present
        const segmentedControl = widget.locator('.ant-segmented');
        await expect(segmentedControl).toBeVisible();

        // 3. Click the "Free" segment and verify it becomes selected
        await segmentedControl.getByText('Free').click();
        await expect(
          segmentedControl.locator('.ant-segmented-item-selected'),
        ).toContainText('Free');

        // 4. Click the "Used" segment and verify it becomes selected
        await segmentedControl.getByText('Used').click();
        await expect(
          segmentedControl.locator('.ant-segmented-item-selected'),
        ).toContainText('Used');
      });

      test('Admin can manually refresh the Agent Stats widget', async ({
        page,
      }) => {
        // Agent Stats widget requires server >= 25.15.0
        const widget = page
          .locator('.bai_grid_item')
          .filter({ hasText: 'Agent Statistics' });

        // Skip test explicitly if widget is not available on this server version
        test.skip(
          !(await widget.isVisible({ timeout: WIDGET_TIMEOUT })),
          'Agent Statistics widget not available (requires server >= 25.15.0)',
        );

        // 2. Click the refresh button in the widget header
        const refreshButton = widget.getByRole('button', { name: 'reload' });
        await refreshButton.click();

        // 3. Verify the widget still renders after refresh (no error state)
        await expect(widget).toBeVisible();
      });
    });

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
        await expect(widget.locator('.ant-table')).toBeVisible();
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
        const refreshButton = widget.getByRole('button', { name: 'reload' });
        await refreshButton.click();

        // 3. Verify the widget still renders after refresh
        await expect(widget.locator('.ant-table')).toBeVisible();
      });
    });

    // -----------------------------------------------------------------------
    // 12. Board Layout (Resize and Move - smoke tests)
    // -----------------------------------------------------------------------
    test.describe('Board Layout', () => {
      test('Admin can see resizable and movable widgets on the Dashboard', async ({
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

        // 4. Verify drag handles exist on board widgets
        const dragHandles = page.locator('.bai_board_handle');
        await expect(dragHandles.first()).toBeVisible();

        // 5. Verify resize handles exist on board widgets
        const resizeHandles = page.locator('.bai_board_resizer');
        await expect(resizeHandles.first()).toBeVisible();
      });
    });
  },
);
