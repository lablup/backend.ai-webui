// spec: e2e/.agent-output/test-plan-deployments-ui.md
// seed: e2e/screenshot-seed.spec.ts
//
// Key deviations from the plan discovered during manual browser verification:
//
// 1. Creating a deployment auto-navigates directly to its detail page
//    (`/deployments/{id}`) instead of staying on the list page with the
//    modal simply closed. Tests assert the detail-page redirect first, then
//    separately navigate back to the list to verify the row.
//
// 2. In the Add Revision modal, selecting a Preset does NOT auto-fill the
//    Model Folder field -- it must be selected independently (contrary to
//    the plan's open question about this).
//
// 3. The Add Revision modal's Model Folder combobox only lists
//    Project-owned/user-owned VFolders, not model-store/project-store
//    catalog resources -- confirmed live: a model-store catalog folder
//    never appears there, regardless of active project. This turned out to
//    be intentional behavior, not a bug. The full-lifecycle "add a revision
//    with a real preset" scenario therefore uses utils/deployment-fixtures.ts
//    to ensure its preset (reusing a compatible pre-existing one when the
//    cluster has it, creating a GPU-free `e2e-dfx-*` one otherwise) and to
//    provision a fresh `e2e-dfx-*` model folder, instead of assuming any
//    hand-seeded fixture exists on the target cluster -- confirmed via live
//    end-to-end verification to submit successfully and produce a real
//    revision. That test deliberately stops at confirming the revision is
//    attached and scheduling has begun -- it does not wait for a replica to
//    actually appear as scheduled, because that specific signal was directly
//    measured (across repeated identical runs) to take anywhere from ~40
//    seconds to over 20 minutes on this shared cluster, a cluster-level
//    characteristic outside this test's control that makes it unsuitable
//    for a CI-practical bounded wait; see the comment in that test for the
//    full investigation. A sibling Advanced Mode test covers the manual
//    revision path, which needs no preset at all.
//
// 4. Reopening the Edit Deployment modal after a successful save shows a
//    stale Desired Replicas value (the value from before the save) rather
//    than the just-persisted one, even though the Basic Information card
//    behind the modal correctly reflects the saved value. The Cancel-does-
//    not-persist assertion below verifies the Basic Information card value
//    directly rather than asserting on the modal's (buggy) pre-fill.
//
// Every test in this file creates its own throwaway `e2e-plan-*` deployment
// shell and deletes it inline. The two revision-attaching tests additionally
// provision what they need via utils/deployment-fixtures.ts -- the Preset
// Mode test a found-or-created preset plus a fresh model folder, the
// Advanced Mode test a fresh model folder only -- attach a real revision,
// then tear the deployment down through the same delete flow and clean up
// everything the run itself created.
import {
  cleanupDeploymentFixtures,
  cleanupDeploymentSafely,
  createDeploymentShell,
  deleteDeploymentAndVerify,
  type DeploymentFixtures,
  ensureDeploymentPreset,
  escapeForRegExp,
  provisionDeploymentFixtures,
  provisionDeploymentModelFolder,
} from '../utils/deployment-fixtures';
import { skipUnlessClientFeature } from '../utils/feature-gate-util';
import { loginAsAdmin, modifyConfigToml, navigateTo } from '../utils/test-util';
import { getFormItemControlByLabel } from '../utils/test-util-antd';
import { test, expect, Page } from '@playwright/test';

// `role="tab"` is never emitted unless `TabList` is given `role="tablist"`,
// which this app never does. DeploymentRevisionCard's tab bar renders as
// `nav[aria-label="Tabs"]` containing plain buttons instead.
function revisionTabBar(page: Page) {
  return page.getByRole('navigation', { name: 'Tabs' });
}

// Local fork of deployment-fixtures.ts's `selectRevisionModalOption`: its
// popup search box's accessible name is actually "Search options" (confirmed
// live), not "Search" -- kept spec-local rather than editing the shared
// fixtures file, which has unrelated in-flight changes elsewhere.
async function selectRevisionModalOptionLocal(
  page: Page,
  fieldLabel: string,
  optionName: string,
): Promise<void> {
  await page.getByRole('button', { name: fieldLabel, exact: true }).click();
  const popup = page.getByRole('dialog', { name: fieldLabel, exact: true });
  await expect(popup).toBeVisible({ timeout: 10000 });
  await popup
    .getByRole('combobox', { name: 'Search options', exact: true })
    .fill(optionName);
  const option = popup.getByRole('option', { name: optionName }).first();
  await expect(option).toBeVisible({ timeout: 15000 });
  await option.click();
  await expect(popup).toBeHidden({ timeout: 5000 });
  await expect(
    page.getByRole('button', { name: fieldLabel, exact: true }),
  ).toContainText(optionName, { timeout: 5000 });
}

test.describe(
  'Deployment List Page',
  { tag: ['@functional', '@regression', '@serving', '@deployment'] },
  () => {
    let createdDeploymentName: string | null = null;

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test.afterEach(async ({ page }) => {
      if (createdDeploymentName) {
        await cleanupDeploymentSafely(page, createdDeploymentName);
        createdDeploymentName = null;
      }
    });

    test(
      'Admin can view the deployments list with expected columns and controls',
      { tag: ['@smoke'] },
      async ({ page }) => {
        // 1. Navigate to /deployments.
        await navigateTo(page, 'deployments');

        // 2. Inspect the page header area and table.
        // Scope to the sidebar nav (named "Side navigation") rather than an
        // unscoped `getByRole('navigation')`, which also matches the
        // "Breadcrumb" navigation — both render a "Deployments" text node,
        // causing a strict-mode violation on the unscoped `getByText`.
        await expect(
          page
            .getByRole('navigation', { name: 'Side navigation' })
            .getByText('Deployments', { exact: true }),
        ).toBeVisible({ timeout: 20000 });
        await expect(page.getByRole('radio', { name: 'Running' })).toBeChecked({
          timeout: 20000,
        });
        // `BAIRadioGroup` (`react/src/components/BAIRadioGroup.tsx`) has
        // rendered on Astryx `SegmentedControl` since ticket 10 — a real,
        // directly-visible `<button role="radio">`
        // (`SegmentedControlItem.tsx`), not antd's button-style radio group
        // with its opacity:0 input behind a clickable label wrapper. No
        // `.ant-radio-button-wrapper` workaround is needed any more; the
        // radio role itself is visible.
        await expect(
          page.getByRole('radio', { name: 'Terminated' }),
        ).toBeVisible();
        await expect(
          page.getByRole('button', { name: 'Refresh', exact: true }),
        ).toBeVisible();
        await expect(
          page.getByRole('button', { name: 'Create Deployment' }),
        ).toBeVisible();

        await expect(page.getByRole('table')).toBeVisible({ timeout: 20000 });
        await expect(
          page.getByRole('columnheader', { name: 'Name' }),
        ).toBeVisible();
        await expect(
          page.getByRole('columnheader', { name: /Revision/ }),
        ).toBeVisible();
        await expect(
          page.getByRole('columnheader', { name: 'Lifecycle' }),
        ).toBeVisible();
        await expect(
          page.getByRole('columnheader', { name: /Replicas/ }),
        ).toBeVisible();
        await expect(
          page.getByRole('columnheader', { name: 'Model' }),
        ).toBeVisible();
        // The sortable column's accessible name is the sort button's own
        // label ("Sort by createdAt"), not the visible "Created At" text.
        await expect(
          page.getByRole('columnheader', { name: /Created ?At/i }),
        ).toBeVisible();
      },
    );

    test(
      'Admin can create a new deployment and permanently delete it',
      { tag: ['@critical'] },
      async ({ page }) => {
        const deploymentName = `e2e-plan-deploy-${Date.now()}`;

        // 1. Click "Create Deployment".
        await navigateTo(page, 'deployments');
        await page.getByRole('button', { name: 'Create Deployment' }).click();

        // 2. In the modal, fill "Deployment Name" with e2e-plan-deploy-<timestamp>.
        const createDialog = page.getByRole('dialog', {
          name: 'Create Deployment',
        });
        await expect(createDialog).toBeVisible({ timeout: 20000 });
        // The dialog shell can become visible slightly before its form
        // fields finish mounting (observed live: the default 5s timeout is
        // occasionally not enough for the Deployment Name textbox
        // specifically) -- give this first field check a generous timeout,
        // matching this file's convention elsewhere.
        await expect(
          createDialog.getByRole('textbox', { name: /Deployment Name/ }),
        ).toHaveAttribute('placeholder', 'Enter a deployment name', {
          timeout: 20000,
        });

        // 3. Leave "Resource Group" at its default (default), "Desired Replicas" at
        // its default (1), "Tags" empty, and "Open To Public" (Public checkbox)
        // unchecked.
        await expect(
          createDialog.getByRole('spinbutton', { name: /Desired Replicas/ }),
        ).toHaveValue('1');
        await expect(
          createDialog.getByText('Enter tags, separated by commas'),
        ).toBeVisible();
        const publicCheckbox = createDialog.getByRole('checkbox', {
          name: 'Public',
        });
        await expect(publicCheckbox).not.toBeChecked();
        await expect(publicCheckbox).toBeEnabled();
        await createDialog
          .getByRole('textbox', { name: /Deployment Name/ })
          .fill(deploymentName);

        // 4. Click "Create".
        createdDeploymentName = deploymentName;
        await createDialog
          .getByRole('button', { name: 'Create', exact: true })
          .click();

        // 5. Confirm the modal closes and the new row appears in the list with
        // Lifecycle "Pending" and Replicas "0 / 1".
        // NOTE: creating a deployment auto-navigates directly to its detail page
        // instead of staying on the list with the modal closed -- confirmed by
        // manual verification (see header comment).
        await expect(
          page.getByRole('heading', { level: 3, name: deploymentName }),
        ).toBeVisible({ timeout: 20000 });
        await navigateTo(page, 'deployments');
        const row = page.getByRole('row', {
          name: new RegExp(escapeForRegExp(deploymentName)),
        });
        await expect(row).toBeVisible({ timeout: 20000 });
        await expect(row.getByRole('cell', { name: 'Pending' })).toBeVisible();
        await expect(row.getByRole('cell', { name: '0 / 1' })).toBeVisible();

        // 6. Click the new row's "delete" icon.
        await row.getByRole('button', { name: 'delete' }).click();

        // 7. In the "Delete Deployment" confirmation modal, type the exact
        // deployment name into the confirmation textbox.
        const deleteDialog = page.getByRole('dialog', {
          name: /Delete Deployment/,
        });
        await expect(deleteDialog).toBeVisible({ timeout: 10000 });
        await expect(
          deleteDialog.getByText(
            'Are you sure you want to permanently delete Deployment?',
          ),
        ).toBeVisible();
        await expect(
          deleteDialog.getByText('This action cannot be undone.'),
        ).toBeVisible();
        const confirmInput = page.getByPlaceholder(deploymentName);
        await expect(confirmInput).toBeVisible();
        const deleteButton = deleteDialog.getByRole('button', {
          name: 'Delete',
          exact: true,
        });
        await expect(deleteButton).toBeDisabled();
        await confirmInput.fill(deploymentName);

        // 8. Click "Delete" (disabled until the typed value matches).
        await expect(deleteButton).toBeEnabled({ timeout: 5000 });
        await deleteButton.click();

        // 9. Confirm the row is removed from the list.
        await expect(page.getByText(deploymentName).first()).toBeHidden({
          timeout: 30000,
        });
        // `BAIRadioGroup` renders a directly-clickable `role="radio"` button
        // (see comment in "Admin can view the deployments list..." above).
        await page.getByRole('radio', { name: 'Terminated' }).click();
        await expect(page.getByText(deploymentName).first()).toBeHidden({
          timeout: 10000,
        });

        createdDeploymentName = null;
      },
    );
  },
);

test.describe(
  'Deployment Detail Page',
  { tag: ['@functional', '@regression', '@serving', '@deployment'] },
  () => {
    let createdDeploymentName: string | null = null;

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test.afterEach(async ({ page }) => {
      if (createdDeploymentName) {
        await cleanupDeploymentSafely(page, createdDeploymentName);
        createdDeploymentName = null;
      }
    });

    test('Admin can view the Basic Information and empty-state sections of a newly created deployment', async ({
      page,
    }) => {
      const deploymentName = `e2e-plan-detail-${Date.now()}`;

      // 1. Click the deployment's name link from the list (or navigate directly
      // to /deployments/{id}) -- here achieved by creating a fresh shell, which
      // auto-navigates to its detail page.
      await navigateTo(page, 'deployments');
      await createDeploymentShell(page, deploymentName);
      createdDeploymentName = deploymentName;

      // 2. Inspect the alert banner, header, "Basic Information" card, revision
      // tabs, "Replicas" section, "Auto-scaling" section, and "Access Tokens"
      // section.
      const alert = page.getByRole('alert');
      await expect(alert).toContainText('No revision is deployed', {
        timeout: 20000,
      });
      await expect(
        alert.getByRole('button', { name: 'Add Revision' }),
      ).toBeVisible();

      await expect(
        page.getByRole('heading', { level: 3, name: deploymentName }),
      ).toBeVisible();
      await expect(page.getByText('Pending').first()).toBeVisible();

      // Basic Information card
      // FR-3331/FR-3315 replaced the settings-cog icon with a lucide edit icon
      // (no accessible name of its own), leaving the button's accessible name
      // as just "Edit" instead of the old icon-name-prefixed "edit Edit".
      await expect(
        page.getByRole('button', { name: 'Edit', exact: true }),
      ).toBeVisible({
        timeout: 20000,
      });
      await expect(page.getByRole('button', { name: 'More' })).toBeVisible();
      await expect(
        page.getByRole('rowheader', { name: 'Lifecycle' }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /Scheduling History/ }),
      ).toBeVisible();
      await expect(
        page.getByRole('rowheader', { name: 'Deployment ID' }),
      ).toBeVisible();
      await expect(
        page.getByRole('rowheader', { name: 'Project' }),
      ).toBeVisible();
      await expect(
        page.getByRole('rowheader', { name: 'Domain' }),
      ).toBeVisible();
      await expect(
        page.getByRole('rowheader', { name: 'Resource Group' }),
      ).toBeVisible();
      await expect(
        page.getByRole('rowheader', { name: 'Endpoint URL' }),
      ).toBeVisible();
      await expect(
        page.getByRole('rowheader', { name: 'Visibility' }),
      ).toBeVisible();
      await expect(
        page.getByRole('rowheader', { name: 'Desired Replicas' }),
      ).toBeVisible();
      await expect(page.getByRole('rowheader', { name: 'Tags' })).toBeVisible();

      // Revision tabs
      await expect(
        page.getByRole('tab', { name: 'Current Revision', selected: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('tab', { name: 'Revision History' }),
      ).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Audit Log' })).toBeVisible();
      await expect(
        page.getByRole('tablist').getByRole('button', { name: 'Add Revision' }),
      ).toBeVisible();

      // Replicas section (`DeploymentReplicasCard.tsx`'s `BAIRadioGroup`
      // toggle — see the deployments list page's toggle comment above).
      await expect(page.getByText('Replicas', { exact: true })).toBeVisible();
      await expect(page.getByRole('radio', { name: 'Running' })).toBeVisible();
      await expect(
        page.getByRole('radio', { name: 'Terminated' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Replica ID' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /Health Status/ }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /Traffic Status/ }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Session' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /Revision \(ID\)/ }),
      ).toBeVisible();

      // Auto-scaling section
      await expect(page.getByText('Auto-scaling')).toBeVisible();
      // The Auto-scaling card's body (button + table) loads via its own
      // query/Suspense boundary independently of the heading above, and can
      // take longer than the default 5s timeout to hydrate (observed live,
      // reproducibly, in both parallel and serial execution) -- give its
      // first body element a generous explicit timeout, matching this
      // file's convention for the first assertion of each section.
      await expect(page.getByRole('button', { name: 'Add Rules' })).toBeVisible(
        { timeout: 20000 },
      );
      await expect(
        page.getByRole('columnheader', { name: /Metric Source/ }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /Cooldown Sec\./ }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /Step Size/ }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /Min \/ MAX Replicas/ }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /Last Triggered/ }),
      ).toBeVisible();

      // Access Tokens section
      await expect(page.getByText('Access Tokens')).toBeVisible();
      // Same independently-loading-body caveat as the Auto-scaling section
      // above.
      await expect(
        page.getByRole('button', { name: 'Create Access Token' }),
      ).toBeDisabled({ timeout: 20000 });
      await expect(
        page.getByRole('columnheader', { name: 'Token' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Expiration' }),
      ).toBeVisible();

      await deleteDeploymentAndVerify(page, deploymentName);
      createdDeploymentName = null;
    });
  },
);

test.describe(
  'Add Revision Modal',
  { tag: ['@functional', '@regression', '@serving', '@deployment'] },
  () => {
    let createdDeploymentName: string | null = null;
    // Tracks whatever this describe's tests provisioned so afterEach can
    // unwind it — the full preset+folder pair for the Preset Mode test, or
    // just `{ folderName }` for the Advanced Mode test (which needs no
    // preset). cleanupDeploymentFixtures accepts either shape and never
    // touches a reused pre-existing preset (its id is never recorded).
    let fixtures: Partial<DeploymentFixtures> | null = null;

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test.afterEach(async ({ page }) => {
      // Deployment first — its revision references the provisioned fixtures.
      if (createdDeploymentName) {
        await cleanupDeploymentSafely(page, createdDeploymentName);
        createdDeploymentName = null;
      }
      if (fixtures) {
        await cleanupDeploymentFixtures(page, fixtures);
        fixtures = null;
      }
    });

    test('Admin can view Preset Mode fields in the Add Revision modal', async ({
      page,
    }) => {
      // Preset Mode's fields only render once at least one deployment preset
      // exists on the cluster -- with none, the modal shows a "No deployment
      // presets available" empty state instead (confirmed live via GraphQL:
      // this cluster had zero deployment presets at test time, which the app
      // correctly reflects as an intentional empty state, not a bug). Ensure
      // one exists first, exactly like the Preset Mode revision-attach test
      // below -- reusing a compatible pre-existing preset when the cluster
      // has one, or provisioning a throwaway `e2e-dfx-*` preset otherwise. A
      // model folder is not needed here since this test only inspects the
      // modal's fields and never submits.
      await skipUnlessClientFeature(
        page,
        'deployment-preset',
        "Preset Mode requires the 'deployment-preset' capability (manager >= 26.4.x)",
      );
      const preset = await ensureDeploymentPreset(page);
      if (preset.presetId) {
        fixtures = { presetId: preset.presetId, presetName: preset.presetName };
      }

      const deploymentName = `e2e-plan-preset-${Date.now()}`;
      await navigateTo(page, 'deployments');
      await createDeploymentShell(page, deploymentName);
      createdDeploymentName = deploymentName;

      // 1. Click "Add Revision" (from either the banner or the tab bar).
      await revisionTabBar(page)
        .getByRole('button', { name: 'Add Revision' })
        .click();
      const dialog = page.getByRole('dialog', { name: /Add Revision/ });
      await expect(dialog).toBeVisible({ timeout: 20000 });

      // 2. Confirm "Preset Mode" is selected by default in the modal's segmented
      // control.
      await expect(
        dialog.getByRole('radio', { name: 'Preset Mode' }),
      ).toBeChecked();
      await expect(
        dialog.getByRole('radio', { name: 'Advanced Mode' }),
      ).not.toBeChecked();

      // 3. Inspect the Preset Mode fields.
      await expect(dialog.getByText('Select Preset')).toBeVisible();
      // The icon-only info button next to "Preset" now carries a purpose-based
      // aria-label ("Deployment Preset Detail") instead of the old antd
      // icon-name-derived "info-circle" -- it stays disabled until a preset
      // is selected.
      await expect(
        dialog.getByRole('button', { name: 'Deployment Preset Detail' }),
      ).toBeDisabled();
      await expect(dialog.getByText('Select Folder')).toBeVisible();
      await expect(
        dialog.getByRole('checkbox', {
          name: 'Apply immediately after adding',
        }),
      ).toBeChecked();
      await expect(
        dialog.getByRole('button', { name: 'Cancel' }),
      ).toBeVisible();
      await expect(
        dialog.getByRole('button', { name: 'Add Revision' }),
      ).toBeVisible();

      // 4. Click "Cancel" to close without submitting.
      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(dialog).toBeHidden({ timeout: 10000 });

      await deleteDeploymentAndVerify(page, deploymentName);
      createdDeploymentName = null;
    });

    test('Admin can view Advanced Mode fields in the Add Revision modal', async ({
      page,
    }) => {
      const deploymentName = `e2e-plan-advanced-${Date.now()}`;
      await navigateTo(page, 'deployments');
      await createDeploymentShell(page, deploymentName);
      createdDeploymentName = deploymentName;

      // 1. Open "Add Revision".
      await revisionTabBar(page)
        .getByRole('button', { name: 'Add Revision' })
        .click();
      const dialog = page.getByRole('dialog', { name: /Add Revision/ });
      await expect(dialog).toBeVisible({ timeout: 20000 });

      // 2. Select the "Advanced Mode" segmented-control option. `BAIRadioGroup`
      // now renders Astryx `SegmentedControl` -- a directly-clickable
      // `role="radio"` button, not antd's hidden-input-behind-a-label.
      await dialog.getByRole('radio', { name: 'Advanced Mode' }).click();

      // 3. Inspect the expanded field set.
      await expect(dialog.getByText('Model & Runtime')).toBeVisible({
        timeout: 10000,
      });
      await expect(dialog.getByText('Select Folder')).toBeVisible();
      // Runtime is a ComplexSelector trigger button ("Select Runtime
      // Variant" placeholder), not a native combobox.
      await expect(
        dialog.getByRole('button', { name: 'Runtime' }),
      ).toBeVisible();
      await expect(
        dialog.getByRole('checkbox', { name: 'Enable Health Check' }),
      ).toBeVisible();
      // The section separator's "Environments" text collides with the
      // Environments/Version field's own label -- scope to the separator.
      await expect(
        dialog.getByRole('separator', { name: 'Environments' }),
      ).toBeVisible();
      await expect(dialog.getByText('Environments / Version')).toBeVisible();
      await expect(
        dialog.getByRole('button', { name: 'Add environment variables' }),
      ).toBeVisible();
      await expect(dialog.getByText('Cluster & Resources')).toBeVisible({
        timeout: 20000,
      });
      // Resource Presets is also a ComplexSelector trigger button, not a
      // native combobox.
      await expect(
        dialog.getByRole('button', { name: 'Resource Presets' }),
      ).toBeVisible({ timeout: 20000 });
      await expect(
        dialog.getByRole('radio', { name: /Multi Node/ }),
      ).toBeChecked();
      await expect(
        dialog.getByRole('radio', { name: /Single Node/ }),
      ).toBeVisible();
      await expect(
        dialog.getByRole('button', { name: /Advanced Settings/ }),
      ).toBeVisible();
      await expect(
        dialog.getByRole('checkbox', {
          name: 'Apply immediately after adding',
        }),
      ).toBeChecked();

      // 4. Click "Cancel" to close without submitting.
      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(dialog).toBeHidden({ timeout: 10000 });

      await deleteDeploymentAndVerify(page, deploymentName);
      createdDeploymentName = null;
    });

    // The two revision-attaching tests below each provision a model folder
    // and upload the mock-server fixtures — a real vfolder create + storage
    // upload against the shared cluster. Running the two concurrently in
    // separate workers was directly observed to starve each other's /data
    // list fetch and upload-completion waits into their timeouts (both
    // failed only when concurrent; each passes in isolation), so they run
    // serially. Note serial mode skips the second test if the first fails.
    test.describe.serial('Revision attach flows', () => {
      test(
        'Admin can add a revision in Preset Mode and see it attached',
        { tag: ['@critical'] },
        async ({ page }) => {
          // This test waits up to 180s for the deployment's Lifecycle to
          // leave "Pending" (real scheduling can take a while) but, per the
          // comment near the end of this test, deliberately does NOT wait
          // for the Replicas table to show a scheduled replica -- that
          // specific signal was directly measured to take anywhere from
          // ~40s to over 20 minutes on this shared cluster, independent of
          // this test's own logic. 480s covers fixture provisioning (model
          // folder + upload + preset ensure), setup, the 180s lifecycle
          // wait, and teardown (including fixture cleanup) with comfortable
          // margin.
          test.setTimeout(480_000);

          // 0. Ensure the preset + model folder pair this test selects in the
          // Add Revision modal: a compatible pre-existing preset is reused
          // as-is when the cluster has one, and created (then torn down)
          // otherwise -- no hand-seeded cluster fixture is assumed either
          // way. Deployment presets need backend support, so gate on the same
          // capability flag the UI checks.
          await skipUnlessClientFeature(
            page,
            'deployment-preset',
            "Adding a revision from a preset requires the 'deployment-preset' capability (manager >= 26.4.x)",
          );
          const provisioned = await provisionDeploymentFixtures(page);
          fixtures = provisioned;

          const deploymentName = `e2e-plan-revision-${Date.now()}`;
          await navigateTo(page, 'deployments');
          await createDeploymentShell(page, deploymentName);
          createdDeploymentName = deploymentName;

          // 1. Open "Add Revision" on the fresh deployment, staying in "Preset Mode".
          await revisionTabBar(page)
            .getByRole('button', { name: 'Add Revision' })
            .click();
          const dialog = page.getByRole('dialog', { name: /Add Revision/ });
          await expect(dialog).toBeVisible({ timeout: 20000 });
          await expect(
            dialog.getByRole('radio', { name: 'Preset Mode' }),
          ).toBeChecked();

          // 2. Select the ensured preset from the "Preset" select — the
          // ComplexSelector interaction (trigger button → search → option
          // click) lives on selectRevisionModalOptionLocal above.
          await selectRevisionModalOptionLocal(
            page,
            'Preset',
            provisioned.presetName,
          );

          // 3. Confirm/select the "Model Folder" (verify whether it auto-populates
          // from the preset or must be chosen separately). Manual verification
          // found it does NOT auto-fill -- it must be chosen independently. The
          // Model Folder select only lists Project-owned/user-owned VFolders
          // (not model-store/project-store catalog resources), which is why the
          // provisioned folder is created as the e2e admin account's own owned
          // VFolder. Same ComplexSelector interaction via the local helper.
          await selectRevisionModalOptionLocal(
            page,
            'Model Folder',
            provisioned.folderName,
          );

          // 4. Leave "Apply immediately after adding" checked.
          await expect(
            dialog.getByRole('checkbox', {
              name: 'Apply immediately after adding',
            }),
          ).toBeChecked();

          // 5. Click "Add Revision" to submit.
          await dialog.getByRole('button', { name: 'Add Revision' }).click();
          await expect(dialog).toBeHidden({ timeout: 20000 });

          // Submitting auto-opens a "Revision Detail" dialog; close it so it
          // cannot mask later assertions/clicks (same as the Advanced Mode
          // manual-revision test below).
          const revisionDetailDialog = page.getByRole('dialog', {
            name: 'Revision Detail',
          });
          await expect(revisionDetailDialog).toBeVisible({ timeout: 10000 });
          await revisionDetailDialog
            .getByRole('button', { name: 'Close' })
            .click();
          await expect(revisionDetailDialog).toBeHidden({ timeout: 10000 });

          // 6. Wait for the deployment's Lifecycle/status to leave "Pending" (allow
          // a generous timeout for scheduling; this is a real model-serving
          // container pull + start). The status badge next to the deployment
          // name heading mirrors the Basic Information card's Lifecycle
          // value and is simpler to target reliably than the description
          // list (Basic Information renders `<dt>`/`<dd>` pairs, not a
          // table -- there is no `role="row"`/`"rowheader"` there).
          const statusBadge = page
            .getByRole('heading', { level: 3, name: deploymentName })
            .locator('xpath=following-sibling::*[1]');
          await expect(statusBadge).not.toContainText('Pending', {
            timeout: 180_000,
          });

          // 7. Inspect the "Current Revision" tab, confirming the revision is
          // now actually attached (this is the reliable, deterministic
          // success signal for "a revision was added and scheduling began" --
          // see the note below on why this test does not also wait for the
          // Replicas table's empty state to clear).
          // NOTE: DeploymentRevisionCard uses BAICard's `tabList` API, which
          // renders each tab's content as a conditional child of the Card
          // body, not inside a `role="tabpanel"`. The Current Revision tab's
          // empty state renders a unique level-3 heading with this text
          // (distinct from the identically-worded alert banner, which is
          // plain text, not a heading) -- assert it goes away instead of
          // scoping on the (now nonexistent) antd `.ant-card` class.
          await expect(
            page.getByRole('heading', { name: /No revision is deployed/ }),
          ).toBeHidden({ timeout: 10000 });
          // Deliberately not asserted: waiting for the Replicas card's
          // "No data" empty state to clear (i.e. a scheduled replica actually
          // appearing). Live investigation directly measured this take
          // anywhere from ~40s to over 20 minutes across repeated identical
          // runs (independent of this file's own worker concurrency, which
          // was ruled out by forcing serial execution; independent of
          // resource-limit exhaustion, which is Unlimited on this account;
          // and independent of leftover/queued sessions, of which there were
          // none) -- a real, cluster-level scheduling-latency characteristic
          // of this shared QA cluster, not a bug in this test, the locator, or
          // the application. Across that sampling only 1 of 7 runs finished
          // within a 5-minute bound, so no CI-practical timeout reliably
          // captures it; asserting on it would make this test's pass/fail
          // outcome dominated by cluster noise rather than by whether adding
          // a revision actually works. The "Current Revision" tab check above
          // already confirms the functionally important outcome (the
          // revision was added and is active); replica-level scheduling
          // completion is best verified manually or via infrastructure
          // monitoring, not this e2e test.

          // Cleanup: Permanently delete the deployment via the list page's per-row
          // delete icon and the typed-name "Delete Deployment" modal, which should
          // tear down the revision/replica along with the deployment shell. The
          // provisioned preset + folder go last (the revision referenced them).
          await deleteDeploymentAndVerify(page, deploymentName);
          createdDeploymentName = null;
          await cleanupDeploymentFixtures(page, fixtures);
          fixtures = null;
        },
      );

      test(
        'Admin can add a revision manually in Advanced Mode without a preset',
        { tag: ['@critical'] },
        async ({ page, request }) => {
          // Advanced (Custom) Mode builds the revision by hand -- model
          // folder + runtime + start command, with the image and resources
          // left at the form's own auto-selected defaults -- so it must work
          // even on a cluster with zero deployment presets. Only the model
          // folder is provisioned here; no preset is needed, ensured, or
          // created. 360s covers folder provisioning (create + fixture
          // upload), the modal flow, and teardown with comfortable margin
          // (no lifecycle wait -- the Preset Mode test above already covers
          // that signal).
          test.setTimeout(360_000);

          // The Environments / Version select (ImageEnvironmentSelectFormItems)
          // queries images with `is_installed: true` unless this config flag is
          // set, and this shared cluster currently has zero images actually
          // marked installed (confirmed live: the dropdown renders "No data"
          // with no search text at all) -- so without this flag there is no
          // valid option for this form to select, regardless of locator
          // correctness. Enabling it broadens the query to all images so the
          // manual pick below has something to choose from. The describe's
          // beforeEach login already loaded config.toml, so this override
          // only takes effect after the page.reload() below.
          await modifyConfigToml(page, request, {
            environments: { showNonInstalledImages: true },
          });
          await page.reload();

          const folderName = await provisionDeploymentModelFolder(page);
          fixtures = { folderName };

          const deploymentName = `e2e-plan-manual-rev-${Date.now()}`;
          await navigateTo(page, 'deployments');
          await createDeploymentShell(page, deploymentName);
          createdDeploymentName = deploymentName;

          // 1. Open "Add Revision" and switch to Advanced Mode.
          await revisionTabBar(page)
            .getByRole('button', { name: 'Add Revision' })
            .click();
          const dialog = page.getByRole('dialog', { name: /Add Revision/ });
          await expect(dialog).toBeVisible({ timeout: 20000 });
          // `BAIRadioGroup` renders Astryx `SegmentedControl` -- a
          // directly-clickable `role="radio"` button (see the "view
          // Advanced Mode fields" test above).
          await dialog.getByRole('radio', { name: 'Advanced Mode' }).click();
          await expect(dialog.getByText('Model & Runtime')).toBeVisible({
            timeout: 10000,
          });

          // 2. Select the provisioned model folder -- the Advanced form's
          // folder select shares the "Model Folder" field label and search
          // behavior with Preset Mode (only one form is mounted at a time),
          // so the local helper applies unchanged.
          await selectRevisionModalOptionLocal(
            page,
            'Model Folder',
            folderName,
          );

          // 3. Select the "custom" runtime variant -- Runtime is the same
          // ComplexSelector pattern (trigger button -> popup search -> option
          // click) as Preset/Model Folder now, not an antd Select.
          await selectRevisionModalOptionLocal(page, 'Runtime', 'custom');

          // 4. The custom runtime reveals a "Start Command" field -- fill it
          // with the command that runs the folder's mock server. The image
          // (Environments / Version) is left at the form's own auto-selected
          // default (confirmed live: both selects now populate a default on
          // mount); resources are set by hand below to satisfy that image's
          // minimum footprint (the submit handler itself rejects a missing
          // image, so a cluster with no usable image fails loudly here
          // rather than silently).
          const startCommandControl = getFormItemControlByLabel(
            page,
            'Start Command',
          );
          await expect(startCommandControl).toBeVisible({ timeout: 10000 });
          await startCommandControl
            .getByRole('textbox')
            .fill('python3 /models/mock_openai_server.py');

          // The Cluster & Resources section mounts via its own
          // query/Suspense boundary and takes 10s+ on the shared cluster
          // (the "view Advanced Mode fields" test above waits for the same
          // landmark). Submitting before it mounts leaves the `resource`
          // fields unregistered on the form, and the submit handler then
          // dies on the missing values with no visible error at all --
          // observed live as a click that produced no form error, no
          // notification, and no mutation. Gate on the section's landmark --
          // also a ComplexSelector trigger button now, not a combobox.
          await expect(
            dialog.getByRole('button', { name: 'Resource Presets' }),
          ).toBeVisible({ timeout: 30000 });

          // The form's auto-selected default image carries a minimum resource
          // footprint (observed live: CPU >= 5, mem >= 1088MiB) that the
          // default resource preset does NOT meet, so submitting at the
          // defaults fails form validation ("CPU must be minimum 5", "The
          // minimum memory capacity ... is 1088MiB") and silently keeps the
          // modal open. Set CPU/mem above those minimums by hand -- part of
          // building a revision manually. CPU/Memory render as Astryx
          // spinbuttons now, not antd `.ant-input-number` inputs.
          const cpuInput = getFormItemControlByLabel(page, 'CPU')
            .getByRole('spinbutton')
            .first();
          await cpuInput.click();
          await cpuInput.fill('5');
          await cpuInput.blur();
          const memInput = getFormItemControlByLabel(page, 'Memory')
            .getByRole('spinbutton')
            .first();
          await memInput.fill('4'); // GiB (default unit) — comfortably over 1088MiB

          // 5. Submit and confirm the revision is attached -- the same
          // deterministic success signals as the Preset Mode test: the modal
          // closes, the auto-opened "Revision Detail" dialog appears (closed
          // so it cannot mask later assertions), and the "Current Revision"
          // card leaves its empty state.
          await dialog.getByRole('button', { name: 'Add Revision' }).click();
          await expect(dialog).toBeHidden({ timeout: 20000 });

          const revisionDetailDialog = page.getByRole('dialog', {
            name: 'Revision Detail',
          });
          await expect(revisionDetailDialog).toBeVisible({ timeout: 10000 });
          await revisionDetailDialog
            .getByRole('button', { name: 'Close' })
            .click();
          await expect(revisionDetailDialog).toBeHidden({ timeout: 10000 });

          // Same unique level-3 empty-state heading as the Preset Mode test
          // above (see its comment) instead of the nonexistent antd
          // `.ant-card` class.
          await expect(
            page.getByRole('heading', { name: /No revision is deployed/ }),
          ).toBeHidden({ timeout: 20000 });

          // Cleanup: deployment first (its revision references the folder),
          // then the provisioned folder.
          await deleteDeploymentAndVerify(page, deploymentName);
          createdDeploymentName = null;
          await cleanupDeploymentFixtures(page, fixtures);
          fixtures = null;
        },
      );
    });
  },
);

test.describe(
  'Edit Deployment Modal',
  { tag: ['@functional', '@regression', '@serving', '@deployment'] },
  () => {
    let createdDeploymentName: string | null = null;

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test.afterEach(async ({ page }) => {
      if (createdDeploymentName) {
        await cleanupDeploymentSafely(page, createdDeploymentName);
        createdDeploymentName = null;
      }
    });

    test("Admin can update a deployment's Desired Replicas via the Edit modal", async ({
      page,
    }) => {
      const deploymentName = `e2e-plan-edit-${Date.now()}`;
      await navigateTo(page, 'deployments');
      await createDeploymentShell(page, deploymentName);
      createdDeploymentName = deploymentName;

      // 1. Click "Edit" in the "Basic Information" card.
      await page.getByRole('button', { name: 'Edit', exact: true }).click();

      // 2. Inspect the modal fields.
      const dialog = page.getByRole('dialog', { name: 'Edit Deployment' });
      await expect(dialog).toBeVisible({ timeout: 20000 });
      await expect(
        dialog.getByRole('textbox', { name: /Deployment Name/ }),
      ).toHaveValue(deploymentName);
      // Resource Group is plain text here, not editable -- unlike the Create
      // modal where it is a combobox.
      await expect(
        dialog.getByRole('combobox', { name: /Resource Group/ }),
      ).toHaveCount(0);
      const replicasInput = dialog.getByRole('spinbutton', {
        name: /Desired Replicas/,
      });
      await expect(replicasInput).toHaveValue('1');
      await expect(
        dialog.getByRole('checkbox', { name: 'Public' }),
      ).toBeDisabled();

      // 3. Change "Desired Replicas" using the stepper (e.g. increment by 1).
      await replicasInput.click();
      await page.keyboard.press('ArrowUp');
      await expect(replicasInput).toHaveValue('2');

      // 4. Click "Save".
      await dialog.getByRole('button', { name: 'Save' }).click();
      await expect(dialog).toBeHidden({ timeout: 20000 });
      const desiredReplicasCell = page
        .getByRole('row')
        .filter({
          has: page.getByRole('rowheader', { name: 'Desired Replicas' }),
        })
        .getByRole('cell')
        .last();
      await expect(desiredReplicasCell).toHaveText('2', { timeout: 20000 });

      // 5. Click "Cancel" instead of "Save" on a repeat run to confirm no changes
      // persist when cancelled.
      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      const dialog2 = page.getByRole('dialog', { name: 'Edit Deployment' });
      await expect(dialog2).toBeVisible({ timeout: 20000 });
      const replicasInput2 = dialog2.getByRole('spinbutton', {
        name: /Desired Replicas/,
      });
      await replicasInput2.click();
      await page.keyboard.press('ArrowUp');
      await dialog2.getByRole('button', { name: 'Cancel' }).click();
      await expect(dialog2).toBeHidden({ timeout: 10000 });
      await expect(desiredReplicasCell).toHaveText('2', { timeout: 20000 });

      await deleteDeploymentAndVerify(page, deploymentName);
      createdDeploymentName = null;
    });
  },
);

test.describe(
  'Auto-Scaling Rules',
  { tag: ['@functional', '@regression', '@serving', '@deployment'] },
  () => {
    let createdDeploymentName: string | null = null;

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test.afterEach(async ({ page }) => {
      if (createdDeploymentName) {
        await cleanupDeploymentSafely(page, createdDeploymentName);
        createdDeploymentName = null;
      }
    });

    test('Admin can view the Add Auto Scaling Rule modal fields', async ({
      page,
    }) => {
      const deploymentName = `e2e-plan-scale-fields-${Date.now()}`;
      await navigateTo(page, 'deployments');
      await createDeploymentShell(page, deploymentName);
      createdDeploymentName = deploymentName;

      // 1. Click "Add Rules" in the "Auto-scaling" section.
      await page.getByRole('button', { name: 'Add Rules' }).click();

      // 2. Inspect the modal fields.
      const dialog = page.getByRole('dialog', {
        name: 'Add Auto Scaling Rule',
      });
      await expect(dialog).toBeVisible({ timeout: 20000 });
      // antd's Select renders its accessible `role="combobox"` on the
      // internal search <input>, which always has an empty `value` attribute
      // -- the displayed selection text lives in a sibling
      // `.ant-select-selection-item`. Read the current value off the
      // Form.Item's control container instead of the raw combobox (see
      // `getFormItemControlByLabel` in test-util-antd.ts).
      await expect(
        getFormItemControlByLabel(page, 'Metric Source'),
      ).toContainText('Kernel');
      await expect(
        dialog.getByRole('combobox', { name: /Metric Name/ }),
      ).toBeVisible();
      // `exact: true` is required here: "Scale In" is a literal prefix
      // substring of "Scale In & Out", so non-exact name matching resolves
      // to both radio inputs (strict-mode violation), confirmed live.
      await expect(
        dialog.getByRole('radio', { name: 'Scale In', exact: true }),
      ).not.toBeChecked();
      await expect(
        dialog.getByRole('radio', { name: 'Scale Out' }),
      ).toBeChecked();
      await expect(
        dialog.getByRole('radio', { name: 'Scale In & Out' }),
      ).not.toBeChecked();
      await expect(
        dialog.getByRole('spinbutton', { name: 'Max Threshold' }),
      ).toBeVisible();
      await expect(
        dialog.getByRole('spinbutton', { name: /Step Size/ }),
      ).toHaveValue('1');
      await expect(
        dialog.getByRole('spinbutton', { name: /Cooldown Sec\./ }),
      ).toHaveValue('300');
      await expect(
        dialog.getByRole('spinbutton', { name: /Min Replicas/ }),
      ).toHaveValue('0');
      await expect(
        dialog.getByRole('spinbutton', { name: /Max Replicas/ }),
      ).toHaveValue('5');
      await expect(
        dialog.getByRole('button', { name: 'Cancel' }),
      ).toBeVisible();
      await expect(
        dialog.getByRole('button', { name: 'OK', exact: true }),
      ).toBeVisible();

      // 3. Click "Cancel" to close without submitting.
      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(dialog).toBeHidden({ timeout: 10000 });

      await deleteDeploymentAndVerify(page, deploymentName);
      createdDeploymentName = null;
    });

    test('Admin can create and then delete an auto-scaling rule', async ({
      page,
    }) => {
      const deploymentName = `e2e-plan-scale-crud-${Date.now()}`;
      await navigateTo(page, 'deployments');
      await createDeploymentShell(page, deploymentName);
      createdDeploymentName = deploymentName;

      // 1. Click "Add Rules".
      await page.getByRole('button', { name: 'Add Rules' }).click();
      const dialog = page.getByRole('dialog', {
        name: 'Add Auto Scaling Rule',
      });
      await expect(dialog).toBeVisible({ timeout: 20000 });

      // 2. Set "Metric Name" to a valid value appropriate to the selected
      // "Metric Source".
      await dialog.getByRole('combobox', { name: /Metric Name/ }).click();
      await page.getByRole('option', { name: 'cpu_util' }).click();

      // 3. Leave "Condition" at "Scale Out" and set a "Max Threshold" value.
      await dialog
        .getByRole('spinbutton', { name: 'Max Threshold' })
        .fill('80');

      // 4. Leave Step Size (1), Cooldown Sec. (300), Min Replicas (0), Max
      // Replicas (5) at their defaults.

      // 5. Click "OK".
      await dialog.getByRole('button', { name: 'OK', exact: true }).click();

      // 6. Confirm the new rule appears as a row in the Auto-scaling table.
      const ruleRow = page.getByRole('row', { name: /cpu_util/ });
      await expect(ruleRow).toBeVisible({ timeout: 20000 });
      await expect(ruleRow).toContainText('80');

      // 7. Delete the rule (locate the row's delete affordance).
      await ruleRow.getByRole('button', { name: 'delete' }).click();
      const deleteRuleDialog = page.getByRole('dialog', {
        name: /Delete Auto Scaling Rule/,
      });
      await expect(deleteRuleDialog).toBeVisible({ timeout: 10000 });
      // Reversible/low-impact action -- confirmed to use a plain confirm modal
      // (Cancel/Delete buttons), not the typed-name "permanently delete"
      // pattern, consistent with destructive-confirmation.md.
      await deleteRuleDialog
        .getByRole('button', { name: 'Delete', exact: true })
        .click();
      await expect(ruleRow).toBeHidden({ timeout: 20000 });

      await deleteDeploymentAndVerify(page, deploymentName);
      createdDeploymentName = null;
    });
  },
);

test.describe(
  'Revision History Tab',
  { tag: ['@functional', '@regression', '@serving', '@deployment'] },
  () => {
    let createdDeploymentName: string | null = null;

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test.afterEach(async ({ page }) => {
      if (createdDeploymentName) {
        await cleanupDeploymentSafely(page, createdDeploymentName);
        createdDeploymentName = null;
      }
    });

    test('Admin can view the Revision History tab structure', async ({
      page,
    }) => {
      const deploymentName = `e2e-plan-history-${Date.now()}`;
      await navigateTo(page, 'deployments');
      await createDeploymentShell(page, deploymentName);
      createdDeploymentName = deploymentName;

      // 1. Click the "Revision History" tab.
      await revisionTabBar(page)
        .getByRole('button', { name: 'Revision History' })
        .click();

      // 2. Confirm the URL updates to include ?revisionTab=revisionHistory.
      await expect(page).toHaveURL(/revisionTab=revisionHistory/, {
        timeout: 20000,
      });

      // 3. Inspect the filter and table.
      // BAIPropertyFilter (Astryx PowerSearch) only lists its field names in
      // the dropdown once opened -- "Revision Number" isn't statically
      // visible the way the old antd-era filter chip text was. The page has
      // two "Search filters" comboboxes (this section's and the Replicas
      // section's below it) -- `.first()` is a race (whichever section
      // finishes mounting first wins, confirmed live to flip between runs),
      // so scope to the container that also holds the tab bar instead.
      const revisionHistorySection = revisionTabBar(page).locator('xpath=..');
      await revisionHistorySection
        .getByRole('combobox', { name: 'Search filters' })
        .click();
      await expect(
        revisionHistorySection.getByRole('option', { name: 'Revision Number' }),
      ).toBeVisible({ timeout: 20000 });
      await page.keyboard.press('Escape');

      // DeploymentRevisionCard renders each tab's content as a conditional
      // child of the BAICard body, not inside a `role="tabpanel"` -- and
      // BAICard has no antd `.ant-card` class any more. The revision-history
      // table is the only one on the page with a "Runtime" column, so scope
      // on that instead of a card wrapper.
      const revisionTable = page.getByRole('table').filter({
        has: page.getByRole('columnheader').filter({ hasText: 'Runtime' }),
      });
      await expect(
        revisionTable
          .getByRole('columnheader')
          .filter({ hasText: /Revision \(ID\)/ }),
      ).toBeVisible();
      await expect(
        revisionTable
          .getByRole('columnheader')
          .filter({ hasText: 'Created At' }),
      ).toBeVisible();
      await expect(
        revisionTable.getByRole('columnheader').filter({ hasText: 'Runtime' }),
      ).toBeVisible();
      await expect(
        revisionTable
          .getByRole('columnheader')
          .filter({ hasText: /Cluster Mode/ }),
      ).toBeVisible();
      // Astryx's empty-table state renders a single visible "No data to
      // display" heading (no antd-`Empty`-style hidden SVG-title duplicate).
      await expect(
        revisionTable.getByRole('heading', { name: 'No data to display' }),
      ).toBeVisible();

      await deleteDeploymentAndVerify(page, deploymentName);
      createdDeploymentName = null;
    });
  },
);
