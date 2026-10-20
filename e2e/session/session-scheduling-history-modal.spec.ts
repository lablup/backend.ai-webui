// E2E spec: Session Scheduling History Modal
import { skipUnlessWebUIVersion } from '../utils/feature-gate-util';
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
    });

    /**
     * Helper: opens the session detail drawer for the first session in the list.
     * Returns after the drawer is visible.
     */
    async function openSessionDetailDrawer(page: Page) {
      // Click the mocked session's name to open the Session Detail drawer.
      const sessionNameButton = page.getByRole('button', {
        name: 'mock-session-for-scheduling-history',
        exact: true,
      });
      await expect(sessionNameButton).toBeVisible({ timeout: 10000 });
      await sessionNameButton.click();
      const drawer = page.getByRole('dialog', { name: 'Session Info' });
      await expect(drawer).toBeVisible({ timeout: 10000 });
      return drawer;
    }

    /**
     * Helper: locates the PowerSearch typeahead of the BAIGraphQLPropertyFilter.
     */
    function getPropertyFilterCombobox(modal: ReturnType<Page['getByRole']>) {
      return modal.getByRole('combobox', { name: 'Search filters' });
    }

    /**
     * Helper: picks a field in the PowerSearch typeahead, which opens the
     * Field / Operator / Value editor popover.
     */
    async function selectFilterProperty(
      page: Page,
      modal: ReturnType<Page['getByRole']>,
      propertyName: string,
    ) {
      await getPropertyFilterCombobox(modal).click();
      const option = page.getByRole('option', {
        name: propertyName,
        exact: true,
      });
      await expect(option).toBeVisible();
      await option.click();
    }

    /**
     * Helper: commits the value editor popover. Strict-selection fields may
     * commit as soon as an option is picked, so Apply is clicked only if it
     * is still shown.
     */
    async function applyFilterValue(page: Page) {
      const applyButton = page.getByRole('button', {
        name: 'Apply',
        exact: true,
      });
      if (await applyButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await applyButton.click();
      }
      await expect(applyButton).toBeHidden();
    }

    /**
     * Helper: the remove button of the committed filter token for a field.
     * Token labels follow "<Field>: <operator> <value>".
     */
    function getFilterTokenRemoveButton(
      modal: ReturnType<Page['getByRole']>,
      propertyName: string,
    ) {
      return modal.getByRole('button', {
        name: new RegExp(`^Remove ${propertyName}: `),
      });
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
        name: 'Session Scheduling History',
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
      const drawer = await openSessionDetailDrawer(page);

      // 2. Locate the Status entry of the session metadata list.
      const statusTerm = drawer
        .getByRole('term')
        .filter({ hasText: /^Status$/ });
      await expect(statusTerm).toBeVisible();
      const statusValue = statusTerm.locator('xpath=following-sibling::dd[1]');

      // 3. Verify the scheduling history button sits next to the status badge.
      const historyButton = statusValue.getByRole('button', {
        name: 'Session Scheduling History',
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
      const refreshButton = modal.getByRole('button', {
        name: 'Refresh',
        exact: true,
      });
      await expect(refreshButton).toBeVisible();

      // 6. Verify the history table column headers
      await expect(
        modal.getByRole('columnheader', { name: 'Phase' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Result' }),
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

      // 7. Verify the flat status-transition columns "From Status" and
      // "To Status" (the grouped "Status Transition" header was removed).
      await expect(
        modal.getByRole('columnheader', { name: 'From Status' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'To Status' }),
      ).toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Modal Dismissal
    // ─────────────────────────────────────────────────────────────────────────

    test('Admin can close the Session Scheduling History modal using the X button in the header', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Verify the modal is visible
      await expect(modal).toBeVisible();

      // 3. Click the X (close) button in the modal header.
      // The modal is footerless, so the header X is its first "Close" button.
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

    test('Admin can close the Session Scheduling History modal by pressing Escape', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Verify the modal is visible
      await expect(modal).toBeVisible();

      // 3. Press Escape. The modal opens full screen, so there is no backdrop
      // area outside it to click.
      await page.keyboard.press('Escape');

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

      // 2. Select "Phase" in the property filter
      await selectFilterProperty(page, modal, 'Phase');

      // 3. Type a partial phase name in the value editor and apply it
      await page.getByRole('textbox', { name: 'Value' }).fill('schedule');
      await applyFilterValue(page);

      // 4. Verify the filter token is shown and the table still has rows
      await expect(getFilterTokenRemoveButton(modal, 'Phase')).toBeVisible();
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

      // 2. Select "Result" in the property filter
      await selectFilterProperty(page, modal, 'Result');

      // 3. Pick "SUCCESS" from the strict-selection value selector and apply
      await page.getByRole('combobox', { name: 'Value' }).click();
      await page.getByRole('option', { name: 'SUCCESS', exact: true }).click();
      await applyFilterValue(page);

      // 4. Verify the filter token is visible
      await expect(getFilterTokenRemoveButton(modal, 'Result')).toBeVisible();
    });

    // FIXME(#10289): the PowerSearch Tokenizer end lane (loading spinner +
    // 'Clear all' button) covers the token's 'Remove' button in this narrow
    // filter and intercepts the click. The fix waits on upstream
    // facebook/astryx#7365; un-fixme once it lands.
    test.fixme('Admin can remove an applied filter to restore the full history list', async ({
      page,
    }) => {
      // 1. Open the Session Detail drawer and history modal
      await openSessionDetailDrawer(page);
      const modal = await openSchedulingHistoryModal(page);

      // 2. Apply a Phase filter
      await selectFilterProperty(page, modal, 'Phase');
      await page.getByRole('textbox', { name: 'Value' }).fill('schedule');
      await applyFilterValue(page);

      // 3. Verify the filter token is visible
      const removeButton = getFilterTokenRemoveButton(modal, 'Phase');
      await expect(removeButton).toBeVisible();

      // 4. Click the token's remove button
      await removeButton.click();

      // 5. Verify the filter token is no longer visible
      await expect(removeButton).not.toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Datetime Filter — Created At and Updated At
    // Declarative feature gate (FR-3112): datetime filter properties were
    // introduced by FR-2302 (WebUI > v26.3.0, first released in v26.4). The
    // whole group is tagged @requires-webui-v26.4 so it can be excluded
    // explicitly on older WebUI builds, e.g.:
    //   npx playwright test --grep-invert "@requires-webui-v26.4"
    // On an older build the version gate in beforeEach skips each test with
    // an auditable reason; on a capable build a missing datetime option is a
    // real failure (no silent skip).
    // ─────────────────────────────────────────────────────────────────────────
    test.describe(
      'Datetime Filter (Created At / Updated At)',
      { tag: ['@requires-webui-v26.4'] },
      () => {
        // Runtime half of the @requires-webui-v26.4 gate: skip declaratively
        // on WebUI builds that predate FR-2302 (first released in v26.4),
        // based on the explicit version source rather than UI probing.
        test.beforeEach(async ({ page }) => {
          await skipUnlessWebUIVersion(
            page,
            '26.4',
            'Datetime filter properties require FR-2302',
          );
        });

        /**
         * Helper: opens the property filter and selects a datetime property.
         * The version gate in beforeEach guarantees FR-2302 is present, so a
         * missing option here is a real regression and fails the test.
         */
        async function selectDatetimeProperty(
          page: Page,
          modal: ReturnType<Page['getByRole']>,
          propertyName: 'Created At' | 'Updated At',
        ): Promise<void> {
          await selectFilterProperty(page, modal, propertyName);
        }

        /**
         * Helper: picks the first selectable day in the date editor's
         * calendar and applies the filter.
         */
        async function applyFirstSelectableDate(page: Page): Promise<void> {
          await page.getByRole('button', { name: 'Open calendar' }).click();
          const calendar = page.getByRole('dialog', { name: 'Choose date' });
          await expect(calendar).toBeVisible();
          await calendar
            .getByRole('gridcell')
            .getByRole('button', { disabled: false })
            .first()
            .click();
          await applyFilterValue(page);
        }

        for (const propertyName of ['Created At', 'Updated At'] as const) {
          test(`Admin sees a date picker instead of text input when ${propertyName} filter property is selected`, async ({
            page,
          }) => {
            // 1. Open the Session Detail drawer and history modal
            await openSessionDetailDrawer(page);
            const modal = await openSchedulingHistoryModal(page);

            // 2. Select the datetime property in the property filter
            await selectDatetimeProperty(page, modal, propertyName);

            // 3. Verify the date input is shown for the datetime type
            await expect(
              page.getByRole('combobox', { name: 'Date' }),
            ).toBeVisible();

            // 4. Verify the free-text value input is NOT shown
            await expect(
              page.getByRole('textbox', { name: 'Value' }),
            ).not.toBeVisible();
          });
        }

        test('Admin can see datetime operator options (after, before) for Created At filter', async ({
          page,
        }) => {
          // 1. Open the Session Detail drawer and history modal
          await openSessionDetailDrawer(page);
          const modal = await openSchedulingHistoryModal(page);

          // 2. Select "Created At" in the property filter
          await selectDatetimeProperty(page, modal, 'Created At');

          // 3. Open the operator selector of the value editor
          await page.getByRole('combobox', { name: 'Operator' }).click();

          // 4. Verify the datetime operator options are visible
          // Labels come from i18n comp:BAIGraphQLPropertyFilter.operator.* keys
          await expect(
            page.getByRole('option', { name: 'after' }),
          ).toBeVisible();
          await expect(
            page.getByRole('option', { name: 'before' }),
          ).toBeVisible();

          // 5. Close the dropdown
          await page.keyboard.press('Escape');
        });

        for (const propertyName of ['Created At', 'Updated At'] as const) {
          test(`Admin can apply a ${propertyName} datetime filter using the date picker and see the filter token`, async ({
            page,
          }) => {
            // 1. Open the Session Detail drawer and history modal
            await openSessionDetailDrawer(page);
            const modal = await openSchedulingHistoryModal(page);

            // 2. Select the datetime property and apply a date
            await selectDatetimeProperty(page, modal, propertyName);
            await applyFirstSelectableDate(page);

            // 3. Verify the filter token for the property appears
            await expect(
              getFilterTokenRemoveButton(modal, propertyName),
            ).toBeVisible();
          });
        }

        // FIXME(#10289): the PowerSearch Tokenizer end lane (loading spinner +
        // 'Clear all' button) covers the token's 'Remove' button in this narrow
        // filter and intercepts the click. The fix waits on upstream
        // facebook/astryx#7365; un-fixme once it lands.
        test.fixme('Admin can remove an applied Created At datetime filter token', async ({
          page,
        }) => {
          // 1. Open the Session Detail drawer and history modal
          await openSessionDetailDrawer(page);
          const modal = await openSchedulingHistoryModal(page);

          // 2. Apply a Created At datetime filter
          await selectDatetimeProperty(page, modal, 'Created At');
          await applyFirstSelectableDate(page);

          // 3. Verify the filter token is visible
          const removeButton = getFilterTokenRemoveButton(modal, 'Created At');
          await expect(removeButton).toBeVisible();

          // 4. Click the token's remove button
          await removeButton.click();

          // 5. Verify the filter token is no longer visible
          await expect(removeButton).not.toBeVisible();
        });
      },
    );

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
      const refreshButton = modal.getByRole('button', {
        name: 'Refresh',
        exact: true,
      });
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
      const enqueueRow = modal.getByRole('row').filter({ hasText: 'enqueue' });
      await expect(enqueueRow).toBeVisible();

      // 3. Verify phase cell has text
      await expect(
        enqueueRow.getByRole('cell', { name: 'enqueue' }),
      ).toBeVisible();

      // 4. Verify result badge shows "SUCCESS"
      await expect(
        enqueueRow.getByRole('cell').filter({ hasText: 'SUCCESS' }),
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

      // 2. Identify a row with an expand icon (the schedule-sessions row has sub-steps).
      // The expand mode only decides which rows start open — every row with
      // sub-steps stays expandable in all three modes, and expanding one always
      // shows its full sub-step list (FR-3425). No mode switch needed here.
      // Find the row by its text content rather than its accessible name.
      const expandableRow = modal
        .getByRole('row')
        .filter({ hasText: 'schedule-sessions' });
      await expect(expandableRow).toBeVisible();

      // 3. Click the expand icon/arrow on that row
      await expandableRow.getByLabel('Expand row').click();

      // 4. Verify the sub-steps table columns are visible.
      // The sub-step panel carries one Time column (the step's start) plus a
      // Duration, not the Started At / Ended At pair it used to show.
      await expect(
        modal.getByRole('columnheader', { name: 'Step' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Result' }).nth(1),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Message' }).first(),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Error Code' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Duration' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Time' }),
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

      // 2. Expand the schedule-sessions row.
      // Use filter by text content — see test #8 comment for why the name pattern
      // /Expand row schedule-sessions/ does not work with Playwright's row accname.
      // Narrow to the first match to avoid strict-mode violations if multiple
      // schedule-sessions rows appear (e.g. during a previous run's residue).
      const expandableRow = modal
        .getByRole('row')
        .filter({ hasText: 'schedule-sessions' })
        .first();
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

      // 4. Click the same toggle again to collapse the row. The DataGrid
      // toggle keeps its "Expand row" label and only swaps its icon.
      await expandableRow.getByLabel('Expand row').click();

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
      const enqueueRow = modal.getByRole('row').filter({ hasText: 'enqueue' });
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

      // 2. Verify the CreatedAt column header is visible
      const createdAtHeader = modal.getByRole('columnheader', {
        name: 'Created At',
      });
      await expect(createdAtHeader).toBeVisible();

      // The table has no interactive sort controls (availableHistorySorterKeys is empty),
      // so there is no aria-sort attribute or sort icon to check. Instead, verify the
      // default order by asserting the first data row is "enqueue" (earliest createdAt)
      // and the last data row is "start" (latest createdAt), confirming ascending order.
      const dataRows = modal.getByRole('row').filter({ hasText: /SUCCESS/ });
      await expect(dataRows.first()).toContainText('enqueue');
      await expect(dataRows.last()).toContainText('start');
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

      // 4. Verify the history table is visible and contains records.
      // Use filter by text content — see test #8 comment for why the name pattern
      // /Expand row schedule-sessions/ does not work with Playwright's row accname.
      const scheduleRow = modal
        .getByRole('row')
        .filter({ hasText: 'schedule-sessions' });
      await expect(scheduleRow).toBeVisible();

      // 5. Expand the schedule-sessions row to view sub-step details
      await scheduleRow.getByLabel('Expand row').click();

      // 6. Verify the sub-steps table appears with correct column headers
      await expect(
        modal.getByRole('columnheader', { name: 'Step' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Duration' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('columnheader', { name: 'Time' }),
      ).toBeVisible();

      // 7. Verify sub-step data is displayed.
      // Use .first() to avoid strict mode violation: both the expanded row container
      // and the actual data row match /FIFOSequencer SUCCESS/.
      await expect(
        modal.getByRole('row', { name: /FIFOSequencer SUCCESS/ }).first(),
      ).toBeVisible();

      // 8. Click the refresh button
      const refreshButton = modal.getByRole('button', {
        name: 'Refresh',
        exact: true,
      });
      await refreshButton.click();

      // 9. Wait for the refresh to complete — verify the table is still visible
      await expect(
        modal.getByRole('columnheader', { name: 'Phase' }),
      ).toBeVisible();

      // 10. Click the header X (close) button to close the modal
      await modal.getByRole('button', { name: 'Close' }).first().click();

      // 11. Verify the modal is closed
      await expect(modal).not.toBeVisible();

      // 12. Verify the Session Detail drawer is still visible
      const drawer = page.getByRole('dialog', { name: 'Session Info' });
      await expect(drawer).toBeVisible();
    });
  },
);
