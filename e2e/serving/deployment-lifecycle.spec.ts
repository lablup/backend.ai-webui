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
  escapeForRegExp,
  provisionDeploymentFixtures,
  provisionDeploymentModelFolder,
  selectRevisionModalOption,
} from '../utils/deployment-fixtures';
import { skipUnlessClientFeature } from '../utils/feature-gate-util';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { getFormItemControlByLabel } from '../utils/test-util-antd';
import { test, expect } from '@playwright/test';

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
        await expect(
          page
            .getByRole('navigation')
            .getByText('Deployments', { exact: true }),
        ).toBeVisible({ timeout: 20000 });
        await expect(page.getByRole('radio', { name: 'Running' })).toBeChecked({
          timeout: 20000,
        });
        // antd's button-style BAIRadioGroup visually hides the raw <input>
        // (opacity: 0) and renders the clickable label on the surrounding
        // `.ant-radio-button-wrapper` -- `toBeVisible()` on the raw radio
        // always fails ("hidden") even though the option is genuinely
        // offered. Assert on the visible wrapper instead (confirmed via
        // live DOM inspection; see also endpoint-route-table.spec.ts for the
        // same pattern on an analogous Running/Finished toggle).
        await expect(
          page.locator('.ant-radio-button-wrapper', { hasText: 'Terminated' }),
        ).toBeVisible();
        await expect(
          page.getByRole('button', { name: 'reload' }),
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
        await expect(
          page.getByRole('columnheader', { name: 'Created At' }),
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
        // The raw radio input is visually hidden by antd's button-style
        // radio group; click the visible wrapper instead (see comment in
        // "Admin can view the deployments list..." above).
        await page
          .locator('.ant-radio-button-wrapper', { hasText: 'Terminated' })
          .click();
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
      await expect(page.getByRole('button', { name: 'edit Edit' })).toBeVisible(
        {
          timeout: 20000,
        },
      );
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

      // Replicas section
      await expect(page.getByText('Replicas', { exact: true })).toBeVisible();
      // Same hidden-input caveat as the deployments list page's toggle --
      // assert on the visible `.ant-radio-button-wrapper`, not the raw radio.
      await expect(
        page.locator('.ant-radio-button-wrapper', { hasText: 'Running' }),
      ).toBeVisible();
      await expect(
        page.locator('.ant-radio-button-wrapper', { hasText: 'Terminated' }),
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
      const deploymentName = `e2e-plan-preset-${Date.now()}`;
      await navigateTo(page, 'deployments');
      await createDeploymentShell(page, deploymentName);
      createdDeploymentName = deploymentName;

      // 1. Click "Add Revision" (from either the banner or the tab bar).
      await page
        .getByRole('tablist')
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
      await expect(
        dialog.getByRole('button', { name: 'info-circle' }),
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
      await page
        .getByRole('tablist')
        .getByRole('button', { name: 'Add Revision' })
        .click();
      const dialog = page.getByRole('dialog', { name: /Add Revision/ });
      await expect(dialog).toBeVisible({ timeout: 20000 });

      // 2. Select the "Advanced Mode" segmented-control option.
      await page.locator('label').filter({ hasText: 'Advanced Mode' }).click();

      // 3. Inspect the expanded field set.
      await expect(dialog.getByText('Model & Runtime')).toBeVisible({
        timeout: 10000,
      });
      await expect(dialog.getByText('Select Folder')).toBeVisible();
      await expect(
        dialog.getByRole('combobox', { name: /Runtime/ }),
      ).toBeVisible();
      await expect(
        dialog.getByRole('checkbox', { name: 'Enable Health Check' }),
      ).toBeVisible();
      await expect(
        dialog.getByText('Environments', { exact: true }),
      ).toBeVisible();
      await expect(dialog.getByText('Environments / Version')).toBeVisible();
      await expect(
        dialog.getByRole('button', { name: 'Add environment variables' }),
      ).toBeVisible();
      await expect(dialog.getByText('Cluster & Resources')).toBeVisible({
        timeout: 20000,
      });
      await expect(
        dialog.getByRole('combobox', { name: 'Resource Presets' }),
      ).toBeVisible({ timeout: 20000 });
      await expect(
        dialog.getByRole('radio', { name: /Multi Node/ }),
      ).toBeChecked();
      // Same hidden-input caveat -- assert on the visible wrapper, not the
      // raw (CSS-hidden) radio input.
      await expect(
        dialog.locator('.ant-radio-button-wrapper', { hasText: /Single Node/ }),
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
          await page
            .getByRole('tablist')
            .getByRole('button', { name: 'Add Revision' })
            .click();
          const dialog = page.getByRole('dialog', { name: /Add Revision/ });
          await expect(dialog).toBeVisible({ timeout: 20000 });
          await expect(
            dialog.getByRole('radio', { name: 'Preset Mode' }),
          ).toBeChecked();

          // 2. Select the ensured preset from the "Preset" dropdown. The
          // dropdown groups options by runtime category and renders virtualized
          // option rows with a computed width of 0 px, so selection happens via
          // search + keyboard Enter -- the full investigation lives on
          // selectRevisionModalOption in utils/deployment-fixtures.ts.
          await selectRevisionModalOption(
            page,
            '#revisionPresetId',
            provisioned.presetName,
          );

          // 3. Confirm/select the "Model Folder" (verify whether it auto-populates
          // from the preset or must be chosen separately). Manual verification
          // found it does NOT auto-fill -- it must be chosen independently. The
          // Model Folder combobox only lists Project-owned/user-owned VFolders
          // (not model-store/project-store catalog resources), which is why the
          // provisioned folder is created as the e2e admin account's own owned
          // VFolder. Same zero-width option rows as the preset dropdown --
          // keyboard selection via the shared helper.
          await selectRevisionModalOption(
            page,
            '#modelFolderId',
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

          // 6. Wait for the deployment's Lifecycle/status to leave "Pending" (allow
          // a generous timeout for scheduling; this is a real model-serving
          // container pull + start).
          const lifecycleRow = page.getByRole('row').filter({
            has: page.getByRole('rowheader', { name: 'Lifecycle' }),
          });
          await expect(
            lifecycleRow.getByRole('cell').first(),
          ).not.toContainText('Pending', { timeout: 180_000 });

          // 7. Inspect the "Current Revision" tab, confirming the revision is
          // now actually attached (this is the reliable, deterministic
          // success signal for "a revision was added and scheduling began" --
          // see the note below on why this test does not also wait for the
          // Replicas table's empty state to clear).
          // NOTE: DeploymentRevisionCard uses BAICard's `tabList` API, which
          // renders each tab's content as a conditional child of the Card
          // body rather than inside antd's own `role="tabpanel"` panes --
          // those panes are always empty placeholders here (confirmed live:
          // both `#rc-tabs-0-panel-currentRevision` and
          // `#rc-tabs-0-panel-revisionHistory` have zero children even while
          // active). Scope on the `.ant-card` itself instead of the
          // content-less tabpanel role.
          const currentRevisionCard = page
            .locator('.ant-card')
            .filter({ hasText: 'Current Revision' });
          await expect(currentRevisionCard).not.toContainText(
            'No revision is deployed',
            { timeout: 10000 },
          );
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
        async ({ page }) => {
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
          const folderName = await provisionDeploymentModelFolder(page);
          fixtures = { folderName };

          const deploymentName = `e2e-plan-manual-rev-${Date.now()}`;
          await navigateTo(page, 'deployments');
          await createDeploymentShell(page, deploymentName);
          createdDeploymentName = deploymentName;

          // 1. Open "Add Revision" and switch to Advanced Mode.
          await page
            .getByRole('tablist')
            .getByRole('button', { name: 'Add Revision' })
            .click();
          const dialog = page.getByRole('dialog', { name: /Add Revision/ });
          await expect(dialog).toBeVisible({ timeout: 20000 });
          await page
            .locator('label')
            .filter({ hasText: 'Advanced Mode' })
            .click();
          await expect(dialog.getByText('Model & Runtime')).toBeVisible({
            timeout: 10000,
          });

          // 2. Select the provisioned model folder -- the Advanced form's
          // folder Select shares the `#modelFolderId` id and search behavior
          // with Preset Mode (only one form is mounted at a time), so the
          // shared helper applies unchanged.
          await selectRevisionModalOption(page, '#modelFolderId', folderName);

          // 3. Select the "custom" runtime variant. This Select exposes no
          // accessible option roles and its rows are not clickable (same
          // zero-width virtualized rendering as the other modal Selects,
          // confirmed live), and it has no "Total N items" footer either --
          // so the shared helper's settle gate does not apply. Its variant
          // list loads via its own query, and keyboard selection silently
          // no-ops while that list is still empty (observed live under
          // load) -- so first gate on the filtered "custom" entry actually
          // existing in the dropdown (attached, not visible: the rows
          // render zero-width). Then ArrowDown + Enter selects the sole
          // match; the content assertion proves the intended variant (not
          // some other row) was selected.
          await page.locator('#runtimeVariantId').click();
          await page.locator('#runtimeVariantId').fill('custom');
          const runtimeDropdown = page
            .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
            .first();
          await expect(
            runtimeDropdown.getByText('custom', { exact: true }).first(),
          ).toBeAttached({ timeout: 15000 });
          await page.locator('#runtimeVariantId').press('ArrowDown');
          await page.locator('#runtimeVariantId').press('Enter');
          await expect(
            page
              .locator('.ant-select', {
                has: page.locator('#runtimeVariantId'),
              })
              .locator('.ant-select-content'),
          ).toContainText('custom', { timeout: 5000 });

          // 4. The custom runtime reveals the definition-mode control with
          // "Enter Command" preselected -- fill the start command that runs
          // the folder's mock server. The image (Environments / Version) is
          // left at the form's own auto-selected default; resources are set by
          // hand below to satisfy that image's minimum footprint (the submit
          // handler itself rejects a missing image, so a cluster with no
          // usable image fails loudly here rather than silently).
          const startCommand = page.locator('#startCommand');
          await expect(startCommand).toBeVisible({ timeout: 10000 });
          await startCommand.fill('python3 /models/mock_openai_server.py');

          // The Environments / Version selects resolve their default image
          // asynchronously; submitting before they finish leaves the form's
          // image empty and the submit handler rejects it, keeping the
          // modal open (observed live as an intermittent submit "failure").
          // antd v6 marks a resolved selection with the
          // `ant-select-content-has-value` class on the content element --
          // gate on it for both selects before submitting.
          const envSelects = dialog.locator('.ant-select', {
            has: page.locator(
              '#environments_environment, #environments_version',
            ),
          });
          await expect(envSelects).toHaveCount(2, { timeout: 20000 });
          for (const index of [0, 1]) {
            await expect(
              envSelects.nth(index).locator('.ant-select-content'),
            ).toHaveClass(/ant-select-content-has-value/, { timeout: 30000 });
          }

          // The Cluster & Resources section mounts via its own
          // query/Suspense boundary and takes 10s+ on the shared cluster
          // (the "view Advanced Mode fields" test above waits for the same
          // landmark). Submitting before it mounts leaves the `resource`
          // fields unregistered on the form, and the submit handler then
          // dies on the missing values with no visible error at all --
          // observed live as a click that produced no form error, no
          // notification, and no mutation. Gate on the section's landmark.
          await expect(
            dialog.getByRole('combobox', { name: 'Resource Presets' }),
          ).toBeVisible({ timeout: 30000 });

          // The form's auto-selected default image carries a minimum resource
          // footprint (observed live: CPU >= 5, mem >= 1088MiB) that the
          // default resource preset does NOT meet, so submitting at the
          // defaults fails form validation ("CPU must be minimum 5", "The
          // minimum memory capacity ... is 1088MiB") and silently keeps the
          // modal open. Set CPU/mem above those minimums by hand -- part of
          // building a revision manually. The CPU locator is scoped to
          // `.ant-input-number input` so it targets the number field, not the
          // paired slider's own input (which `.fill()` cannot set).
          const cpuInput = dialog
            .locator(
              '.ant-form-item-row:has-text("CPU") .ant-input-number input',
            )
            .first();
          await cpuInput.click();
          await cpuInput.fill('5');
          await cpuInput.blur();
          const memInput = dialog
            .locator(
              '.ant-form-item-row:has-text("Memory") .ant-input-number input',
            )
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

          const currentRevisionCard = page
            .locator('.ant-card')
            .filter({ hasText: 'Current Revision' });
          await expect(currentRevisionCard).not.toContainText(
            'No revision is deployed',
            { timeout: 20000 },
          );

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
      await page.getByRole('button', { name: 'edit Edit' }).click();

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
      await page.getByRole('button', { name: 'edit Edit' }).click();
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
      await page.getByRole('tab', { name: 'Revision History' }).click();

      // 2. Confirm the URL updates to include ?revisionTab=revisionHistory.
      await expect(page).toHaveURL(/revisionTab=revisionHistory/, {
        timeout: 20000,
      });

      // 3. Inspect the filter and table.
      // NOTE: `getByRole('tabpanel', { name: 'Revision History' })` always
      // times out here -- DeploymentRevisionCard renders each tab's content
      // as a conditional child of the BAICard body (see `tabList` usage in
      // DeploymentRevisionCard.tsx), not inside antd's own tabpanel panes.
      // Verified live: `#rc-tabs-0-panel-revisionHistory` (the actual
      // `role="tabpanel"` element) has zero children even while active/
      // visible -- the real filter+table content is a sibling of the tab
      // bar, inside the `.ant-card`. Scope on the card instead.
      const revisionCard = page
        .locator('.ant-card')
        .filter({ hasText: 'Revision History' });
      await expect(revisionCard.getByText('Revision Number')).toBeVisible({
        timeout: 20000,
      });
      await expect(
        revisionCard.getByRole('columnheader', { name: /Revision \(ID\)/ }),
      ).toBeVisible();
      await expect(
        revisionCard.getByRole('columnheader', { name: 'Created At' }),
      ).toBeVisible();
      await expect(
        revisionCard.getByRole('columnheader', { name: 'Runtime' }),
      ).toBeVisible();
      await expect(
        revisionCard.getByRole('columnheader', { name: /Cluster Mode/ }),
      ).toBeVisible();
      // antd's stock `Empty` component (used for the table's empty state)
      // renders the "No data" string twice: once as the illustration SVG's
      // accessibility `<title>` (always hidden -- SVG titles are never
      // rendered) and once as the visible `.ant-empty-description` caption.
      // `getByText('No data').first()` non-deterministically resolves to the
      // hidden title (confirmed live), so target the caption class directly.
      await expect(
        revisionCard.locator('.ant-empty-description'),
      ).toBeVisible();

      await deleteDeploymentAndVerify(page, deploymentName);
      createdDeploymentName = null;
    });
  },
);
