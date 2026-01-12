// spec: e2e/AppLauncher-Test-Plan.md
// Section 3: App Launcher - Advanced Options Tests
import { AppLauncherModal } from './utils/classes/AppLauncherModal';
import { SessionLauncher } from './utils/classes/SessionLauncher';
import {
  loginAsUser,
  modifyConfigToml,
  createOrReuseSession,
} from './utils/test-util';
import {
  test,
  expect,
  Page,
  BrowserContext,
  // APIRequestContext,
} from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// NOTE: These tests use modifyConfigToml to enable advanced options (openPortToPublic and allowPreferredPort)
// Tests verify that UI checkboxes appear, can be interacted with, and network requests include correct parameters
// Sessions must reach RUNNING status for app launcher to be testable.
test.describe('AppLauncher - Advanced Options', () => {
  let sessionCreated = false;
  let sharedContext: BrowserContext;
  let sharedPage: Page;
  let appLauncherModal: AppLauncherModal;
  let sessionName: string;
  let sessionLauncher: SessionLauncher | undefined;
  // let sharedRequest: APIRequestContext;

  test.beforeAll(async ({ browser, request }, testInfo) => {
    testInfo.setTimeout(300000); // 5 minutes timeout for session creation + modal opening

    // Create shared context and page for all tests
    sharedContext = await browser.newContext();
    sharedPage = await sharedContext.newPage();
    // sharedRequest = request;

    // Enable advanced options using modifyConfigToml
    await modifyConfigToml(sharedPage, request, {
      resources: {
        allowNonAuthTCP: true,
        openPortToPublic: true,
        allowPreferredPort: true,
      },
    });

    await loginAsUser(sharedPage, request);

    try {
      // Use createOrReuseSession helper for session creation
      // When E2E_REUSE_SESSION=true and E2E_EXISTING_SESSION_NAME is set,
      // returns only sessionName (no SessionLauncher created)
      const sessionInfo = await createOrReuseSession(sharedPage, {
        defaultSessionName: `e2e-app-adv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        image: 'cr.backend.ai/stable/python:3.13-ubuntu24.04-amd64@x86_64',
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
    } catch (error) {
      console.log(`Failed to setup test environment: ${sessionName}:`, error);
    }
  });

  // Cleanup: Terminate the session and close context after all tests
  test.afterAll(async () => {
    if (sessionCreated && sharedPage) {
      try {
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

        // Terminate the session only if we created it (sessionLauncher exists)
        // When reusing, sessionLauncher is undefined, so this is skipped
        await sessionLauncher?.terminate();
      } catch (error) {
        console.log('Failed to cleanup session:', error);
      }
    }

    if (sharedContext) {
      await sharedContext.close();
    }
  });

  test('User can enable "Open to Public" option and verify network request includes parameter', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already opened in beforeAll, verify it's visible
    await expect(appLauncherModal.getModal()).toBeVisible();

    // 1. Verify "Open to Public" checkbox is visible
    const openToPublicCheckbox = appLauncherModal
      .getModal()
      .locator('.ant-checkbox-wrapper')
      .filter({ hasText: /open.*public/i })
      .locator('input[type="checkbox"]');

    await expect(openToPublicCheckbox).toBeVisible();

    // 2. Verify checkbox is unchecked by default
    await expect(openToPublicCheckbox).not.toBeChecked();

    // 3. Check the "Open to Public" checkbox
    await openToPublicCheckbox.check();
    await expect(openToPublicCheckbox).toBeChecked();

    // 4. Add allowed client IPs
    const clientIpsInput = appLauncherModal
      .getModal()
      .locator('input[id*="clientIps"]');
    await expect(clientIpsInput).toBeVisible();
    await clientIpsInput.fill('192.168.1.100');
    await sharedPage.keyboard.press('Enter');
    await clientIpsInput.fill('192.168.1.101');
    await sharedPage.keyboard.press('Enter');

    // Set up network request tracking for proxy endpoint
    const proxyRequests: any[] = [];
    sharedPage.on('request', (request) => {
      const url = request.url();
      if (url.includes('/proxy/') || url.includes('/add')) {
        proxyRequests.push({
          url,
          method: request.method(),
        });
      }
    });

    // Track new page openings (new browser tabs)
    const newPagePromise = sharedContext.waitForEvent('page', {
      timeout: 10000,
    });

    // 5. Click Console/Terminal app button (data-testid="app-ttyd")
    await appLauncherModal.clickApp('ttyd');

    // 6. Wait for notification to appear with progress indicator
    const notificationContainer = sharedPage.locator(
      '.ant-notification-notice',
    );
    await expect(notificationContainer).toBeVisible({ timeout: 10000 });

    // 7. Wait for "Prepared" status in notification
    const preparedNotification = sharedPage
      .locator('.ant-notification-notice')
      .filter({ hasText: 'Prepared' });
    await expect(preparedNotification).toBeVisible({ timeout: 30000 });

    // 8. Wait for app to open in new browser tab
    const newPage = await newPagePromise;
    await expect(newPage).toBeTruthy();

    // Close the new tab
    await newPage.close();

    // 9. Verify app launcher modal remains open
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Network Verification: Verify proxy request includes required parameters
    const ttydRequest = proxyRequests.find((req) =>
      req.url.includes('app=ttyd'),
    );
    expect(ttydRequest).toBeTruthy();

    if (ttydRequest) {
      // Verify open_to_public parameter is present
      expect(ttydRequest.url).toContain('open_to_public=true');

      // Verify allowed_client_ips parameter is present and properly formatted (spaces trimmed)
      expect(ttydRequest.url).toContain('allowed_client_ips=192.168.1.100');
      expect(ttydRequest.url).toContain('192.168.1.101');
    }

    // 10. Verify "Open to Public" checkbox resets to unchecked state after launch
    // Wait a moment for form reset
    await sharedPage.waitForTimeout(1000);
    await expect(openToPublicCheckbox).not.toBeChecked();
  });

  test('User can specify preferred port and verify network request includes port parameter', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already open, verify it's visible
    await expect(appLauncherModal.getModal()).toBeVisible();

    // 1. Verify "Try Preferred Port" checkbox is visible
    const preferredPortCheckbox = appLauncherModal
      .getModal()
      .locator('.ant-checkbox-wrapper')
      .filter({ hasText: /prefer.*port/i })
      .locator('input[type="checkbox"]');

    await expect(preferredPortCheckbox).toBeVisible();

    // 2. Verify checkbox is unchecked by default
    await expect(preferredPortCheckbox).not.toBeChecked();

    // 3. Check the "Try Preferred Port" checkbox
    await preferredPortCheckbox.check();
    await expect(preferredPortCheckbox).toBeChecked();

    // 4. Enter a valid port number (10250)
    const portInput = appLauncherModal
      .getModal()
      .locator('input[type="number"]');

    await expect(portInput).toBeVisible();
    await expect(portInput).toBeEnabled();
    await portInput.fill('10250');

    // Check if Jupyter Notebook app is available
    const jupyterAppButton = appLauncherModal.getAppButton('jupyter');
    const jupyterAppVisible = await jupyterAppButton
      .isVisible()
      .catch(() => false);

    test.skip(!jupyterAppVisible, 'Jupyter Notebook app not available');

    // Set up network request tracking
    const proxyRequests: any[] = [];
    sharedPage.on('request', (request) => {
      const url = request.url();
      if (url.includes('/proxy/') || url.includes('/add')) {
        proxyRequests.push({
          url,
          method: request.method(),
        });
      }
    });

    // Track new page openings
    const newPagePromise = sharedContext.waitForEvent('page', {
      timeout: 10000,
    });

    // 5. Click Jupyter Notebook app button
    await appLauncherModal.clickApp('jupyter');

    // 6. Wait for notification to appear
    const notificationContainer = sharedPage.locator(
      '.ant-notification-notice',
    );
    await expect(notificationContainer).toBeVisible({ timeout: 10000 });

    // 7. Wait for "Prepared" status in notification
    const preparedNotification = sharedPage
      .locator('.ant-notification-notice')
      .filter({ hasText: 'Prepared' });
    await expect(preparedNotification).toBeVisible({ timeout: 30000 });

    // 8. Wait for app to open in new browser tab
    const newPage = await newPagePromise;
    await expect(newPage).toBeTruthy();

    // Close the new tab
    await newPage.close();

    // 9. Verify app launcher modal remains open
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Network Verification: Verify proxy request includes port parameter
    const jupyterRequest = proxyRequests.find((req) =>
      req.url.includes('app=jupyter'),
    );
    expect(jupyterRequest).toBeTruthy();

    if (jupyterRequest) {
      // Verify port parameter is present
      expect(jupyterRequest.url).toContain('port=10250');
    }

    // 10. Verify "Try Preferred Port" checkbox resets to unchecked state after launch
    await sharedPage.waitForTimeout(1000);
    await expect(preferredPortCheckbox).not.toBeChecked();
  });

  test('User sees validation error for invalid preferred port numbers', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already open, verify it's visible
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Verify "Try Preferred Port" checkbox is visible
    const preferredPortCheckbox = appLauncherModal
      .getModal()
      .locator('.ant-checkbox-wrapper')
      .filter({ hasText: /prefer.*port/i })
      .locator('input[type="checkbox"]');

    await expect(preferredPortCheckbox).toBeVisible();

    // 1. Check the "Try Preferred Port" checkbox
    await preferredPortCheckbox.check();
    await expect(preferredPortCheckbox).toBeChecked();

    const portInput = appLauncherModal
      .getModal()
      .locator('input[type="number"]');

    await expect(portInput).toBeVisible();

    // 2. Test port below minimum (1024)
    await portInput.fill('1024');

    // Try to trigger validation by clicking app button
    await appLauncherModal.clickApp('ttyd');

    // Verify validation error appears
    const validationErrorMin = appLauncherModal
      .getModal()
      .getByText(/Value must be at least 1025/i);
    await expect(validationErrorMin).toBeVisible({ timeout: 5000 });

    // 3. Test port above maximum (65535)
    await portInput.fill('65535');

    // Try to trigger validation
    await appLauncherModal.clickApp('ttyd');

    // Verify validation error appears
    const validationErrorMax = appLauncherModal
      .getModal()
      .getByText(/Value must be at most 65534/i);
    await expect(validationErrorMax).toBeVisible({ timeout: 5000 });

    // Reset checkbox state for next test
    await preferredPortCheckbox.uncheck();
  });

  test('User can combine "Open to Public" and "Preferred Port" options', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already open, verify it's visible
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Verify both options are available
    const openToPublicCheckbox = appLauncherModal
      .getModal()
      .locator('.ant-checkbox-wrapper')
      .filter({ hasText: /open.*public/i })
      .locator('input[type="checkbox"]');

    const preferredPortCheckbox = appLauncherModal
      .getModal()
      .locator('.ant-checkbox-wrapper')
      .filter({ hasText: /prefer.*port/i })
      .locator('input[type="checkbox"]');

    await expect(openToPublicCheckbox).toBeVisible();
    await expect(preferredPortCheckbox).toBeVisible();

    // 1. Check "Open to Public" checkbox
    await openToPublicCheckbox.check();
    await expect(openToPublicCheckbox).toBeChecked();

    // 2. Add allowed client IPs: "10.0.0.1, 192.168.1.50"
    const clientIpsInput = appLauncherModal
      .getModal()
      .locator('input[id*="clientIps"]');
    await expect(clientIpsInput).toBeVisible();
    await clientIpsInput.fill('10.0.0.1');
    await sharedPage.keyboard.press('Enter');
    await clientIpsInput.fill('192.168.1.50');
    await sharedPage.keyboard.press('Enter');

    // 3. Check "Try Preferred Port" checkbox
    await preferredPortCheckbox.check();
    await expect(preferredPortCheckbox).toBeChecked();

    // 4. Enter preferred port: 15000
    const portInput = appLauncherModal
      .getModal()
      .locator('input[type="number"]');

    await expect(portInput).toBeVisible();
    await portInput.fill('15000');

    // Check if VS Code app is available
    const vscodeAppButton = appLauncherModal.getAppButton('vscode');
    const vscodeAppVisible = await vscodeAppButton
      .isVisible()
      .catch(() => false);

    test.skip(!vscodeAppVisible, 'VS Code app not available');

    // Set up network request tracking
    const proxyRequests: any[] = [];
    sharedPage.on('request', (request) => {
      const url = request.url();
      if (url.includes('/proxy/') || url.includes('/add')) {
        proxyRequests.push({
          url,
          method: request.method(),
        });
      }
    });

    // Track new page openings
    const newPagePromise = sharedContext.waitForEvent('page', {
      timeout: 10000,
    });

    // 5. Click VS Code app button
    await appLauncherModal.clickApp('vscode');

    // 6. Wait for notification to appear
    const notificationContainer = sharedPage.locator(
      '.ant-notification-notice',
    );
    await expect(notificationContainer).toBeVisible({ timeout: 10000 });

    // 7. Wait for "Prepared" status in notification
    const preparedNotification = sharedPage
      .locator('.ant-notification-notice')
      .filter({ hasText: 'Prepared' });
    await expect(preparedNotification).toBeVisible({ timeout: 30000 });

    // 8. Wait for app to open in new browser tab
    const newPage = await newPagePromise;
    await expect(newPage).toBeTruthy();

    // Close the new tab
    await newPage.close();

    // 9. Verify app launcher modal remains open
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Network Verification: Verify all parameters are present
    const vscodeRequest = proxyRequests.find((req) =>
      req.url.includes('app=vscode'),
    );
    expect(vscodeRequest).toBeTruthy();

    if (vscodeRequest) {
      // Verify all four parameters are present
      expect(vscodeRequest.url).toContain('app=vscode');
      expect(vscodeRequest.url).toContain('open_to_public=true');
      expect(vscodeRequest.url).toContain('allowed_client_ips=10.0.0.1');
      expect(vscodeRequest.url).toContain('192.168.1.50');
      expect(vscodeRequest.url).toContain('port=15000');
    }

    // 10. Verify both checkboxes reset to unchecked state after launch
    await sharedPage.waitForTimeout(1000);
    await expect(openToPublicCheckbox).not.toBeChecked();
    await expect(preferredPortCheckbox).not.toBeChecked();
  });
});
