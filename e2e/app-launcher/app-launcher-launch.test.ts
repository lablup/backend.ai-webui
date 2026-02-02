// spec: e2e/AppLauncher-Test-Plan.md
// Section 2: App Launcher - Basic App Launch Tests
import { AppLauncherModal } from '../utils/classes/session/AppLauncherModal';
import { SessionLauncher } from '../utils/classes/session/SessionLauncher';
import { loginAsUser, modifyConfigToml } from '../utils/test-util';
import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * TODO: Remove this function when proxy 502 error handling is no longer needed.
 * This is a temporary workaround for proxy errors during app initialization.
 *
 * Handles 502 Bad Gateway errors by waiting and refreshing the page.
 * Retries multiple times if needed.
 * @param page - The page to handle errors for
 */
const handleProxyError = async (page: Page): Promise<void> => {
  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    // Wait for the page to load (DOM content loaded is sufficient)
    await page
      .waitForLoadState('domcontentloaded', { timeout: 15000 })
      .catch(() => {
        // If page load fails or times out, continue - we'll check for 502 error
      });

    // Check if we got a 502 Bad Gateway error

    const is502Page =
      (await page
        .locator('h1')
        .filter({ hasText: /502\s+bad\s+gateway/i })
        .count()) > 0;

    if (is502Page) {
      retryCount++;
      if (retryCount < maxRetries) {
        // Wait longer with each retry (3s, 5s, 7s)
        await page.waitForTimeout(3000 + retryCount * 2000);
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
      }
    } else {
      // No error, break out of retry loop
      break;
    }
  }
};

test.describe.configure({ mode: 'serial' });

// NOTE: These tests require compute environment with available capacity.
// Sessions must reach RUNNING status for app launcher to be testable.
// If tests are consistently failing due to PENDING status, check resource availability.
test.describe('AppLauncher - Basic App Launch', () => {
  let sessionCreated = false;
  let sharedContext: BrowserContext;
  let sharedPage: Page;
  let appLauncherModal: AppLauncherModal;
  let sessionLauncher: SessionLauncher;

  test.beforeAll(async ({ browser, request }, testInfo) => {
    testInfo.setTimeout(300000); // 5 minutes timeout for session creation + modal opening

    // Create shared context and page for all tests
    sharedContext = await browser.newContext();
    sharedPage = await sharedContext.newPage();

    // Enable allowNonAuthTCP to allow SFTP and VS Code Desktop apps
    await modifyConfigToml(sharedPage, request, {
      resources: {
        allowNonAuthTCP: true,
      },
    });

    await loginAsUser(sharedPage, request);

    // Initialize SessionLauncher with custom image and unique session name
    sessionLauncher = new SessionLauncher(sharedPage)
      .withSessionName(
        `e2e-app-launch-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      )
      .withImage('cr.backend.ai/stable/python:3.13-ubuntu24.04-amd64@x86_64');

    // Create session using SessionLauncher
    await sessionLauncher.create();
    sessionCreated = true;

    // Open app launcher modal once for all tests
    appLauncherModal = await AppLauncherModal.openFromSession(
      sharedPage,
      sessionLauncher,
    );
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

      // Terminate the session using SessionLauncher
      await sessionLauncher.terminate();
    }

    if (sharedContext) {
      await sharedContext.close();
    }
  });

  test('User can launch Console (Terminal/ttyd) app in new browser tab', async ({}, testInfo) => {
    testInfo.setTimeout(120000); // 2 minutes timeout for app initialization
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already opened in beforeAll, verify it's visible
    await expect(appLauncherModal.getModal()).toBeVisible();

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

    // Track new page openings (new browser tabs) - MUST be set BEFORE clicking
    const newPagePromise = sharedContext.waitForEvent('page', {
      timeout: 30000,
    });

    // 1. Click Console/Terminal app button (data-testid="app-ttyd")
    await appLauncherModal.clickApp('ttyd');

    // 2. Wait for notification to appear with progress indicator
    const notificationContainer = sharedPage
      .locator('.ant-notification-notice')
      .last();
    await expect(notificationContainer).toBeVisible({ timeout: 10000 });

    // 3. Wait for "Prepared" status in notification
    const preparedNotification = sharedPage
      .locator('.ant-notification-notice')
      .filter({ hasText: 'Prepared' });
    await expect(preparedNotification).toBeVisible({ timeout: 60000 });

    // 4. Wait for app to open in new browser tab
    const newPage = await newPagePromise;
    await expect(newPage).toBeTruthy();

    // TODO: Remove this error handling when proxy is stable
    await handleProxyError(newPage);

    // Verify actual app UI is loaded
    // Wait for page to fully load (DOM + resources)
    await newPage.waitForLoadState('load', { timeout: 60000 });

    // Wait for ttyd/xterm.js terminal UI to load
    // ttyd uses xterm.js which creates specific terminal DOM elements
    // Give JavaScript time to initialize (xterm elements are created by JS)
    const xtermContainer = newPage.locator('.xterm');

    // Wait up to 30 seconds for xterm container to appear
    await expect(xtermContainer.first()).toBeVisible({ timeout: 30000 });

    // Close the new tab
    await newPage.close();

    // 5. Verify app launcher modal remains open
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Network Verification: Verify proxy request includes app=ttyd parameter
    const ttydRequest = proxyRequests.find((req) =>
      req.url.includes('app=ttyd'),
    );
    expect(ttydRequest).toBeTruthy();
    // Verify no open_to_public or port parameters (advanced options not set)
    if (ttydRequest) {
      expect(ttydRequest.url).not.toContain('open_to_public');
      expect(ttydRequest.url).not.toContain('port=');
    }
  });

  test('User can launch Jupyter Notebook app in new browser tab', async ({}, testInfo) => {
    testInfo.setTimeout(120000); // 2 minutes timeout for app initialization
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already open, verify it's visible
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Check if Jupyter Notebook app is available
    const jupyterAppVisible = await appLauncherModal
      .getAppButton('jupyter')
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

    // Track new page openings (MUST be set BEFORE clicking)
    const newPagePromise = sharedContext.waitForEvent('page', {
      timeout: 30000,
    });

    // 1. Click Jupyter Notebook app button
    await appLauncherModal.clickApp('jupyter');

    // 2. Wait for notification to appear
    const notificationContainer = sharedPage
      .locator('.ant-notification-notice')
      .last();
    await expect(notificationContainer).toBeVisible({ timeout: 10000 });

    // 3. Wait for "Prepared" status in notification
    const preparedNotification = sharedPage
      .locator('.ant-notification-notice')
      .filter({ hasText: 'Prepared' });
    await expect(preparedNotification).toBeVisible({ timeout: 60000 });

    // 4. Wait for app to open in new browser tab
    const newPage = await newPagePromise;
    await expect(newPage).toBeTruthy();

    // TODO: Remove this error handling when proxy is stable
    await handleProxyError(newPage);

    // Verify actual app UI is loaded
    // Wait for page to fully load (DOM + resources)
    await newPage.waitForLoadState('load', { timeout: 60000 });

    // Wait for Jupyter Notebook UI to load
    // Check for both classic Notebook and JupyterLab (some environments redirect)
    await expect(newPage.getByRole('link', { name: 'Jupyter' })).toBeVisible({
      timeout: 30000,
    });

    // Close the new tab
    await newPage.close();

    // 5. Verify app launcher modal remains open
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Network Verification: Verify proxy request includes app=jupyter parameter
    const jupyterRequest = proxyRequests.find((req) =>
      req.url.includes('app=jupyter'),
    );
    expect(jupyterRequest).toBeTruthy();
  });

  test('User can launch JupyterLab app in new browser tab', async ({}, testInfo) => {
    testInfo.setTimeout(120000); // 2 minutes timeout for app initialization
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already open, verify it's visible
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Check if JupyterLab app is available
    const jupyterlabAppVisible = await appLauncherModal
      .getAppButton('jupyterlab')
      .isVisible()
      .catch(() => false);

    test.skip(!jupyterlabAppVisible, 'JupyterLab app not available');

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

    // Track new page openings (MUST be set BEFORE clicking)
    const newPagePromise = sharedContext.waitForEvent('page', {
      timeout: 30000,
    });

    // 1. Click JupyterLab app button
    await appLauncherModal.clickApp('jupyterlab');

    // 2. Wait for notification to appear
    const notificationContainer = sharedPage
      .locator('.ant-notification-notice')
      .last();
    await expect(notificationContainer).toBeVisible({ timeout: 10000 });

    // 3. Wait for "Prepared" status in notification
    const preparedNotification = sharedPage
      .locator('.ant-notification-notice')
      .filter({ hasText: 'Prepared' });
    await expect(preparedNotification).toBeVisible({ timeout: 60000 });

    // 4. Wait for app to open in new browser tab
    const newPage = await newPagePromise;
    await expect(newPage).toBeTruthy();

    // TODO: Remove this error handling when proxy is stable
    await handleProxyError(newPage);

    // Verify actual app UI is loaded
    // Wait for page to fully load (DOM + resources)
    await newPage.waitForLoadState('load', { timeout: 60000 });

    // Wait for JupyterLab UI to load
    // JupyterLab has specific class-based structure
    const labShell = newPage.locator('.jp-LabShell');
    await expect(labShell.first()).toBeVisible({ timeout: 30000 });

    // Close the new tab
    await newPage.close();

    // 5. Verify app launcher modal remains open
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Network Verification: Verify proxy request includes app=jupyterlab parameter
    const jupyterlabRequest = proxyRequests.find((req) =>
      req.url.includes('app=jupyterlab'),
    );
    expect(jupyterlabRequest).toBeTruthy();
  });

  test('User can launch Visual Studio Code app in new browser tab', async ({}, testInfo) => {
    testInfo.setTimeout(120000); // 2 minutes timeout for app initialization
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already open, verify it's visible
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Check if VS Code app is available
    const vscodeAppVisible = await appLauncherModal
      .getAppButton('vscode')
      .isVisible()
      .catch(() => false);

    test.skip(!vscodeAppVisible, 'Visual Studio Code app not available');

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

    // Track new page openings (MUST be set BEFORE clicking)
    const newPagePromise = sharedContext.waitForEvent('page', {
      timeout: 30000,
    });

    // 1. Click VS Code app button
    await appLauncherModal.clickApp('vscode');

    // 2. Wait for notification to appear
    const notificationContainer = sharedPage
      .locator('.ant-notification-notice')
      .last();
    await expect(notificationContainer).toBeVisible({ timeout: 10000 });

    // 3. Wait for "Prepared" status in notification
    const preparedNotification = sharedPage
      .locator('.ant-notification-notice')
      .filter({ hasText: 'Prepared' });
    await expect(preparedNotification).toBeVisible({ timeout: 60000 });

    // 4. Wait for app to open in new browser tab
    const newPage = await newPagePromise;
    await expect(newPage).toBeTruthy();

    // TODO: Remove this error handling when proxy is stable
    await handleProxyError(newPage);

    // Verify actual app UI is loaded
    // Wait for page to fully load (DOM + resources)
    await newPage.waitForLoadState('load', { timeout: 60000 });

    // Wait for VS Code (code-server) UI to load
    // VS Code uses Monaco editor with specific DOM structure
    const monacoWorkbench = newPage.locator('.monaco-workbench');
    await expect(monacoWorkbench.first()).toBeVisible({ timeout: 30000 });

    // Close the new tab
    await newPage.close();

    // 5. Verify app launcher modal remains open
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Network Verification: Verify proxy request includes app=vscode parameter
    const vscodeRequest = proxyRequests.find((req) =>
      req.url.includes('app=vscode'),
    );
    expect(vscodeRequest).toBeTruthy();
  });

  test('User sees SFTP connection info modal after launching SSH/SFTP app', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already open, verify it's visible
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Check if SSH/SFTP app is available
    const sshdAppVisible = await appLauncherModal
      .getAppButton('sshd')
      .isVisible()
      .catch(() => false);

    test.skip(!sshdAppVisible, 'SSH/SFTP app not available');

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

    // 1. Click SSH/SFTP app button
    await appLauncherModal.clickApp('sshd');

    // 2. Wait for notification to appear
    const notificationContainer = sharedPage
      .locator('.ant-notification-notice')
      .last();
    await expect(notificationContainer).toBeVisible({ timeout: 10000 });

    // 3. Wait for "Prepared" status in notification
    const preparedNotification = sharedPage
      .locator('.ant-notification-notice')
      .filter({ hasText: 'Prepared' });
    await expect(preparedNotification).toBeVisible({ timeout: 30000 });

    // 4. Verify SFTP connection info modal opens
    const sftpConnectionModal = sharedPage
      .getByRole('dialog')
      .filter({ hasText: 'SSH / SFTP connection' });
    await expect(sftpConnectionModal).toBeVisible({ timeout: 5000 });

    // Verify modal displays connection information
    await expect(sftpConnectionModal).toContainText('Host');
    await expect(sftpConnectionModal).toContainText('Port');
    await expect(sftpConnectionModal).toContainText('User');

    // 5. Close the SFTP connection info modal
    const sftpModalCloseButton = sftpConnectionModal.getByRole('button', {
      name: 'Close',
    });
    await sftpModalCloseButton.click();
    await expect(sftpConnectionModal).not.toBeVisible({ timeout: 5000 });

    // 6. Verify app launcher modal remains open
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Network Verification: Verify proxy request includes app=sshd and protocol=tcp parameters
    const sshdRequest = proxyRequests.find((req) =>
      req.url.includes('app=sshd'),
    );
    expect(sshdRequest).toBeTruthy();
    if (sshdRequest) {
      expect(sshdRequest.url).toContain('protocol=tcp');
    }
  });

  test('User sees VS Code Desktop connection modal after launching VS Code Desktop app', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already open, verify it's visible
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Check if VS Code Desktop app is available
    const vscodeDesktopAppVisible = await appLauncherModal
      .getAppButton('vscode-desktop')
      .isVisible()
      .catch(() => false);

    test.skip(!vscodeDesktopAppVisible, 'VS Code Desktop app not available');

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

    // 1. Click VS Code Desktop app button
    await appLauncherModal.clickApp('vscode-desktop');

    // 2. Wait for notification to appear
    const notificationContainer = sharedPage
      .locator('.ant-notification-notice')
      .last();
    await expect(notificationContainer).toBeVisible({ timeout: 10000 });

    // 3. Wait for "Prepared" status in notification
    const preparedNotification = sharedPage
      .locator('.ant-notification-notice')
      .filter({ hasText: 'Prepared' });
    await expect(preparedNotification).toBeVisible({ timeout: 30000 });

    // 4. Verify VS Code Desktop connection modal opens
    // Modal may show as "SSH connection" or "SSH / SFTP Connection"
    const vscodeDesktopModal = sharedPage
      .getByRole('dialog')
      .filter({ hasText: /SSH.*connection/i });
    await expect(vscodeDesktopModal).toBeVisible({ timeout: 10000 });

    // Verify modal displays connection information
    await expect(vscodeDesktopModal).toContainText('Host');
    await expect(vscodeDesktopModal).toContainText('Port');

    // 5. Close the VS Code Desktop connection modal
    const vscodeDesktopModalCloseButton = vscodeDesktopModal.getByRole(
      'button',
      {
        name: 'Close',
      },
    );
    await vscodeDesktopModalCloseButton.click();
    await expect(vscodeDesktopModal).not.toBeVisible({ timeout: 5000 });

    // 6. Verify app launcher modal remains open
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Network Verification: VS Code Desktop uses sshd service internally
    const sshdRequest = proxyRequests.find((req) =>
      req.url.includes('app=sshd'),
    );
    expect(sshdRequest).toBeTruthy();
    if (sshdRequest) {
      expect(sshdRequest.url).toContain('protocol=tcp');
    }
  });
});
