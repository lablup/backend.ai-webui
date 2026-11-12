// spec: e2e/.agent-output/test-plan-start-dashboard.md
// scenarios: 6 (Widget Rendering), 7 (Session Count Widget), 8 (My Resources Widget),
//            9 (My Activity Widget, replaces My Resources in Resource Group),
//            9b (Card Header Time Range, #10915),
//            12 (Board Layout), plus the custom panel add flow.
// The member dashboard reads only the viewer's own data (#10584). The superadmin
// dashboard is in e2e/admin/dashboard/, the project admin one in e2e/project-admin/dashboard/.
import { WIDGET_TIMEOUT, setFailuresOnly } from '../../utils/dashboard-util';
import { loginAsAdmin, loginAsUser, navigateTo } from '../../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

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
    // 9b. Card header time range (a header pick is temporary, never saved)
    // -----------------------------------------------------------------------
    test.describe('Card Header Time Range', () => {
      const myActivityWidget = (page: Page) =>
        page
          .locator('.uic-board-item')
          .filter({ hasText: 'My Activity' })
          .first();
      const rangePicker = (page: Page) =>
        page.getByRole('dialog', { name: 'Choose date and time range' });
      const dayButton = (page: Page, label: string) =>
        rangePicker(page).getByRole('button', { name: label, exact: true });

      test.beforeEach(async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'summary');
        await expect(myActivityWidget(page)).toBeVisible({
          timeout: WIDGET_TIMEOUT,
        });
      });

      test.afterEach(async ({ page }) => {
        const reset = myActivityWidget(page).getByRole('button', {
          name: /^Back to the saved setting/,
        });
        if (await reset.isVisible().catch(() => false)) {
          await reset.click();
        }
      });

      test('Admin can pick a preset period in a dashboard card header', async ({
        page,
      }) => {
        const widget = myActivityWidget(page);

        // 1. Open the header's time range control
        await widget
          .getByTestId('panel-header-settings')
          .getByRole('button', { name: /^Time range/ })
          .first()
          .click();
        await expect(rangePicker(page)).toBeVisible();

        // 2. Pick the "Last 7 days" preset; a preset commits at once
        await rangePicker(page)
          .getByRole('group', { name: 'Preset ranges' })
          .getByRole('button', { name: 'Last 7 days', exact: true })
          .click();
        await expect(rangePicker(page)).toBeHidden();

        // 3. The header shows the preset
        await expect(
          widget.getByRole('button', { name: 'Time range: Last 7 days' }),
        ).toBeVisible();
      });

      test('Admin can pick a custom period in a dashboard card header', async ({
        page,
      }) => {
        const widget = myActivityWidget(page);

        // Day labels in the browser's own calendar, as the control renders them
        const days = await page.evaluate(() => {
          const label = (offset: number) => {
            const d = new Date();
            d.setHours(12, 0, 0, 0);
            d.setDate(d.getDate() - offset);
            const pad = (n: number) => String(n).padStart(2, '0');
            return {
              label: d.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
            };
          };
          return { start: label(9), end: label(4), tooFar: label(1) };
        });

        // 1. Open the header's time range control
        await widget
          .getByTestId('panel-header-settings')
          .getByRole('button', { name: /^Time range/ })
          .first()
          .click();
        await expect(rangePicker(page)).toBeVisible();

        // 2. Pick the start day and hour, then confirm the start
        await dayButton(page, days.start.label).click();
        await rangePicker(page)
          .getByRole('group', { name: 'Start time' })
          .getByRole('listbox', { name: 'Hour' })
          .getByRole('option', { name: '09', exact: true })
          .click();
        await rangePicker(page)
          .getByRole('button', { name: 'OK', exact: true })
          .click();
        await expect(
          rangePicker(page).getByRole('group', { name: 'End time' }),
        ).toBeVisible();

        // 3. A day more than 7 days after the start is disabled
        await expect(dayButton(page, days.tooFar.label)).toBeDisabled();

        // 4. Pick an end within 7 days and confirm
        await dayButton(page, days.end.label).click();
        await rangePicker(page)
          .getByRole('button', { name: 'OK', exact: true })
          .click();
        await expect(rangePicker(page)).toBeHidden();

        // 5. The header shows both ends of the custom period
        const header = widget.getByTestId('panel-header-settings');
        await expect(
          header.getByRole('button', {
            name: `Time range, Start date: ${days.start.iso} 09:00`,
          }),
        ).toBeVisible();
        await expect(
          header.getByRole('button', {
            name: new RegExp(
              `^Time range, End date: ${days.end.iso} \\d{2}:\\d{2}$`,
            ),
          }),
        ).toBeVisible();
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
              body.includes('useAppConfigUpsertMutation') &&
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
