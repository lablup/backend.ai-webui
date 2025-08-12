import { StartPage } from './utils/classes/StartPage';
import {
  deleteSession,
  loginAsAdmin,
  loginAsUser,
  navigateTo,
} from './utils/test-util';
import { getMenuItem } from './utils/test-util-antd';
import { test, expect, Page } from '@playwright/test';

const getStartSessionButton = (page: Page) => {
  return page.getByTestId('start-session-button');
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
  await page.waitForLoadState('networkidle');

  // select default resource group
  const resourceGroup = page
    .locator('.ant-form-item-row:has-text("Resource Group")')
    .locator(
      '.ant-form-item-control-input-content > .ant-select > .ant-select-selector',
    )
    .locator('input');
  await expect(resourceGroup).toBeVisible();
  await resourceGroup.fill('default');
  await page.locator('.ant-select-dropdown:has-text("default")').click();
  // select Minimum Requirements
  const ResourcePreset = page
    .locator('.ant-form-item-row:has-text("Resource Presets")')
    .locator(
      '.ant-form-item-control-input-content > .ant-select > .ant-select-selector',
    )
    .locator('input');
  await expect(ResourcePreset).toBeVisible();
  await ResourcePreset.fill('minimum');
  await page.locator('.ant-select-dropdown:has-text("minimum")').click();
  // launch
  await page.getByRole('button', { name: 'Skip to review' }).click();

  await page.locator('button').filter({ hasText: 'Launch' }).click();
  await expect(page.locator('.ant-modal-confirm-title')).toHaveText(
    'No storage folder is mounted',
  );
  await page.getByRole('button', { name: 'Start' }).click();
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
  expect(BatchModeConfigurationCard).toBeVisible();
  await BatchModeConfigurationCard.getByLabel('Startup Command').fill(
    'sleep 60',
  );
  await page.getByRole('button', { name: 'Next' }).click();
  await page.waitForLoadState('networkidle');

  // select default resource group
  const resourceGroup = page
    .locator('.ant-form-item-row:has-text("Resource Group")')
    .locator(
      '.ant-form-item-control-input-content > .ant-select > .ant-select-selector',
    )
    .locator('input');
  await expect(resourceGroup).toBeVisible();
  await resourceGroup.fill('default');
  await page.locator('.ant-select-dropdown:has-text("default")').click();
  // select Minimum Requirements
  const ResourcePreset = page
    .locator('.ant-form-item-row:has-text("Resource Presets")')
    .locator(
      '.ant-form-item-control-input-content > .ant-select > .ant-select-selector',
    )
    .locator('input');
  await expect(ResourcePreset).toBeVisible();
  await ResourcePreset.fill('minimum');
  await page.locator('.ant-select-dropdown:has-text("minimum")').click();
  // launch
  await page.getByRole('button', { name: 'Skip to review' }).click();
  await page.locator('button').filter({ hasText: 'Launch' }).click();
  await expect(page.locator('.ant-modal-confirm-title')).toHaveText(
    'No storage folder is mounted',
  );
  await page.getByRole('button', { name: 'Start' }).click();
};

test.describe('Session Creation', () => {
  const sessionName = 'e2e-test-session' + new Date().getTime();

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });
  test.afterEach(async ({ page }) => {
    // delete session after each test
    await deleteSession(page, sessionName);
  });

  test('User can create interactive session on the Start page', async ({
    page,
  }) => {
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
    await page.waitForLoadState('networkidle');
    // interactive radio button is selected by default
    const interactiveRadioButton = page
      .locator('label')
      .filter({ hasText: 'Interactive' })
      .locator('input[type="radio"]');
    await expect(interactiveRadioButton).toBeChecked();
    // create session
    await createInteractiveSessionOnSessionStartPage(page, sessionName);
    // close app dialog
    await page.getByRole('button', { name: 'close' }).click();
    // Verify that a cell exists to display the session name
    const session = page
      .locator('vaadin-grid-cell-content')
      .filter({ hasText: `${sessionName} edit done` });
    // it takes time to show the created session
    await expect(session).toBeVisible({ timeout: 10000 });
  });

  test('User can create batch session on the Start page', async ({ page }) => {
    const startPage = new StartPage(page);
    await startPage.goto();
    await expect(page).toHaveURL(/\/start/);
    const batchSessionCard = startPage.getBatchSessionCard();
    await expect(batchSessionCard).toBeVisible();
    const creationButton = startPage.getStartButtonFromCard(batchSessionCard);
    await creationButton.click();
    await expect(page).toHaveURL(/\/session\/start/);
    await page.waitForLoadState('networkidle');
    // batch radio button is selected by default
    const batchRadioButton = page
      .locator('label')
      .filter({ hasText: 'Batch' })
      .locator('input[type="radio"]');
    await expect(batchRadioButton).toBeChecked();
    // create session
    await createBatchSessionOnSessionStartPage(page, sessionName);
    // Verify that a cell exists to display the session name
    const session = page
      .locator('vaadin-grid-cell-content')
      .filter({ hasText: `${sessionName} edit done` });
    // it takes time to show the created session
    await expect(session).toBeVisible({ timeout: 10000 });
  });

  test('User can create interactive session on the Sessions page', async ({
    page,
  }) => {
    // move to sessions page
    await getMenuItem(page, 'sessions').click();
    await expect(page).toHaveURL(/\/job/);
    // click start button to create session
    const startButton = getStartSessionButton(page);
    expect(startButton).toBeVisible();
    await startButton.click();
    await expect(page).toHaveURL(/\/session\/start/);
    await page.waitForLoadState('networkidle');
    await createInteractiveSessionOnSessionStartPage(page, sessionName);
    // close app dialog
    await page.getByRole('button', { name: 'close' }).click();
    // Verify that a cell exists to display the session name
    const session = page
      .locator('vaadin-grid-cell-content')
      .filter({ hasText: `${sessionName} edit done` });
    // it takes time to show the created session
    await expect(session).toBeVisible({ timeout: 10000 });
  });

  test('User can create batch session on the Sessions page', async ({
    page,
  }) => {
    // move to sessions page
    await getMenuItem(page, 'sessions').click();
    await expect(page).toHaveURL(/\/job/);
    // click start button to create session
    const startButton = getStartSessionButton(page);
    expect(startButton).toBeVisible();
    await startButton.click();
    await expect(page).toHaveURL(/\/session\/start/);
    await page.waitForLoadState('networkidle');

    await createBatchSessionOnSessionStartPage(page, sessionName);
    // Verify that a cell exists to display the session name
    const session = page
      .locator('vaadin-grid-cell-content')
      .filter({ hasText: `${sessionName} edit done` });
    // it takes time to show the created session
    await expect(session).toBeVisible({ timeout: 20000 });
  });
});

test.describe('NEO Sessions Launcher', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('Sensitive environment variables are cleared when the browser is reloaded.', async ({
    page,
  }) => {
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
      page.locator('#envvars_1_value_help').getByText('Please enter a value.'),
    ).toBeVisible();
    await expect(
      page.locator('#envvars_2_value_help').getByText('Please enter a value.'),
    ).toBeVisible();
  });
});

test.describe('Restrict resource policy and see resource warning message', () => {
  // TODO: fix this test
  test.skip('superadmin to modify keypair resource policy', async ({
    page,
  }) => {
    await loginAsAdmin(page);
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
});
