// spec: e2e/.agent-output/test-plan-session-vfolder-mount.md
//
// Covers two folder-mounting mechanisms exposed in the Session Launcher
// (/session/start) and verified in the running session's detail drawer:
//   1. Explicit mount - user checks a folder's row in the Data & Storage
//      step's selectable table.
//   2. Automount - a dot-prefixed, Auto-Mount-usage-mode folder is never
//      shown in the selectable table and is attached to every session the
//      owning user launches automatically.
// Both converge in the running session's "Mounted folders" drawer row.
import { SessionLauncher } from '../utils/classes/session/SessionLauncher';
import { FolderCreationModal } from '../utils/classes/vfolder/FolderCreationModal';
import { cleanupVFolderSafely } from '../utils/cleanup-util';
import {
  createVFolderAndVerify,
  loginAsAdmin,
  navigateTo,
  verifyVFolder,
} from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

// Unique per-run resource names shared across the serial scenarios below.
// Naming follows the plan's convention: an `e2e-plan-` prefix for the regular
// mount-test folder, and a dot-prefixed `e2e-plan-` name for the automount
// folder, so both are identifiable as this suite's resources and the
// automount folder is recognized by the automount mechanism.
const RUN_ID = `${Date.now()}`;
const MOUNT_FOLDER_NAME = `e2e-plan-mount-test-${RUN_ID}`;
const AUTOMOUNT_FOLDER_NAME = `.e2e-plan-automount-${RUN_ID}`;
const SESSION_NAME = `e2e-plan-mount-session-${RUN_ID}`;

/**
 * Scenario 2.1, steps 1-3: fill the Session Type step (Interactive is the
 * default) with a session name, then jump directly to the "Data & Storage"
 * step via its step-rail button instead of clicking "Next" through every
 * intermediate step. The launcher's step buttons are directly jumpable once
 * session type + name are valid (see plan's Automation Notes), which is much
 * faster than replaying the full SessionLauncher.create() flow for a
 * mount-focused test.
 */
async function goToDataStorageStep(page: Page): Promise<void> {
  // 1. Navigate to `/session/start`.
  await navigateTo(page, 'session/start');

  // 2. Optionally set a session name on the Session Type step. Uses the same
  // `#sessionName` id locator as SessionLauncher.fillSessionName() - the
  // field's accessible role/name does not resolve cleanly via getByRole.
  // The Session Launcher form takes ~10-13s to fully hydrate after a direct
  // page.goto on this QA cluster (confirmed by direct measurement), so this
  // needs the same generous margin as route-crawl.spec.ts's SLOW tier.
  const sessionNameInput = page.locator('#sessionName');
  await expect(sessionNameInput).toBeVisible({ timeout: 30000 });
  await sessionNameInput.fill(SESSION_NAME);

  // 3. Jump directly to the "Data & Storage" step by clicking its step button.
  await page.getByRole('button', { name: 'Data & Storage' }).click();
  await expect(page).toHaveURL(/step=2/, { timeout: 15000 });
}

test.describe.serial(
  'Session VFolder Mount & Automount',
  { tag: ['@functional', '@regression', '@session', '@vfolder'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test.afterAll(async ({ browser, request }) => {
      // Cleanup can involve terminating a session plus trashing + permanently
      // deleting two folders (each up to ~15s per the trash/delete helpers) -
      // give it more room than the default 180s test budget.
      test.setTimeout(180_000);
      const context = await browser.newContext();
      const page = await context.newPage();
      await loginAsAdmin(page, request);

      // Terminate the launched session if it is still around. SessionLauncher's
      // terminate() already no-ops gracefully when the session row is not
      // found (never launched, or already terminated by the test itself), so
      // this is safe to call unconditionally as a best-effort safety net.
      try {
        const launcher = new SessionLauncher(page);
        launcher.withSessionName(SESSION_NAME);
        await launcher.terminate();
      } catch (error) {
        console.log(
          `[cleanup] failed to terminate session ${SESSION_NAME}:`,
          error,
        );
      }

      await cleanupVFolderSafely(page, MOUNT_FOLDER_NAME);
      await cleanupVFolderSafely(page, AUTOMOUNT_FOLDER_NAME);

      await context.close();
    });

    test.describe('Folder Creation - Auto Mount Usage Mode', () => {
      test('Admin can create a folder with Auto Mount usage mode using a dot-prefixed name', async ({
        page,
      }) => {
        // 1. Navigate to /data.
        await navigateTo(page, 'data');

        // 2. Click "Create Folder".
        await page
          .getByRole('button', { name: 'Create Folder' })
          .first()
          .click();
        const modal = new FolderCreationModal(page);
        await modal.modalToBeVisible();

        // 3. In the "Usage Mode" radiogroup, select "Auto Mount".
        await (await modal.getAutoMountUsageModeRadio()).click();

        // 4. In the "Folder name" field, type a dot-prefixed name.
        await modal.fillFolderName(AUTOMOUNT_FOLDER_NAME);

        // 5. Leave Location/Type/Permission at their defaults (sp1:local / User / Read & Write) - no action needed.

        // 6. Click "Create".
        await (await modal.getCreateButton()).click();

        // Expected: no validation error for the dot-prefixed name - a success
        // notification appears: "Folder: .e2e-plan-automount-<run> / Folder created".
        const notification = page
          .getByRole('alert')
          .filter({ hasText: 'Folder created' });
        await expect(notification).toBeVisible({ timeout: 15000 });
        await expect(notification).toContainText(AUTOMOUNT_FOLDER_NAME);

        // Expected: the new folder appears in the Data page's Active tab list.
        await verifyVFolder(page, AUTOMOUNT_FOLDER_NAME);
      });
    });

    test.describe('Session Launcher - Data & Storage Step', () => {
      test('Admin can select an existing folder to mount for a new session', async ({
        page,
      }) => {
        // Assumption: at least one non-automount folder exists (created here
        // with default "General" usage mode, per this scenario's Assumptions).
        await createVFolderAndVerify(
          page,
          MOUNT_FOLDER_NAME,
          'general',
          'user',
          'rw',
        );

        // 1-3. Navigate to /session/start, set the session name, and jump to
        // the "Data & Storage" step.
        await goToDataStorageStep(page);

        // 4. Locate the selectable folder table.
        const folderTable = page.getByRole('table').first();
        await expect(folderTable).toBeVisible({ timeout: 20000 });

        // 5. Check the checkbox on the mount-test folder's row.
        const folderRow = folderTable.getByRole('row', {
          name: new RegExp(MOUNT_FOLDER_NAME),
        });
        await expect(folderRow).toBeVisible({ timeout: 15000 });
        await folderRow.getByRole('checkbox').click();

        // Expected: checking the row reveals an inline "Path & Alias" field
        // showing the default container mount path (`/home/work/<folder-name>`).
        await expect(
          folderRow.getByText(`/home/work/${MOUNT_FOLDER_NAME}`),
        ).toBeVisible({ timeout: 10000 });

        // Expected: the "Select all" header checkbox reflects a mixed/partial
        // state when only some rows are checked.
        const selectAllCheckbox = page.getByRole('checkbox', {
          name: 'Select all',
        });
        await expect(selectAllCheckbox).toHaveJSProperty(
          'indeterminate',
          true,
          { timeout: 10000 },
        );
      });

      test('Admin can see automount folders displayed separately from selectable folders in the Data & Storage step', async ({
        page,
      }) => {
        // 1. Navigate to /session/start and jump to the "Data & Storage" step.
        await goToDataStorageStep(page);

        // 2. Inspect the selectable folder table's rows.
        const folderTable = page.getByRole('table').first();
        // Wait for the table to finish loading real data (the mount-test
        // folder from the previous scenario is a known-present row) before
        // asserting on the automount folder's absence below.
        await expect(
          folderTable.getByRole('row', { name: new RegExp(MOUNT_FOLDER_NAME) }),
        ).toBeVisible({ timeout: 20000 });

        // Expected: the dot-prefixed automount folder does NOT appear as a
        // row in the selectable/checkable folder table.
        await expect(
          folderTable.getByRole('link', { name: AUTOMOUNT_FOLDER_NAME }),
        ).toHaveCount(0);

        // 3. Look below the selectable table for a second, separate table.
        // Expected: a read-only "Automount Folders : <name>" row is rendered
        // there - purely informational, no checkbox. Matched via two
        // substring checks rather than one literal `Automount Folders :
        // ${name}` string - if more than one automount folder exists on the
        // account, the row's accessible name concatenates every folder name
        // space-separated (e.g. "Automount Folders : .foo .bar"), so an exact
        // "label + this-folder-only" string only matches when this is the
        // *sole* automount folder present.
        const automountRow = page
          .getByRole('row', { name: /Automount Folders/ })
          .filter({ hasText: AUTOMOUNT_FOLDER_NAME });
        await expect(automountRow).toBeVisible({ timeout: 15000 });
      });
    });

    test.describe('Session Launcher - Review Step', () => {
      test('Admin can see explicitly selected and automount folders listed in the Data & Storage review section', async ({
        page,
      }) => {
        // 1. Continue from the Data & Storage scenario's state: jump to Data
        // & Storage and check the mount-test folder.
        await goToDataStorageStep(page);
        const folderTable = page.getByRole('table').first();
        const folderRow = folderTable.getByRole('row', {
          name: new RegExp(MOUNT_FOLDER_NAME),
        });
        await expect(folderRow).toBeVisible({ timeout: 15000 });
        await folderRow.getByRole('checkbox').click();

        // 2. Click the "Confirm and Launch" step button to jump to the final
        // review step.
        await page.getByRole('button', { name: 'Confirm and Launch' }).click();
        await expect(page).toHaveURL(/step=4/, { timeout: 15000 });

        // 3. Locate the "Data & Storage" section within the review page.
        // Expected: the review page renders five sections, each with its own
        // "Edit" button.
        await expect(page.getByRole('button', { name: 'Edit' })).toHaveCount(
          5,
          { timeout: 15000 },
        );

        // Expected: the Data & Storage section shows a two-column table with
        // the checked folder's name and mount path.
        const reviewMountTable = page.getByRole('table').filter({
          has: page.getByRole('columnheader', { name: 'Path & Alias' }),
        });
        await expect(reviewMountTable).toBeVisible({ timeout: 15000 });
        await expect(
          reviewMountTable.getByRole('row', {
            name: new RegExp(MOUNT_FOLDER_NAME),
          }),
        ).toContainText(`/home/work/${MOUNT_FOLDER_NAME}`);

        // Expected: a second table directly below shows the automount folder.
        // See the identical multi-folder concatenation note in the Data &
        // Storage Step scenario above - matched via two substring checks
        // rather than one literal `Automount Folders : ${name}` string.
        const reviewAutomountRow = page
          .getByRole('row', { name: /Automount Folders/ })
          .filter({ hasText: AUTOMOUNT_FOLDER_NAME });
        await expect(reviewAutomountRow).toBeVisible();

        // Expected: a "Launch" button (with a play-circle icon) is visible at
        // the bottom of the page. Scoped to the native <button> tag - per
        // SessionLauncher.create()'s own launch-button locator, plain
        // getByRole('button', {name: 'Launch'}) is a strict-mode violation
        // here because the step-rail's "Confirm and Launch" nav item is also
        // exposed as role=button and its name contains the substring "Launch".
        await expect(
          page.locator('button').filter({ hasText: 'Launch' }),
        ).toBeVisible();
      });
    });

    test.describe('Session Launch and Mounted Folder Verification', () => {
      test(
        'Admin can verify both an explicitly mounted folder and an automount folder appear in the session detail drawer after launch',
        { tag: ['@critical', '@requires-agent-capacity'] },
        async ({ page }) => {
          test.setTimeout(240_000);

          // Setup: replay the Data & Storage and Review Step scenarios so
          // this test starts from the same configured-but-not-yet-launched
          // state (name filled, mount-test folder checked, review step open).
          await goToDataStorageStep(page);
          const folderTable = page.getByRole('table').first();
          const folderRow = folderTable.getByRole('row', {
            name: new RegExp(MOUNT_FOLDER_NAME),
          });
          await expect(folderRow).toBeVisible({ timeout: 15000 });
          await folderRow.getByRole('checkbox').click();
          await page
            .getByRole('button', { name: 'Confirm and Launch' })
            .click();
          await expect(page).toHaveURL(/step=4/, { timeout: 15000 });

          // 1. From the review step, click "Launch". Scoped to the native
          // <button> tag - see the Review Step scenario's identical
          // strict-mode note above.
          const launchButton = page
            .locator('button')
            .filter({ hasText: 'Launch' });
          await expect(launchButton).toBeEnabled({ timeout: 15000 });
          await launchButton.click();

          // 2. Wait for the browser to navigate to /session and for the new
          // session row to appear (status transitions PREPARED → CREATING →
          // RUNNING).
          await expect(page).toHaveURL(/\/session/, { timeout: 15000 });
          const sessionRow = page
            .locator('tr')
            .filter({ hasText: SESSION_NAME });
          await expect(sessionRow).toBeVisible({ timeout: 30000 });
          // Expected: no "No storage folder is mounted" dialog appears, since
          // a folder is mounted.
          await expect(
            page.getByRole('dialog', { name: 'No storage folder is mounted' }),
          ).toHaveCount(0);

          // 3. Wait for the session to reach RUNNING (or at minimum a
          // non-PENDING state) with a bounded timeout *before* trying to open
          // the Session Info drawer - matches the proven ordering in
          // AppLauncherModal.openFromSession() ("Wait for session to reach
          // RUNNING status" happens first, *then* openSessionDetailDrawer()).
          // Confirmed via two live runs: clicking the session name while it
          // is still PREPARED does not open the drawer at all (only a
          // floating launch-progress toast is visible); if it remains
          // PENDING, skip the remainder of the test citing insufficient
          // agent capacity (@requires-agent-capacity) instead of hanging or
          // failing on an environment issue unrelated to the mount feature
          // under test.
          const statusCell = sessionRow.getByRole('cell').nth(2);
          const reachedRunning = await statusCell
            .getByText('RUNNING', { exact: true })
            .waitFor({ state: 'visible', timeout: 90_000 })
            .then(() => true)
            .catch(() => false);
          if (!reachedRunning) {
            const stillPending = await statusCell
              .getByText(/PENDING|PREPARED|PREPARING|CREATING/)
              .isVisible()
              .catch(() => false);
            test.skip(
              stillPending,
              'Session did not reach RUNNING - insufficient Backend.AI agent capacity on this QA cluster (@requires-agent-capacity)',
            );
          }

          // 4. Click the session name to open the "Session Info" drawer.
          // No `exact: true` here - matches the proven click target in
          // SessionLauncher.openSessionDetailDrawer() (used against real,
          // non-mocked sessions).
          await sessionRow.getByText(SESSION_NAME).click();
          // Locate by `.ant-drawer` CSS class, not getByRole('dialog', {name}) -
          // this is the exact locator SessionLauncher.openSessionDetailDrawer()
          // already uses successfully against real launched sessions (the
          // real, non-mocked drawer is not exposed with an accessible
          // role=dialog + matching name the way the *mocked* drawer in
          // session-scheduling-history-modal.spec.ts is).
          const sessionInfoDrawer = page
            .locator('.ant-drawer')
            .filter({ hasText: 'Session Info' });
          await expect(sessionInfoDrawer).toBeVisible({ timeout: 20000 });

          // 5. Locate the "Mounted folders" row in the drawer's info table.
          // Expected: both the automount folder and the explicitly mounted
          // folder appear as clickable VFolder links (href includes
          // `&folder=<folder-id>`).
          await expect(
            sessionInfoDrawer.getByRole('rowheader', {
              name: 'Mounted folders',
            }),
          ).toBeVisible({ timeout: 20000 });
          const automountLink = sessionInfoDrawer.getByRole('link', {
            name: AUTOMOUNT_FOLDER_NAME,
          });
          const mountFolderLink = sessionInfoDrawer.getByRole('link', {
            name: MOUNT_FOLDER_NAME,
          });
          await expect(automountLink).toBeVisible({ timeout: 20000 });
          await expect(mountFolderLink).toBeVisible();
          await expect(automountLink).toHaveAttribute('href', /folder=/);
          await expect(mountFolderLink).toHaveAttribute('href', /folder=/);

          // 6. Click the "terminate" icon button in the drawer's action row.
          await sessionInfoDrawer
            .getByRole('button', { name: 'terminate' })
            .click();

          // 7. In the "Terminate Session" confirmation dialog, confirm the
          // session name shown matches, then click "Terminate" (leave "Force
          // Terminate" unchecked).
          const terminateDialog = page.getByRole('dialog', {
            name: 'Terminate Session',
          });
          await expect(terminateDialog).toBeVisible({ timeout: 10000 });
          await expect(terminateDialog.locator('mark')).toHaveText(
            SESSION_NAME,
          );
          await expect(
            terminateDialog.getByRole('checkbox', { name: 'Force Terminate' }),
          ).not.toBeChecked();
          await terminateDialog
            .getByRole('button', { name: 'Terminate', exact: true })
            .click();
          await expect(terminateDialog).not.toBeVisible({ timeout: 10000 });

          // 8. Wait for the session status to reach TERMINATED, per the
          // drawer's own Status row (the drawer is already open here, unlike
          // the pre-drawer RUNNING wait above which reads the table row).
          const drawerStatusRow = sessionInfoDrawer.getByRole('row', {
            name: /^Status/,
          });
          await expect(
            drawerStatusRow.getByText('TERMINATED', { exact: true }),
          ).toBeVisible({ timeout: 60_000 });

          // 9. Close the drawer.
          await sessionInfoDrawer
            .getByRole('button', { name: 'Close' })
            .click();
          await expect(sessionInfoDrawer).not.toBeVisible({ timeout: 10000 });
        },
      );
    });
  },
);
