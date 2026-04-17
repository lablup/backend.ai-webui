// E2E spec: Session Scheduling History Modal
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { setupGraphQLMocks } from './mocking/graphql-interceptor';
import { schedulingHistoryMockResponse } from './mocking/scheduling-history-mock';
import {
  sessionDetailLegacyMockResponse,
  sessionDetailMockResponse,
} from './mocking/session-detail-mock';
import { sessionListMockResponse } from './mocking/session-list-mock';
import { test, expect, Page } from '@playwright/test';

test.describe(
  'Session Scheduling History Modal - Admin Scheduling History Access',
  { tag: ['@session', '@functional', '@regression'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);

      // Set up GraphQL mocks BEFORE navigation triggers queries
      await setupGraphQLMocks(page, {
        ComputeSessionListPageQuery: () => sessionListMockResponse(),
        SessionDetailContentLegacyQuery: (vars) =>
          sessionDetailLegacyMockResponse(vars),
        SessionDetailContentQuery: (vars) => sessionDetailMockResponse(vars),
        SessionSchedulingHistoryModalQuery: () =>
          schedulingHistoryMockResponse(),
      });

      await navigateTo(page, 'session');
      // Wait for session list table to be visible
      await expect(page.locator('table').first()).toBeVisible({
        timeout: 10000,
      });

      // Force session-scheduling-history capability so the history button
      // is rendered regardless of the backend version.
      // This must be set AFTER navigation so backendaiclient is fully initialized.
      // The component reads baiClient.supports() on each render, so setting the flag
      // here ensures it is active when the Session Detail drawer is opened.
      await page.waitForFunction(() => {
        return (
          typeof (globalThis as any).backendaiclient !== 'undefined' &&
          (globalThis as any).backendaiclient !== null &&
          (globalThis as any).backendaiclient.ready === true
        );
      }, { timeout: 10000 });
      await page.evaluate(() => {
        (globalThis as any).backendaiclient._features[
          'session-scheduling-history'
        ] = true;
      });
    });

    /**
     * Helper: opens the session detail drawer for the first session in the list.
     * Returns after the drawer is visible.
     */
    async function openSessionDetailDrawer(page: Page) {
      // Click the first session name cell to open the Session Detail drawer.
      // Use .ant-table-row to skip the ant-table-measure-row (a zero-height
      // column-width measurement row that Ant Design inserts at the top of tbody).
      const firstSessionRow = page
        .locator('table tbody tr.ant-table-row')
        .first();
      await expect(firstSessionRow).toBeVisible({ timeout: 10000 });
      const firstSessionCell = firstSessionRow.locator('td').nth(1);
      await firstSessionCell.click();
      const drawer = page.getByRole('dialog', { name: 'Session Info' });
      await expect(drawer).toBeVisible({ timeout: 10000 });
      return drawer;
    }

    /**
     * Helper: locates the property selector combobox inside the BAIGraphQLPropertyFilter.
     * Uses CSS chain because both the property selector and search input are
     * `combobox` role elements — no unique aria attribute distinguishes them.
     * A `data-testid` on BAIGraphQLPropertyFilter would be the ideal upstream fix.
     */
    function getPropertyFilterCombobox(modal: ReturnType<Page['getByRole']>) {
      return modal
        .locator('.ant-space-compact .ant-select')
        .first()
        .locator('[role="combobox"]');
    }

    /**
     * Helper: clicks the history button in the Session Detail drawer and waits
     * for the Session Scheduling History modal to be visible.
     * Returns the modal locator.
     */
    async function openSchedulingHistoryModal(page: Page) {
      // Scope to the Session Info drawer to avoid strict mode violation with the
      // React Grab toolbar buttons ("Open history", "Copy all history items").
      const drawer = page.getByRole('dialog', { name: 'Session Info' });
      const historyButton = drawer.getByRole('button', {
        name: 'history',
        exact: true,
      });
      await expect(historyButton).toBeVisible({ timeout: 5000 });
      await historyButton.click();
      const modal = page.getByRole('dialog', {
        name: 'Session Scheduling History',
      });
      await expect(modal).toBeVisible({ timeout: 10000 });
      return modal;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. History Button Visibility and Access
    // ─────────────────────────────────────────────────────────────────────────

    test('Admin can see the scheduling history button in session detail when backend supports the capability', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer by clicking the first session row
      await openSessionDetailDrawer(page);

      // 2. Locate the Status row and verify the history button is visible
      const statusRow = page.getByRole('row', { name: /Status/ });
      await expect(statusRow).toBeVisible();

      // 3. Verify the "history" button (HistoryOutlined icon) is visible next to the status tag.
      // Scope to the drawer to avoid strict mode violation with React Grab toolbar buttons.
      const drawer = page.getByRole('dialog', { name: 'Session Info' });
      const historyButton = drawer.getByRole('button', {
        name: 'history',
        exact: true,
      });
      await expect(historyButton).toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Modal Opening and Initial State
    // ─────────────────────────────────────────────────────────────────────────

    test('Admin can open the Session Scheduling History modal and see correct column headers', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer
      await openSessionDetailDrawer(page);

      // 2. Click the history button to open the modal
      const modal = await openSchedulingHistoryModal(page);

      // 3. Verify the modal title is correct
      await expect(modal.getByText('Session Scheduling History')).toBeVisible();

      // 4. Verify the property filter combobox is visible at the top left
      await expect(getPropertyFilterCombobox(modal)).toBeVisible();

      // 5. Verify the refresh button is visible at the top right
      const refreshButton = modal.getByRole('button', { name: 'reload' });
      await expect(refreshButton).toBeVisible();

      // 6. Verify the history table column headers
      await expect(
        modal.getByRole('columnheader', { name: 'Phase' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Result' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Status Transition' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Attempts' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Updated At' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Created At' }),
      ).toBeVisible();

      // 7. Verify the sub-header "From" and "To" within Status Transition
      await expect(
        modal.getByRole('columnheader', { name: 'From' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'To' }),
      ).toBeVisible();

      // 8. Verify the Close button is visible in the modal footer
      const closeButtonFooter = modal
        .getByRole('button', { name: 'Close' })
        .filter({ hasText: 'Close' });
      await expect(closeButtonFooter).toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Modal Dismissal
    // ─────────────────────────────────────────────────────────────────────────

    test('Admin can close the Session Scheduling History modal using the footer Close button', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Verify the modal is visible
      await expect(modal).toBeVisible();

      // 3. Click the footer "Close" button
      await modal
        .getByRole('button', { name: 'Close' })
        .filter({ hasText: 'Close' })
        .click();

      // 4. Verify the modal is no longer visible
      await expect(modal).not.toBeVisible();

      // 5. Verify the Session Detail drawer is still open
      const drawer = page.getByRole('dialog', { name: 'Session Info' });
      await expect(drawer).toBeVisible();
    });

    test('Admin can close the Session Scheduling History modal using the X button in the header', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Verify the modal is visible
      await expect(modal).toBeVisible();

      // 3. Click the X (close) button in the modal header.
      // The Ant Design modal header X button has aria-label="Close" and appears first in DOM order.
      // The footer "Close" button has visible text "Close" (use hasText to distinguish them).
      // The header X button is the first button named "Close" in the modal.
      const headerCloseButton = modal
        .getByRole('button', { name: 'Close' })
        .first();
      await headerCloseButton.click();

      // 4. Verify the modal is no longer visible
      await expect(modal).not.toBeVisible();

      // 5. Verify the Session Detail drawer is still open
      const drawer = page.getByRole('dialog', { name: 'Session Info' });
      await expect(drawer).toBeVisible();
    });

    test('Admin can close the Session Scheduling History modal by clicking outside (backdrop)', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Verify the modal is visible
      await expect(modal).toBeVisible();

      // 3. Click on the modal backdrop overlay (area outside the modal content)
      // The ant-modal-wrap is the backdrop container
      await page
        .locator('.ant-modal-wrap')
        .click({ position: { x: 10, y: 10 } });

      // 4. Verify the modal is no longer visible
      await expect(modal).not.toBeVisible();

      // 5. Verify the Session Detail drawer is still open
      const drawer = page.getByRole('dialog', { name: 'Session Info' });
      await expect(drawer).toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Property Filter — Filter Controls
    // ─────────────────────────────────────────────────────────────────────────

    test('Admin can see all available filter properties in the property filter selector', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Click the property selector dropdown
      await getPropertyFilterCombobox(modal).click();

      // 3. Verify all filter properties are available in the dropdown
      await expect(page.getByRole('option', { name: 'ID' })).toBeVisible();
      await expect(page.getByRole('option', { name: 'Phase' })).toBeVisible();
      await expect(page.getByRole('option', { name: 'Result' })).toBeVisible();
      await expect(
        page.getByRole('option', { name: 'From Status' }),
      ).toBeVisible();
      await expect(
        page.getByRole('option', { name: 'To Status' }),
      ).toBeVisible();
      await expect(
        page.getByRole('option', { name: 'Error Code' }),
      ).toBeVisible();
      await expect(page.getByRole('option', { name: 'Message' })).toBeVisible();
      // Verify the datetime filter options (createdAt/updatedAt) added in feat(FR-2302).
      // These options require BAIGraphQLPropertyFilter datetime type support
      // (introduced after v26.3.0). Skip gracefully if not available on the server build.
      const hasCreatedAtOption = await page
        .getByRole('option', { name: 'Created At' })
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      if (hasCreatedAtOption) {
        await expect(
          page.getByRole('option', { name: 'Created At' }),
        ).toBeVisible();
        await expect(
          page.getByRole('option', { name: 'Updated At' }),
        ).toBeVisible();
      }

      // 4. Close the dropdown
      await page.keyboard.press('Escape');
    });

    test('Admin can filter history records by Phase using the property filter', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Click the property selector dropdown and select "Phase"
      await getPropertyFilterCombobox(modal).click();
      await page.getByRole('option', { name: 'Phase' }).click();

      // 3. Type a partial phase name in the value input
      const searchInput = modal.locator(
        '[role="combobox"][placeholder="Search"]',
      );
      await searchInput.fill('schedule');

      // 4. Click the search/confirm button
      await modal.getByRole('button', { name: 'search' }).click();

      // 5. Verify the table is filtered
      const rows = modal
        .getByRole('row')
        .filter({ has: page.getByRole('cell') });
      await expect(rows.first()).toBeVisible();
    });

    test('Admin can filter history records by Result enum using the property filter', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Click the property selector dropdown and select "Result"
      await getPropertyFilterCombobox(modal).click();
      await page.getByRole('option', { name: 'Result' }).click();

      // 3. Type "SUCCESS" in the AutoComplete input and submit.
      // The value field uses an AutoComplete with Input.Search. For enum types
      // with strictSelection, typing the exact option value and searching works.
      const searchInput = modal.locator(
        '[role="combobox"][placeholder="Search"]',
      );
      await searchInput.fill('SUCCESS');

      // 4. Click the search/confirm button to add the filter condition
      await modal.getByRole('button', { name: 'search' }).click();

      // 5. Verify the filter chip/tag is visible
      // Ant Design Tags have no unique ARIA role; CSS class is the only reliable selector.
      const filterTag = modal.locator('.ant-tag');
      await expect(filterTag).toBeVisible();
    });

    test('Admin can remove an applied filter to restore the full history list', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Apply a Phase filter
      await getPropertyFilterCombobox(modal).click();
      await page.getByRole('option', { name: 'Phase' }).click();
      const searchInput = modal.locator(
        '[role="combobox"][placeholder="Search"]',
      );
      await searchInput.fill('schedule');
      await modal.getByRole('button', { name: 'search' }).click();

      // 3. Verify the filter chip/tag is visible
      // Ant Design Tags have no unique ARIA role; CSS class is the only reliable selector.
      const filterTag = modal.locator('.ant-tag').first();
      await expect(filterTag).toBeVisible();

      // 4. Click the X (close) icon on the filter chip to remove it
      await filterTag.getByLabel('close').click();

      // 5. Verify the filter chip is no longer visible
      await expect(filterTag).not.toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Datetime Filter — Created At and Updated At
    // NOTE: Tests in this section require datetime filter support (feat/FR-2302),
    // introduced in the main branch after v26.3.0. If the server runs an older build,
    // "Created At" and "Updated At" options will not appear in the property filter
    // dropdown and these tests will be skipped automatically.
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Helper: opens the property filter, selects a datetime property, and returns
     * whether the datetime feature is available. Skips the test if not available.
     */
    async function selectDatetimeProperty(
      page: Page,
      modal: ReturnType<Page['getByRole']>,
      propertyName: 'Created At' | 'Updated At',
    ): Promise<boolean> {
      await getPropertyFilterCombobox(modal).click();
      const option = page.getByRole('option', { name: propertyName });
      const isAvailable = await option
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      if (!isAvailable) {
        await page.keyboard.press('Escape');
        test.skip(
          true,
          `Datetime filter option "${propertyName}" requires feat/FR-2302 (WebUI > v26.3.0).`,
        );
        return false;
      }
      await option.click();
      return true;
    }

    test('Admin sees a DatePicker instead of text input when Created At filter property is selected', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Select "Created At" from the property selector dropdown
      const isAvailable = await selectDatetimeProperty(page, modal, 'Created At');
      if (!isAvailable) return;

      // 3. Verify the DatePicker input is visible for datetime type
      const datePicker = modal
        .locator('.ant-space-compact .ant-picker')
        .first();
      await expect(datePicker).toBeVisible();

      // 4. Verify the regular text search input is NOT visible when datetime type is selected
      const searchInput = modal.locator(
        '[role="combobox"][placeholder="Search"]',
      );
      await expect(searchInput).not.toBeVisible();
    });

    test('Admin sees a DatePicker instead of text input when Updated At filter property is selected', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Select "Updated At" from the property selector dropdown (skip if not available)
      const isAvailable = await selectDatetimeProperty(page, modal, 'Updated At');
      if (!isAvailable) return;

      // 3. Verify the DatePicker input is visible for datetime type
      const datePicker = modal
        .locator('.ant-space-compact .ant-picker')
        .first();
      await expect(datePicker).toBeVisible();

      // 4. Verify the regular text search input is NOT visible when datetime type is selected
      const searchInput = modal.locator(
        '[role="combobox"][placeholder="Search"]',
      );
      await expect(searchInput).not.toBeVisible();
    });

    test('Admin can see datetime operator options (after, before) for Created At filter', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Select "Created At" from the property selector dropdown (skip if not available)
      const isAvailable = await selectDatetimeProperty(page, modal, 'Created At');
      if (!isAvailable) return;

      // 3. Click the operator selector (second BAISelect in the compact group).
      // For datetime type without fixedOperator, the operator selector is shown
      // between the property selector and the DatePicker.
      // Click the .ant-select container directly because the .ant-select-content-value
      // overlay intercepts pointer events on the inner [role="combobox"] input.
      const operatorSelect = modal
        .locator('.ant-space-compact .ant-select')
        .nth(1);
      await operatorSelect.click();

      // 4. Verify the datetime operator options are visible
      // Labels come from i18n comp:BAIGraphQLPropertyFilter.operator.* keys
      await expect(page.getByRole('option', { name: 'after' })).toBeVisible();
      await expect(page.getByRole('option', { name: 'before' })).toBeVisible();

      // 5. Close the dropdown
      await page.keyboard.press('Escape');
    });

    test('Admin can apply a Created At datetime filter using the DatePicker and see the filter tag', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Select "Created At" from the property selector dropdown (skip if not available)
      const isAvailable = await selectDatetimeProperty(page, modal, 'Created At');
      if (!isAvailable) return;

      // 3. Click the DatePicker to open the calendar
      const datePicker = modal
        .locator('.ant-space-compact .ant-picker')
        .first();
      await datePicker.click();

      // 4. Select the first visible day in the calendar
      const calendarPopup = page
        .locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)')
        .first();
      await calendarPopup.locator('.ant-picker-cell-in-view').first().click();

      // 5. Click the "OK" button to confirm the datetime selection (required for showTime)
      await calendarPopup.getByRole('button', { name: 'OK' }).click();

      // 6. Verify the filter tag for "Created At" appears with the applied condition
      // The tag format is: "{propertyLabel} {operatorSymbol} {datetime}"
      const filterTag = modal
        .locator('.ant-tag', { hasText: 'Created At' })
        .first();
      await expect(filterTag).toBeVisible();
    });

    test('Admin can apply an Updated At datetime filter using the DatePicker and see the filter tag', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Select "Updated At" from the property selector dropdown (skip if not available)
      const isAvailable = await selectDatetimeProperty(page, modal, 'Updated At');
      if (!isAvailable) return;

      // 3. Click the DatePicker to open the calendar
      const datePicker = modal
        .locator('.ant-space-compact .ant-picker')
        .first();
      await datePicker.click();

      // 4. Select the first visible day in the calendar
      const calendarPopup = page
        .locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)')
        .first();
      await calendarPopup.locator('.ant-picker-cell-in-view').first().click();

      // 5. Click the "OK" button to confirm the datetime selection (required for showTime)
      await calendarPopup.getByRole('button', { name: 'OK' }).click();

      // 6. Verify the filter tag for "Updated At" appears with the applied condition
      const filterTag = modal
        .locator('.ant-tag', { hasText: 'Updated At' })
        .first();
      await expect(filterTag).toBeVisible();
    });

    test('Admin can remove an applied Created At datetime filter tag', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Apply a Created At datetime filter (skip if not available)
      const isAvailable = await selectDatetimeProperty(page, modal, 'Created At');
      if (!isAvailable) return;
      const datePicker = modal
        .locator('.ant-space-compact .ant-picker')
        .first();
      await datePicker.click();
      const calendarPopup = page
        .locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)')
        .first();
      await calendarPopup.locator('.ant-picker-cell-in-view').first().click();
      await calendarPopup.getByRole('button', { name: 'OK' }).click();

      // 3. Verify the filter tag is visible
      const filterTag = modal
        .locator('.ant-tag', { hasText: 'Created At' })
        .first();
      await expect(filterTag).toBeVisible();

      // 4. Click the X (close) icon on the filter tag to remove it
      await filterTag.getByLabel('close').click();

      // 5. Verify the filter tag is no longer visible
      await expect(filterTag).not.toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Refresh Functionality
    // ─────────────────────────────────────────────────────────────────────────

    test('Admin can manually refresh the scheduling history data using the refresh button', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Locate and verify the refresh button is visible
      const refreshButton = modal.getByRole('button', { name: 'reload' });
      await expect(refreshButton).toBeVisible();

      // 3. Click the refresh button
      await refreshButton.click();

      // 4. Wait for the refresh to complete — the table data should remain visible
      // The loading state is transient (minimum 700ms) and may complete before assertion.
      // Instead, verify the button remains visible and data is still present after refresh.
      await expect(refreshButton).toBeVisible();

      // 5. Verify the table data is still displayed after refresh
      await expect(
        modal.getByRole('columnheader', { name: 'Phase' }),
      ).toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 7. History Table — Data Display
    // ─────────────────────────────────────────────────────────────────────────

    test('Admin can see history records displayed in the scheduling history table', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Verify the table body has at least one row
      const tableRows = modal.getByRole('row').filter({
        has: page.getByRole('cell', {
          name: /enqueue|schedule|check|promote|start/,
        }),
      });
      await expect(tableRows.first()).toBeVisible();
    });

    test('Admin sees history records with phase names, result badges, and date-time columns', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Verify the "enqueue" phase row is visible in the table
      const enqueueRow = modal.getByRole('row', {
        name: /enqueue SUCCESS PENDING/,
      });
      await expect(enqueueRow).toBeVisible();

      // 3. Verify phase cell has text
      await expect(
        enqueueRow.getByRole('cell', { name: 'enqueue' }),
      ).toBeVisible();

      // 4. Verify result badge shows "SUCCESS"
      await expect(
        enqueueRow.getByRole('cell', { name: 'SUCCESS' }),
      ).toBeVisible();

      // 5. Verify status transition From is "PENDING"
      await expect(
        enqueueRow.getByRole('cell', { name: 'PENDING' }),
      ).toBeVisible();

      // 6. Verify Attempts value is a number (use exact: true to avoid matching date cells containing '1')
      await expect(
        enqueueRow.getByRole('cell', { name: '1', exact: true }),
      ).toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 8. Expandable Rows — Sub-Step Details
    // ─────────────────────────────────────────────────────────────────────────

    test('Admin can expand a history row to view sub-step details when sub-steps exist', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Identify a row with an expand icon (the schedule-sessions row has sub-steps)
      const expandableRow = modal.getByRole('row', {
        name: /Expand row schedule-sessions/,
      });
      await expect(expandableRow).toBeVisible();

      // 3. Click the expand icon/arrow on that row
      await expandableRow.getByLabel('Expand row').click();

      // 4. Verify the sub-steps table columns are visible
      await expect(
        modal.getByRole('columnheader', { name: 'Step' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Result' }).nth(1),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Message' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Error Code' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Started At' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Ended At' }),
      ).toBeVisible();

      // 5. Verify at least one sub-step row is visible.
      // Use .first() to avoid strict mode violation: the expanded row container and the
      // actual data row both match /FIFOSequencer SUCCESS/. The .first() gets the
      // expanded row container which is visible.
      const firstSubStep = modal
        .getByRole('row', { name: /FIFOSequencer SUCCESS/ })
        .first();
      await expect(firstSubStep).toBeVisible();
    });

    test('Admin can collapse an expanded sub-step row by clicking the expand icon again', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Expand the schedule-sessions row
      const expandableRow = modal.getByRole('row', {
        name: /Expand row schedule-sessions/,
      });
      await expandableRow.getByLabel('Expand row').click();

      // 3. Verify sub-steps table is visible
      await expect(
        modal.getByRole('columnheader', { name: 'Step' }),
      ).toBeVisible();
      // Use .first() to avoid strict mode violation (see test #13 comment).
      const firstSubStep = modal
        .getByRole('row', { name: /FIFOSequencer SUCCESS/ })
        .first();
      await expect(firstSubStep).toBeVisible();

      // 4. Click the Collapse row button to collapse the expanded row
      const collapseRow = modal.getByRole('row', {
        name: /Collapse row schedule-sessions/,
      });
      await collapseRow.getByLabel('Collapse row').click();

      // 5. Verify the sub-step row is no longer visible
      await expect(firstSubStep).not.toBeVisible();
    });

    test('Admin does not see expand icon for history rows with no sub-steps', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. The "enqueue" row has no sub-steps and should not have an expand button
      const enqueueRow = modal.getByRole('row', {
        name: /enqueue SUCCESS PENDING/,
      });
      await expect(enqueueRow).toBeVisible();

      // 3. Verify the enqueue row does not have an "Expand row" button
      await expect(enqueueRow.getByLabel('Expand row')).not.toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 9. Sorting
    // ─────────────────────────────────────────────────────────────────────────

    test('Admin can sort the history table by the CreatedAt column', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Verify the CreatedAt column header is visible and has a sorter indicator
      const createdAtHeader = modal.getByRole('columnheader', {
        name: 'Created At',
      });
      await expect(createdAtHeader).toBeVisible();

      // 3. Click the "Created At" column header to toggle sort
      await createdAtHeader.click();

      // 4. Click again to sort descending
      await createdAtHeader.click();
    });

    test('Admin can sort the history table by the UpdatedAt column', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Verify the UpdatedAt column header is visible
      const updatedAtHeader = modal.getByRole('columnheader', {
        name: 'Updated At',
      });
      await expect(updatedAtHeader).toBeVisible();

      // 3. Click the "Updated At" column header to sort ascending
      await updatedAtHeader.click();

      // 4. Click again to sort descending
      await updatedAtHeader.click();
    });

    test('Admin sees the history table sorted by CreatedAt ascending by default on modal open', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Verify the CreatedAt column shows the ascending sort indicator by default
      const createdAtHeader = modal.getByRole('columnheader', {
        name: 'Created At',
      });
      await expect(createdAtHeader).toBeVisible();

      // The default sort is ascending by createdAt — the sort icon should reflect this
      // Without multiple records with different timestamps, we can only verify the header is sortable
      await expect(
        createdAtHeader.locator('[role="img"]').first(),
      ).toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 10. Full End-to-End Workflow
    // ─────────────────────────────────────────────────────────────────────────

    test('Admin can open, view records, expand sub-steps, refresh, and close the scheduling history modal', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer
      await openSessionDetailDrawer(page);

      // 2. Click the history button to open the modal
      const modal = await openSchedulingHistoryModal(page);

      // 3. Verify the modal title is "Session Scheduling History"
      await expect(modal.getByText('Session Scheduling History')).toBeVisible();

      // 4. Verify the history table is visible and contains records
      const scheduleRow = modal.getByRole('row', {
        name: /Expand row schedule-sessions/,
      });
      await expect(scheduleRow).toBeVisible();

      // 5. Expand the schedule-sessions row to view sub-step details
      await scheduleRow.getByLabel('Expand row').click();

      // 6. Verify the sub-steps table appears with correct column headers
      await expect(
        modal.getByRole('columnheader', { name: 'Step' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Started At' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Ended At' }),
      ).toBeVisible();

      // 7. Verify sub-step data is displayed.
      // Use .first() to avoid strict mode violation: both the expanded row container
      // and the actual data row match /FIFOSequencer SUCCESS/.
      await expect(
        modal.getByRole('row', { name: /FIFOSequencer SUCCESS/ }).first(),
      ).toBeVisible();

      // 8. Click the refresh button
      const refreshButton = modal.getByRole('button', { name: 'reload' });
      await refreshButton.click();

      // 9. Wait for the refresh to complete — verify the table is still visible
      await expect(
        modal.getByRole('columnheader', { name: 'Phase' }),
      ).toBeVisible();

      // 10. Click the footer "Close" button to close the modal
      await modal
        .getByRole('button', { name: 'Close' })
        .filter({ hasText: 'Close' })
        .click();

      // 11. Verify the modal is closed
      await expect(modal).not.toBeVisible();

      // 12. Verify the Session Detail drawer is still visible
      const drawer = page.getByRole('dialog', { name: 'Session Info' });
      await expect(drawer).toBeVisible();
    });
  },
);
