// spec: e2e/AppLauncher-Test-Plan.md
// Section 3.5: App Launcher - Configuration-based UI Visibility
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
  APIRequestContext,
} from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// NOTE: These tests verify that UI elements appear/disappear based on config.toml settings.
// Uses modifyConfigToml to dynamically change configuration and verify UI changes.
test.describe('AppLauncher - Configuration-based UI Visibility', () => {
  let sessionCreated = false;
  let sharedContext: BrowserContext;
  let sharedPage: Page;
  let appLauncherModal: AppLauncherModal;
  let sessionName: string;
  let sessionLauncher: SessionLauncher | undefined;
  let sharedRequest: APIRequestContext;

  // Helper function to open app launcher modal (handles both reuse and create modes)
  async function openAppLauncherModal(): Promise<AppLauncherModal> {
    if (sessionLauncher) {
      return AppLauncherModal.openFromSession(sharedPage, sessionLauncher);
    } else {
      return AppLauncherModal.openBySessionName(sharedPage, sessionName);
    }
  }

  // Helper function to close modal and drawer before config changes
  async function closeModalAndDrawer() {
    // Close the modal if it's open
    if (appLauncherModal) {
      const isModalVisible = await appLauncherModal
        .getModal()
        .isVisible()
        .catch(() => false);
      if (isModalVisible) {
        await appLauncherModal.close();
      }
    }

    // Close the session detail drawer if it's open
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
      await expect(sessionDetailDrawer).not.toBeVisible({ timeout: 5000 });
    }
  }

  test.beforeAll(async ({ browser, request }, testInfo) => {
    testInfo.setTimeout(300000); // 5 minutes timeout for session creation + modal opening

    // Create shared context and page for all tests
    sharedContext = await browser.newContext();
    sharedPage = await sharedContext.newPage();
    sharedRequest = request;

    // Start with all advanced options disabled
    await modifyConfigToml(sharedPage, request, {
      resources: {
        allowNonAuthTCP: true,
        openPortToPublic: false,
        allowPreferredPort: false,
      },
    });

    await loginAsUser(sharedPage, request);

    // Use createOrReuseSession helper for session creation
    // When E2E_REUSE_SESSION=true and E2E_EXISTING_SESSION_NAME is set,
    // returns only sessionName (no SessionLauncher created)
    const sessionInfo = await createOrReuseSession(sharedPage, {
      defaultSessionName: `e2e-config-vis-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      image: 'cr.backend.ai/stable/python:3.13-ubuntu24.04-amd64@x86_64',
    });
    sessionName = sessionInfo.sessionName;
    sessionLauncher = sessionInfo.sessionLauncher;

    sessionCreated = true;

    // Open app launcher modal once for all tests
    appLauncherModal = await openAppLauncherModal();
  });

  // Cleanup: Terminate the session and close context after all tests
  test.afterAll(async () => {
    if (sessionCreated && sharedPage) {
      try {
        // Use helper function to close modal and drawer
        await closeModalAndDrawer();

        // Terminate the session only if we created it (sessionLauncher exists)
        // When reusing, sessionLauncher is undefined, so this is skipped
        await sessionLauncher?.terminate();
      } catch (error) {
        console.log('Failed to terminate session during cleanup:', error);
        // Session cleanup failed, but this shouldn't fail the test
      }
    }

    if (sharedContext) {
      await sharedContext.close();
    }
  });

  test('User does not see advanced options when both settings are disabled', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal is already opened in beforeAll with disabled config
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Verify "Open to Public" checkbox is NOT visible
    const openToPublicCheckbox = appLauncherModal
      .getModal()
      .locator('.ant-checkbox-wrapper')
      .filter({ hasText: /open.*public/i });
    await expect(openToPublicCheckbox).not.toBeVisible();

    // Verify "Try Preferred Port" checkbox is NOT visible
    const preferredPortCheckbox = appLauncherModal
      .getModal()
      .locator('.ant-checkbox-wrapper')
      .filter({ hasText: /prefer.*port/i });
    await expect(preferredPortCheckbox).not.toBeVisible();

    // Verify app buttons are still visible and functional
    const ttydAppButton = appLauncherModal.getAppButton('ttyd');
    await expect(ttydAppButton).toBeVisible();
  });

  test('User sees "Open to Public" option when openPortToPublic is enabled', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Close modal and drawer before applying new config
    await closeModalAndDrawer();

    // Enable openPortToPublic
    await modifyConfigToml(sharedPage, sharedRequest, {
      resources: {
        openPortToPublic: true,
        allowPreferredPort: false,
      },
    });

    // Reload page to apply config changes
    await sharedPage.reload();
    await sharedPage.waitForLoadState('networkidle');

    // Reopen modal
    appLauncherModal = await openAppLauncherModal();
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Verify "Open to Public" checkbox IS visible
    const openToPublicCheckbox = appLauncherModal
      .getModal()
      .locator('.ant-checkbox-wrapper')
      .filter({ hasText: /open.*public/i });
    await expect(openToPublicCheckbox).toBeVisible();

    // Verify "Try Preferred Port" checkbox is still NOT visible
    const preferredPortCheckbox = appLauncherModal
      .getModal()
      .locator('.ant-checkbox-wrapper')
      .filter({ hasText: /prefer.*port/i });
    await expect(preferredPortCheckbox).not.toBeVisible();
  });

  test('User sees "Try Preferred Port" option when allowPreferredPort is enabled', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Close modal and drawer before applying new config
    await closeModalAndDrawer();

    // Enable allowPreferredPort, disable openPortToPublic
    await modifyConfigToml(sharedPage, sharedRequest, {
      resources: {
        openPortToPublic: false,
        allowPreferredPort: true,
      },
    });

    // Reload page to apply config changes
    await sharedPage.reload();
    await sharedPage.waitForLoadState('networkidle');

    // Reopen modal
    appLauncherModal = await openAppLauncherModal();
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Verify "Open to Public" checkbox is NOT visible
    const openToPublicCheckbox = appLauncherModal
      .getModal()
      .locator('.ant-checkbox-wrapper')
      .filter({ hasText: /open.*public/i });
    await expect(openToPublicCheckbox).not.toBeVisible();

    // Verify "Try Preferred Port" checkbox IS visible
    const preferredPortCheckbox = appLauncherModal
      .getModal()
      .locator('.ant-checkbox-wrapper')
      .filter({ hasText: /prefer.*port/i });
    await expect(preferredPortCheckbox).toBeVisible();
  });

  test('User sees both advanced options when both settings are enabled', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Close modal and drawer before applying new config
    await closeModalAndDrawer();

    // Enable both options
    await modifyConfigToml(sharedPage, sharedRequest, {
      resources: {
        openPortToPublic: true,
        allowPreferredPort: true,
      },
    });

    // Reload page to apply config changes
    await sharedPage.reload();
    await sharedPage.waitForLoadState('networkidle');

    // Reopen modal
    appLauncherModal = await openAppLauncherModal();
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Verify "Open to Public" checkbox IS visible
    const openToPublicCheckbox = appLauncherModal
      .getModal()
      .locator('.ant-checkbox-wrapper')
      .filter({ hasText: /open.*public/i });
    await expect(openToPublicCheckbox).toBeVisible();

    // Verify "Try Preferred Port" checkbox IS visible
    const preferredPortCheckbox = appLauncherModal
      .getModal()
      .locator('.ant-checkbox-wrapper')
      .filter({ hasText: /prefer.*port/i });
    await expect(preferredPortCheckbox).toBeVisible();
  });

  test('User can interact with "Open to Public" checkbox when enabled', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal should still be open with both options enabled
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Find and interact with "Open to Public" checkbox
    const openToPublicCheckbox = appLauncherModal
      .getModal()
      .locator('.ant-checkbox-wrapper')
      .filter({ hasText: /open.*public/i })
      .locator('input[type="checkbox"]');

    // Check the checkbox
    await openToPublicCheckbox.check();
    await expect(openToPublicCheckbox).toBeChecked();

    // Uncheck the checkbox
    await openToPublicCheckbox.uncheck();
    await expect(openToPublicCheckbox).not.toBeChecked();
  });

  test('User can interact with "Try Preferred Port" checkbox when enabled', async () => {
    test.skip(!sessionCreated, 'Session was not created successfully');

    // Modal should still be open with both options enabled
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Find and interact with "Try Preferred Port" checkbox
    const preferredPortCheckbox = appLauncherModal
      .getModal()
      .locator('.ant-checkbox-wrapper')
      .filter({ hasText: /prefer.*port/i })
      .locator('input[type="checkbox"]');

    // Check the checkbox
    await preferredPortCheckbox.check();
    await expect(preferredPortCheckbox).toBeChecked();

    // Uncheck the checkbox
    await preferredPortCheckbox.uncheck();
    await expect(preferredPortCheckbox).not.toBeChecked();
  });
});
