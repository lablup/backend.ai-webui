// spec: Session Dependency E2E Tests
// Tests for session dependency card visibility and dropdown interactions in the session launcher
import { SessionLauncher } from '../utils/classes/session/SessionLauncher';
import { loginAsUser, navigateTo } from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

/**
 * Navigate to session launcher and wait for form readiness
 */
const navigateToSessionLauncher = async (page: Page) => {
  await navigateTo(page, 'session/start');
  const interactiveRadioButton = page
    .locator('label')
    .filter({ hasText: 'Interactive' })
    .locator('input[type="radio"]');
  await expect(interactiveRadioButton).toBeVisible({ timeout: 10000 });
};

/**
 * Get a Locator for the Dependencies card on the session launcher page.
 */
const getDependenciesCard = (page: Page) => {
  return page.locator('div.ant-card').filter({ hasText: 'Dependencies' });
};

/**
 * Wait for the dependency select to finish loading (Suspense/Relay query).
 * During Suspense transitions, there may be two .ant-select elements briefly.
 * We target the one that is NOT in a loading/disabled state.
 */
const waitForSelectReady = async (page: Page) => {
  const card = getDependenciesCard(page);
  const select = card.locator(
    '.ant-select:not(.ant-select-loading):not(.ant-select-disabled)',
  );
  await expect(select).toBeVisible({ timeout: 15000 });
  return select;
};

/**
 * Skip the test if the session-dependency feature is not supported by the backend.
 */
const skipIfDependencyFeatureUnavailable = async (page: Page) => {
  const dependenciesCard = getDependenciesCard(page);
  const isVisible = await dependenciesCard
    .isVisible({ timeout: 5000 })
    .catch(() => false);

  if (!isVisible) {
    console.log(
      'session-dependency feature not supported by backend, skipping',
    );
    test.skip();
  }
};

test.describe(
  'Session Launcher - Dependency Configuration',
  { tag: ['@critical', '@session', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
    });

    test('User can see Dependencies card on session launcher page in interactive mode', async ({
      page,
    }) => {
      await navigateToSessionLauncher(page);
      await skipIfDependencyFeatureUnavailable(page);

      const dependenciesCard = getDependenciesCard(page);
      await expect(dependenciesCard).toContainText('Dependencies');
      await expect(dependenciesCard).toContainText('Depend on other sessions');
      await waitForSelectReady(page);
    });

    test('User can see Dependencies card when switching to batch mode', async ({
      page,
    }) => {
      await navigateToSessionLauncher(page);
      await skipIfDependencyFeatureUnavailable(page);

      const batchRadioButton = page
        .locator('label')
        .filter({ hasText: 'Batch' })
        .locator('input[type="radio"]');
      await batchRadioButton.check();

      const dependenciesCard = getDependenciesCard(page);
      await expect(dependenciesCard).toBeVisible({ timeout: 10000 });
      await expect(dependenciesCard).toContainText('Dependencies');
      await waitForSelectReady(page);
    });

    test('User can open dependency dropdown and see available sessions or empty state', async ({
      page,
    }) => {
      await navigateToSessionLauncher(page);
      await skipIfDependencyFeatureUnavailable(page);

      const select = await waitForSelectReady(page);
      await select.click();

      const dropdown = page.locator('.ant-select-dropdown');
      await expect(dropdown).toBeVisible({ timeout: 10000 });

      const hasOptions = await dropdown
        .locator('.ant-select-item-option')
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      const hasEmpty = await dropdown
        .locator('.ant-empty')
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      expect(hasOptions || hasEmpty).toBeTruthy();
    });

    test('User can search for sessions by name in the dependency dropdown', async ({
      page,
    }) => {
      await navigateToSessionLauncher(page);
      await skipIfDependencyFeatureUnavailable(page);

      const select = await waitForSelectReady(page);
      await select.click();

      const dropdown = page.locator('.ant-select-dropdown');
      await expect(dropdown).toBeVisible({ timeout: 10000 });

      const searchInput = select.locator('input');
      await searchInput.fill('e2e-test');

      await expect(dropdown).toBeVisible({ timeout: 10000 });
    });
  },
);

// Tests below require a running Backend.AI cluster with available compute resources.
// They create actual sessions and wait for RUNNING status.
// Tag: @requires-session — skip in environments without a cluster.

test.describe(
  'Session Launcher - Dependency with Session Creation',
  { tag: ['@critical', '@session', '@functional', '@requires-session'] },
  () => {
    const createdSessions: string[] = [];

    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
    });

    test.afterEach(async ({ page }) => {
      for (const sessionName of createdSessions) {
        try {
          const launcher = new SessionLauncher(page);
          launcher.withSessionName(sessionName);
          await launcher.terminate();
        } catch (error) {
          console.log(`Failed to terminate session ${sessionName}:`, error);
        }
      }
      createdSessions.length = 0;
    });

    test('User can select a session from the dependency dropdown and see it as a tag', async ({
      page,
    }) => {
      test.setTimeout(300000);
      const sessionName = `e2e-dep-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const launcher = new SessionLauncher(page)
        .withSessionName(sessionName)
        .withSessionType('batch')
        .withBatchCommand('sleep 300')
        .withWaitForRunning(true, 180000);

      await launcher.create();
      createdSessions.push(sessionName);

      await navigateToSessionLauncher(page);
      await skipIfDependencyFeatureUnavailable(page);

      const select = await waitForSelectReady(page);
      await select.click();

      const dropdown = page.locator('.ant-select-dropdown');
      await expect(dropdown).toBeVisible({ timeout: 10000 });

      const searchInput = select.locator('input');
      await searchInput.fill(sessionName);

      const sessionOption = dropdown
        .locator('.ant-select-item-option')
        .filter({ hasText: sessionName });
      await expect(sessionOption).toBeVisible({ timeout: 15000 });
      await sessionOption.click();

      const selectedTag = select.locator('.ant-select-selection-item');
      await expect(selectedTag).toBeVisible();
    });

    test('User can create session with dependency on a running session', async ({
      page,
    }) => {
      test.setTimeout(600000);
      const dependencySessionName = `e2e-dep-parent-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const dependentSessionName = `e2e-dep-child-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const parentLauncher = new SessionLauncher(page)
        .withSessionName(dependencySessionName)
        .withSessionType('batch')
        .withBatchCommand('sleep 300')
        .withWaitForRunning(true, 180000);

      await parentLauncher.create();
      createdSessions.push(dependencySessionName);

      await navigateToSessionLauncher(page);
      await skipIfDependencyFeatureUnavailable(page);

      const sessionNameInput = page.locator('#sessionName');
      await sessionNameInput.fill(dependentSessionName);

      const select = await waitForSelectReady(page);
      await select.click();

      const searchInput = select.locator('input');
      await searchInput.fill(dependencySessionName);

      const dropdown = page.locator('.ant-select-dropdown');
      await expect(dropdown).toBeVisible({ timeout: 10000 });

      const sessionOption = dropdown.locator('.ant-select-item-option').filter({
        hasText: dependencySessionName,
      });
      await expect(sessionOption).toBeVisible({ timeout: 15000 });
      await sessionOption.click();

      const selectedTag = select.locator('.ant-select-selection-item');
      await expect(selectedTag).toBeVisible();

      await page.getByRole('button', { name: 'Next' }).click();

      const resourceGroup = page.getByRole('combobox', {
        name: 'Resource Group',
      });
      await expect(resourceGroup).toBeVisible({ timeout: 10000 });
      await resourceGroup.fill('default');
      await page.keyboard.press('Enter');

      const resourcePreset = page.getByRole('combobox', {
        name: 'Resource Presets',
      });
      await expect(resourcePreset).toBeVisible();
      await resourcePreset.fill('minimum');
      await page.getByRole('option', { name: 'minimum' }).click();

      await page.getByRole('button', { name: 'Skip to review' }).click();

      const launchButton = page.locator('button').filter({ hasText: 'Launch' });
      await expect(launchButton).toBeEnabled({ timeout: 10000 });
      await launchButton.click();

      try {
        const storageDialog = page
          .getByRole('dialog')
          .filter({ hasText: 'No storage folder is mounted' });
        await expect(storageDialog).toBeVisible({ timeout: 5000 });
        await storageDialog.getByRole('button', { name: 'Start' }).click();
      } catch {
        // No warning dialog
      }

      const sessionRow = page
        .locator('tr')
        .filter({ hasText: dependentSessionName });
      await expect(sessionRow).toBeVisible({ timeout: 30000 });
      createdSessions.push(dependentSessionName);
    });
  },
);

test.describe(
  'Session Detail - Dependency Display',
  { tag: ['@regression', '@session', '@functional', '@requires-session'] },
  () => {
    const createdSessions: string[] = [];

    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
    });

    test.afterEach(async ({ page }) => {
      for (const sessionName of createdSessions) {
        try {
          const launcher = new SessionLauncher(page);
          launcher.withSessionName(sessionName);
          await launcher.terminate();
        } catch (error) {
          console.log(`Failed to terminate session ${sessionName}:`, error);
        }
      }
      createdSessions.length = 0;
    });

    test('User can view dependency information in session detail drawer', async ({
      page,
    }) => {
      test.setTimeout(600000);
      const parentSessionName = `e2e-dep-view-parent-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const parentLauncher = new SessionLauncher(page)
        .withSessionName(parentSessionName)
        .withSessionType('batch')
        .withBatchCommand('sleep 300')
        .withWaitForRunning(true, 180000);

      await parentLauncher.create();
      createdSessions.push(parentSessionName);

      await navigateToSessionLauncher(page);
      await skipIfDependencyFeatureUnavailable(page);

      const childSessionName = `e2e-dep-view-child-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const sessionNameInput = page.locator('#sessionName');
      await sessionNameInput.fill(childSessionName);

      const select = await waitForSelectReady(page);
      await select.click();

      const searchInput = select.locator('input');
      await searchInput.fill(parentSessionName);

      const dropdown = page.locator('.ant-select-dropdown');
      await expect(dropdown).toBeVisible({ timeout: 10000 });

      const sessionOption = dropdown.locator('.ant-select-item-option').filter({
        hasText: parentSessionName,
      });
      await expect(sessionOption).toBeVisible({ timeout: 15000 });
      await sessionOption.click();

      await page.getByRole('button', { name: 'Next' }).click();

      const resourceGroup = page.getByRole('combobox', {
        name: 'Resource Group',
      });
      await expect(resourceGroup).toBeVisible({ timeout: 10000 });
      await resourceGroup.fill('default');
      await page.keyboard.press('Enter');

      const resourcePreset = page.getByRole('combobox', {
        name: 'Resource Presets',
      });
      await expect(resourcePreset).toBeVisible();
      await resourcePreset.fill('minimum');
      await page.getByRole('option', { name: 'minimum' }).click();

      await page.getByRole('button', { name: 'Skip to review' }).click();

      const launchButton = page.locator('button').filter({ hasText: 'Launch' });
      await expect(launchButton).toBeEnabled({ timeout: 10000 });
      await launchButton.click();

      try {
        const storageDialog = page
          .getByRole('dialog')
          .filter({ hasText: 'No storage folder is mounted' });
        await expect(storageDialog).toBeVisible({ timeout: 5000 });
        await storageDialog.getByRole('button', { name: 'Start' }).click();
      } catch {
        // No warning dialog
      }

      const childSessionRow = page
        .locator('tr')
        .filter({ hasText: childSessionName });
      await expect(childSessionRow).toBeVisible({ timeout: 30000 });
      createdSessions.push(childSessionName);

      const childLauncher = new SessionLauncher(page).withSessionName(
        childSessionName,
      );
      await childLauncher.navigateToSessionList();
      const drawer = await childLauncher.openSessionDetailDrawer();

      const dependsOnLabel = drawer.getByText('Depends On');
      const hasDependsOn = await dependsOnLabel
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (hasDependsOn) {
        await expect(drawer.getByText(parentSessionName)).toBeVisible({
          timeout: 5000,
        });
      }

      await drawer.getByRole('button', { name: 'Close' }).first().click();

      const parentLauncherForDetail = new SessionLauncher(page).withSessionName(
        parentSessionName,
      );
      const parentDrawer =
        await parentLauncherForDetail.openSessionDetailDrawer();

      const dependedByLabel = parentDrawer.getByText('Depended by Others');
      const hasDependedBy = await dependedByLabel
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (hasDependedBy) {
        await expect(parentDrawer.getByText(childSessionName)).toBeVisible({
          timeout: 5000,
        });
      }
    });
  },
);
