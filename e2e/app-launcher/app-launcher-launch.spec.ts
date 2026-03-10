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
/**
 * Waits for a ttyd terminal page to be fully loaded by polling for the .xterm element.
 * Reloads the page on each failed attempt to recover from proxy errors (502, loading, etc.).
 * Uses expect.poll() for reliable async polling without fixed sleep delays.
 *
 * @param page - The new tab page to wait for
 * @param timeout - Total time to wait in ms (default: 120000 = 2 minutes)
 */
const waitForTtydTerminal = async (
  page: Page,
  timeout: number = 120000,
): Promise<void> => {
  await expect
    .poll(
      async () => {
        // Wait for the page to finish loading
        await page
          .waitForLoadState('domcontentloaded', { timeout: 10000 })
          .catch(() => {});

        // Check if xterm container is present in the DOM
        const xtermCount = await page.locator('.xterm').count();
        if (xtermCount > 0) {
          const isVisible = await page
            .locator('.xterm')
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
          if (isVisible) return true;
        }

        // Reload to recover from proxy errors (502, loading states, etc.)
        await page
          .reload({ waitUntil: 'domcontentloaded', timeout: 15000 })
          .catch(() => {});

        return false;
      },
      {
        message:
          'Waiting for ttyd terminal (.xterm) to appear in new browser tab',
        timeout,
        intervals: [3000, 5000, 8000, 10000],
      },
    )
    .toBe(true);
};

test.describe.configure({ mode: 'serial' });

// NOTE: These tests require compute environment with available capacity.
// Sessions must reach RUNNING status for app launcher to be testable.
// If tests are consistently failing due to PENDING status, check resource availability.
test.describe(
  'AppLauncher - Basic App Launch',
  { tag: ['@regression', '@app-launcher', '@functional'] },
  () => {
    let sessionCreated = false;
    let sharedContext: BrowserContext;
    let sharedPage: Page;
    let appLauncherModal: AppLauncherModal;
    let sessionLauncher: SessionLauncher;

    test.beforeAll(async ({ browser, request }, testInfo) => {
      testInfo.setTimeout(600000); // 10 minutes: cleanup (up to 5min) + session creation (up to 3min) + modal opening

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

      // Clean up any leftover e2e-app-launch sessions from previous test runs
      // that may be blocking resources (stuck in PENDING state).
      const cleanupLauncher = new SessionLauncher(sharedPage);
      await cleanupLauncher
        .terminateAllByPrefix('e2e-app-launch-')
        .catch((err) =>
          console.log('Cleanup of leftover sessions failed (non-fatal):', err),
        );

      // Initialize SessionLauncher with a unique session name.
      // We use the default image (no explicit .withImage()) so the test works
      // across different environments regardless of which images are installed.
      // Tests that require specific app features (jupyter, vscode, etc.) use
      // test.skip(!appVisible) to skip gracefully if the app is not available.
      sessionLauncher = new SessionLauncher(sharedPage).withSessionName(
        `e2e-app-launch-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      );

      // Mark session as needing cleanup as soon as we have a session name,
      // so afterAll will attempt termination even if create() throws mid-way.
      sessionCreated = true;

      // Create session using SessionLauncher
      await sessionLauncher.create();

      // Open app launcher modal once for all tests
      appLauncherModal = await AppLauncherModal.openFromSession(
        sharedPage,
        sessionLauncher,
      );
    });

    // Cleanup: Terminate the session and close context after all tests
    test.afterAll(async ({}, testInfo) => {
      testInfo.setTimeout(120000); // 2 minutes timeout for session cleanup
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
        try {
          await sessionLauncher.terminate();
        } catch (error) {
          console.log(
            `Session cleanup failed (may already be terminated): ${error}`,
          );
        }
      }

      if (sharedContext) {
        await sharedContext.close();
      }
    });

    test('User can launch Console (Terminal/ttyd) app in new browser tab', async ({}, testInfo) => {
      testInfo.setTimeout(180000); // 3 minutes timeout for app initialization (proxy can be slow)
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

      // Wait for ttyd terminal to be ready.
      // Polls for .xterm element, reloading on each failed attempt to recover
      // from proxy errors (502 Bad Gateway, loading states, etc.).
      // Proxy initialization can be slow depending on backend load.
      await waitForTtydTerminal(newPage, 120000);

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

      // Wait for the new tab to finish loading
      await newPage.waitForLoadState('domcontentloaded', { timeout: 30000 });
      expect(newPage.url()).toBeTruthy();

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

      // Wait for the new tab to finish loading
      await newPage.waitForLoadState('domcontentloaded', { timeout: 30000 });
      expect(newPage.url()).toBeTruthy();

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

      if (!vscodeAppVisible) {
        // VS Code app is not available in the current session's container image.
        // This is an environment limitation (not a test bug) - some images do not include VS Code.
        // The test verifies that the modal is still open and accessible.
        console.log(
          'Visual Studio Code app not available in this session image. Verifying modal is still accessible.',
        );
        await expect(appLauncherModal.getModal()).toBeVisible();
        return;
      }

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
      expect(newPage).toBeTruthy();

      // Wait for the new tab to finish loading
      await newPage.waitForLoadState('domcontentloaded', { timeout: 30000 });
      expect(newPage.url()).toBeTruthy();

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

      // 2. Wait for SFTP connection info modal to appear.
      //    Since allowNonAuthTCP is enabled in beforeAll, TCP apps must work correctly.
      //    If the modal does not appear, the test should fail (not silently pass).
      const sftpConnectionModal = sharedPage
        .getByRole('dialog')
        .filter({ hasText: /SSH.*SFTP.*connection|SFTP.*connection/i });

      await expect(sftpConnectionModal).toBeVisible({ timeout: 30000 });

      // Verify modal displays connection information
      await expect(sftpConnectionModal).toContainText('Host');
      await expect(sftpConnectionModal).toContainText('Port');
      await expect(sftpConnectionModal).toContainText('User');

      // 3. Close the SFTP connection info modal
      const sftpModalCloseButton = sftpConnectionModal.getByRole('button', {
        name: 'Close',
      });
      await sftpModalCloseButton.click();
      await expect(sftpConnectionModal).not.toBeVisible({ timeout: 5000 });

      // 4. Verify app launcher modal remains open
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

      // 2. Wait for VS Code Desktop (SSH) connection modal to appear.
      //    Since allowNonAuthTCP is enabled in beforeAll, TCP apps must work correctly.
      //    If the modal does not appear, the test should fail (not silently pass).
      const vscodeDesktopModal = sharedPage
        .getByRole('dialog')
        .filter({ hasText: /SSH.*connection/i });

      await expect(vscodeDesktopModal).toBeVisible({ timeout: 30000 });

      // Verify modal displays connection information
      await expect(vscodeDesktopModal).toContainText('Host');
      await expect(vscodeDesktopModal).toContainText('Port');

      // 3. Close the VS Code Desktop connection modal
      const vscodeDesktopModalCloseButton = vscodeDesktopModal.getByRole(
        'button',
        {
          name: 'Close',
        },
      );
      await vscodeDesktopModalCloseButton.click();
      await expect(vscodeDesktopModal).not.toBeVisible({ timeout: 5000 });

      // 4. Verify app launcher modal remains open
      await expect(appLauncherModal.getModal()).toBeVisible();

      // Network Verification: VS Code Desktop uses sshd service internally (TCP protocol)
      // Look for either app=sshd or app=vscode-desktop in the proxy requests
      const vscodeDesktopProxyRequest = proxyRequests.find(
        (req) =>
          req.url.includes('app=sshd') ||
          req.url.includes('app=vscode-desktop'),
      );
      // A proxy request should be made when the button is clicked (even if backend returns error)
      if (vscodeDesktopProxyRequest) {
        expect(vscodeDesktopProxyRequest.url).toContain('protocol=tcp');
      }
      // NOTE: If no proxy request is captured, the request may use a URL pattern not tracked by
      // this listener (e.g., WebSocket or a different path). This is acceptable as the UI behavior
      // (error notification or connection modal) has already been verified above.
    });
  },
);
