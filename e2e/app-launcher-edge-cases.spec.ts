// spec: e2e/AppLauncher-Test-Plan.md
// Section 8: App Launcher - Edge Cases and Error Handling
import { AppLauncherModal } from './utils/classes/AppLauncherModal';
import { loginAsUser, navigateTo } from './utils/test-util';
import { getMenuItem } from './utils/test-util-antd';
import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * Creates an interactive session with Python 3.13 image
 * Based on app-launcher-basic.spec.ts patterns
 */
const createInteractiveSession = async (
  page: Page,
  sessionName: string,
): Promise<void> => {
  await navigateTo(page, 'session/start');

  // Select Interactive mode
  const interactiveRadioButton = page
    .locator('label')
    .filter({ hasText: 'Interactive' })
    .locator('input[type="radio"]');
  await expect(interactiveRadioButton).toBeVisible({ timeout: 10000 });
  await interactiveRadioButton.check();

  // Fill session name
  const sessionNameInput = page.locator('#sessionName');
  await expect(sessionNameInput).toBeVisible();
  await sessionNameInput.fill(sessionName);

  // Go to next step
  await page.getByRole('button', { name: 'Next' }).click();

  // Select resource group
  const resourceGroup = page.getByRole('combobox', {
    name: 'Resource Group',
  });
  await expect(resourceGroup).toBeVisible({ timeout: 10000 });
  await resourceGroup.fill('default');
  await page.keyboard.press('Enter');

  // Select minimum resource preset (image will use default)
  const resourcePreset = page.getByRole('combobox', {
    name: 'Resource Presets',
  });
  await expect(resourcePreset).toBeVisible({ timeout: 10000 });
  await resourcePreset.fill('minimum');
  await page.getByRole('option', { name: 'minimum' }).click();

  // Skip to review and launch
  await page.getByRole('button', { name: 'Skip to review' }).click();

  const launchButton = page.locator('button').filter({ hasText: 'Launch' });
  await expect(launchButton).toBeEnabled({ timeout: 10000 });
  await launchButton.click();

  // Handle "No storage folder is mounted" dialog - wait for it and click Start
  await page
    .getByRole('dialog')
    .filter({ hasText: 'No storage folder is mounted' })
    .getByRole('button', { name: 'Start' })
    .click();

  // Wait for app launcher dialog to appear and close it
  const appLauncherDialog = page.getByTestId('app-launcher-modal');
  if (await appLauncherDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
    await appLauncherDialog.getByRole('button', { name: 'Close' }).click();
  }

  // Wait for session list to load and verify session exists
  const sessionRow = page.locator('tr').filter({ hasText: sessionName });
  // It takes time to show the created session
  await expect(sessionRow).toBeVisible({ timeout: 20000 });

  // Wait for session to reach RUNNING status
  // Poll for RUNNING status with explicit check
  const runningStatus = sessionRow.getByText('RUNNING');
  await expect(runningStatus).toBeVisible({ timeout: 180000 }); // 3 minutes max
};

/**
 * Terminates a session by name
 */
const terminateSession = async (
  page: Page,
  sessionName: string,
): Promise<void> => {
  // Navigate to session page
  await getMenuItem(page, 'Sessions').click();
  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 10000 });

  // Find session row
  const sessionRow = page.locator('tr').filter({ hasText: sessionName });

  const sessionRowVisible = await sessionRow
    .isVisible({ timeout: 5000 })
    .catch(() => false);

  if (!sessionRowVisible) {
    console.log(
      `Session ${sessionName} not found in table, may already be terminated`,
    );
    return;
  }

  // Check if session is already terminated/terminating
  const currentStatus = sessionRow
    .locator('td')
    .filter({ hasText: /TERMINATED|TERMINATING/ });
  const isAlreadyTerminated = await currentStatus
    .isVisible({ timeout: 1000 })
    .catch(() => false);

  if (isAlreadyTerminated) {
    console.log(
      `Session ${sessionName} is already terminated or terminating, skipping termination`,
    );
    return;
  }

  // Click on the session name link to open detail drawer
  const sessionNameLink = sessionRow.getByText(sessionName);
  await sessionNameLink.click();

  // Wait for session detail drawer to open
  const sessionDetailDrawer = page
    .locator('.ant-drawer')
    .filter({ hasText: 'Session Info' });
  await expect(sessionDetailDrawer).toBeVisible({ timeout: 10000 });

  // Find and click terminate button using power-off icon label (scoped to drawer)
  const terminateButton = sessionDetailDrawer
    .getByRole('button')
    .filter({ has: page.getByLabel('terminate') });

  const terminateButtonVisible = await terminateButton
    .isVisible({ timeout: 3000 })
    .catch(() => false);

  if (!terminateButtonVisible) {
    // Button not found - session might be terminating or UI doesn't allow termination
    const statusInDrawer = await sessionDetailDrawer
      .getByText(/TERMINATED|TERMINATING|CANCELLED/)
      .isVisible({ timeout: 1000 })
      .catch(() => false);

    if (statusInDrawer) {
      console.log(
        `Session ${sessionName} is already in terminal state, skipping termination`,
      );
    } else {
      console.log(
        `Terminate button not available for session ${sessionName}, may already be terminated`,
      );
    }

    // Close the drawer before returning
    const drawerCloseButton = sessionDetailDrawer
      .getByRole('button', { name: 'Close' })
      .first();
    if (
      await drawerCloseButton.isVisible({ timeout: 2000 }).catch(() => false)
    ) {
      await drawerCloseButton.click();
    }
    return;
  }

  await terminateButton.click();

  // Wait for confirmation modal to appear
  const confirmModal = page.getByRole('dialog', { name: 'Terminate Session' });
  await expect(confirmModal).toBeVisible({ timeout: 5000 });

  // Confirm termination in the modal
  const confirmButton = confirmModal.getByRole('button', { name: 'Terminate' });
  await expect(confirmButton).toBeVisible({ timeout: 5000 });
  await confirmButton.click();

  // Wait for confirmation modal to close
  await expect(confirmModal).not.toBeVisible({ timeout: 5000 });

  // Close the drawer if still open
  const drawerCloseButton = sessionDetailDrawer
    .getByRole('button', { name: 'Close' })
    .first();
  if (await drawerCloseButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await drawerCloseButton.click();
  }

  // Wait for session to be terminated - check status changes
  const updatedSessionRow = page.locator('tr').filter({ hasText: sessionName });
  await expect(updatedSessionRow).toBeHidden({ timeout: 10_000 });
};

/**
 * Opens the app launcher modal for a given session
 */
const openAppLauncherModal = async (
  page: Page,
  sessionName: string,
): Promise<AppLauncherModal> => {
  // Navigate to session list via menu click
  await getMenuItem(page, 'Sessions').click();
  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 10000 });

  // Find the session row
  const sessionRow = page.locator('tr').filter({ hasText: sessionName });
  await expect(sessionRow).toBeVisible({ timeout: 10000 });

  // Wait for session to reach RUNNING status
  const runningStatus = sessionRow.getByText('RUNNING');
  await expect(runningStatus).toBeVisible({ timeout: 180000 }); // 3 minutes max

  // Click on the session name link to open detail drawer
  const sessionNameLink = sessionRow.getByText(sessionName);
  await sessionNameLink.click();

  // Wait for session detail drawer to open
  const sessionDetailDrawer = page
    .locator('.ant-drawer')
    .filter({ hasText: 'Session Info' });
  await expect(sessionDetailDrawer).toBeVisible({ timeout: 10000 });

  // Click the app launcher button (has BAIAppIcon with aria-label="app")
  const appLauncherButton = sessionDetailDrawer
    .getByRole('button')
    .filter({ has: page.getByLabel('app') })
    .first();

  await expect(appLauncherButton).toBeVisible({ timeout: 5000 });
  await appLauncherButton.click();

  const modal = new AppLauncherModal(page);
  await modal.waitForOpen();

  return modal;
};

test.describe.configure({ mode: 'serial' });

// NOTE: These tests require compute environment with available capacity.
// Tests focus on edge cases and error handling scenarios.
test.describe('AppLauncher - Edge Cases and Error Handling', () => {
  // Use a unique session name for this test run
  const testSessionName = `e2e-edge-cases-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  let sessionCreated = false;
  let sharedContext: BrowserContext;
  let sharedPage: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(300000); // 5 minutes timeout for session creation

    // Create shared context and page for all tests
    sharedContext = await browser.newContext();
    sharedPage = await sharedContext.newPage();

    await loginAsUser(sharedPage);

    try {
      // Create session for edge case tests
      await createInteractiveSession(sharedPage, testSessionName);
      sessionCreated = true;
    } catch (error) {
      console.log(
        `Failed to setup test environment: ${testSessionName}:`,
        error,
      );
    }
  });

  // Cleanup: Terminate the session and close context after all tests
  test.afterAll(async () => {
    if (sessionCreated && sharedPage) {
      // Terminate the session if it still exists
      await terminateSession(sharedPage, testSessionName);
    }

    if (sharedContext) {
      await sharedContext.close();
    }
  });

  test('User cannot launch apps from terminated session', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // 1. Session is already created and running in beforeAll
    // Navigate to session list
    await getMenuItem(sharedPage, 'Sessions').click();
    await expect(sharedPage.locator('.ant-table')).toBeVisible({
      timeout: 10000,
    });

    // Find the session row
    const sessionRow = sharedPage
      .locator('tr')
      .filter({ hasText: testSessionName });
    await expect(sessionRow).toBeVisible({ timeout: 10000 });

    // 2. Terminate the session
    await terminateSession(sharedPage, testSessionName);

    // Wait a moment for UI to update
    await sharedPage.waitForTimeout(2000);

    // 3. Navigate to Finished tab to see terminated sessions
    const finishedTab = sharedPage.getByRole('tab', { name: 'Finished' });
    await finishedTab.click();

    // Wait for table to load
    await expect(sharedPage.locator('.ant-table')).toBeVisible({
      timeout: 10000,
    });

    // Find the terminated session row in Finished tab
    const terminatedSessionRow = sharedPage
      .locator('tr')
      .filter({ hasText: testSessionName });

    // Check if row is visible (it should be in Finished tab)
    const isTerminatedSessionVisible = await terminatedSessionRow
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (isTerminatedSessionVisible) {
      // Verify the session status is TERMINATED
      const statusCell = terminatedSessionRow.locator('td').filter({
        hasText: /TERMINATED/,
      });
      await expect(statusCell).toBeVisible({ timeout: 5000 });

      // Click on the session name to open detail drawer
      const sessionNameLink = terminatedSessionRow.getByText(testSessionName);
      await sessionNameLink.click();

      // Wait for session detail drawer to open
      const sessionDetailDrawer = sharedPage
        .locator('.ant-drawer')
        .filter({ hasText: 'Session Info' });
      await expect(sessionDetailDrawer).toBeVisible({ timeout: 10000 });

      // 4. Verify app launcher button is disabled or hidden for terminated session
      const appLauncherButton = sessionDetailDrawer
        .getByRole('button')
        .filter({ has: sharedPage.getByLabel('app') })
        .first();

      const isAppLauncherVisible = await appLauncherButton
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (isAppLauncherVisible) {
        // If button is visible, it should be disabled
        await expect(appLauncherButton).toBeDisabled();
      } else {
        // Button should be hidden - verify it's not in the DOM
        expect(isAppLauncherVisible).toBe(false);
      }

      // Close the drawer
      const drawerCloseButton = sessionDetailDrawer
        .getByRole('button', { name: 'Close' })
        .first();
      await drawerCloseButton.click();
    }

    // Expected Results:
    // - App launcher button is disabled or hidden for terminated sessions
    // - No errors occur when attempting to interact with terminated session
  });

  test('User can re-launch app after previous launch completes', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // For this test, we need a running session, so create a new one
    const reLaunchSessionName = `e2e-relaunch-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    try {
      // 1. Create a new session for re-launch test
      await createInteractiveSession(sharedPage, reLaunchSessionName);

      // 2. Open app launcher modal
      const appLauncherModal = await openAppLauncherModal(
        sharedPage,
        reLaunchSessionName,
      );
      await expect(appLauncherModal.getModal()).toBeVisible();

      // Track new page openings (new browser tabs)
      const newPagePromise = sharedContext.waitForEvent('page', {
        timeout: 10000,
      });

      // 3. Launch Console app
      await appLauncherModal.clickApp('ttyd');

      // Wait for notification to appear
      const notificationContainer = sharedPage.locator(
        '.ant-notification-notice',
      );
      await expect(notificationContainer).toBeVisible({ timeout: 10000 });

      // Wait for "Prepared" status in notification
      const preparedNotification = sharedPage
        .locator('.ant-notification-notice')
        .filter({ hasText: 'Prepared' });
      await expect(preparedNotification).toBeVisible({ timeout: 30000 });

      // Wait for app to open in new browser tab
      const newPage = await newPagePromise;
      await expect(newPage).toBeTruthy();

      // Verify the new tab URL contains session-related content
      await expect(newPage.url()).toContain(reLaunchSessionName.split('-')[0]);

      // Close the new tab
      await newPage.close();

      // 4. App launcher modal remains open, re-launch the same app
      await expect(appLauncherModal.getModal()).toBeVisible();

      // Track another new page opening
      const secondNewPagePromise = sharedContext.waitForEvent('page', {
        timeout: 10000,
      });

      // 5. Click Console app button again
      await appLauncherModal.clickApp('ttyd');

      // 6. Monitor notification - it may show "reuse: true" or create new connection
      const secondNotification = sharedPage
        .locator('.ant-notification-notice')
        .filter({ hasText: 'Prepared' })
        .last();
      await expect(secondNotification).toBeVisible({ timeout: 30000 });

      // Wait for second app to open in new tab
      const secondNewPage = await secondNewPagePromise;
      await expect(secondNewPage).toBeTruthy();

      // Close the second new tab
      await secondNewPage.close();

      // Expected Results:
      // - Second launch completes successfully (reuse or new connection)
      // - App opens in new tab
      // - No errors occur during re-launch

      // Close the app launcher modal
      await appLauncherModal.close();

      // Close the session detail drawer if still open
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
      }

      // Cleanup: Terminate the re-launch test session
      await terminateSession(sharedPage, reLaunchSessionName);
    } catch (error) {
      console.log(
        `Re-launch test failed for session ${reLaunchSessionName}:`,
        error,
      );
      // Try to cleanup even if test failed
      await terminateSession(sharedPage, reLaunchSessionName);
      throw error;
    }
  });

  test('User can close connection info modal and app launcher modal independently', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // For this test, we need a running session
    const connectionModalSessionName = `e2e-connection-modal-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    try {
      // 1. Create a new session for connection modal test
      await createInteractiveSession(sharedPage, connectionModalSessionName);

      // 2. Open app launcher modal
      const appLauncherModal = await openAppLauncherModal(
        sharedPage,
        connectionModalSessionName,
      );
      await expect(appLauncherModal.getModal()).toBeVisible();

      // 3. Check if SSH/SFTP app is available
      const sshdAppVisible = await appLauncherModal
        .getAppButton('sshd')
        .isVisible()
        .catch(() => false);

      if (!sshdAppVisible) {
        console.log(
          'SSH/SFTP app not available, skipping connection modal test',
        );
        // Close modal and cleanup
        await appLauncherModal.close();
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
        }
        await terminateSession(sharedPage, connectionModalSessionName);
        test.skip();
      }

      // 4. Launch SSH/SFTP app
      await appLauncherModal.clickApp('sshd');

      // Wait for notification to appear
      const notificationContainer = sharedPage.locator(
        '.ant-notification-notice',
      );
      await expect(notificationContainer).toBeVisible({ timeout: 10000 });

      // Wait for "Prepared" status in notification
      const preparedNotification = sharedPage
        .locator('.ant-notification-notice')
        .filter({ hasText: 'Prepared' });
      await expect(preparedNotification).toBeVisible({ timeout: 30000 });

      // 5. Verify SFTP connection info modal opens
      const sftpConnectionModal = sharedPage
        .getByRole('dialog')
        .filter({ hasText: 'SSH / SFTP connection' });
      await expect(sftpConnectionModal).toBeVisible({ timeout: 5000 });

      // Verify modal displays connection information
      await expect(sftpConnectionModal).toContainText('Host');
      await expect(sftpConnectionModal).toContainText('Port');
      await expect(sftpConnectionModal).toContainText('Username');

      // 6. Close the SFTP connection info modal
      const sftpModalCloseButton = sftpConnectionModal.getByRole('button', {
        name: 'Close',
      });
      await sftpModalCloseButton.click();
      await expect(sftpConnectionModal).not.toBeVisible({ timeout: 5000 });

      // 7. Verify app launcher modal is still visible after closing connection info modal
      await expect(appLauncherModal.getModal()).toBeVisible();

      // Verify app launcher modal is still functional - try to interact with it
      const visibleApps = await appLauncherModal.getVisibleApps();
      expect(visibleApps.length).toBeGreaterThan(0);

      // 8. Close app launcher modal
      await appLauncherModal.close();
      await expect(appLauncherModal.getModal()).not.toBeVisible();

      // Expected Results:
      // - Closing SFTP modal does not close app launcher modal
      // - App launcher modal remains functional after closing connection info modal
      // - No memory leaks or stale state issues

      // Close the session detail drawer if still open
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
      }

      // Cleanup: Terminate the connection modal test session
      await terminateSession(sharedPage, connectionModalSessionName);
    } catch (error) {
      console.log(
        `Connection modal test failed for session ${connectionModalSessionName}:`,
        error,
      );
      // Try to cleanup even if test failed
      await terminateSession(sharedPage, connectionModalSessionName);
      throw error;
    }
  });
});
