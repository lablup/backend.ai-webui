// Temporary debug file to inspect app page elements
import { AppLauncherModal } from './utils/classes/AppLauncherModal';
import { loginAsUser, navigateTo } from './utils/test-util';
import { test, expect, Page, BrowserContext } from '@playwright/test';

const createInteractiveSession = async (
  page: Page,
  sessionName: string,
): Promise<void> => {
  await navigateTo(page, 'session/start');
  await page.waitForLoadState('networkidle');

  const interactiveRadioButton = page
    .locator('label')
    .filter({ hasText: 'Interactive' })
    .locator('input[type="radio"]');
  await expect(interactiveRadioButton).toBeVisible({ timeout: 10000 });
  await interactiveRadioButton.check();

  const sessionNameInput = page.locator('#sessionName');
  await expect(sessionNameInput).toBeVisible();
  await sessionNameInput.fill(sessionName);

  await page.getByRole('button', { name: 'Next' }).click();
  await page.waitForLoadState('networkidle');
  const firstSelect = page
    .getByRole('combobox', { name: 'Environments' })
    .first();
  await firstSelect.click();

  const targetImage =
    'cr.backend.ai/stable/python:3.13-ubuntu24.04-amd64@x86_64';
  firstSelect.fill(targetImage);

  const imageOption = page.getByRole('option').filter({ hasText: targetImage });
  await imageOption.click();

  const resourceGroup = page.getByRole('combobox', {
    name: 'Resource Group',
  });
  await expect(resourceGroup).toBeVisible({ timeout: 10000 });
  await resourceGroup.fill('default');
  await page.keyboard.press('Enter');

  const resourcePreset = page.getByRole('combobox', {
    name: 'Resource Presets',
  });
  await expect(resourcePreset).toBeVisible({ timeout: 10000 });
  await resourcePreset.fill('minimum');
  await page.getByRole('option', { name: 'minimum' }).click();

  await page.getByRole('button', { name: 'Skip to review' }).click();

  const launchButton = page.locator('button').filter({ hasText: 'Launch' });
  await expect(launchButton).toBeEnabled({ timeout: 10000 });
  await launchButton.click();

  await page
    .getByRole('dialog')
    .filter({ hasText: 'No storage folder is mounted' })
    .getByRole('button', { name: 'Start' })
    .click();

  const appLauncherDialog = page.getByTestId('app-launcher-modal');
  if (await appLauncherDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
    await appLauncherDialog.getByRole('button', { name: 'Close' }).click();
  }

  const sessionRow = page.locator('tr').filter({ hasText: sessionName });
  await expect(sessionRow).toBeVisible({ timeout: 20000 });

  const runningStatus = sessionRow.getByText('RUNNING');
  await expect(runningStatus).toBeVisible({ timeout: 180000 });
};

const terminateSession = async (
  page: Page,
  sessionName: string,
): Promise<void> => {
  await page.getByRole('link', { name: 'Sessions' }).click();
  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 10000 });

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

  const sessionNameLink = sessionRow.getByText(sessionName);
  await sessionNameLink.click();

  const sessionDetailDrawer = page
    .locator('.ant-drawer')
    .filter({ hasText: 'Session Info' });
  await expect(sessionDetailDrawer).toBeVisible({ timeout: 10000 });

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

  const confirmModal = page.getByRole('dialog', { name: 'Terminate Session' });
  await expect(confirmModal).toBeVisible({ timeout: 5000 });

  const confirmButton = confirmModal.getByRole('button', { name: 'Terminate' });
  await expect(confirmButton).toBeVisible({ timeout: 5000 });
  await confirmButton.click();

  await expect(confirmModal).not.toBeVisible({ timeout: 5000 });

  const drawerCloseButton = sessionDetailDrawer
    .getByRole('button', { name: 'Close' })
    .first();
  if (await drawerCloseButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await drawerCloseButton.click();
  }

  const updatedSessionRow = page.locator('tr').filter({ hasText: sessionName });
  await expect(updatedSessionRow).toBeHidden({ timeout: 60_000 });
};

const openAppLauncherModal = async (
  page: Page,
  sessionName: string,
): Promise<AppLauncherModal> => {
  await page.getByRole('link', { name: 'Sessions' }).click();
  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 10000 });

  const sessionRow = page.locator('tr').filter({ hasText: sessionName });
  await expect(sessionRow).toBeVisible({ timeout: 10000 });

  const runningStatus = sessionRow.getByText('RUNNING');
  await expect(runningStatus).toBeVisible({ timeout: 180000 });

  const sessionNameLink = sessionRow.getByText(sessionName);
  await sessionNameLink.click();

  const sessionDetailDrawer = page
    .locator('.ant-drawer')
    .filter({ hasText: 'Session Info' });
  await expect(sessionDetailDrawer).toBeVisible({ timeout: 10000 });

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

const handleProxyError = async (page: Page): Promise<void> => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    await page
      .waitForLoadState('domcontentloaded', { timeout: 15000 })
      .catch(() => {});

    const pageContent = await page.content().catch(() => '');
    if (pageContent.includes('502') || pageContent.includes('Bad Gateway')) {
      retryCount++;
      if (retryCount < maxRetries) {
        await page.waitForTimeout(3000 + retryCount * 2000);
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
      }
    } else {
      break;
    }
  }
};

test.describe.configure({ mode: 'serial' });

test.describe('AppLauncher - Debug App Page Elements', () => {
  const testSessionName = `e2e-debug-${Date.now()}`;
  let sessionCreated = false;
  let sharedContext: BrowserContext;
  let sharedPage: Page;
  let appLauncherModal: AppLauncherModal;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(300000);

    sharedContext = await browser.newContext();
    sharedPage = await sharedContext.newPage();

    await loginAsUser(sharedPage);

    try {
      await createInteractiveSession(sharedPage, testSessionName);
      sessionCreated = true;

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
      if (appLauncherModal) {
        const isModalVisible = await appLauncherModal
          .getModal()
          .isVisible()
          .catch(() => false);
        if (isModalVisible) {
          await appLauncherModal.close();
        }
      }

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

      await terminateSession(sharedPage, testSessionName);
    }

    if (sharedContext) {
      await sharedContext.close();
    }
  });

  test('DEBUG: Console/ttyd page elements', async ({}, testInfo) => {
    testInfo.setTimeout(120000);
    test.skip(!sessionCreated, 'Session was not created successfully');

    await expect(appLauncherModal.getModal()).toBeVisible();

    const newPagePromise = sharedContext.waitForEvent('page', {
      timeout: 30000,
    });

    await appLauncherModal.clickApp('ttyd');

    const notificationContainer = sharedPage
      .locator('.ant-notification-notice')
      .last();
    await expect(notificationContainer).toBeVisible({ timeout: 10000 });

    const preparedNotification = sharedPage
      .locator('.ant-notification-notice')
      .filter({ hasText: 'Prepared' });
    await expect(preparedNotification).toBeVisible({ timeout: 60000 });

    const newPage = await newPagePromise;
    await expect(newPage).toBeTruthy();

    await handleProxyError(newPage);
    await newPage.waitForLoadState('load', { timeout: 60000 });

    // Wait a bit for JavaScript to render
    await newPage.waitForTimeout(3000);

    // Get page HTML for inspection
    const html = await newPage.content();
    console.log('===== TTYD PAGE HTML (first 5000 chars) =====');
    console.log(html.substring(0, 5000));

    // Check for common xterm.js elements
    const xtermContainer = await newPage.locator('.xterm').count();
    const xtermScreen = await newPage.locator('.xterm-screen').count();
    const xtermViewport = await newPage.locator('.xterm-viewport').count();
    const xtermRows = await newPage.locator('.xterm-rows').count();
    const terminal = await newPage.locator('[data-type="terminal"]').count();

    console.log('===== TTYD ELEMENT COUNTS =====');
    console.log('.xterm:', xtermContainer);
    console.log('.xterm-screen:', xtermScreen);
    console.log('.xterm-viewport:', xtermViewport);
    console.log('.xterm-rows:', xtermRows);
    console.log('[data-type="terminal"]:', terminal);

    await newPage.close();
    await expect(appLauncherModal.getModal()).toBeVisible();
  });

  test('DEBUG: Jupyter Notebook page elements', async ({}, testInfo) => {
    testInfo.setTimeout(120000);
    test.skip(!sessionCreated, 'Session was not created successfully');

    await expect(appLauncherModal.getModal()).toBeVisible();

    const jupyterAppVisible = await appLauncherModal
      .getAppButton('jupyter')
      .isVisible()
      .catch(() => false);

    test.skip(!jupyterAppVisible, 'Jupyter Notebook app not available');

    const newPagePromise = sharedContext.waitForEvent('page', {
      timeout: 30000,
    });

    await appLauncherModal.clickApp('jupyter');

    const notificationContainer = sharedPage
      .locator('.ant-notification-notice')
      .last();
    await expect(notificationContainer).toBeVisible({ timeout: 10000 });

    const preparedNotification = sharedPage
      .locator('.ant-notification-notice')
      .filter({ hasText: 'Prepared' });
    await expect(preparedNotification).toBeVisible({ timeout: 60000 });

    const newPage = await newPagePromise;
    await expect(newPage).toBeTruthy();

    await handleProxyError(newPage);
    await newPage.waitForLoadState('load', { timeout: 60000 });

    await newPage.waitForTimeout(3000);

    const html = await newPage.content();
    console.log('===== JUPYTER NOTEBOOK PAGE HTML (first 5000 chars) =====');
    console.log(html.substring(0, 5000));

    // Check for Jupyter Notebook specific elements
    const notebook = await newPage.locator('#notebook').count();
    const notebookContainer = await newPage
      .locator('#notebook-container')
      .count();
    const maintoolbar = await newPage.locator('#maintoolbar').count();
    const cellElement = await newPage.locator('.cell').count();
    const jupyterText = await newPage.locator('text=Jupyter').count();

    console.log('===== JUPYTER NOTEBOOK ELEMENT COUNTS =====');
    console.log('#notebook:', notebook);
    console.log('#notebook-container:', notebookContainer);
    console.log('#maintoolbar:', maintoolbar);
    console.log('.cell:', cellElement);
    console.log('text=Jupyter:', jupyterText);

    await newPage.close();
    await expect(appLauncherModal.getModal()).toBeVisible();
  });

  test('DEBUG: JupyterLab page elements', async ({}, testInfo) => {
    testInfo.setTimeout(120000);
    test.skip(!sessionCreated, 'Session was not created successfully');

    await expect(appLauncherModal.getModal()).toBeVisible();

    const jupyterlabAppVisible = await appLauncherModal
      .getAppButton('jupyterlab')
      .isVisible()
      .catch(() => false);

    test.skip(!jupyterlabAppVisible, 'JupyterLab app not available');

    const newPagePromise = sharedContext.waitForEvent('page', {
      timeout: 30000,
    });

    await appLauncherModal.clickApp('jupyterlab');

    const notificationContainer = sharedPage
      .locator('.ant-notification-notice')
      .last();
    await expect(notificationContainer).toBeVisible({ timeout: 10000 });

    const preparedNotification = sharedPage
      .locator('.ant-notification-notice')
      .filter({ hasText: 'Prepared' });
    await expect(preparedNotification).toBeVisible({ timeout: 60000 });

    const newPage = await newPagePromise;
    await expect(newPage).toBeTruthy();

    await handleProxyError(newPage);
    await newPage.waitForLoadState('load', { timeout: 60000 });

    await newPage.waitForTimeout(3000);

    const html = await newPage.content();
    console.log('===== JUPYTERLAB PAGE HTML (first 5000 chars) =====');
    console.log(html.substring(0, 5000));

    // Check for JupyterLab specific elements
    const labShell = await newPage.locator('.jp-LabShell').count();
    const launcher = await newPage.locator('.jp-Launcher').count();
    const mainArea = await newPage.locator('.jp-MainAreaWidget').count();
    const sidebar = await newPage.locator('.jp-SideBar').count();
    const jupyterlabText = await newPage.locator('text=JupyterLab').count();

    console.log('===== JUPYTERLAB ELEMENT COUNTS =====');
    console.log('.jp-LabShell:', labShell);
    console.log('.jp-Launcher:', launcher);
    console.log('.jp-MainAreaWidget:', mainArea);
    console.log('.jp-SideBar:', sidebar);
    console.log('text=JupyterLab:', jupyterlabText);

    await newPage.close();
    await expect(appLauncherModal.getModal()).toBeVisible();
  });

  test('DEBUG: VS Code page elements', async ({}, testInfo) => {
    testInfo.setTimeout(120000);
    test.skip(!sessionCreated, 'Session was not created successfully');

    await expect(appLauncherModal.getModal()).toBeVisible();

    const vscodeAppVisible = await appLauncherModal
      .getAppButton('vscode')
      .isVisible()
      .catch(() => false);

    test.skip(!vscodeAppVisible, 'Visual Studio Code app not available');

    const newPagePromise = sharedContext.waitForEvent('page', {
      timeout: 30000,
    });

    await appLauncherModal.clickApp('vscode');

    const notificationContainer = sharedPage
      .locator('.ant-notification-notice')
      .last();
    await expect(notificationContainer).toBeVisible({ timeout: 10000 });

    const preparedNotification = sharedPage
      .locator('.ant-notification-notice')
      .filter({ hasText: 'Prepared' });
    await expect(preparedNotification).toBeVisible({ timeout: 60000 });

    const newPage = await newPagePromise;
    await expect(newPage).toBeTruthy();

    await handleProxyError(newPage);
    await newPage.waitForLoadState('load', { timeout: 60000 });

    await newPage.waitForTimeout(3000);

    const html = await newPage.content();
    console.log('===== VS CODE PAGE HTML (first 5000 chars) =====');
    console.log(html.substring(0, 5000));

    // Check for VS Code specific elements
    const monacoWorkbench = await newPage.locator('.monaco-workbench').count();
    const monacoEditor = await newPage.locator('.monaco-editor').count();
    const activitybar = await newPage.locator('.activitybar').count();
    const sidebar = await newPage.locator('.sidebar').count();
    const vscodeText = await newPage.locator('text=Visual Studio Code').count();

    console.log('===== VS CODE ELEMENT COUNTS =====');
    console.log('.monaco-workbench:', monacoWorkbench);
    console.log('.monaco-editor:', monacoEditor);
    console.log('.activitybar:', activitybar);
    console.log('.sidebar:', sidebar);
    console.log('text=Visual Studio Code:', vscodeText);

    await newPage.close();
    await expect(appLauncherModal.getModal()).toBeVisible();
  });
});
