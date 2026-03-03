# Session Scheduling History Modal - Comprehensive Test Plan

## Application Overview

The Session Scheduling History Modal is a feature in the Backend.AI WebUI that provides detailed scheduling history records for individual compute sessions. It is accessible from the Session Detail view (drawer) via a history button next to the session status tag.

### Key Feature Areas

- **Capability Guard**: The history button is only rendered when the backend supports the `session-scheduling-history` capability
- **Modal Display**: A large modal (90% width, max 1600px) with a full-viewport-height body
- **Property Filtering**: A `BAIGraphQLPropertyFilter` supporting 7 filter properties (ID, Phase, Result, FromStatus, ToStatus, ErrorCode, Message)
- **Data Refresh**: A `BAIFetchKeyButton` that manually refreshes history data
- **History Table**: A `BAISchedulingHistoryNodes` table with Phase, Result (colored badge), Status Transition (From/To), Attempts, UpdatedAt, and CreatedAt columns
- **Expandable Rows**: Rows with sub-steps can be expanded to show Step, Result, Message, ErrorCode, StartedAt, and EndedAt
- **Sorting**: Columns sortable by `createdAt` and `updatedAt`
- **Modal Dismissal**: Three dismissal paths — footer Close button, header X button, and clicking the modal overlay (backdrop)

### Access Path

1. Login as admin at `http://127.0.0.1:9081`
2. Navigate to `/session`
3. Click a session row to open the Session Detail drawer
4. In the drawer's Status row, click the `HistoryOutlined` icon button (tooltip: "Session Scheduling History")

### Feature Guard

The `HistoryOutlined` button and the `SessionSchedulingHistoryModal` are only rendered when
`baiClient.supports('session-scheduling-history')` is `true`. Tests that rely on real session data
(requiring a running or terminated session) must be marked `test.fixme()` due to resource constraints
in the test environment.

---

## Test Infrastructure Notes

- **Authentication**: `loginAsAdmin` (admin@lablup.com)
- **Navigation**: `navigateTo(page, 'session')`
- **Session POM**: `SessionLauncher` (create/terminate), `SessionDetailPage` (status/navigation)
- **Spec file**: `e2e/session/session-scheduling-history-modal.spec.ts`
- **Cleanup Required**: Yes — any session created during a test must be terminated in `afterEach`
- **Execution Mode**: Serial (`test.describe.configure({ mode: 'serial' })`) for tests that share session state
- **Tags**: `@session`, `@functional`, `@regression`
- **Capability Dependency**: Backend must support `session-scheduling-history` for history button to appear

---

## Test Scenarios

### 1. History Button Visibility and Access

#### 1.1 Admin can see the scheduling history button in the session detail when the backend supports the capability

**Preconditions:**
- Admin is logged in
- At least one session exists (any status: PENDING, RUNNING, TERMINATED, etc.)
- Backend supports `session-scheduling-history` capability

**Steps:**
1. Login as admin using `loginAsAdmin`
2. Navigate to the session page using `navigateTo(page, 'session')`
3. Verify the session list table is visible
4. Click on a session row to open the Session Detail drawer
5. Verify the drawer with "Session Info" heading is visible
6. In the drawer, locate the "Status" description item row
7. Verify a button with tooltip "Session Scheduling History" and the `HistoryOutlined` icon is visible next to the status tag

**Expected Results:**
- The session detail drawer opens successfully
- The "Session Scheduling History" icon button is visible alongside the session status tag
- The button has the `HistoryOutlined` icon rendered

**Notes:**
- `test.fixme()` if the test environment has no existing sessions
- If backend does not support the capability, this test should be skipped or the button should be absent (see scenario 1.2)

---

#### 1.2 Admin does not see the scheduling history button when the backend does not support the capability

**Preconditions:**
- Admin is logged in
- At least one session exists
- Backend does NOT support `session-scheduling-history` capability

**Steps:**
1. Login as admin using `loginAsAdmin`
2. Navigate to the session page using `navigateTo(page, 'session')`
3. Click on a session row to open the Session Detail drawer
4. Locate the "Status" description item row in the drawer

**Expected Results:**
- The `HistoryOutlined` icon button is NOT visible next to the status tag
- The session status tag is displayed as before without the history button
- The `SessionStatusDetailModal` info button may appear instead (legacy behavior)

**Notes:**
- This scenario tests the capability guard logic
- The status display falls back to showing `status_info` in the tag when the capability is absent

---

### 2. Modal Opening and Initial State

#### 2.1 Admin can open the Session Scheduling History modal by clicking the history button

**Preconditions:**
- Admin is logged in
- At least one session exists
- Backend supports `session-scheduling-history` capability

**Steps:**
1. Login as admin using `loginAsAdmin`
2. Navigate to the session page using `navigateTo(page, 'session')`
3. Click on a session row to open the Session Detail drawer
4. In the Status row, click the button with tooltip "Session Scheduling History" (HistoryOutlined icon)
5. Wait for the modal dialog to appear

**Expected Results:**
- A modal dialog opens with the title "Session Scheduling History"
- The modal is wide (approximately 90% of the viewport width, max 1600px)
- The modal body has full viewport height content area
- A property filter control (BAIGraphQLPropertyFilter) is visible at the top left of the modal body
- A refresh button (reload icon) is visible at the top right of the modal body
- The history table (BAISchedulingHistoryNodes) is visible below the filter controls
- The table has columns: Phase, Result, From (Status Transition), To (Status Transition), Attempts, UpdatedAt, CreatedAt
- A "Close" button is visible in the modal footer

**Notes:**
- `test.fixme()` if no sessions exist in the test environment

---

#### 2.2 Admin sees the history table with correct column headers

**Preconditions:**
- Session Scheduling History modal is open (see 2.1)

**Steps:**
1. Open the Session Scheduling History modal (follow steps from scenario 2.1)
2. Verify each column header is present in the history table

**Expected Results:**
- Column "Phase" is visible in the table header
- Column "Result" is visible in the table header
- Column group "Status Transition" with sub-columns "From" and "To" is visible
- Column "Attempts" is visible in the table header
- Column "UpdatedAt" is visible in the table header
- Column "CreatedAt" is visible in the table header

---

### 3. Modal Dismissal

#### 3.1 Admin can close the Session Scheduling History modal using the footer Close button

**Preconditions:**
- Session Scheduling History modal is open

**Steps:**
1. Open the Session Scheduling History modal (follow steps from scenario 2.1)
2. Verify the modal is visible with title "Session Scheduling History"
3. Click the "Close" button in the modal footer

**Expected Results:**
- The modal closes and is no longer visible
- The user is returned to the Session Detail drawer
- The drawer remains open (it was not closed by the modal action)

---

#### 3.2 Admin can close the Session Scheduling History modal using the X button in the header

**Preconditions:**
- Session Scheduling History modal is open

**Steps:**
1. Open the Session Scheduling History modal (follow steps from scenario 2.1)
2. Verify the modal is visible with title "Session Scheduling History"
3. Click the X (close) button in the top-right corner of the modal header

**Expected Results:**
- The modal closes and is no longer visible
- The user is returned to the Session Detail drawer

---

#### 3.3 Admin can close the Session Scheduling History modal by clicking outside (backdrop)

**Preconditions:**
- Session Scheduling History modal is open

**Steps:**
1. Open the Session Scheduling History modal (follow steps from scenario 2.1)
2. Verify the modal is visible with title "Session Scheduling History"
3. Click on the modal backdrop overlay (the dimmed area outside the modal)

**Expected Results:**
- The modal closes and is no longer visible
- The user is returned to the Session Detail drawer

---

### 4. Property Filter — Filter Controls

#### 4.1 Admin can see all available filter properties in the property filter selector

**Preconditions:**
- Session Scheduling History modal is open

**Steps:**
1. Open the Session Scheduling History modal (follow steps from scenario 2.1)
2. Click the property selector dropdown (the first select in the compact space — BAIGraphQLPropertyFilter)
3. Inspect the available options in the dropdown list

**Expected Results:**
- The following filter properties are available in the dropdown:
  - "ID" (uuid type, equals operator)
  - "Phase" (string type, contains operator)
  - "Result" (enum type with fixed values)
  - "From Status" or "FromStatus" (string scalar)
  - "To Status" or "ToStatus" (string scalar)
  - "Error Code" or "ErrorCode" (string type, contains operator)
  - "Message" (string type, contains operator)

---

#### 4.2 Admin can filter history records by Phase using the property filter

**Preconditions:**
- Session Scheduling History modal is open
- At least one scheduling history record exists

**Steps:**
1. Open the Session Scheduling History modal (follow steps from scenario 2.1)
2. In the property filter, click the property selector
3. Select "Phase" from the dropdown options
4. In the value input, type a partial phase name (e.g., "SCHEDULE")
5. Click the search/confirm button
6. Observe the table results

**Expected Results:**
- The property filter shows a chip/tag with the applied filter (e.g., "Phase: contains SCHEDULE")
- The history table is filtered to show only records whose Phase contains the entered string
- Records not matching the filter are hidden

**Notes:**
- `test.fixme()` if the test environment has no scheduling history records

---

#### 4.3 Admin can filter history records by Result enum using the property filter

**Preconditions:**
- Session Scheduling History modal is open
- At least one scheduling history record exists

**Steps:**
1. Open the Session Scheduling History modal (follow steps from scenario 2.1)
2. In the property filter, click the property selector
3. Select "Result" from the dropdown options
4. In the value input, click to open the options list (it is a strict enum select)
5. Select "SUCCESS" from the available options
6. Click the search/confirm button
7. Observe the table results

**Expected Results:**
- The property filter shows a chip/tag for Result = SUCCESS
- The history table shows only records with Result = SUCCESS
- Result badges in the filtered rows show green (success color) badges labeled "SUCCESS"

**Notes:**
- Available Result values: SUCCESS, FAILURE, STALE, NEED_RETRY, EXPIRED, GIVE_UP, SKIPPED
- `test.fixme()` if no history records exist

---

#### 4.4 Admin can remove an applied filter to restore the full history list

**Preconditions:**
- Session Scheduling History modal is open
- A filter has been applied (e.g., Phase filter from scenario 4.2)

**Steps:**
1. Open the Session Scheduling History modal and apply a Phase filter (follow steps from scenario 4.2)
2. Verify the filter chip/tag is visible and results are filtered
3. Click the X (remove) icon on the filter chip/tag to remove the filter

**Expected Results:**
- The filter chip/tag disappears from the filter area
- The history table reloads and shows all records without the filter applied
- The record count returns to the unfiltered total

---

#### 4.5 Admin can filter history records by ID (UUID) using the property filter

**Preconditions:**
- Session Scheduling History modal is open
- At least one scheduling history record exists and its UUID is known

**Steps:**
1. Open the Session Scheduling History modal (follow steps from scenario 2.1)
2. In the property filter, click the property selector
3. Select "ID" from the dropdown options
4. In the value input, paste or type a valid UUID string of a known history record
5. Click the search/confirm button
6. Observe the table results

**Expected Results:**
- The history table is filtered to show only the record matching the exact UUID
- At most one record is visible in the table

**Notes:**
- `test.fixme()` if no history records exist (UUID not known)

---

#### 4.6 Admin can filter history records by Message content using the property filter

**Preconditions:**
- Session Scheduling History modal is open
- At least one scheduling history record with a non-empty message exists

**Steps:**
1. Open the Session Scheduling History modal (follow steps from scenario 2.1)
2. In the property filter, click the property selector
3. Select "Message" from the dropdown options
4. In the value input, type a partial message string
5. Click the search/confirm button
6. Observe the table results

**Expected Results:**
- The history table is filtered to records where the message contains the entered string
- The filter chip shows "Message: contains [entered string]"

**Notes:**
- `test.fixme()` if no history records with messages exist

---

### 5. Refresh Functionality

#### 5.1 Admin can manually refresh the scheduling history data using the refresh button

**Preconditions:**
- Session Scheduling History modal is open

**Steps:**
1. Open the Session Scheduling History modal (follow steps from scenario 2.1)
2. Observe the current state of the history table
3. Click the refresh button (ReloadOutlined icon) in the top-right area of the modal body
4. Wait for the loading state to resolve (the refresh button shows a loading spinner during fetch)

**Expected Results:**
- The refresh button shows a loading/spinning icon immediately after clicking
- The loading indicator disappears once data is fetched (within a reasonable timeout)
- The history table reflects the latest data from the server
- No error messages are shown after the refresh

**Notes:**
- The `BAIFetchKeyButton` has `autoUpdateDelay={null}` meaning it does NOT auto-refresh; only manual clicks trigger a refresh

---

#### 5.2 Admin sees the refresh button in a loading state while data is being fetched

**Preconditions:**
- Session Scheduling History modal is open
- Network is not throttled but fetch takes observable time

**Steps:**
1. Open the Session Scheduling History modal
2. Click the refresh button (ReloadOutlined icon)
3. Immediately observe the button state

**Expected Results:**
- The refresh button changes to a loading state (spinning icon) immediately upon clicking
- The loading state persists for at least 700ms (minimum display time enforced by BAIFetchKeyButton)
- After loading completes, the button returns to the non-loading state

---

### 6. History Table — Data Display

#### 6.1 Admin can see history records displayed in the scheduling history table

**Preconditions:**
- Session Scheduling History modal is open
- At least one scheduling history record exists for the selected session

**Steps:**
1. Open the Session Scheduling History modal (follow steps from scenario 2.1)
2. Observe the history table content

**Expected Results:**
- At least one row is visible in the history table
- Each row displays:
  - Phase: A text string describing the scheduling phase (e.g., "PREPARE", "SCHEDULE", etc.)
  - Result: A colored badge (BAISchedulingResultBadge) with the result label
  - From (Status Transition): Source status text
  - To (Status Transition): Target status text
  - Attempts: A numeric value
  - UpdatedAt: A formatted date-time string (e.g., "Mar 3, 2026 10:00 AM")
  - CreatedAt: A formatted date-time string

**Notes:**
- `test.fixme()` if no history records exist

---

#### 6.2 Admin can see result badges with correct colors for different result values

**Preconditions:**
- Session Scheduling History modal is open
- History records with various result values exist

**Steps:**
1. Open the Session Scheduling History modal (follow steps from scenario 2.1)
2. Observe the Result column in the history table
3. Identify rows with different Result values

**Expected Results:**
- SUCCESS result shows a green (success) colored badge dot
- FAILURE result shows a red (error) colored badge dot
- STALE result shows a default (grey) colored badge dot
- NEED_RETRY result shows a warning (orange) colored badge dot
- EXPIRED result shows a red (error) colored badge dot
- GIVE_UP result shows a red (error) colored badge dot
- SKIPPED result shows a default (grey) colored badge dot

**Notes:**
- `test.fixme()` if history data is insufficient to cover all result types

---

#### 6.3 Admin sees an empty table state when no scheduling history exists for a session

**Preconditions:**
- Admin is logged in
- A newly created session exists with no scheduling history records yet
- Backend supports `session-scheduling-history` capability

**Steps:**
1. Login as admin using `loginAsAdmin`
2. Navigate to the session page using `navigateTo(page, 'session')`
3. Click on a session row (preferably a newly created session)
4. Click the "Session Scheduling History" history button
5. Observe the history table

**Expected Results:**
- The modal opens successfully
- The history table shows an empty state (no rows)
- An empty state indicator (e.g., empty table placeholder) is visible
- No error messages are shown

**Notes:**
- `test.fixme()` if it is not possible to reliably identify a session with no history

---

### 7. Expandable Rows — Sub-Step Details

#### 7.1 Admin can expand a history row to view sub-step details when sub-steps exist

**Preconditions:**
- Session Scheduling History modal is open
- At least one history record with sub-steps exists (sub-steps are non-empty)

**Steps:**
1. Open the Session Scheduling History modal (follow steps from scenario 2.1)
2. In the history table, identify a row that has an expand icon (indicating it has sub-steps)
3. Click the expand icon/arrow on that row

**Expected Results:**
- The row expands to reveal a nested sub-steps table below the parent row
- The sub-steps table contains columns: Step, Result, Message, ErrorCode, StartedAt, EndedAt
- At least one sub-step row is visible
- Each sub-step row shows:
  - Step: A step identifier string
  - Result: A colored badge (BAISchedulingResultBadge) or "-" if null
  - Message: A truncated message text or "-" if empty
  - ErrorCode: Monospace error code text or "-" if empty
  - StartedAt: A formatted date-time or "-" if null
  - EndedAt: A formatted date-time or "-" if null

**Notes:**
- `test.fixme()` if no history records with sub-steps exist in the test environment

---

#### 7.2 Admin cannot expand a history row when no sub-steps exist

**Preconditions:**
- Session Scheduling History modal is open
- At least one history record exists with no sub-steps

**Steps:**
1. Open the Session Scheduling History modal (follow steps from scenario 2.1)
2. In the history table, identify a row without an expand icon
3. Observe the row expand control state

**Expected Results:**
- The row does not show an expand icon/arrow
- Clicking the row does not expand any sub-rows
- The row remains in its collapsed single-row presentation

**Notes:**
- `test.fixme()` if all history records have sub-steps or no records exist

---

#### 7.3 Admin can collapse an expanded sub-step row by clicking the expand icon again

**Preconditions:**
- A history row is expanded (sub-steps are visible)

**Steps:**
1. Open the Session Scheduling History modal and expand a row with sub-steps (follow steps from scenario 7.1)
2. Verify the sub-steps table is visible
3. Click the expand icon/arrow again on the same row to collapse it

**Expected Results:**
- The sub-steps table collapses and is no longer visible
- The parent row returns to its normal single-row presentation

---

### 8. Sorting

#### 8.1 Admin can sort the history table by the CreatedAt column

**Preconditions:**
- Session Scheduling History modal is open
- Multiple history records exist

**Steps:**
1. Open the Session Scheduling History modal (follow steps from scenario 2.1)
2. Verify the CreatedAt column header is visible and has a sorter indicator
3. Click the "CreatedAt" column header to sort ascending
4. Observe the row order
5. Click the "CreatedAt" column header again to sort descending
6. Observe the row order again

**Expected Results:**
- After the first click: Rows are sorted by CreatedAt in ascending order (oldest first)
- After the second click: Rows are sorted by CreatedAt in descending order (newest first)
- The sort indicator (arrow) in the column header reflects the current sort direction

**Notes:**
- The default sort order on modal open is ascending by `createdAt`
- `test.fixme()` if fewer than two history records exist

---

#### 8.2 Admin can sort the history table by the UpdatedAt column

**Preconditions:**
- Session Scheduling History modal is open
- Multiple history records exist

**Steps:**
1. Open the Session Scheduling History modal (follow steps from scenario 2.1)
2. Verify the UpdatedAt column header is visible and has a sorter indicator
3. Click the "UpdatedAt" column header to sort ascending
4. Observe the row order
5. Click the "UpdatedAt" column header again to sort descending
6. Observe the row order again

**Expected Results:**
- After the first click: Rows are sorted by UpdatedAt in ascending order
- After the second click: Rows are sorted by UpdatedAt in descending order
- The sort indicator reflects the current sort direction

**Notes:**
- `test.fixme()` if fewer than two history records exist

---

#### 8.3 Admin sees the history table sorted by CreatedAt ascending by default on modal open

**Preconditions:**
- Session Scheduling History modal is open
- Multiple history records exist with different createdAt values

**Steps:**
1. Open the Session Scheduling History modal (follow steps from scenario 2.1)
2. Do not interact with any sort controls
3. Observe the default sort order of the CreatedAt column

**Expected Results:**
- The CreatedAt column sort indicator shows ascending order by default
- Records are ordered from oldest (top) to newest (bottom) by creation time

**Notes:**
- The default `order` state is `'createdAt'` (ascending) as defined in the component
- `test.fixme()` if fewer than two history records exist

---

### 9. Full End-to-End Workflow

#### 9.1 Admin can open, filter, expand, refresh, and close the Session Scheduling History modal in a complete workflow

**Preconditions:**
- Admin is logged in
- A session with scheduling history records (including sub-steps) exists
- Backend supports `session-scheduling-history` capability

**Steps:**
1. Login as admin using `loginAsAdmin`
2. Navigate to the session page using `navigateTo(page, 'session')`
3. Click on a session row to open the Session Detail drawer
4. In the Status row, click the "Session Scheduling History" history button
5. Verify the modal opens with title "Session Scheduling History"
6. Verify the history table is visible and contains records
7. Apply a Phase filter by selecting "Phase" in the property filter and typing a search term
8. Verify the table updates to show filtered results
9. Remove the Phase filter by clicking the X on the filter chip
10. Verify the table shows all records again
11. Sort by "UpdatedAt" ascending by clicking the column header
12. Verify the sort order changes
13. Expand a row that has sub-steps by clicking its expand icon
14. Verify the sub-step table appears with Step, Result, Message, ErrorCode, StartedAt, EndedAt columns
15. Click the refresh button (ReloadOutlined icon)
16. Verify the refresh button shows loading and then resolves
17. Click the "Close" button in the modal footer
18. Verify the modal closes

**Expected Results:**
- All steps execute without errors
- Filter, sort, expand, and refresh operations all work correctly
- The modal can be closed via the footer button
- The Session Detail drawer remains open after modal closes

**Notes:**
- `test.fixme()` due to resource constraints (requires session with history data)
- This is the primary happy-path integration test

---

## Test Infrastructure Notes

- **Cleanup Required**: Yes — sessions created during tests must be terminated in `afterEach`
- **Execution Mode**: Serial (`test.describe.configure({ mode: 'serial' })`) for tests that share a single session
- **Tags**: `@session`, `@functional`, `@regression`
- **Capability Requirement**: Backend must support `session-scheduling-history` for the history button to appear; tests depending on this should use `test.skip` with a capability check or `test.fixme()` if the environment cannot be guaranteed
- **Resource Constraints**: Tests requiring actual scheduling history data (scenarios in groups 6, 7, 8, 9) are marked `test.fixme()` because the test environment may not have agent resources to run sessions that generate history records

---

## Suggested Test File Location and Structure

**File**: `e2e/session/session-scheduling-history-modal.spec.ts`

```typescript
// spec: SessionSchedulingHistoryModal-Test-Plan.md
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { SessionLauncher } from '../utils/classes/session/SessionLauncher';
import { test, expect } from '@playwright/test';

test.describe(
  'SessionSchedulingHistoryModal - Admin Scheduling History Access',
  { tag: ['@session', '@functional', '@regression'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    let sessionLauncher: SessionLauncher;

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'session');
      sessionLauncher = new SessionLauncher(page);
    });

    test.afterEach(async ({ page }) => {
      // Cleanup: terminate created session if it exists
      if (sessionLauncher?.getSessionName()) {
        try {
          await sessionLauncher.terminate();
        } catch (error) {
          console.log('Cleanup: failed to terminate session', error);
        }
      }
    });

    // --- Scenarios are implemented here based on the test plan above ---
  },
);
```

### Proposed Page Object Model

**File**: `e2e/utils/classes/session/SessionSchedulingHistoryModal.ts`

This POM class should extend `BaseModal` and provide:
- `waitForModalOpen()` — waits for the dialog with title "Session Scheduling History" to be visible
- `waitForModalClose()` — waits for the dialog to be hidden
- `getModal()` — returns the modal dialog locator
- `clickClose()` — clicks the footer "Close" button
- `clickXButton()` — clicks the header X close button
- `clickRefresh()` — clicks the refresh (ReloadOutlined) button
- `getPropertyFilterContainer()` — returns the BAIGraphQLPropertyFilter container locator
- `selectFilterProperty(propertyName: string)` — selects a filter property from the dropdown
- `enterFilterValue(value: string)` — fills the filter value input
- `clickFilterSearch()` — clicks the search/confirm button in the filter
- `removeFilter(filterLabel: string)` — removes an applied filter chip
- `getHistoryTable()` — returns the history table locator
- `getHistoryRows()` — returns all history row locators
- `expandRow(rowIndex: number)` — clicks the expand icon on a row
- `getSubStepRows(rowIndex: number)` — returns sub-step rows for an expanded row
- `clickSortColumn(columnName: string)` — clicks a column header to toggle sort
