import { getMenuItem } from '../test-util-antd';
import type { SessionLauncher } from './SessionLauncher';
import { Page, expect, Locator } from '@playwright/test';

/**
 * Page Object Model for AppLauncherModal component.
 * Provides methods for interacting with the app launcher modal in E2E tests.
 */
export class AppLauncherModal {
  private readonly modalRoot: Locator;
  private readonly modal: Locator;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.modalRoot = page.getByTestId('app-launcher-modal');
    // Use the dialog role element as the actual modal locator for visibility checks
    this.modal = page.getByRole('dialog').filter({ hasText: 'App:' });
  }

  /**
   * Opens the app launcher modal from a session.
   * This is a convenience factory method that:
   * 1. Navigates to the session list
   * 2. Waits for the session to reach RUNNING status
   * 3. Opens the session detail drawer
   * 4. Clicks the app launcher button
   * 5. Returns the AppLauncherModal instance
   *
   * @param page - Playwright Page instance
   * @param sessionLauncher - SessionLauncher instance with session info
   * @returns AppLauncherModal instance ready for interaction
   *
   * @example
   * ```typescript
   * const modal = await AppLauncherModal.openFromSession(page, sessionLauncher);
   * await modal.clickApp('ttyd');
   * ```
   */
  static async openFromSession(
    page: Page,
    sessionLauncher: SessionLauncher,
  ): Promise<AppLauncherModal> {
    // Navigate to session list
    await sessionLauncher.navigateToSessionList();

    // Wait for session to reach RUNNING status
    await sessionLauncher.waitForRunning();

    // Open session detail drawer
    const sessionDetailDrawer = await sessionLauncher.openSessionDetailDrawer();

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
  }

  /**
   * Opens the app launcher modal using only the session name.
   * This is a lightweight alternative to openFromSession() that doesn't require
   * a SessionLauncher object. Useful for session reuse scenarios where the session
   * is already running and we just need to open the modal.
   *
   * @param page - Playwright Page instance
   * @param sessionName - Name of the existing RUNNING session
   * @returns AppLauncherModal instance ready for interaction
   *
   * @example
   * ```typescript
   * const modal = await AppLauncherModal.openBySessionName(page, 'my-session');
   * await modal.clickApp('ttyd');
   * ```
   */
  static async openBySessionName(
    page: Page,
    sessionName: string,
  ): Promise<AppLauncherModal> {
    // Navigate to session list
    await getMenuItem(page, 'Sessions').click();
    await expect(page.locator('.ant-table')).toBeVisible({ timeout: 10000 });

    // Find session row and click to open drawer
    const sessionRow = page.locator('tr').filter({ hasText: sessionName });
    await expect(sessionRow).toBeVisible({ timeout: 10000 });

    const sessionNameLink = sessionRow.getByText(sessionName);
    await sessionNameLink.click();

    // Wait for drawer to open
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
  }

  /**
   * Returns the modal locator
   */
  getModal(): Locator {
    return this.modal;
  }

  /**
   * Waits for the modal to be visible
   */
  async waitForOpen(): Promise<void> {
    // Wait for the actual modal content to be visible (the dialog role element with "App:" in title)
    await expect(this.modal).toBeVisible({ timeout: 10000 });
  }

  /**
   * Closes the modal by clicking the X button
   */
  async close(): Promise<void> {
    await this.modal.getByRole('button', { name: 'Close' }).click();
    await expect(this.modal).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Verifies the modal title contains the session name
   */
  async verifyModalTitle(sessionName: string): Promise<void> {
    const titleText = this.modal.locator('.ant-modal-title');
    await expect(titleText).toContainText(sessionName);
  }

  /**
   * Verifies a category section is visible by category name
   * Categories are displayed as Typography.Title level 5
   */
  async verifyCategoryVisible(categoryName: string): Promise<void> {
    const categoryHeading = this.modal.getByRole('heading', {
      name: categoryName,
      level: 5,
    });
    await expect(categoryHeading).toBeVisible();
  }

  /**
   * Gets a category section by data-testid
   */
  getCategorySection(categoryKey: string): Locator {
    return this.modal.getByTestId(`category-${categoryKey}`);
  }

  /**
   * Verifies an app button is visible by app name
   */
  async verifyAppVisible(appName: string): Promise<void> {
    const appContainer = this.modal.getByTestId(`app-${appName}`);
    await expect(appContainer).toBeVisible();
  }

  /**
   * Gets an app button by app name (data-testid)
   */
  getAppButton(appName: string): Locator {
    return this.modal.getByTestId(`app-${appName}`).getByRole('button');
  }

  /**
   * Clicks an app button by app name
   */
  async clickApp(appName: string): Promise<void> {
    const appButton = this.getAppButton(appName);
    await appButton.click();
  }

  /**
   * Verifies the app title text is visible
   */
  async verifyAppTitle(appName: string, expectedTitle: string): Promise<void> {
    const appContainer = this.modal.getByTestId(`app-${appName}`);
    await expect(appContainer).toContainText(expectedTitle);
  }

  /**
   * Checks if the Open to Public checkbox is visible
   */
  async isOpenToPublicVisible(): Promise<boolean> {
    const checkbox = this.modal.getByText('Open to Public');
    return await checkbox.isVisible();
  }

  /**
   * Checks if the Preferred Port input is visible
   */
  async isPreferredPortVisible(): Promise<boolean> {
    const checkbox = this.modal.getByText('Try Preferred Port');
    return await checkbox.isVisible();
  }

  /**
   * Sets the Open to Public option
   */
  async setOpenToPublic(enabled: boolean): Promise<void> {
    const checkbox = this.modal
      .locator('label')
      .filter({ hasText: 'Open to Public' })
      .locator('input[type="checkbox"]');
    if (enabled) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }

  /**
   * Sets the Preferred Port option
   */
  async setPreferredPort(port: number): Promise<void> {
    const checkbox = this.modal
      .locator('label')
      .filter({ hasText: 'Try Preferred Port' })
      .locator('input[type="checkbox"]');
    await checkbox.check();

    const portInput = this.modal.locator('input[type="number"]');
    await portInput.fill(port.toString());
  }

  /**
   * Verifies the modal footer is not visible (footer={null})
   */
  async verifyNoFooter(): Promise<void> {
    const footer = this.modal.locator('.ant-modal-footer');
    await expect(footer).not.toBeVisible();
  }

  /**
   * Gets all visible app containers in the modal
   */
  async getVisibleApps(): Promise<string[]> {
    const apps = this.modal.locator('[data-testid^="app-"]');
    const count = await apps.count();
    const appNames: string[] = [];
    for (let i = 0; i < count; i++) {
      const testId = await apps.nth(i).getAttribute('data-testid');
      if (testId) {
        appNames.push(testId.replace('app-', ''));
      }
    }
    return appNames;
  }

  /**
   * Verifies apps are displayed in grid layout (Row with Cols)
   */
  async verifyGridLayout(): Promise<void> {
    // Verify the Row container with apps exists
    const appGrid = this.modal.locator('.ant-row').first();
    await expect(appGrid).toBeVisible();

    // Verify at least one Col (app container) exists
    const appCols = this.modal.locator('.ant-col');
    const count = await appCols.count();
    expect(count).toBeGreaterThan(0);
  }
}
