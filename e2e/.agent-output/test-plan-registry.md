# Container Registry - Comprehensive E2E Test Plan

## Application Overview

The Container Registry section is part of the `/environment` page, accessible via the **Registries** tab under Admin Settings > Environments. It allows superadmins to manage Docker-compatible container registries used as image sources for Backend.AI compute sessions.

Key features:

- **Registry List Table**: Displays all registered container registries with columns: Registry Name, Registry URL, Type, Project, Username, Password, Enabled (toggle switch), and Control (Edit/Delete/Rescan buttons)
- **Add Registry**: A modal form to add new registries with fields: Registry Name, Registry URL (must start with `http://` or `https://`), Username (optional), Password (optional), Registry Type (select), Project Name, Is Global checkbox (checked by default), and Allowed Projects multi-select (visible only when Is Global is unchecked)
- **Edit Registry**: Opens the same modal pre-filled with existing values; Registry Name field is disabled. Includes a "Change Password" checkbox to enable password editing
- **Enable/Disable**: Switch toggle in the Enabled column that adds/removes the registry from the domain's allowed docker registries
- **Delete Registry**: Confirmation dialog requiring the user to type the registry name exactly before the Delete button is enabled
- **Filter**: BAIPropertyFilter supporting filtering by Registry Name (free text)
- **Rescan**: Sync button in Control column to trigger image rescan for a registry
- **URL**: `http://localhost:9082/environment?tab=registry`

## Test Infrastructure Notes

- **Seed File**: None – registries used in tests are created within `e2e/environment/registry.spec.ts` as part of the test setup
- **Test File**: `e2e/environment/registry.spec.ts`
- **Cleanup Strategy**: CRUD tests (Suite 2) include a `test.afterAll` cleanup hook that deletes the test registry if it still exists, ensuring the environment stays clean even when earlier tests fail
- **Execution Mode**: Suite 2 (CRUD) is serial; Suites 1, 3, 4 are independent and can run in parallel
- **Tags**: `@regression`, `@environment`, `@functional`, `@registry`
- **Authentication**: `loginAsAdmin` for all tests

---

## Suite 1: Registry List Rendering

**Execution mode**: Parallel (independent tests)

**Setup (beforeEach)**:
1. Call `loginAsAdmin(page, request)`
2. Click the `Admin Settings` menu item
3. Click the `file-done Environments` menu item
4. Click the `Registries` tab
5. Wait for `page.getByRole('table')` to be visible

---

### 1.1 Admin can see the registry table with all expected columns

**Steps**:
1. Verify the registry table (`page.getByRole('table')`) is visible
2. Verify the `Registry Name` column header is visible
3. Verify the `Registry URL` column header is visible
4. Verify the `Type` column header is visible
5. Verify the `Project` column header is visible
6. Verify the `Username` column header is visible
7. Verify the `Password` column header is visible
8. Verify the `Enabled` column header is visible
9. Verify the `Control` column header is visible

**Expected Results**:
- All 8 column headers are visible in the table
- At least one registry row is visible in the table body

---

### 1.2 Admin can see the Add Registry button

**Steps**:
1. Verify the `Add Registry` button (with plus icon) is visible in the toolbar area
2. Verify the BAIPropertyFilter (combobox with label `Filter property selector`) is visible
3. Verify the Refresh (reload) button is visible

**Expected Results**:
- `Add Registry` button is visible and enabled
- The filter combobox and refresh button are present

---

### 1.3 Admin can see the Enabled toggle switch in each registry row

**Steps**:
1. Verify the registry table has at least one row
2. For the first registry row, verify a `switch` (toggle) element exists in the `Enabled` column

**Expected Results**:
- The Enabled column contains a switch toggle for each row
- The switch reflects the enabled/disabled state of the registry

---

### 1.4 Admin can see the Control buttons (Edit, Delete, Rescan) in each registry row

**Steps**:
1. Verify the first registry row's Control cell contains a `setting` icon button (Edit)
2. Verify the first registry row's Control cell contains a `delete` icon button (Delete)
3. Verify the first registry row's Control cell contains a `sync` icon button (Rescan)

**Expected Results**:
- All three control buttons are present for each registry row

---

## Suite 2: Registry CRUD

**Execution mode**: Serial (`test.describe.configure({ mode: 'serial' })`)

**Test data**:
```typescript
const TEST_RUN_ID = Date.now().toString(36);
const REGISTRY_NAME = `e2e-test-registry-${TEST_RUN_ID}`;
const REGISTRY_URL = 'https://registry.example.com';
const REGISTRY_URL_MODIFIED = 'https://registry-modified.example.com';
const PROJECT_NAME = 'test-project';
const PROJECT_NAME_MODIFIED = 'test-project-modified';
```

**Setup (beforeEach)**:
1. Call `loginAsAdmin(page, request)`
2. Click the `Admin Settings` menu item
3. Click the `file-done Environments` menu item
4. Click the `Registries` tab
5. Wait for `page.getByRole('table')` to be visible

**Cleanup (afterAll)**:
- If the test registry still exists in the table (search by name using the filter), delete it by clicking its Delete button, typing the registry name in the confirmation input, and confirming deletion

---

### 2.1 Admin can add a new registry with required fields only

**Steps**:
1. Click the `Add Registry` button
2. Verify the `Add Registry` dialog is visible with title "Add Registry"
3. Verify the `Is Global` checkbox is checked by default
4. Fill in the **Registry Name** field with `REGISTRY_NAME`
5. Fill in the **Registry URL** field with `REGISTRY_URL`
6. Select `docker` from the **Registry Type** dropdown
7. Fill in the **Project Name** field with `PROJECT_NAME`
8. Click the `Add` button
9. Wait for the success notification "Registry successfully added." to appear

**Expected Results**:
- The modal closes after successful submission
- A success message "Registry successfully added." is displayed
- The dialog closes and the table is visible

---

### 2.2 Admin can see the new registry in the table

**Steps**:
1. Apply the BAIPropertyFilter: select `Registry Name` as the filter property, type `REGISTRY_NAME`, and click the search button
2. Verify a filter tag `Registry Name: REGISTRY_NAME` appears
3. Verify a row with the registry name `REGISTRY_NAME` is visible in the table
4. Verify the row shows `REGISTRY_URL` in the Registry URL column
5. Verify the row shows `docker` in the Type column
6. Verify the row shows `PROJECT_NAME` (as a tag) in the Project column
7. Remove the filter tag by clicking its Close button

**Expected Results**:
- The newly created registry appears in the filtered results
- All field values match what was entered during creation

---

### 2.3 Admin can edit the registry URL and project name

**Steps**:
1. Apply the BAIPropertyFilter to locate the `REGISTRY_NAME` row
2. In the `REGISTRY_NAME` row, click the `setting` (Edit) button in the Control column
3. Verify the `Modify Registry` dialog is visible with title "Modify Registry"
4. Verify the **Registry Name** field is disabled and shows `REGISTRY_NAME`
5. Clear and fill the **Registry URL** field with `REGISTRY_URL_MODIFIED`
6. Clear and fill the **Project Name** field with `PROJECT_NAME_MODIFIED`
7. Click the `Save` button
8. Wait for the success notification "Registry successfully modified." to appear
9. Remove the filter tag

**Expected Results**:
- The modal closes after saving
- A success message "Registry successfully modified." is displayed
- The dialog closes

---

### 2.4 Admin can see the modified registry values in the table

**Steps**:
1. Apply the BAIPropertyFilter to locate the `REGISTRY_NAME` row
2. Verify the row shows `REGISTRY_URL_MODIFIED` in the Registry URL column
3. Verify the row shows `PROJECT_NAME_MODIFIED` (as a tag) in the Project column
4. Remove the filter tag

**Expected Results**:
- The table reflects the updated values after editing

---

### 2.5 Admin can see the Is Global checkbox is checked by default for new registries

**Steps**:
1. Click the `Add Registry` button
2. Verify the `Add Registry` dialog is visible
3. Verify the **Set as Global Registry** checkbox (labeled "Allow access from all projects") is **checked** by default
4. Verify the **Allowed Projects** field is **not visible** when Is Global is checked
5. Click `Cancel` to close the modal

**Expected Results**:
- The Is Global checkbox is checked by default for new registries
- The Allowed Projects field is hidden when Is Global is checked

---

### 2.6 Admin can uncheck Is Global and see the Allowed Projects field appear

**Steps**:
1. Click the `Add Registry` button
2. Verify the `Add Registry` dialog is visible
3. Uncheck the **Set as Global Registry** checkbox
4. Verify the **Allowed Projects** multi-select field appears in the form
5. Verify the **Allowed Projects** label is visible
6. Verify the Allowed Projects field contains a "Select Project" placeholder
7. Click `Cancel` to close the modal

**Expected Results**:
- The Allowed Projects field becomes visible after unchecking Is Global
- The field shows a multi-select dropdown with project options

---

### 2.7 Admin can delete the registry with correct name confirmation

**Steps**:
1. Apply the BAIPropertyFilter to locate the `REGISTRY_NAME` row
2. In the `REGISTRY_NAME` row, click the `delete` (Delete) button in the Control column
3. Verify the confirmation dialog appears with title containing "WARNING: this cannot be undone!"
4. Verify the dialog shows the registry name in a code element
5. Verify the `Delete` button is disabled initially
6. Type `REGISTRY_NAME` exactly in the confirmation text input
7. Verify the `Delete` button becomes enabled
8. Click the `Delete` button
9. Wait for the success notification "Registry successfully deleted." to appear
10. Remove the filter tag
11. Re-apply the filter for `REGISTRY_NAME` and verify no matching rows are visible (table shows empty state)
12. Remove the filter tag

**Expected Results**:
- The registry is removed from the table after deletion
- Success notification "Registry successfully deleted." is shown

---

## Suite 3: Registry Controls

**Execution mode**: Parallel (independent tests)

**Setup (beforeEach)**:
1. Call `loginAsAdmin(page, request)`
2. Click the `Admin Settings` menu item
3. Click the `file-done Environments` menu item
4. Click the `Registries` tab
5. Wait for `page.getByRole('table')` to be visible

---

### 3.1 Admin can toggle registry from disabled to enabled

**Assumptions**: At least one registry exists in the table that is currently disabled (switch is unchecked). The test uses the first row with an unchecked switch, or falls back to toggling an enabled one and restoring.

**Steps**:
1. Locate the first registry row in the table
2. Record the current state of the `switch` toggle in the `Enabled` column
3. Click the `switch` toggle to change its state
4. Wait for the success notification `Registry enabled` or `Registry disabled` to appear (depending on the new state)
5. Verify the switch reflects the new state after the mutation completes
6. Click the `switch` toggle again to restore the original state
7. Wait for the success notification confirming the restore

**Expected Results**:
- Toggling the switch triggers a domain mutation
- The success notification confirms the state change
- The switch visually reflects the new enabled/disabled state

---

### 3.2 Admin cannot delete a registry without entering the correct name

**Steps**:
1. Locate the first registry row in the table
2. Note the registry name displayed in the `Registry Name` column
3. Click the `delete` (Delete) button in the Control column for the first row
4. Verify the confirmation dialog appears
5. Verify the `Delete` button is disabled initially (no text entered)
6. Type a partial or incorrect registry name (e.g., `wrong-name`) in the confirmation input
7. Verify the `Delete` button remains disabled
8. Clear the input field
9. Verify the `Delete` button remains disabled
10. Click `Cancel` to close the dialog without deleting

**Expected Results**:
- The Delete button is disabled when the input is empty or incorrect
- The Delete button is only enabled when the exact registry name is typed
- Canceling the dialog does not delete the registry

---

### 3.3 Admin can cancel the delete confirmation dialog without deleting

**Steps**:
1. Locate the first registry row and note its registry name
2. Click the `delete` button in the Control column for the first row
3. Verify the confirmation dialog is visible
4. Click the `Cancel` button in the dialog
5. Verify the dialog closes
6. Verify the registry row is still visible in the table

**Expected Results**:
- Clicking Cancel closes the dialog without performing any deletion
- The registry remains in the table

---

### 3.4 Admin can open the Modify Registry dialog for an existing registry

**Steps**:
1. Locate the first registry row in the table
2. Note the registry name shown in the `Registry Name` column
3. Click the `setting` (Edit) button in the Control column
4. Verify the `Modify Registry` dialog opens with title "Modify Registry"
5. Verify the **Registry Name** text field is **disabled** (read-only)
6. Verify the **Registry URL** field is pre-filled with the registry's URL
7. Verify the **Registry Type** select is pre-filled with the registry's type
8. Verify the **Change Password** checkbox is visible (not present in Add modal)
9. Verify the **Password** field is disabled (until Change Password is checked)
10. Click `Cancel` to close the dialog

**Expected Results**:
- The edit modal is pre-populated with existing registry values
- Registry Name is disabled (cannot be changed during edit)
- The Change Password checkbox is shown in edit mode only
- The password field is disabled until Change Password is checked

---

### 3.5 Admin can enable the password field by checking Change Password

**Steps**:
1. Click the `setting` (Edit) button on the first registry row
2. Verify the `Modify Registry` dialog is open
3. Verify the Password field is disabled
4. Check the `Change Password` checkbox
5. Verify the Password field becomes enabled (editable)
6. Click `Cancel` to close without saving

**Expected Results**:
- The password field transitions from disabled to enabled when Change Password is checked
- No changes are made when Cancel is clicked

---

## Suite 4: Registry Filtering

**Execution mode**: Parallel (independent tests)

**Setup (beforeEach)**:
1. Call `loginAsAdmin(page, request)`
2. Click the `Admin Settings` menu item
3. Click the `file-done Environments` menu item
4. Click the `Registries` tab
5. Wait for `page.getByRole('table')` to be visible
6. Wait for `page.getByRole('combobox', { name: 'Filter property selector' })` to be visible

---

### 4.1 Admin can filter registries by name using a partial text value

**Assumptions**: At least one registry exists whose name contains the letter "c" (e.g., `cr.backend.ai`).

**Steps**:
1. Click the `Filter property selector` combobox
2. Select the `Registry Name` option
3. Type `cr` in the `Filter value search` input
4. Click the `search` button
5. Verify a filter tag `Registry Name: cr` appears below the filter bar
6. Verify the table is still visible and shows filtered results
7. Verify all visible registry rows have names containing `cr`
8. Click the Close icon on the `Registry Name: cr` filter tag to remove it
9. Verify the filter tag disappears

**Expected Results**:
- The filter tag appears after applying the filter
- The table shows only matching registries
- Removing the tag restores the unfiltered table

---

### 4.2 Admin sees empty state when filtering by a non-existent registry name

**Steps**:
1. Click the `Filter property selector` combobox
2. Select the `Registry Name` option
3. Type `zzz-nonexistent-registry-999` in the `Filter value search` input
4. Click the `search` button
5. Verify a filter tag `Registry Name: zzz-nonexistent-registry-999` appears
6. Verify the table shows an empty state (Ant Design `No data` placeholder visible)
7. Click the Close icon on the filter tag to remove it
8. Verify the filter tag disappears
9. Verify the table rows reappear (registry data is restored)

**Expected Results**:
- Filtering by a non-existent name results in an empty table
- Removing the filter restores all registry rows

---

### 4.3 Admin can clear the filter tag and restore the full registry list

**Steps**:
1. Apply the BAIPropertyFilter: select `Registry Name`, type `cr`, click search
2. Verify the filter tag `Registry Name: cr` is visible
3. Verify the table shows filtered results
4. Click the Close icon on the `Registry Name: cr` filter tag
5. Verify the filter tag is no longer visible
6. Verify the table shows the full list of registries (more rows than with the filter applied)

**Expected Results**:
- The filter is cleared and the table returns to the unfiltered state

---

### 4.4 Admin can see the filter property selector dropdown contains Registry Name option

**Steps**:
1. Click the `Filter property selector` combobox to open the dropdown
2. Verify the dropdown option `Registry Name` is visible in the list
3. Press `Escape` to close the dropdown without selecting

**Expected Results**:
- The BAIPropertyFilter for the Registries tab only exposes "Registry Name" as a filterable property
- The dropdown contains the correct options for the registry list context

---

## Appendix: Locator Reference

Based on live exploration of the application at `http://localhost:9082/environment?tab=registry`:

| Element | Locator |
|---------|---------|
| Registries tab | `page.getByRole('tab', { name: /Registries/i })` |
| Registry table | `page.getByRole('table')` |
| Add Registry button | `page.getByRole('button', { name: 'plus Add Registry' })` |
| Refresh button | `page.getByRole('button', { name: 'reload' })` |
| Filter property selector | `page.getByRole('combobox', { name: 'Filter property selector' })` |
| Filter value search | `page.locator('[aria-label="Filter value search"]')` or `page.getByRole('combobox', { name: 'Filter value search' })` |
| Filter search button | `page.getByRole('button', { name: 'search' })` |
| Add Registry dialog | `page.getByRole('dialog', { name: 'Add Registry' })` |
| Modify Registry dialog | `page.getByRole('dialog', { name: 'Modify Registry' })` |
| Delete confirmation dialog | `page.getByRole('dialog').filter({ hasText: 'cannot be undone' })` |
| Registry Name field (add) | `page.getByRole('textbox', { name: 'Registry Name' })` |
| Registry URL field | `page.getByRole('textbox', { name: 'Registry URL' })` |
| Registry Type select | `page.getByRole('combobox', { name: 'Registry Type' })` |
| Project Name field | `page.getByRole('textbox', { name: 'Project Name' })` |
| Is Global checkbox | `page.getByRole('checkbox', { name: /Set as Global Registry/ })` |
| Allowed Projects multi-select | `page.getByRole('combobox', { name: /Allowed Projects/ })` |
| Change Password checkbox (edit) | `page.getByRole('checkbox', { name: 'Change Password' })` |
| Delete confirmation input | `page.getByRole('dialog').filter({ hasText: 'cannot be undone' }).getByRole('textbox')` |
| Enabled switch (row) | Row locator `.getByRole('switch')` |
| Edit button (row) | Row locator `.getByRole('button', { name: 'setting' })` |
| Delete button (row) | Row locator `.getByRole('button', { name: 'delete' })` |
| Rescan button (row) | Row locator `.getByRole('button', { name: 'sync' })` |
| Add button (modal) | `dialog.getByRole('button', { name: 'Add' })` |
| Save button (modal) | `dialog.getByRole('button', { name: 'Save' })` |
| Cancel button (modal) | `dialog.getByRole('button', { name: 'Cancel' })` |
| Delete button (confirm dialog) | `confirmDialog.getByRole('button', { name: 'Delete' })` |

## Helper Function: applyRegistryFilter

```typescript
async function applyRegistryFilter(page: Page, value: string) {
  await page.getByRole('combobox', { name: 'Filter property selector' }).click();
  await page.getByRole('option', { name: 'Registry Name', exact: true }).click();
  await page.locator('[aria-label="Filter value search"]').fill(value);
  await page.getByRole('button', { name: 'search' }).click();
  await page
    .locator('.ant-spin-spinning')
    .waitFor({ state: 'detached', timeout: 10000 })
    .catch(() => {});
}

async function removeRegistryFilterTag(page: Page, tagText: string) {
  const tag = page
    .locator('.ant-tag')
    .filter({ has: page.locator('[aria-label="Close"]') })
    .filter({ hasText: tagText });
  await tag.locator('[aria-label="Close"]').click();
  await page
    .locator('.ant-spin-spinning')
    .waitFor({ state: 'detached', timeout: 10000 })
    .catch(() => {});
}
```
