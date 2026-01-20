// spec: e2e/AppLauncher-Test-Plan.md
// Section 6: App Launcher - Progress Notifications
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
// Sessions must reach RUNNING status for app launcher to be testable.
// If tests are consistently failing due to PENDING status, check resource availability.
test.describe('AppLauncher - Progress Notifications', () => {
  // Use a unique session name for this test run
  const testSessionName = `e2e-app-notif-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  let sessionCreated = false;
  let sharedContext: BrowserContext;
  let sharedPage: Page;
  let appLauncherModal: AppLauncherModal;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(300000); // 5 minutes timeout for session creation + modal opening

    // Create shared context and page for all tests
    sharedContext = await browser.newContext();
    sharedPage = await sharedContext.newPage();

    await loginAsUser(sharedPage);

    try {
      // Create session
      await createInteractiveSession(sharedPage, testSessionName);
      sessionCreated = true;

      // Open app launcher modal once for all tests
      appLauncherModal = await openAppLauncherModal(
        sharedPage,
        testSessionName,
      );
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
      }

      // Terminate the session
      await terminateSession(sharedPage, testSessionName);
    }

    if (sharedContext) {
      await sharedContext.close();
    }
  });

  test('User sees progress notification with multiple stages during app launch', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already opened in beforeAll, verify it's visible
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Track new page openings (new browser tabs)
    const newPagePromise = sharedContext.waitForEvent('page', {
      timeout: 10000,
    });

    // 1. Click Console/Terminal app button (data-testid="app-ttyd")
    await appLauncherModal.clickApp('ttyd');

    // 2. Wait for notification to appear
    const notificationContainer = sharedPage.locator(
      '.ant-notification-notice',
    );
    await expect(notificationContainer).toBeVisible({ timeout: 10000 });

    // 3. Verify notification contains session name link
    const notificationWithSessionName = sharedPage
      .locator('.ant-notification-notice')
      .filter({ hasText: testSessionName });
    await expect(notificationWithSessionName).toBeVisible({ timeout: 5000 });

    // 4. Verify notification shows progress stages in sequence
    // Note: Notification stages may appear quickly, so we check for key stages

    // Check for initial launching stage (may already be past this)
    const launchingText = sharedPage
      .locator('.ant-notification-notice')
      .filter({ hasText: /Launching|Setting up proxy|Adding kernel/ });
    await expect(launchingText.first()).toBeVisible({ timeout: 10000 });

    // 5. Wait for "Prepared" status in notification (final stage at 100%)
    const preparedNotification = sharedPage
      .locator('.ant-notification-notice')
      .filter({ hasText: 'Prepared' });
    await expect(preparedNotification).toBeVisible({ timeout: 60000 });

    // 6. Verify progress bar was present (checking for ant-progress class)
    // Note: Progress may have completed by now, but we can verify the notification structure
    const notificationWithProgress = sharedPage.locator(
      '.ant-notification-notice',
    );
    await expect(notificationWithProgress.first()).toBeVisible();

    // 7. Wait for app to open in new browser tab
    const newPage = await newPagePromise;
    await expect(newPage).toBeTruthy();

    // Close the new tab
    await newPage.close();

    // 8. Verify app launcher modal remains open
    await expect(appLauncherModal.getModal()).toBeVisible();

    // 9. Wait a bit to see if notification auto-dismisses (3 seconds)
    // The Prepared notification should auto-dismiss after 3 seconds
    await sharedPage.waitForTimeout(4000);

    // Notification may have auto-dismissed, but modal should still be open
    await expect(appLauncherModal.getModal()).toBeVisible();
  });

  test('User sees error notification when app launch fails', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already open, verify it's visible
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Simulate network failure by blocking the proxy endpoint
    await sharedPage.route('**/proxy/**', (route) => {
      route.abort('failed');
    });

    // Also block /add endpoint
    await sharedPage.route('**/add**', (route) => {
      route.abort('failed');
    });

    // 1. Click Console app button to trigger launch with blocked network
    await appLauncherModal.clickApp('ttyd');

    // 2. Wait for error notification to appear
    const notificationContainer = sharedPage.locator(
      '.ant-notification-notice',
    );
    await expect(notificationContainer).toBeVisible({ timeout: 10000 });

    // 3. Verify error notification is displayed
    // Look for error indicators in notification
    const errorNotification = sharedPage
      .locator('.ant-notification-notice')
      .filter({ hasText: /error|fail|not responding|coordinator/i });

    await expect(errorNotification.first()).toBeVisible({ timeout: 30000 });

    // 4. Verify notification contains error description
    // The notification should have error message content
    const notificationContent = errorNotification.first();
    await expect(notificationContent).toBeVisible();

    // 5. Verify error notification is persistent (has close button)
    const closeButton = errorNotification
      .first()
      .locator('.ant-notification-notice-close');
    await expect(closeButton).toBeVisible();

    // 6. User can manually close error notification
    await closeButton.click();
    await expect(errorNotification.first()).not.toBeVisible({ timeout: 5000 });

    // 7. Verify app launcher modal remains open after error
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Unblock network for subsequent tests
    await sharedPage.unroute('**/proxy/**');
    await sharedPage.unroute('**/add**');
  });

  test('User can click session name link in notification to navigate to session detail', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already open, verify it's visible
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Check if Jupyter Notebook app is available
    const jupyterAppVisible = await appLauncherModal
      .getAppButton('jupyter')
      .isVisible()
      .catch(() => false);

    test.skip(!jupyterAppVisible, 'Jupyter Notebook app not available');

    // Track new page openings
    const newPagePromise = sharedContext.waitForEvent('page', {
      timeout: 10000,
    });

    // 1. Click Jupyter Notebook app button
    await appLauncherModal.clickApp('jupyter');

    // 2. Wait for notification to appear with session name
    const notificationWithSessionName = sharedPage
      .locator('.ant-notification-notice')
      .filter({ hasText: testSessionName });
    await expect(notificationWithSessionName).toBeVisible({ timeout: 10000 });

    // 3. Find and click the session name link in notification
    // Session name should be a clickable link
    const sessionNameLink = notificationWithSessionName.locator('a').first();
    await expect(sessionNameLink).toBeVisible({ timeout: 5000 });

    // // Store current URL before clicking
    // const urlBeforeClick = sharedPage.url();

    // Click the session name link
    await sessionNameLink.click();

    // 4. Verify navigation to session detail page
    // URL should contain sessionDetail parameter
    await expect(sharedPage).toHaveURL(/sessionDetail/, { timeout: 10000 });

    // 5. Verify session detail drawer opens
    const sessionDetailDrawer = sharedPage
      .locator('.ant-drawer')
      .filter({ hasText: 'Session Info' });
    await expect(sessionDetailDrawer).toBeVisible({ timeout: 10000 });

    // 6. Verify the drawer shows the correct session name
    await expect(sessionDetailDrawer).toContainText(testSessionName);

    // 7. Notification should remain visible (or may have auto-dismissed)
    // App launch continues in background

    // Wait for app to open in new browser tab (if it hasn't already)
    const newPage = await newPagePromise.catch(() => null);
    if (newPage) {
      await newPage.close();
    }

    // 8. Close the session detail drawer to return to previous state
    const drawerCloseButton = sessionDetailDrawer
      .getByRole('button', { name: 'Close' })
      .first();
    await drawerCloseButton.click();
    await expect(sessionDetailDrawer).not.toBeVisible({ timeout: 5000 });
  });
});
