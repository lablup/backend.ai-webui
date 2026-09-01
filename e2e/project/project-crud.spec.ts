// spec: e2e/.agent-output/test-plan-project.md
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { clickRowAction } from '../utils/user-profile-util';
import test, { expect, Page } from '@playwright/test';

const TEST_RUN_ID = Date.now().toString(36);
const PROJECT_DESCRIPTION = 'Test project for E2E';
const UPDATED_DESCRIPTION = 'Updated E2E description';

// Each CRUD test provisions its own uniquely-named project so that edit,
// filter and delete no longer depend on a create test having run first.
// TEST_RUN_ID keeps names unique across runs; the per-test label keeps them
// unique within a run.
function projectName(label: string) {
  return `e2e-test-project-${TEST_RUN_ID}-${label}`;
}

// `BAICard`'s `tabList` renders a `nav[aria-label="Tabs"]` of plain
// `<button>`s (BAITabList / Astryx `TabList`), never ARIA `tab` elements —
// the same contract rbac-role-list.spec.ts and registry.spec.ts already use.
// The active one carries `aria-current="true"` in place of `aria-selected`.
function projectsTab(page: Page) {
  return page
    .getByRole('navigation', { name: 'Tabs' })
    .getByRole('button', { name: 'Projects' });
}

// A BAITable column header's accessible NAME is built from its sort and
// resize controls ("Sort by name Resize column name"), so it no longer equals
// the visible label; match the header's TEXT instead.
function projectColumnHeader(page: Page, label: string) {
  return page.getByRole('columnheader').filter({ hasText: label });
}

// Not serial: each CRUD test provisions and cleans up its own uniquely-named
// project, so the tests are order-independent and a failure in one does not
// cascade-skip the others. `mode: 'default'` only removes serial's cascade-skip
// — it does not by itself pin execution to a single worker: under the project's
// `fullyParallel: true` these tests can run concurrently locally and run
// sequentially on CI (`workers: 1`). The independence above makes both safe.
test.describe.configure({ mode: 'default' });

// Cleanup function to delete a test project if it exists.
// The project lifecycle is: Active → Deactivated (trash) → Purged (hard delete).
// This helper handles all lifecycle states: if the project is active it
// deactivates it first, then switches to the Inactive tab and purges it.
async function cleanupTestProject(page: Page, projectName: string) {
  // Check Active tab first
  const activeProjectRow = page
    .getByRole('row')
    .filter({ hasText: projectName });
  const isActiveVisible = await activeProjectRow
    .isVisible({ timeout: 2000 })
    .catch(() => false);

  if (isActiveVisible) {
    // Deactivate first (Popconfirm flow). Row actions expose their title as
    // the button's `aria-label` (BAINameActionCell), so target by name —
    // index-based selection breaks when optional actions (e.g. "Set Project
    // Admin" on managers >= 26.8) are prepended.
    //
    // Go through `clickRowAction`: how many actions stay inline vs. collapse
    // into the "More actions" overflow depends on the rendered column widths.
    // BAINameActionCell only reveals them on hover, and this table is ~2500px
    // wide against a 1280px viewport, so scroll the row into view first —
    // otherwise `click()`'s own scroll moves the row out from under the
    // pointer and the buttons hide again mid-click. Retry the whole
    // reveal→confirm step, the same way rbac-role-detail.spec.ts's cleanup
    // does.
    await expect(async () => {
      await activeProjectRow.scrollIntoViewIfNeeded();
      await clickRowAction(page, activeProjectRow, 'Deactivate');
      // The deactivate confirm is an anchored `BAIPopconfirm`-style popover
      // rendered with `role="dialog"` (`BAINameActionCell.tsx`), accessible
      // name = the row action's title ("Deactivate").
      const deactivatePopconfirm = page.getByRole('dialog', {
        name: 'Deactivate',
      });
      await expect(deactivatePopconfirm).toBeVisible({ timeout: 5000 });
      await deactivatePopconfirm
        .getByRole('button', { name: 'Deactivate' })
        .click();
      await expect(activeProjectRow).toBeHidden({ timeout: 10000 });
    }).toPass({ timeout: 60000 });
  }

  // Switch to Inactive tab and purge. `BAIRadioGroup` renders on Astryx
  // `SegmentedControl`, whose options are `<button role="radio">` with no
  // `<label>` wrapper (see `BAIRadioGroup.tsx`).
  await page.getByRole('radio', { name: 'Inactive', exact: true }).click();
  const inactiveProjectRow = page
    .getByRole('row')
    .filter({ hasText: projectName });
  const isInactiveVisible = await inactiveProjectRow
    .isVisible({ timeout: 5000 })
    .catch(() => false);

  if (isInactiveVisible) {
    // The Inactive tab shows 3 row actions (Edit, Activate, Purge), one more
    // than the Active tab fits directly, so Purge collapses into the
    // "More actions" overflow menu (`BAINameActionCell`). `clickRowAction`
    // handles both the directly-visible and overflowed cases.
    await clickRowAction(page, inactiveProjectRow, 'Purge');
    const purgeDialog = page.getByRole('dialog', { name: 'Purge Project' });
    await expect(purgeDialog).toBeVisible({ timeout: 5000 });
    // `BAIDeleteConfirmModal`'s confirm input has no `#confirmText` id in the
    // DOM; it is the dialog's only textbox, labeled "Type {name} to confirm.".
    await purgeDialog.getByRole('textbox').fill(projectName);
    await purgeDialog.getByRole('button', { name: 'Purge' }).click();
    await expect(inactiveProjectRow).toBeHidden({ timeout: 10000 });
  }

  // Return to Active tab for subsequent tests. `exact: true` is required —
  // Playwright's accessible-name match is substring-based, so a bare
  // { name: 'Active' } also matches the "Inactive" radio.
  await page.getByRole('radio', { name: 'Active', exact: true }).click();
}

// Creation helper — extracted so each test can provision its own project.
// Assumes the caller is already on the project page; pre-cleans any leftover
// project of the same name (retry safety), creates it and verifies it appears.
async function createProject(page: Page, name: string, description: string) {
  await cleanupTestProject(page, name);

  // Click the Create Project button
  await page.getByRole('button', { name: 'Create Project' }).click();

  // Verify Create Project dialog appears
  const modal = page.getByRole('dialog', { name: 'Create Project' });
  await expect(modal).toBeVisible();

  // Fill in the project name and description
  await modal.getByRole('textbox', { name: 'Name' }).fill(name);
  await modal.getByRole('textbox', { name: 'Description' }).fill(description);

  // Select Domain 'default'. `BAIDomainSelect` renders as a Selector trigger
  // `button` (not a `combobox`) whose accessible name concatenates the field
  // label with the placeholder ("Domain Select Domain") — match the label as
  // a substring rather than exactly.
  await modal.getByRole('button', { name: 'Domain' }).click();
  await page.getByRole('option', { name: 'default', exact: true }).click();

  // Click OK to create and verify the modal closes
  await modal.getByRole('button', { name: 'OK' }).click();
  await expect(modal).toBeHidden({ timeout: 10000 });

  // Verify the new project appears in the table. The name column renders via
  // BAINameActionCell so the cell's accessible name also includes hover-only
  // action labels; match by filter({ hasText }) instead of exact name.
  await expect(page.getByRole('row').filter({ hasText: name })).toBeVisible({
    timeout: 10000,
  });
}

// Independent of the CRUD tests: only reads the default project list, so a
// CRUD failure must not skip it (extracted from the serial block in FR-3113).
test.describe(
  'Project List',
  { tag: ['@critical', '@project', '@functional'] },
  () => {
    test('Admin can see project list with expected columns', async ({
      page,
      request,
    }) => {
      // 1. Login as admin and navigate to project page
      await loginAsAdmin(page, request);
      await navigateTo(page, 'project');

      // 2. Verify the Projects tab is selected (BAICard tabList label renamed
      // "Project" -> "Projects", see webui.menu.Projects in ProjectPage.tsx)
      await expect(projectsTab(page)).toBeVisible({ timeout: 30000 });
      await expect(projectsTab(page)).toHaveAttribute('aria-current', 'true');

      // 3. Verify table columns are visible
      await expect(projectColumnHeader(page, 'Name')).toBeVisible();
      await expect(projectColumnHeader(page, 'Domain')).toBeVisible();
      await expect(projectColumnHeader(page, 'Description')).toBeVisible();
      await expect(projectColumnHeader(page, 'Type')).toBeVisible();

      // 4. Verify the default project row
      const defaultRow = page
        .getByRole('row')
        .filter({ hasText: 'default' })
        .first();
      await expect(defaultRow).toBeVisible();

      // 5. Verify the Active radio button is selected and the default row has Type = GENERAL
      // (Active is a filter tab, not a table column; the default project is active by default).
      // `ProjectPage.tsx`'s status toggle is `BAIRadioGroup`, rendered on
      // Astryx `SegmentedControl` since ticket 10 (`BAIRadioGroup.tsx`).
      // `exact` matters: a substring match on "Active" also hits "Inactive".
      await expect(
        page.getByRole('radio', { name: 'Active', exact: true }),
      ).toBeChecked();
      await expect(
        defaultRow.getByRole('cell', { name: 'GENERAL' }),
      ).toBeVisible();
    });
  },
);

// No longer serial: each test provisions its own uniquely-named project and
// cleans up after itself, so a failure in one no longer cascade-skips the rest.
test.describe(
  'Project CRUD',
  { tag: ['@critical', '@project', '@functional'] },
  () => {
    test('Admin can create a new project', async ({ page, request }) => {
      const name = projectName('create');
      await loginAsAdmin(page, request);
      await navigateTo(page, 'project');

      await createProject(page, name, PROJECT_DESCRIPTION);

      // Self-cleanup so the created project does not leak to later runs.
      await cleanupTestProject(page, name);
    });

    test('Admin can edit a project', async ({ page, request }) => {
      const name = projectName('edit');
      await loginAsAdmin(page, request);
      await navigateTo(page, 'project');

      // Provision this test's own project so it doesn't depend on the create test.
      await createProject(page, name, PROJECT_DESCRIPTION);

      // Find the test project row, hover to reveal BAINameActionCell action
      // buttons, then click the edit button. The row edit action is a lucide
      // `SquarePenIcon` (FR-3331) whose action title ("Edit") is exposed as
      // the button's `aria-label` by BAINameActionCell, so it can be
      // targeted by its accessible name regardless of action ordering.
      const projectRow = page.getByRole('row').filter({ hasText: name });
      await expect(projectRow).toBeVisible();
      await projectRow.hover();
      await projectRow
        .getByRole('button', { name: 'Edit', exact: true })
        .click();

      // Verify Update Project dialog appears
      const modal = page.getByRole('dialog', { name: 'Update Project' });
      await expect(modal).toBeVisible();

      // Verify the name field contains the test project name
      await expect(modal.getByRole('textbox', { name: 'Name' })).toHaveValue(
        name,
      );

      // Update the description
      await modal.getByRole('textbox', { name: 'Description' }).clear();
      await modal
        .getByRole('textbox', { name: 'Description' })
        .fill(UPDATED_DESCRIPTION);

      // Click OK to save and verify modal closes
      await modal.getByRole('button', { name: 'OK' }).click();
      await expect(modal).toBeHidden({ timeout: 10000 });

      // Verify updated description is visible in the project row
      await expect(
        projectRow.getByRole('cell', { name: UPDATED_DESCRIPTION }),
      ).toBeVisible({ timeout: 10000 });

      // Self-cleanup.
      await cleanupTestProject(page, name);
    });

    test('Admin can filter projects by name', async ({ page, request }) => {
      const name = projectName('filter');
      await loginAsAdmin(page, request);
      await navigateTo(page, 'project');

      // Provision this test's own project to filter for.
      await createProject(page, name, PROJECT_DESCRIPTION);

      // to-astryx ticket 28 rebuilt BAIPropertyFilter on Astryx `PowerSearch`
      // (packages/backend.ai-ui/src/components/BAIPropertyFilter.tsx). "Name"
      // is unset for `contentSearchFieldKey` but is the first free-text,
      // non-strict-selection property in `ProjectPage.tsx`'s
      // `filterProperties`, so it is PowerSearch's own default content-search
      // field (`defaultContentSearchFieldKey`, `BAIPropertyFilter.tsx`):
      // typed text matches a `"<query>"` content-search suggestion whose
      // value is already filled in, committing immediately on click — no
      // separate field pick + edit-popover + Apply step
      // (`usePowerSearchSource.ts`'s content-search branch).
      const searchBar = page.getByRole('combobox', { name: 'Search filters' });
      await searchBar.click();
      await searchBar.fill(name);
      await page
        .getByRole('option', { name: `"${name}"`, exact: true })
        .click();

      // Verify table shows only the matching project. The Name cell renders
      // BAINameActionCell, so its accessible name also includes hover-only
      // action labels; match the row by hasText instead.
      await expect(page.getByRole('row').filter({ hasText: name })).toBeVisible(
        { timeout: 10000 },
      );

      // Verify only one data row is visible (excluding header rows). There is
      // no measure row in the Astryx table, so plain `tbody tr` is sufficient.
      const dataRows = page.locator('tbody tr');
      await expect(dataRows).toHaveCount(1);

      // Self-cleanup runs HERE, while the filter is still applied and the
      // table holds this one row. On the unfiltered list the row can land
      // anywhere across a paginated, ~2500px-wide table, and BAINameActionCell
      // only reveals its row actions on hover — which makes the cleanup's
      // hover→click depend on where the row happens to sit.
      await cleanupTestProject(page, name);

      // Clear the filter by clicking its token's remove button. Token labels
      // follow `"<Field>: <operator>"` (`PowerSearch.tsx` `tokenizerValue` ->
      // `displayLabel`) -- the value itself is not part of the accessible
      // name; "name" has no `defaultOperator` override, so it uses the BUI
      // default `ilike` = "contains".
      await page.getByRole('button', { name: 'Remove Name: contains' }).click();

      // Verify the default project is visible again (filter cleared)
      await expect(
        page.getByRole('cell', { name: 'default', exact: true }).first(),
      ).toBeVisible({ timeout: 10000 });
    });

    test('Admin can delete a project', async ({ page, request }) => {
      const name = projectName('delete');
      await loginAsAdmin(page, request);
      await navigateTo(page, 'project');

      // Provision this test's own project, then delete it (the asserted behavior).
      await createProject(page, name, PROJECT_DESCRIPTION);

      // Find the test project row (Active tab is the default view)
      const projectRow = page.getByRole('row').filter({ hasText: name });
      await expect(projectRow).toBeVisible();

      // The project lifecycle is Active → Deactivated → Purged.
      // Step 1: Deactivate — hover the row to reveal the BAINameActionCell
      // action buttons, then click the deactivate button by its accessible
      // name (the action title is exposed as the button's `aria-label`).
      await projectRow.hover();
      await projectRow
        .getByRole('button', { name: 'Deactivate', exact: true })
        .click();

      // Confirm the anchored deactivate popover (role="dialog", see
      // `cleanupTestProject` above for details).
      const deactivatePopconfirm = page.getByRole('dialog', {
        name: 'Deactivate',
      });
      await expect(deactivatePopconfirm).toBeVisible({ timeout: 5000 });
      await deactivatePopconfirm
        .getByRole('button', { name: 'Deactivate' })
        .click();

      // Verify the project disappears from the Active list
      await expect(projectRow).toBeHidden({ timeout: 10000 });

      // Switch to the Inactive tab to find the deactivated project
      await page.getByRole('radio', { name: 'Inactive', exact: true }).click();

      // Find the deactivated project row in the Inactive tab
      const inactiveProjectRow = page
        .getByRole('row')
        .filter({ hasText: name });
      await expect(inactiveProjectRow).toBeVisible({ timeout: 10000 });

      // Click the Purge action. The Inactive tab shows 3 row actions (Edit,
      // Activate, Purge), so Purge collapses into the "More actions"
      // overflow menu; `clickRowAction` handles both cases.
      await clickRowAction(page, inactiveProjectRow, 'Purge');

      // Verify the Purge Project confirmation dialog appears
      const purgeDialog = page.getByRole('dialog', { name: 'Purge Project' });
      await expect(purgeDialog).toBeVisible({ timeout: 5000 });

      // Type the project name into the confirmation input to enable the
      // Purge button. `BAIDeleteConfirmModal`'s confirm input has no
      // `#confirmText` id in the DOM; it is the dialog's only textbox.
      await purgeDialog.getByRole('textbox').fill(name);

      // Click the Purge button to permanently delete the project
      await purgeDialog.getByRole('button', { name: 'Purge' }).click();

      // Verify the project is removed from the Inactive table
      await expect(inactiveProjectRow).toBeHidden({ timeout: 10000 });
    });
  },
);
