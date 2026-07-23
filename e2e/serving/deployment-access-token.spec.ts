// spec: e2e/.agent-output/test-plan-e2e-coverage-gaps.md
//
// Coverage gap this file fills: deployment-lifecycle.spec.ts only verifies
// that "Create Access Token" is disabled when a deployment has no revision.
// This file covers the rest of the Access Token issuance path: the button
// becoming enabled once a revision is attached, the "Create Access Token"
// modal's contents, and actually issuing a token (verified via the returned
// "Token" result dialog).
//
// Design notes from live investigation:
// 1. This test deliberately creates and tears down only ONE deployment
//    (with one revision attached), doing the full disabled -> enabled ->
//    open modal -> issue token -> verify-result flow inside a single test,
//    rather than splitting into multiple tests that would each need their
//    own revision. Adding a revision is a real scheduling operation on the
//    shared QA cluster, so this minimizes how many times that happens.
// 2. The test issues a real token and verifies the manager returned it (the
//    "Token" result dialog shows the token value + expiration). It does NOT
//    then assert the token appears as a row in the Access Tokens table, nor
//    revoke it: live investigation found the manager mints the token
//    synchronously (the result dialog is reliable) but the list-view refresh
//    that surfaces the new row does not populate deterministically while the
//    deployment is still "Deploying" -- the table stayed on "No data" past
//    the token's creation across repeated runs, the same cluster-scheduling
//    -latency characteristic documented in deployment-lifecycle.spec.ts.
//    See the detailed comment at that step. List-refresh timing and revoke
//    are better covered by backend-surface tests (auto-tester) than this UI
//    e2e; the throwaway deployment (and its token) is destroyed in cleanup.
// 3. Per the task brief, clicking the "Create Access Token" button uses
//    `dispatchEvent('click')` instead of a plain `.click()` -- investigation
//    found this button can sit underneath an overlapping
//    `.ant-descriptions-item-content` <td> from the Basic Information card
//    above it, which fails both a plain `.click()` and `.click({ force:
//    true })` with "subtree intercepts pointer events". `dispatchEvent`
//    fires the click directly on the button, bypassing hit-testing
//    entirely, so it is unaffected by that overlap regardless of timing.
// 4. Adding a revision auto-opens a "Revision Detail" dialog. This test
//    closes it explicitly before interacting with "Create Access Token" --
//    both because that dialog's mask would otherwise block the click, and
//    to avoid the modal query below matching more than one open dialog.
//    Every dialog assertion is still scoped by exact accessible name
//    (`getByRole('dialog', { name: 'Create Access Token' })`, etc.) as a
//    second layer of disambiguation.
// 5. This test does not wait for replica scheduling (which can take
//    anywhere from ~40s to over 20 minutes on this shared cluster, per
//    deployment-lifecycle.spec.ts's investigation) -- it deletes the
//    deployment immediately after verifying the token flow.
import {
  cleanupDeploymentFixtures,
  cleanupDeploymentSafely,
  createDeploymentShell,
  deleteDeploymentAndVerify,
  type DeploymentFixtures,
  provisionDeploymentFixtures,
  selectRevisionModalOption,
} from '../utils/deployment-fixtures';
import { skipUnlessClientFeature } from '../utils/feature-gate-util';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

/**
 * Adds a revision using the fixtures pair from utils/deployment-fixtures.ts
 * (a found-or-created GPU-free preset + a freshly provisioned model folder;
 * see deployment-lifecycle.spec.ts's header comment for why a hand-seeded
 * fixture pair cannot be assumed). Both dropdowns are selected via search +
 * keyboard Enter because their virtualized option rows render with a
 * computed width of 0 and are not clickable -- the full investigation lives
 * on selectRevisionModalOption.
 */
async function addProvisionedRevision(
  page: Page,
  fixtures: DeploymentFixtures,
): Promise<void> {
  await page
    .getByRole('tablist')
    .getByRole('button', { name: 'Add Revision' })
    .click();
  const dialog = page.getByRole('dialog', { name: /Add Revision/ });
  await expect(dialog).toBeVisible({ timeout: 20000 });

  await selectRevisionModalOption(
    page,
    '#revisionPresetId',
    fixtures.presetName,
  );
  await selectRevisionModalOption(page, '#modelFolderId', fixtures.folderName);

  await expect(
    dialog.getByRole('checkbox', { name: 'Apply immediately after adding' }),
  ).toBeChecked();
  await dialog.getByRole('button', { name: 'Add Revision' }).click();
  await expect(dialog).toBeHidden({ timeout: 20000 });

  // Adding a revision auto-opens a "Revision Detail" dialog; close it so it
  // doesn't block (or ambiguously match against) the next interaction.
  const revisionDetailDialog = page.getByRole('dialog', {
    name: 'Revision Detail',
  });
  await expect(revisionDetailDialog).toBeVisible({ timeout: 10000 });
  await revisionDetailDialog.getByRole('button', { name: 'Close' }).click();
  await expect(revisionDetailDialog).toBeHidden({ timeout: 10000 });
}

test.describe(
  'Deployment Access Token Modal',
  { tag: ['@regression', '@serving', '@functional'] },
  () => {
    let createdDeploymentName: string | null = null;
    let fixtures: DeploymentFixtures | null = null;

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

    test(
      'Admin can issue an access token after adding a revision to a deployment',
      { tag: ['@critical'] },
      async ({ page }) => {
        // 360s covers fixture provisioning (model folder + upload + preset
        // mutation), the revision + token flow, and teardown including
        // fixture cleanup.
        test.setTimeout(360_000);
        const deploymentName = `e2e-token-${Date.now()}`;

        // 0. Ensure the preset + model folder pair the Add Revision flow
        // selects (a compatible pre-existing preset is reused when the
        // cluster has one, created otherwise -- no hand-seeded fixture is
        // assumed either way), gated on the same capability flag the UI
        // checks.
        // NOTE: this provisioning (folder create + fixture upload) is the
        // same heavy /data + storage path that deployment-lifecycle.spec.ts
        // serializes between its own two revision tests. Cross-FILE overlap
        // with that spec's provisioning is still possible under local
        // multi-worker runs and can slow both sides' list/upload waits; CI
        // runs single-worker (playwright.config.ts), where this cannot
        // happen.
        await skipUnlessClientFeature(
          page,
          'deployment-preset',
          "Adding a revision from a preset requires the 'deployment-preset' capability (manager >= 26.4.x)",
        );
        fixtures = await provisionDeploymentFixtures(page);

        // 1. Navigate to /deployments and create a deployment shell.
        await navigateTo(page, 'deployments');
        await createDeploymentShell(page, deploymentName);
        createdDeploymentName = deploymentName;

        // 2. Verify "Create Access Token" is disabled before any revision exists.
        const createAccessTokenButton = page.getByRole('button', {
          name: 'Create Access Token',
        });
        await expect(createAccessTokenButton).toBeDisabled({ timeout: 20000 });

        // 3. Add a revision (found-or-created preset + provisioned model
        // folder, keyboard-selected, "Apply immediately after adding" left
        // checked).
        await addProvisionedRevision(page, fixtures);

        // 4. Wait for "Create Access Token" to become enabled now that a
        // revision is attached.
        await expect(createAccessTokenButton).toBeEnabled({ timeout: 30000 });

        // 5. Click "Create Access Token" via dispatchEvent to bypass the
        // overlapping-cell pointer-interception issue (see header comment).
        await createAccessTokenButton.dispatchEvent('click');

        // 6. Verify the "Create Access Token" modal opens, scoped by exact
        // dialog name to avoid ambiguity with any other open dialog.
        const createTokenDialog = page.getByRole('dialog', {
          name: 'Create Access Token',
        });
        await expect(createTokenDialog).toBeVisible({ timeout: 10000 });
        await expect(
          createTokenDialog.getByRole('combobox', { name: 'Expiration' }),
        ).toBeVisible();
        await expect(createTokenDialog.getByText('7 Days')).toBeVisible();
        await expect(
          createTokenDialog.getByRole('button', { name: 'Cancel' }),
        ).toBeVisible();
        await expect(
          createTokenDialog.getByRole('button', {
            name: 'Create Access Token',
          }),
        ).toBeVisible();

        // 7. Submit with the default "7 Days" expiration to actually issue a
        // token. The submit button lives inside the modal (scoped via
        // `createTokenDialog`), so it does not collide with the identically
        // named card-level trigger button behind it.
        await createTokenDialog
          .getByRole('button', { name: 'Create Access Token' })
          .click();

        // 8. Verify the issued-token result dialog appears with the token value
        // and expiration. This is the deterministic success signal: the token
        // was actually minted by the manager and returned to the UI.
        // NOTE: `exact: true` is required, not just prudent -- getByRole
        // name matching is substring by default, so a bare 'Token' also
        // matches the "Create Access Token" modal, which can still be
        // mid-close (its DOM lingers through the close animation) when this
        // dialog appears -- observed live as a strict-mode violation.
        const tokenDialog = page.getByRole('dialog', {
          name: 'Token',
          exact: true,
        });
        await expect(tokenDialog).toBeVisible({ timeout: 10000 });
        await expect(
          tokenDialog.getByText('Access token has been created.'),
        ).toBeVisible();
        await expect(tokenDialog.getByText(/^Expiration:/)).toBeVisible();
        await tokenDialog.getByRole('button', { name: 'Close' }).click();
        await expect(tokenDialog).toBeHidden({ timeout: 10000 });

        // Deliberately NOT asserted: that the issued token then appears as a
        // row in the Access Tokens table, nor revoking it. Live investigation
        // confirmed the manager mints the token synchronously (the "Token"
        // result dialog above always shows it), but the *list-view refresh*
        // that surfaces the new row does not populate deterministically while
        // the deployment is still "Deploying" (replica scheduling in
        // progress) -- the table stayed on its "No data" empty state well
        // past the token's creation across repeated runs, the same
        // cluster-scheduling-latency characteristic documented in
        // deployment-lifecycle.spec.ts (replica appearance measured at ~40s to
        // 20min+). Asserting on the row (and thus revoke) would make this
        // test's outcome hostage to that latency rather than to whether token
        // issuance works. The "Token" result dialog is the reliable,
        // deterministic proof that issuance succeeded; list-refresh timing and
        // revoke are better covered by backend-surface tests (auto-tester)
        // than by this UI e2e. The token is scoped to this throwaway
        // deployment and is destroyed with it in cleanup below.

        // 9. Clean up: delete the deployment shell immediately (this tears down
        // the attached revision and any issued token with it), without waiting
        // for replica scheduling. The provisioned preset + folder go last (the
        // revision referenced them).
        await deleteDeploymentAndVerify(page, deploymentName);
        createdDeploymentName = null;
        await cleanupDeploymentFixtures(page, fixtures);
        fixtures = null;
      },
    );
  },
);
