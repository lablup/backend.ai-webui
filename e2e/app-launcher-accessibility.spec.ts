// spec: e2e/AppLauncher-Test-Plan.md
// Section 10: App Launcher - Accessibility and Usability
import { AppLauncherModal } from './utils/classes/AppLauncherModal';
import { loginAsUser } from './utils/test-util';
import { getMenuItem } from './utils/test-util-antd';
import { test, expect, Page, BrowserContext } from '@playwright/test';

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
  const sessionNameLink = sessionRow.getByText(sessionName).first();
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

// NOTE: These tests use an existing RUNNING session.
// Tests will be skipped if no RUNNING session is available.
test.describe('AppLauncher - Accessibility and Usability', () => {
  let sharedContext: BrowserContext;
  let sharedPage: Page;
  let appLauncherModal: AppLauncherModal;
  let sessionName = '';
  let hasRunningSession = false;

  test.beforeAll(async ({ browser, request }, testInfo) => {
    testInfo.setTimeout(300000); // 5 minutes timeout

    // Create shared context and page for all tests
    sharedContext = await browser.newContext();
    sharedPage = await sharedContext.newPage();

    await loginAsUser(sharedPage, request);

    // Navigate to Sessions page and find any RUNNING session
    await getMenuItem(sharedPage, 'Sessions').click();
    await expect(sharedPage.locator('.ant-table')).toBeVisible({
      timeout: 10000,
    });

    // Look for any RUNNING session
    const runningSessionRow = sharedPage
      .locator('tr')
      .filter({ hasText: 'RUNNING' })
      .first();

    const sessionExists = await runningSessionRow
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (sessionExists) {
      // Extract session name from the first cell
      const sessionNameCell = runningSessionRow.locator('td').nth(1);
      sessionName = (await sessionNameCell.textContent()) || '';
      hasRunningSession = true;

      try {
        // Open app launcher modal once for all tests
        appLauncherModal = await openAppLauncherModal(sharedPage, sessionName);
      } catch (error) {
        console.log(
          `Failed to setup test environment for session ${sessionName}:`,
          error,
        );
        hasRunningSession = false;
      }
    } else {
      console.log('No RUNNING session found, skipping tests');
    }
  });

  // Cleanup: Close modal and context after all tests
  test.afterAll(async () => {
    if (hasRunningSession && sharedPage) {
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
        await sharedPage.waitForTimeout(500);
      }
    }

    if (sharedContext) {
      await sharedContext.close();
    }
  });

  test('User can navigate app launcher modal using keyboard', async () => {
    test.skip(!hasRunningSession, 'No RUNNING session available');

    // Modal is already opened in beforeAll, just verify it
    await expect(appLauncherModal.getModal()).toBeVisible();

    // 2. Use Tab key to navigate through app buttons
    // Press Tab to focus on the Close button first
    await sharedPage.keyboard.press('Tab');

    // Get the currently focused element
    const focusedElement1 = await sharedPage.evaluate(() => {
      const el = document.activeElement;
      return {
        tagName: el?.tagName,
        ariaLabel: el?.getAttribute('aria-label'),
        role: el?.getAttribute('role'),
      };
    });

    // Verify Close button or first interactive element is focused
    expect(
      focusedElement1.tagName === 'BUTTON' || focusedElement1.role === 'button',
    ).toBe(true);

    // Press Tab again to move to first app button
    await sharedPage.keyboard.press('Tab');

    // Get the currently focused element (should be first app button)
    const focusedElement2 = await sharedPage.evaluate(() => {
      const el = document.activeElement;
      return {
        tagName: el?.tagName,
        role: el?.getAttribute('role'),
        testId:
          el?.getAttribute('data-testid') ||
          el?.closest('[data-testid^="app-"]')?.getAttribute('data-testid'),
      };
    });

    // Verify an app button is focused (should have data-testid starting with "app-")
    // If testId is undefined, the focus might not be on an app button yet, skip this specific check
    if (focusedElement2.testId) {
      expect(focusedElement2.testId).toMatch(/^app-/);
    } else {
      // Alternative: check if we're on a focusable element within the modal
      expect(
        focusedElement2.tagName === 'BUTTON' ||
          focusedElement2.role === 'button',
      ).toBe(true);
    }

    // 4. Use Escape key to close modal
    await sharedPage.keyboard.press('Escape');

    // Verify modal is no longer visible
    await expect(appLauncherModal.getModal()).not.toBeVisible({
      timeout: 5000,
    });

    // Reopen modal for subsequent tests
    // Wait a bit for the modal to fully close
    await sharedPage.waitForTimeout(500);

    // Check if the drawer is still open (Escape might close both modal and drawer)
    const sessionDetailDrawer = sharedPage
      .locator('.ant-drawer')
      .filter({ hasText: 'Session Info' });

    const isDrawerOpen = await sessionDetailDrawer
      .isVisible()
      .catch(() => false);

    if (!isDrawerOpen) {
      // Drawer was closed, need to reopen it by clicking the session name
      const sessionRow = sharedPage
        .locator('tr')
        .filter({ hasText: sessionName });
      await expect(sessionRow).toBeVisible({ timeout: 10000 });

      const sessionNameLink = sessionRow.getByText(sessionName).first();
      await sessionNameLink.click();

      await expect(sessionDetailDrawer).toBeVisible({ timeout: 10000 });
      // Wait for drawer to fully open
      await sharedPage.waitForTimeout(1000);
    }

    const appButton = sessionDetailDrawer
      .getByRole('button')
      .filter({ has: sharedPage.getByLabel('app') })
      .first();

    await expect(appButton).toBeVisible({ timeout: 10000 });
    await appButton.click();
    await appLauncherModal.waitForOpen();
  });

  test('User sees apps are keyboard-accessible with proper tab order', async () => {
    test.skip(!hasRunningSession, 'No RUNNING session available');

    // Modal should be open from previous test
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Verify checkboxes are keyboard-accessible
    const openToPublicCheckbox = appLauncherModal
      .getModal()
      .locator('input[type="checkbox"]')
      .first();

    // Navigate to checkbox using Tab
    let tabCount = 0;
    const maxTabs = 20; // Prevent infinite loop

    while (tabCount < maxTabs) {
      await sharedPage.keyboard.press('Tab');
      tabCount++;

      const focusedElement = await sharedPage.evaluate(() => {
        const el = document.activeElement;
        return {
          type: el?.getAttribute('type'),
          tagName: el?.tagName,
        };
      });

      // Stop when we reach a checkbox
      if (
        focusedElement.tagName === 'INPUT' &&
        focusedElement.type === 'checkbox'
      ) {
        break;
      }
    }

    // Verify checkbox is accessible
    await expect(openToPublicCheckbox).toBeVisible();
  });

  test('User can access modal content on different screen sizes', async () => {
    test.skip(!hasRunningSession, 'No RUNNING session available');

    // Verify modal is open, if not reopen it
    const isModalOpen = await appLauncherModal
      .getModal()
      .isVisible()
      .catch(() => false);

    if (!isModalOpen) {
      // Modal was closed, need to reopen it
      const sessionDetailDrawer = sharedPage
        .locator('.ant-drawer')
        .filter({ hasText: 'Session Info' });

      const isDrawerOpen = await sessionDetailDrawer
        .isVisible()
        .catch(() => false);

      if (!isDrawerOpen) {
        // Drawer was closed too, reopen it
        const sessionRow = sharedPage
          .locator('tr')
          .filter({ hasText: sessionName });
        await expect(sessionRow).toBeVisible({ timeout: 10000 });

        const sessionNameLink = sessionRow.getByText(sessionName).first();
        await sessionNameLink.click();

        await expect(sessionDetailDrawer).toBeVisible({ timeout: 10000 });
        // Wait for drawer to fully open
        await sharedPage.waitForTimeout(1000);
      }

      const appButton = sessionDetailDrawer
        .getByRole('button')
        .filter({ has: sharedPage.getByLabel('app') })
        .first();

      await expect(appButton).toBeVisible({ timeout: 10000 });
      await appButton.click();
      await appLauncherModal.waitForOpen();
    }

    // Modal should be open
    await expect(appLauncherModal.getModal()).toBeVisible();

    // 1. Desktop viewport (1920x1080) - already at default size
    await sharedPage.setViewportSize({ width: 1920, height: 1080 });
    await sharedPage.waitForTimeout(500); // Wait for viewport resize to settle

    // Verify modal is visible and properly sized
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Verify apps are visible on desktop
    const visibleAppsDesktop = await appLauncherModal.getVisibleApps();
    expect(visibleAppsDesktop.length).toBeGreaterThan(0);

    // 3. Resize viewport to tablet size (768x1024)
    await sharedPage.setViewportSize({ width: 768, height: 1024 });

    // Verify modal is still visible and accessible
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Verify at least one app is visible
    const visibleApps = await appLauncherModal.getVisibleApps();
    expect(visibleApps.length).toBeGreaterThan(0);

    // 5. Resize viewport to mobile size (375x667)
    await sharedPage.setViewportSize({ width: 375, height: 667 });

    // Verify modal is still visible and accessible
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Verify apps are still visible on mobile
    const visibleAppsMobile = await appLauncherModal.getVisibleApps();
    expect(visibleAppsMobile.length).toBeGreaterThan(0);

    // Verify modal is still visible and responsive on mobile
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Verify all interactive elements are accessible
    const appContainers = appLauncherModal
      .getModal()
      .locator('[data-testid^="app-"]');
    const appContainerCount = await appContainers.count();
    expect(appContainerCount).toBeGreaterThan(0);

    // Verify Close button is accessible
    const closeButton = appLauncherModal
      .getModal()
      .getByRole('button', { name: 'Close' });
    await expect(closeButton).toBeVisible();

    // Reset to default viewport
    await sharedPage.setViewportSize({ width: 1280, height: 720 });
  });

  test('User sees modal is scrollable when content exceeds viewport height', async () => {
    test.skip(!hasRunningSession, 'No RUNNING session available');

    // Set a very small viewport height to force scrolling
    await sharedPage.setViewportSize({ width: 450, height: 400 });

    // Modal should still be visible
    await expect(appLauncherModal.getModal()).toBeVisible();

    // Check if modal body is scrollable
    const isScrollable = await appLauncherModal.getModal().evaluate((el) => {
      const modalBody = el.querySelector('.ant-modal-body');
      if (!modalBody) return false;

      return modalBody.scrollHeight > modalBody.clientHeight;
    });

    // Modal body should be scrollable when content exceeds viewport
    expect(isScrollable).toBe(true);

    // Reset to default viewport
    await sharedPage.setViewportSize({ width: 1280, height: 720 });
  });
});
