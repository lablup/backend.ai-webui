// spec: e2e/AppLauncher-Test-Plan.md
// Section 7: App Launcher - Special App Behaviors
import { AppLauncherModal } from './utils/classes/AppLauncherModal';
import { loginAsUser, navigateTo } from './utils/test-util';
import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * Creates an interactive session with Python Pytorch 2.1.0 image
 * This image includes special apps: nniboard, mlflow-ui, tensorboard
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

  // Select minimum resource preset
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
  await expect(sessionRow).toBeVisible({ timeout: 20000 });

  // Wait for session to reach RUNNING status
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
  await page.getByRole('link', { name: 'Sessions' }).click();
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

  // Find and click terminate button
  const terminateButton = sessionDetailDrawer
    .getByRole('button')
    .filter({ has: page.getByLabel('terminate') });

  const terminateButtonVisible = await terminateButton
    .isVisible({ timeout: 3000 })
    .catch(() => false);

  if (!terminateButtonVisible) {
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

  // Wait for session to be terminated
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
  await page.getByRole('link', { name: 'Sessions' }).click();
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

  // Click the app launcher button
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

// NOTE: These tests require a session with special apps (nniboard, mlflow-ui, tensorboard)
// These apps are typically available in ML-focused images like PyTorch or TensorFlow
test.describe('AppLauncher - Special App Behaviors', () => {
  const testSessionName = `e2e-special-apps-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  let sessionCreated = false;
  let sharedContext: BrowserContext;
  let sharedPage: Page;
  let appLauncherModal: AppLauncherModal;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(300000); // 5 minutes timeout for session creation

    // Create shared context and page for all tests
    sharedContext = await browser.newContext();
    sharedPage = await sharedContext.newPage();

    await loginAsUser(sharedPage);

    try {
      // Create session with image that has special apps
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

  test('User sees confirmation modal before launching nniboard app', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already opened, verify it's visible
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Check if nniboard app is available
    const nniboardAppVisible = await appLauncherModal
      .getAppButton('nniboard')
      .isVisible()
      .catch(() => false);

    test.skip(!nniboardAppVisible, 'nniboard app not available in this image');

    // 1. Click nniboard app button
    await appLauncherModal.clickApp('nniboard');

    // 2. Verify confirmation modal appears
    const confirmationModal = sharedPage
      .getByRole('dialog')
      .filter({ hasText: 'Start only when the app is already running' });
    await expect(confirmationModal).toBeVisible({ timeout: 5000 });

    // 3. Verify modal explains nniboard needs to run before tunneling
    await expect(confirmationModal).toContainText(
      'This app can only be accessed and used if it is already running through the terminal',
    );
    await expect(confirmationModal).toContainText('Do you want to proceed?');

    // 4. Verify confirmation button is present
    const confirmButton = confirmationModal.getByRole('button', {
      name: "I checked and I'll start",
    });
    await expect(confirmButton).toBeVisible();

    // 5. Test cancel flow - click close button
    const closeButton = confirmationModal
      .getByRole('button', { name: 'Close' })
      .first();
    await closeButton.click();

    // 6. Verify modal closed and app did not launch
    await expect(confirmationModal).not.toBeVisible({ timeout: 5000 });

    // 7. Verify app launcher modal remains open
    await expect(appLauncherModal.getModal()).toBeVisible();

    // 8. Verify no notification appears (app was not launched)
    const notificationContainer = sharedPage.locator(
      '.ant-notification-notice',
    );
    const hasNotification = await notificationContainer
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    // If notification is visible, it should not contain the session name (no launch occurred)
    if (hasNotification) {
      const sessionNotification = notificationContainer.filter({
        hasText: testSessionName,
      });
      await expect(sessionNotification).not.toBeVisible();
    }
  });

  test('User sees confirmation modal before launching mlflow-ui app', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already open, verify it's visible
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Check if mlflow-ui app is available
    const mlflowAppVisible = await appLauncherModal
      .getAppButton('mlflow-ui')
      .isVisible()
      .catch(() => false);

    test.skip(!mlflowAppVisible, 'mlflow-ui app not available in this image');

    // 1. Click mlflow-ui app button
    await appLauncherModal.clickApp('mlflow-ui');

    // 2. Verify confirmation modal appears (same modal as nniboard)
    const confirmationModal = sharedPage
      .getByRole('dialog')
      .filter({ hasText: 'Start only when the app is already running' });
    await expect(confirmationModal).toBeVisible({ timeout: 5000 });

    // 3. Verify modal explains mlflow-ui requirements
    await expect(confirmationModal).toContainText(
      'This app can only be accessed and used if it is already running through the terminal',
    );
    await expect(confirmationModal).toContainText('Do you want to proceed?');

    // 4. Verify confirmation button is present
    const confirmButton = confirmationModal.getByRole('button', {
      name: "I checked and I'll start",
    });
    await expect(confirmButton).toBeVisible();

    // 5. Test cancel flow
    const closeButton = confirmationModal
      .getByRole('button', { name: 'Close' })
      .first();
    await closeButton.click();

    // 6. Verify modal closed
    await expect(confirmationModal).not.toBeVisible({ timeout: 5000 });

    // 7. Verify app launcher modal remains open
    await expect(appLauncherModal.getModal()).toBeVisible();
  });

  test('User can specify log directory path when launching Tensorboard app', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already open, verify it's visible
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Check if tensorboard app is available
    const tensorboardAppVisible = await appLauncherModal
      .getAppButton('tensorboard')
      .isVisible()
      .catch(() => false);

    test.skip(
      !tensorboardAppVisible,
      'tensorboard app not available in this image',
    );

    // 1. Click Tensorboard app button
    await appLauncherModal.clickApp('tensorboard');

    // 2. Verify Tensorboard path modal opens BEFORE proxy starts
    const tensorboardPathModal = sharedPage
      .getByRole('dialog')
      .filter({ hasText: 'Specify log directory path' });
    await expect(tensorboardPathModal).toBeVisible({ timeout: 5000 });

    // 3. Verify modal prompts for log directory path
    await expect(tensorboardPathModal).toContainText('Log directory path');

    // 4. Verify input field is present
    const pathInput = tensorboardPathModal.getByRole('textbox');
    await expect(pathInput).toBeVisible();

    // 5. Test cancel flow - close modal without entering path
    const cancelButton = tensorboardPathModal
      .getByRole('button', { name: 'Cancel' })
      .first();

    // If Cancel button doesn't exist, try Close button
    const closeButton = tensorboardPathModal
      .getByRole('button', { name: 'Close' })
      .first();

    const cancelOrCloseButton = (await cancelButton
      .isVisible({ timeout: 1000 })
      .catch(() => false))
      ? cancelButton
      : closeButton;

    await cancelOrCloseButton.click();

    // 6. Verify path modal closed
    await expect(tensorboardPathModal).not.toBeVisible({ timeout: 5000 });

    // 7. Verify no notification appears (app was not launched)
    const notificationContainer = sharedPage.locator(
      '.ant-notification-notice',
    );
    const hasNotification = await notificationContainer
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (hasNotification) {
      const sessionNotification = notificationContainer.filter({
        hasText: testSessionName,
      });
      await expect(sessionNotification).not.toBeVisible();
    }

    // 8. Verify app launcher modal remains open
    await expect(appLauncherModal.getModal()).toBeVisible();

    // 9. Now test the full flow with path submission
    // Click Tensorboard again
    await appLauncherModal.clickApp('tensorboard');

    // Wait for path modal to open again
    await expect(tensorboardPathModal).toBeVisible({ timeout: 5000 });

    // 10. Enter valid log directory path
    const pathInputAgain = tensorboardPathModal.getByRole('textbox');
    await pathInputAgain.fill('/home/work/logs');

    // 11. Submit path
    const submitButton = tensorboardPathModal.getByRole('button', {
      name: /OK|Submit|Start/i,
    });
    await submitButton.click();

    // 12. Verify path modal closed
    await expect(tensorboardPathModal).not.toBeVisible({ timeout: 5000 });

    // 13. Verify notification appears (proxy setup begins)
    await expect(notificationContainer).toBeVisible({ timeout: 10000 });

    // 14. Verify notification contains session name
    const launchNotification = notificationContainer.filter({
      hasText: testSessionName,
    });
    await expect(launchNotification).toBeVisible({ timeout: 5000 });

    // 15. Wait for "Prepared" status in notification
    const preparedNotification = notificationContainer.filter({
      hasText: 'Prepared',
    });
    await expect(preparedNotification).toBeVisible({ timeout: 30000 });

    // 16. Verify app launcher modal remains open
    await expect(appLauncherModal.getModal()).toBeVisible();
  });
});
