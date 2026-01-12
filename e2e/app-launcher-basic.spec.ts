// spec: e2e/AppLauncher-Test-Plan.md
// Section 1: App Launcher Modal - Basic Interaction
import { AppLauncherModal } from './utils/classes/AppLauncherModal';
import { SessionLauncher } from './utils/classes/SessionLauncher';
import { loginAsUser, createOrReuseSession } from './utils/test-util';
import { test, expect, BrowserContext, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// NOTE: These tests require compute environment with available capacity.
// Sessions must reach RUNNING status for app launcher to be testable.
// If tests are consistently failing due to PENDING status, check resource availability.
test.describe('AppLauncher - Basic Interaction', () => {
  let sessionCreated = false;
  let sharedContext: BrowserContext;
  let sharedPage: Page;
  let appLauncherModal: AppLauncherModal;
  let sessionName: string;
  let sessionLauncher: SessionLauncher | undefined;

  test.beforeAll(async ({ browser, request }, testInfo) => {
    testInfo.setTimeout(300000); // 5 minutes timeout for session creation + modal opening

    // Create shared context and page for all tests
    sharedContext = await browser.newContext();
    sharedPage = await sharedContext.newPage();

    await loginAsUser(sharedPage, request);

    // Use createOrReuseSession helper for session creation
    // When E2E_REUSE_SESSION=true and E2E_EXISTING_SESSION_NAME is set,
    // returns only sessionName (no SessionLauncher created)
    const sessionInfo = await createOrReuseSession(sharedPage, {
      defaultSessionName: `e2e-app-launcher-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    });
    sessionName = sessionInfo.sessionName;
    sessionLauncher = sessionInfo.sessionLauncher;

    sessionCreated = true;

    // Open app launcher modal based on session mode
    if (sessionLauncher) {
      appLauncherModal = await AppLauncherModal.openFromSession(
        sharedPage,
        sessionLauncher,
      );
    } else {
      appLauncherModal = await AppLauncherModal.openBySessionName(
        sharedPage,
        sessionName,
      );
    }
  });

  // Cleanup: Terminate the session and close context after all tests
  test.afterAll(async () => {
    if (sessionCreated && sharedPage) {
      // Close the modal first if it's still open
      if (appLauncherModal) {
        const isModalVisible = await appLauncherModal
          .getModal()
          .isVisible()
          .catch(() => false);
        if (isModalVisible) {
          await appLauncherModal.close();
        }
      }

      // Close the session detail drawer if it's still open
      const sessionDetailDrawer = sharedPage
        .locator('.ant-drawer')
        .filter({ hasText: 'Session Info' });
      const isDrawerVisible = await sessionDetailDrawer
        .isVisible()
        .catch(() => false);
      if (isDrawerVisible) {
        const drawerCloseButton = sessionDetailDrawer
          .getByRole('button', { name: 'Close' })
          .first();
        await drawerCloseButton.click();
        // Wait for drawer to close
      }

      // Terminate the session only if we created it (sessionLauncher exists)
      // When reusing, sessionLauncher is undefined, so this is skipped
      await sessionLauncher?.terminate();
    }

    if (sharedContext) {
      await sharedContext.close();
    }
  });

  test('User can open app launcher modal from session action buttons', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already opened in beforeAll, just verify it
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Verify modal title contains session name
    await appLauncherModal.verifyModalTitle(sessionName);

    // Verify modal footer is not visible (footer={null})
    await appLauncherModal.verifyNoFooter();
  });

  test('User sees apps grouped by category in launcher modal', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already open, just verify the grid layout
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Verify apps are displayed in a grid layout (Row with Cols)
    await appLauncherModal.verifyGridLayout();

    // Verify at least one app is visible
    const visibleApps = await appLauncherModal.getVisibleApps();
    expect(visibleApps.length).toBeGreaterThan(0);
  });

  test('User sees correct app icons and titles for each application', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already open, verify app icons and titles
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Verify each supported app is displayed with correct data-testid
    // Apps available in Python 3.13 image:

    // Console/Terminal app (ttyd) - Always available
    await appLauncherModal.verifyAppVisible('ttyd');
    await appLauncherModal.verifyAppTitle('ttyd', 'Console');

    // SSH/SFTP app (sshd) - if available and TCP apps allowed
    const sshdVisible = await appLauncherModal
      .getAppButton('sshd')
      .isVisible()
      .catch(() => false);
    if (sshdVisible) {
      await appLauncherModal.verifyAppTitle('sshd', 'SSH / SFTP');
    }

    // Jupyter Notebook (jupyter)
    const jupyterVisible = await appLauncherModal
      .getAppButton('jupyter')
      .isVisible()
      .catch(() => false);
    if (jupyterVisible) {
      await appLauncherModal.verifyAppTitle('jupyter', 'Jupyter Notebook');
    }

    // JupyterLab (jupyterlab)
    const jupyterlabVisible = await appLauncherModal
      .getAppButton('jupyterlab')
      .isVisible()
      .catch(() => false);
    if (jupyterlabVisible) {
      await appLauncherModal.verifyAppTitle('jupyterlab', 'JupyterLab');
    }

    // Visual Studio Code (vscode)
    const vscodeVisible = await appLauncherModal
      .getAppButton('vscode')
      .isVisible()
      .catch(() => false);
    if (vscodeVisible) {
      await appLauncherModal.verifyAppTitle('vscode', 'Visual Studio Code');
    }

    // VS Code Desktop (vscode-desktop) - only visible when allowTCPApps is true
    const vscodeDesktopVisible = await appLauncherModal
      .getAppButton('vscode-desktop')
      .isVisible()
      .catch(() => false);
    if (vscodeDesktopVisible) {
      await appLauncherModal.verifyAppTitle(
        'vscode-desktop',
        'Visual Studio Code (Desktop)',
      );
    }
  });

  test('User can close app launcher modal', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // This test is last because it closes the modal
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Click the close button (X) in modal header
    await appLauncherModal.close();

    // Verify modal is no longer visible
    await expect(appLauncherModal.getModal()).not.toBeVisible();

    // Verify session detail drawer is still visible after closing modal
    const sessionDetailDrawer = sharedPage
      .locator('.ant-drawer')
      .filter({ hasText: 'Session Info' });
    await expect(sessionDetailDrawer).toBeVisible();

    // Close the drawer to clean up
    const drawerCloseButton = sessionDetailDrawer
      .getByRole('button', { name: 'Close' })
      .first();
    await drawerCloseButton.click();

    // Verify drawer is closed
    await expect(sessionDetailDrawer).not.toBeVisible();

    // Verify user remains on session list page
    await expect(sharedPage).toHaveURL(/\/session/);
  });
});
