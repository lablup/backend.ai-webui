import { StartPage } from '../utils/classes/common/StartPage';
import { SessionLauncher } from '../utils/classes/session/SessionLauncher';
import { loginAsAdmin, loginAsUser, navigateTo } from '../utils/test-util';
import { getMenuItem } from '../utils/test-util-antd';
import { test, expect, Page } from '@playwright/test';

const getStartSessionButton = (page: Page) => {
  // Use the main Start Session button (usually the last one in the page)
  return page.locator('button:has-text("Start Session")').last();
};

const createInteractiveSessionOnSessionStartPage = async (
  page: Page,
  sessionName: string,
) => {
  const batchRadioButton = page
    .locator('label')
    .filter({ hasText: 'Interactive' })
    .locator('input[type="radio"]');
  await batchRadioButton.check();
  const sessionNameInput = page.locator('#sessionName');
  await sessionNameInput.fill(sessionName);
  await page.getByRole('button', { name: 'Next' }).click();

  // Wait for resource group combobox to be visible (indicates page is ready)
  const resourceGroup = page.getByRole('combobox', {
    name: 'Resource Group',
  });
  await expect(resourceGroup).toBeVisible({ timeout: 10000 });
  await resourceGroup.fill('default');
  await page.keyboard.press('Enter');
  // select Minimum Requirements
  const ResourcePreset = page.getByRole('combobox', {
    name: 'Resource Presets',
  });
  await expect(ResourcePreset).toBeVisible();
  await ResourcePreset.fill('minimum');
  await page.getByRole('option', { name: 'minimum' }).click();
  // launch
  await page.getByRole('button', { name: 'Skip to review' }).click();

  // Wait for Launch button to be enabled
  const launchButton = page.locator('button').filter({ hasText: 'Launch' });
  await expect(launchButton).toBeEnabled({ timeout: 10000 });
  await launchButton.click();

  await page
    .getByRole('dialog')
    .filter({ hasText: 'No storage folder is mounted' })
    .getByRole('button', { name: 'Start' })
    .click();
};

const createBatchSessionOnSessionStartPage = async (
  page: Page,
  sessionName: string,
) => {
  const batchRadioButton = page
    .locator('label')
    .filter({ hasText: 'Batch' })
    .locator('input[type="radio"]');
  await batchRadioButton.check();
  const sessionNameInput = page.locator('#sessionName');
  await sessionNameInput.fill(sessionName);
  const BatchModeConfigurationCard = page.locator(
    'div.ant-card:has-text("Batch Mode Configuration")',
  );
  await expect(BatchModeConfigurationCard).toBeVisible();
  await BatchModeConfigurationCard.getByLabel('Startup Command').fill(
    'sleep 60',
  );
  await page.getByRole('button', { name: 'Next' }).click();

  // Wait for resource group combobox to be visible (indicates page is ready)
  const resourceGroup = page.getByRole('combobox', {
    name: 'Resource Group',
  });
  await expect(resourceGroup).toBeVisible({ timeout: 10000 });
  await resourceGroup.fill('default');
  await page.keyboard.press('Enter');

  // select Minimum Requirements
  const ResourcePreset = page.getByRole('combobox', {
    name: 'Resource Presets',
  });
  await expect(ResourcePreset).toBeVisible();
  await ResourcePreset.fill('minimum');
  await page.getByRole('option', { name: 'minimum' }).click();
  // launch
  await page.getByRole('button', { name: 'Skip to review' }).click();

  // Wait for Launch button to be enabled
  const launchButton = page.locator('button').filter({ hasText: 'Launch' });
  await expect(launchButton).toBeEnabled({ timeout: 10000 });
  await launchButton.click();

  // Wait for either success or modal to appear
  await page
    .getByRole('dialog')
    .filter({ hasText: 'No storage folder is mounted' })
    .getByRole('button', { name: 'Start' })
    .click();
};

test.describe(
  'Session Launcher',
  { tag: ['@critical', '@session', '@functional'] },
  () => {
    let createdSessionName: string | null = null;

    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
      createdSessionName = null;
    });

    test.afterEach(async ({ page }) => {
      // Cleanup: terminate created session if it exists
      if (createdSessionName) {
        try {
          const sessionLauncher = new SessionLauncher(page);
          sessionLauncher.withSessionName(createdSessionName);
          await sessionLauncher.terminate();
        } catch (error) {
          // Session might already be terminated or not found
          console.log(
            `Failed to terminate session ${createdSessionName}:`,
            error,
          );
        }
      }
    });

    test('User can create interactive session on the Start page', async ({
      page,
    }) => {
      const sessionName = `e2e-test-session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      createdSessionName = sessionName;
      const startPage = new StartPage(page);
      await startPage.goto();
      await expect(page).toHaveURL(/\/start/);
      const interactiveSessionCard = startPage.getInteractiveSessionCard();
      await expect(interactiveSessionCard).toBeVisible();
      const creationButton = startPage.getStartButtonFromCard(
        interactiveSessionCard,
      );
      await creationButton.click();

      await expect(page).toHaveURL(/\/session\/start/);
      // Wait for interactive radio button to be visible (indicates page is ready)
      const interactiveRadioButton = page
        .locator('label')
        .filter({ hasText: 'Interactive' })
        .locator('input[type="radio"]');
      await expect(interactiveRadioButton).toBeChecked({ timeout: 10000 });
      // create session
      await createInteractiveSessionOnSessionStartPage(page, sessionName);
      // Wait for session list to load and verify session exists
      const sessionRow = page.locator('tr').filter({ hasText: sessionName });
      await expect(sessionRow).toBeVisible({ timeout: 30000 });
    });

    test('User can create batch session on the Start page', async ({
      page,
    }) => {
      const sessionName = `e2e-test-session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      createdSessionName = sessionName;
      const startPage = new StartPage(page);
      await startPage.goto();
      await expect(page).toHaveURL(/\/start/);
      const batchSessionCard = startPage.getBatchSessionCard();
      await expect(batchSessionCard).toBeVisible();
      const creationButton = startPage.getStartButtonFromCard(batchSessionCard);
      await creationButton.click();
      await expect(page).toHaveURL(/\/session\/start/);
      // Wait for batch radio button to be visible (indicates page is ready)
      const batchRadioButton = page
        .locator('label')
        .filter({ hasText: 'Batch' })
        .locator('input[type="radio"]');
      await expect(batchRadioButton).toBeChecked({ timeout: 10000 });
      // create session
      await createBatchSessionOnSessionStartPage(page, sessionName);
      // Wait for session list to load and verify session exists
      const sessionRow = page.locator('tr').filter({ hasText: sessionName });
      await expect(sessionRow).toBeVisible({ timeout: 30000 });
    });

    test('User can create interactive session on the Sessions page', async ({
      page,
    }) => {
      const sessionName = `e2e-test-session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      createdSessionName = sessionName;
      // move to sessions page
      await getMenuItem(page, 'Sessions').click();
      await expect(page).toHaveURL(/\/session/);
      // click start button to create session - wait for button to be visible and enabled
      const startButton = getStartSessionButton(page);
      await expect(startButton).toBeVisible({ timeout: 10000 });
      await expect(startButton).toBeEnabled({ timeout: 5000 });
      await startButton.click();
      await expect(page).toHaveURL(/\/session\/start/);
      // Wait for interactive radio button to be visible (indicates page is ready)
      const interactiveRadioButton = page
        .locator('label')
        .filter({ hasText: 'Interactive' })
        .locator('input[type="radio"]');
      await expect(interactiveRadioButton).toBeVisible({ timeout: 10000 });
      await createInteractiveSessionOnSessionStartPage(page, sessionName);
      // Wait for session list to load and verify session exists
      const sessionRow = page.locator('tr').filter({ hasText: sessionName });
      await expect(sessionRow).toBeVisible({ timeout: 30000 });
    });

    test('User can create batch session on the Sessions page', async ({
      page,
    }) => {
      const sessionName = `e2e-test-session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      createdSessionName = sessionName;
      // move to sessions page
      await getMenuItem(page, 'Sessions').click();
      await expect(page).toHaveURL(/\/session/);
      // click start button to create session - wait for button to be visible and enabled
      const startButton = getStartSessionButton(page);
      await expect(startButton).toBeVisible({ timeout: 10000 });
      await expect(startButton).toBeEnabled({ timeout: 5000 });
      await startButton.click();
      await expect(page).toHaveURL(/\/session\/start/);
      // Wait for batch radio button to be visible (indicates page is ready)
      const batchRadioButton = page
        .locator('label')
        .filter({ hasText: 'Batch' })
        .locator('input[type="radio"]');
      await expect(batchRadioButton).toBeVisible({ timeout: 10000 });

      await createBatchSessionOnSessionStartPage(page, sessionName);
      // Wait for session list to load and verify session exists
      const sessionRow = page.locator('tr').filter({ hasText: sessionName });
      await expect(sessionRow).toBeVisible({ timeout: 30000 });
    });

    test('Sensitive environment variables are cleared when the browser is reloaded.', async ({
      page,
    }) => {
      // This test doesn't create a session, so no cleanup needed
      createdSessionName = null;

      await navigateTo(page, 'session/start');
      await page
        .getByRole('button', { name: '2 Environments & Resource' })
        .click();
      await page
        .getByRole('button', { name: 'plus Add environment variables' })
        .click();
      await page.locator('#envvars_0_variable').fill('abc');
      await page.locator('#envvars_0_variable').press('Tab');
      await page.locator('#envvars_0_value').fill('123');
      await page
        .getByRole('button', { name: 'plus Add environment variables' })
        .click();
      await page.locator('#envvars_1_variable').fill('password');
      await page.locator('#envvars_1_variable').press('Tab');
      await page.locator('#envvars_1_value').fill('hello');
      await page
        .getByRole('button', { name: 'plus Add environment variables' })
        .click();
      await page.locator('#envvars_2_variable').fill('api_key');
      await page.locator('#envvars_2_variable').press('Tab');
      await page.locator('#envvars_2_value').fill('secret');

      await page.waitForFunction(() => {
        // Wait for the form state to be saved as query param.
        return window.location.search.includes('variable');
      });

      await page.reload();
      await expect(
        page
          .locator('#envvars_1_value_help')
          .getByText('Please enter a value.'),
      ).toBeVisible();
      await expect(
        page
          .locator('#envvars_2_value_help')
          .getByText('Please enter a value.'),
      ).toBeVisible();
    });
  },
);

test.describe(
  'Restrict resource policy and see resource warning message',
  { tag: ['@regression', '@session', '@functional'] },
  () => {
    // TODO: fix this test
    test.skip('superadmin to modify keypair resource policy', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      // go to resource policy page
      await navigateTo(page, 'resource-policy');
      // modify resource limit (cpu, memory) to zero
      await page
        .getByRole('table')
        .getByRole('button', { name: 'setting' })
        .click();
      await page.locator('.ant-checkbox-input').first().uncheck();
      await page.getByLabel('CPU(optional)').click();
      await page.getByLabel('CPU(optional)').fill('0');
      await page
        .locator(
          'div:nth-child(2) > div > div > .ant-checkbox-wrapper > span:nth-child(2)',
        )
        .first()
        .uncheck();
      await page.getByLabel('Memory(optional)').click();
      await page.getByLabel('Memory(optional)').fill('0');
      await page.getByRole('button', { name: 'OK' }).click();
      // go back to session page and see message in resource allocation section
      await navigateTo(page, 'session/start');
      await page.getByRole('button', { name: 'Next right' }).click();
      const notEnoughCPUResourceMsg = await page
        .locator('#resource_cpu_help')
        .getByText('Allocatable resources falls')
        .textContent();
      const notEnoughRAMResourceMsg = await page
        .getByText('Allocatable resources falls')
        .nth(1)
        .textContent();
      expect(notEnoughCPUResourceMsg).toEqual(notEnoughRAMResourceMsg);
    });
  },
);
