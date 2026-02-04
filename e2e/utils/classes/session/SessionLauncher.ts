import { navigateTo } from '../../test-util';
import { getMenuItem } from '../../test-util-antd';
import { Page, Locator, expect } from '@playwright/test';

/**
 * Configuration options for SessionLauncher
 */
export interface SessionLauncherOptions {
  /** Session name (auto-generated if not provided) */
  sessionName?: string;
  /** Session type: 'interactive' or 'batch' */
  sessionType?: 'interactive' | 'batch';
  /** Full image string (e.g., 'cr.backend.ai/stable/python:3.13-ubuntu24.04-amd64@x86_64') */
  image?: string;
  /** Resource group name */
  resourceGroup?: string;
  /** Resource preset name (e.g., 'minimum', 'small', 'medium') */
  resourcePreset?: string;
  /** Batch command (required for batch sessions) */
  batchCommand?: string;
  /** Batch schedule date in ISO format */
  batchScheduleDate?: string;
  /** VFolder names to mount */
  mountedFolders?: string[];
  /** Ports to expose */
  ports?: number[];
  /** Environment variables */
  envVars?: Record<string, string>;
  /** Skip the "No storage folder is mounted" warning dialog */
  skipStorageWarning?: boolean;
  /** Close the app launcher modal after session creation */
  closeAppLauncherAfterCreate?: boolean;
  /** Wait for session to reach RUNNING status */
  waitForRunning?: boolean;
  /** Timeout for waiting for RUNNING status (ms) */
  runningTimeout?: number;
}

/**
 * Default options for SessionLauncher
 */
const DEFAULT_OPTIONS: Required<SessionLauncherOptions> = {
  sessionName: '',
  sessionType: 'interactive',
  image: '',
  resourceGroup: 'default',
  resourcePreset: 'minimum',
  batchCommand: '',
  batchScheduleDate: '',
  mountedFolders: [],
  ports: [],
  envVars: {},
  skipStorageWarning: true,
  closeAppLauncherAfterCreate: true,
  waitForRunning: true,
  runningTimeout: 180000, // 3 minutes
};

/**
 * SessionLauncher - A utility class for creating and managing sessions in E2E tests
 *
 * Provides a fluent builder API for configuring session options and methods
 * for creating, terminating, and managing sessions.
 *
 * @example
 * ```typescript
 * // Basic usage with defaults
 * const launcher = new SessionLauncher(page);
 * await launcher.create();
 * await launcher.terminate();
 *
 * // Custom configuration
 * const launcher = new SessionLauncher(page)
 *   .withSessionName('my-test-session')
 *   .withImage('cr.backend.ai/stable/python:3.13-ubuntu24.04-amd64@x86_64')
 *   .withResourcePreset('minimum');
 * await launcher.create();
 * ```
 */
export class SessionLauncher {
  private page: Page;
  private options: Required<SessionLauncherOptions>;

  constructor(page: Page) {
    this.page = page;
    this.options = { ...DEFAULT_OPTIONS };
  }

  /**
   * Generate a unique session name
   */
  private generateSessionName(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `e2e-session-${timestamp}-${random}`;
  }

  // ============================================================
  // Builder Methods (chainable)
  // ============================================================

  /**
   * Set the session name
   * @param name - Session name
   */
  withSessionName(name: string): this {
    this.options.sessionName = name;
    return this;
  }

  /**
   * Set the session type
   * @param type - 'interactive' or 'batch'
   */
  withSessionType(type: 'interactive' | 'batch'): this {
    this.options.sessionType = type;
    return this;
  }

  /**
   * Set the container image
   * @param image - Full image string (e.g., 'cr.backend.ai/stable/python:3.13-ubuntu24.04-amd64@x86_64')
   */
  withImage(image: string): this {
    this.options.image = image;
    return this;
  }

  /**
   * Set the resource group
   * @param group - Resource group name
   */
  withResourceGroup(group: string): this {
    this.options.resourceGroup = group;
    return this;
  }

  /**
   * Set the resource preset
   * @param preset - Resource preset name (e.g., 'minimum', 'small', 'medium')
   */
  withResourcePreset(preset: string): this {
    this.options.resourcePreset = preset;
    return this;
  }

  /**
   * Set the batch command (for batch sessions)
   * @param command - Command to run
   */
  withBatchCommand(command: string): this {
    this.options.batchCommand = command;
    return this;
  }

  /**
   * Set the batch schedule date (for batch sessions)
   * @param date - ISO date string
   */
  withBatchScheduleDate(date: string): this {
    this.options.batchScheduleDate = date;
    return this;
  }

  /**
   * Set the VFolders to mount
   * @param folders - Array of VFolder names
   */
  withMountedFolders(folders: string[]): this {
    this.options.mountedFolders = folders;
    return this;
  }

  /**
   * Set the ports to expose
   * @param ports - Array of port numbers
   */
  withPorts(ports: number[]): this {
    this.options.ports = ports;
    return this;
  }

  /**
   * Set environment variables
   * @param vars - Key-value pairs of environment variables
   */
  withEnvVars(vars: Record<string, string>): this {
    this.options.envVars = vars;
    return this;
  }

  /**
   * Set multiple options at once
   * @param options - Partial options object
   */
  withOptions(options: Partial<SessionLauncherOptions>): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Skip the storage warning dialog
   * @param skip - Whether to skip (default: true)
   */
  withSkipStorageWarning(skip: boolean = true): this {
    this.options.skipStorageWarning = skip;
    return this;
  }

  /**
   * Close app launcher modal after session creation
   * @param close - Whether to close (default: true)
   */
  withCloseAppLauncherAfterCreate(close: boolean = true): this {
    this.options.closeAppLauncherAfterCreate = close;
    return this;
  }

  /**
   * Wait for session to reach RUNNING status
   * @param wait - Whether to wait (default: true)
   * @param timeout - Timeout in ms (default: 180000)
   */
  withWaitForRunning(wait: boolean = true, timeout: number = 180000): this {
    this.options.waitForRunning = wait;
    this.options.runningTimeout = timeout;
    return this;
  }

  // ============================================================
  // Getter Methods
  // ============================================================

  /**
   * Get the current session name
   */
  getSessionName(): string {
    return this.options.sessionName || '';
  }

  /**
   * Get the session row locator
   */
  getSessionRow(): Locator {
    return this.page
      .locator('tr')
      .filter({ hasText: this.options.sessionName });
  }

  // ============================================================
  // Action Methods
  // ============================================================

  /**
   * Create a new session with the configured options
   *
   * Steps:
   * 1. Navigate to session/start page
   * 2. Select session type (interactive/batch)
   * 3. Fill session name
   * 4. Go to environment step
   * 5. Select image (if specified)
   * 6. Select resource group and preset
   * 7. Skip to review and launch
   * 8. Handle dialogs
   * 9. Wait for session to be visible and reach RUNNING status
   */
  async create(): Promise<void> {
    // Generate session name if not provided
    if (!this.options.sessionName) {
      this.options.sessionName = this.generateSessionName();
    }

    // Step 1: Navigate to session launcher page
    await navigateTo(this.page, 'session/start');

    // Step 2: Select session type
    await this.selectSessionType();

    // Step 3: Fill session name
    await this.fillSessionName();

    // Step 4: Configure batch options if batch mode
    if (this.options.sessionType === 'batch') {
      await this.configureBatchOptions();
    }

    // Step 5: Go to next step (environment)
    await this.page.getByRole('button', { name: 'Next' }).click();

    // Step 6: Select image if specified
    if (this.options.image) {
      await this.selectImage();
    }

    // Step 7: Select resource group
    await this.selectResourceGroup();

    // Step 8: Select resource preset
    await this.selectResourcePreset();

    // Step 9: Skip to review and launch
    await this.page.getByRole('button', { name: 'Skip to review' }).click();

    // Step 10: Click Launch button
    const launchButton = this.page
      .locator('button')
      .filter({ hasText: 'Launch' });
    await expect(launchButton).toBeEnabled({ timeout: 10000 });
    await launchButton.click();

    // Step 11: Handle "No storage folder is mounted" dialog
    if (this.options.skipStorageWarning) {
      await this.handleStorageWarningDialog();
    }

    // Step 12: Handle app launcher modal
    if (this.options.closeAppLauncherAfterCreate) {
      await this.closeAppLauncherModal();
    }

    // Step 13: Wait for session to appear in list
    await this.waitForSessionVisible();

    // Step 14: Wait for RUNNING status if configured
    if (this.options.waitForRunning) {
      await this.waitForRunning(this.options.runningTimeout);
    }
  }

  /**
   * Terminate the session
   *
   * Steps:
   * 1. Navigate to sessions page
   * 2. Find session row
   * 3. Check if already terminated
   * 4. Open session detail drawer
   * 5. Click terminate button
   * 6. Confirm termination
   * 7. Wait for TERMINATED status
   */
  async terminate(): Promise<void> {
    if (!this.options.sessionName) {
      throw new Error('Session name is not set. Cannot terminate session.');
    }

    // Step 1: Navigate to session list
    await this.navigateToSessionList();

    // Step 2: Find session row
    const sessionRow = this.getSessionRow();
    const sessionRowVisible = await sessionRow
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (!sessionRowVisible) {
      console.log(
        `Session ${this.options.sessionName} not found in table, may already be terminated`,
      );
      return;
    }

    // Step 3: Check if already terminated/terminating
    const currentStatus = sessionRow
      .locator('td')
      .filter({ hasText: /TERMINATED|TERMINATING/ });
    const isAlreadyTerminated = await currentStatus
      .isVisible({ timeout: 1000 })
      .catch(() => false);

    if (isAlreadyTerminated) {
      console.log(
        `Session ${this.options.sessionName} is already terminated or terminating`,
      );
      return;
    }

    // Step 4: Open session detail drawer
    const sessionDetailDrawer = await this.openSessionDetailDrawer();

    // Step 5: Find and click terminate button
    const terminateButton = sessionDetailDrawer
      .getByRole('button')
      .filter({ has: this.page.getByLabel('terminate') });

    const terminateButtonVisible = await terminateButton
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (!terminateButtonVisible) {
      // Check status in drawer
      const statusInDrawer = await sessionDetailDrawer
        .getByText(/TERMINATED|TERMINATING|CANCELLED/)
        .isVisible({ timeout: 1000 })
        .catch(() => false);

      if (statusInDrawer) {
        console.log(
          `Session ${this.options.sessionName} is already in terminal state`,
        );
      } else {
        console.log(
          `Terminate button not available for session ${this.options.sessionName}`,
        );
      }

      // Close the drawer
      await this.closeDrawer(sessionDetailDrawer);
      return;
    }

    await terminateButton.click();

    // Step 6: Confirm termination in modal
    const confirmModal = this.page.getByRole('dialog', {
      name: 'Terminate Session',
    });
    await expect(confirmModal).toBeVisible({ timeout: 5000 });

    const confirmButton = confirmModal.getByRole('button', {
      name: 'Terminate',
    });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await confirmButton.click();

    // Wait for confirmation modal to close
    await expect(confirmModal).not.toBeVisible({ timeout: 5000 });

    // Step 7: Close the drawer
    await this.closeDrawer(sessionDetailDrawer);

    // Step 8: Wait for TERMINATED status
    const updatedSessionRow = this.page
      .locator('tr')
      .filter({ hasText: this.options.sessionName });
    const terminatedStatus = updatedSessionRow.getByText('TERMINATED');
    await expect(terminatedStatus).toBeVisible({ timeout: 20000 });
  }

  /**
   * Wait for the session to reach RUNNING status
   * @param timeout - Timeout in ms (default: 180000 = 3 minutes)
   */
  async waitForRunning(timeout: number = 180000): Promise<void> {
    const sessionRow = this.getSessionRow();
    const runningStatus = sessionRow.getByText('RUNNING');
    await expect(runningStatus).toBeVisible({ timeout });
  }

  /**
   * Navigate to the session list page
   */
  async navigateToSessionList(): Promise<void> {
    await getMenuItem(this.page, 'Sessions').click();
    await expect(this.page.locator('.ant-table')).toBeVisible({
      timeout: 10000,
    });
  }

  /**
   * Open the session detail drawer
   * @returns The drawer locator
   */
  async openSessionDetailDrawer(): Promise<Locator> {
    const sessionRow = this.getSessionRow();
    await expect(sessionRow).toBeVisible({ timeout: 10000 });

    // Click on the session name link
    const sessionNameLink = sessionRow.getByText(this.options.sessionName);
    await sessionNameLink.click();

    // Wait for drawer to open
    const sessionDetailDrawer = this.page
      .locator('.ant-drawer')
      .filter({ hasText: 'Session Info' });
    await expect(sessionDetailDrawer).toBeVisible({ timeout: 10000 });

    return sessionDetailDrawer;
  }

  // ============================================================
  // Private Helper Methods
  // ============================================================

  /**
   * Select the session type (interactive/batch)
   */
  private async selectSessionType(): Promise<void> {
    const typeLabel =
      this.options.sessionType === 'interactive' ? 'Interactive' : 'Batch';
    const radioButton = this.page
      .locator('label')
      .filter({ hasText: typeLabel })
      .locator('input[type="radio"]');
    await expect(radioButton).toBeVisible({ timeout: 10000 });
    await radioButton.check();
  }

  /**
   * Fill the session name input
   */
  private async fillSessionName(): Promise<void> {
    const sessionNameInput = this.page.locator('#sessionName');
    await expect(sessionNameInput).toBeVisible();
    await sessionNameInput.fill(this.options.sessionName);
  }

  /**
   * Configure batch options (command, schedule date)
   */
  private async configureBatchOptions(): Promise<void> {
    if (this.options.batchCommand) {
      const commandInput = this.page.locator(
        'textarea[id*="batch"][id*="command"], #batch_command',
      );
      if (await commandInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await commandInput.fill(this.options.batchCommand);
      }
    }

    // TODO: Add schedule date configuration if needed
  }

  /**
   * Select the container image
   */
  private async selectImage(): Promise<void> {
    const environmentsSelect = this.page
      .getByRole('combobox', { name: 'Environments' })
      .first();
    await environmentsSelect.click();
    await environmentsSelect.fill(this.options.image);

    const imageOption = this.page
      .getByRole('option')
      .filter({ hasText: this.options.image });
    await imageOption.click();
  }

  /**
   * Select the resource group
   */
  private async selectResourceGroup(): Promise<void> {
    const resourceGroup = this.page.getByRole('combobox', {
      name: 'Resource Group',
    });
    await expect(resourceGroup).toBeVisible({ timeout: 10000 });
    await resourceGroup.fill(this.options.resourceGroup);
    await this.page.keyboard.press('Enter');
  }

  /**
   * Select the resource preset
   */
  private async selectResourcePreset(): Promise<void> {
    const resourcePreset = this.page.getByRole('combobox', {
      name: 'Resource Presets',
    });
    await expect(resourcePreset).toBeVisible({ timeout: 10000 });
    await resourcePreset.fill(this.options.resourcePreset);
    await this.page
      .getByRole('option', { name: this.options.resourcePreset })
      .click();
  }

  /**
   * Handle the "No storage folder is mounted" warning dialog
   */
  private async handleStorageWarningDialog(): Promise<void> {
    try {
      const storageDialog = this.page
        .getByRole('dialog')
        .filter({ hasText: 'No storage folder is mounted' });

      await expect(storageDialog).toBeVisible({ timeout: 5000 });
      await storageDialog.getByRole('button', { name: 'Start' }).click();
    } catch {
      // Dialog may not appear if folders are mounted, this is fine
    }
  }

  /**
   * Close the app launcher modal if visible
   */
  private async closeAppLauncherModal(): Promise<void> {
    const appLauncherDialog = this.page.getByTestId('app-launcher-modal');

    const dialogVisible = await appLauncherDialog
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (dialogVisible) {
      await appLauncherDialog.getByRole('button', { name: 'Close' }).click();
    }
  }

  /**
   * Wait for the session to appear in the session list
   */
  private async waitForSessionVisible(): Promise<void> {
    const sessionRow = this.getSessionRow();
    await expect(sessionRow).toBeVisible({ timeout: 20000 });
  }

  /**
   * Close a drawer
   * @param drawer - The drawer locator
   */
  private async closeDrawer(drawer: Locator): Promise<void> {
    const closeButton = drawer.getByRole('button', { name: 'Close' }).first();
    const closeButtonVisible = await closeButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (closeButtonVisible) {
      await closeButton.click();
    }
  }
}
