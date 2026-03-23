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
  image: process.env.E2E_DEFAULT_IMAGE || '',
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
   * 7. Wait for session row to leave "Running" view
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

    // Step 8: Wait for session to leave "Running" view
    // After termination is confirmed, the session moves from "Running" to "Finished" view
    // (PENDING sessions become CANCELLED, RUNNING sessions become TERMINATED).
    // We wait for the row to disappear from the current "Running" view as a reliable signal.
    // Use a longer timeout (120s) to accommodate PENDING sessions that take time to cancel.
    const runningSessionRow = this.page
      .locator('tr')
      .filter({ hasText: this.options.sessionName });
    await expect(runningSessionRow).not.toBeVisible({ timeout: 120000 });
  }

  /**
   * Terminate all sessions matching a session name prefix (for test cleanup).
   * Iterates through all visible sessions in the "Running" view and terminates
   * any that match the given prefix. Useful for cleaning up leftover test sessions
   * that are stuck in PENDING or RUNNING state and blocking resources.
   *
   * This method initiates termination for each session without waiting for each
   * individual session to disappear, then waits for all of them to clear at the end.
   *
   * @param prefix - Session name prefix to match (e.g., 'e2e-app-launcher-')
   */
  async terminateAllByPrefix(prefix: string): Promise<void> {
    await this.navigateToSessionList();

    // Collect session names by finding table rows (excluding measure rows)
    // that contain text matching the prefix. We collect all names first to
    // avoid stale locator issues when navigating between terminations.
    const allSessionNames: string[] = [];

    // Scan the first page only to keep cleanup fast
    const sessionRows = this.page
      .locator('tbody tr:not(.ant-table-measure-row)')
      .filter({ hasText: prefix });

    const count = await sessionRows.count().catch(() => 0);

    for (let i = 0; i < count; i++) {
      const row = sessionRows.nth(i);
      // Session name is in the second cell (index 1)
      const nameCell = row.locator('td').nth(1);
      const name = await nameCell
        .textContent({ timeout: 3000 })
        .catch(() => null);
      if (name && name.trim().startsWith(prefix)) {
        allSessionNames.push(name.trim());
      }
    }

    // Also check page 2 if there are sessions (sessions table shows 10/page by default)
    const nextPageButton = this.page.locator(
      'li[title="Next Page"] button:not([disabled])',
    );
    const hasNextPage = await nextPageButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (hasNextPage) {
      await nextPageButton.click();
      await this.page.locator('.ant-table').waitFor({ state: 'visible' });

      const page2Rows = this.page
        .locator('tbody tr:not(.ant-table-measure-row)')
        .filter({ hasText: prefix });
      const page2Count = await page2Rows.count().catch(() => 0);

      for (let i = 0; i < page2Count; i++) {
        const row = page2Rows.nth(i);
        const nameCell = row.locator('td').nth(1);
        const name = await nameCell
          .textContent({ timeout: 3000 })
          .catch(() => null);
        if (name && name.trim().startsWith(prefix)) {
          allSessionNames.push(name.trim());
        }
      }

      // Go back to page 1
      const prevPageButton = this.page.locator(
        'li[title="Previous Page"] button:not([disabled])',
      );
      await prevPageButton.click();
      await this.page.locator('.ant-table').waitFor({ state: 'visible' });
    }

    if (allSessionNames.length === 0) {
      console.log(`No sessions with prefix "${prefix}" found to clean up`);
      return;
    }

    console.log(
      `Found ${allSessionNames.length} session(s) with prefix "${prefix}" to clean up`,
    );

    // Terminate each session: initiate termination without waiting for each to disappear.
    // After initiating all terminations, we wait for all rows to be gone at the end.
    const terminatedNames: string[] = [];
    for (const sessionName of allSessionNames) {
      try {
        await this.initiateTermination(sessionName);
        terminatedNames.push(sessionName);
        console.log(`Initiated termination for session: ${sessionName}`);
      } catch (error) {
        console.log(
          `Failed to initiate termination for session ${sessionName}:`,
          error,
        );
      }
      // Navigate back to session list for the next iteration
      await this.navigateToSessionList();
    }

    // Wait for all terminated sessions to disappear from "Running" view
    if (terminatedNames.length > 0) {
      console.log(
        `Waiting for ${terminatedNames.length} session(s) to disappear from Running view...`,
      );
      for (const sessionName of terminatedNames) {
        const row = this.page.locator('tr').filter({ hasText: sessionName });
        await expect(row)
          .not.toBeVisible({ timeout: 120000 })
          .catch((err) => {
            console.log(
              `Session ${sessionName} did not disappear within timeout: ${err}`,
            );
          });
      }
    }
  }

  /**
   * Initiates termination for a session by name without waiting for it to disappear.
   * Opens the session detail drawer, clicks terminate, and confirms the termination dialog.
   * Use this when you want to start termination for multiple sessions and then wait for all.
   *
   * @param sessionName - Session name to terminate
   */
  private async initiateTermination(sessionName: string): Promise<void> {
    const sessionRow = this.page.locator('tr').filter({ hasText: sessionName });

    const sessionRowVisible = await sessionRow
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (!sessionRowVisible) {
      console.log(
        `Session ${sessionName} not found in table, may already be terminated`,
      );
      return;
    }

    // Check if already terminated/terminating
    const currentStatus = sessionRow
      .locator('td')
      .filter({ hasText: /TERMINATED|TERMINATING/ });
    const isAlreadyTerminated = await currentStatus
      .isVisible({ timeout: 1000 })
      .catch(() => false);

    if (isAlreadyTerminated) {
      console.log(
        `Session ${sessionName} is already terminated or terminating`,
      );
      return;
    }

    // Click session name to open drawer
    const sessionNameLink = sessionRow.getByText(sessionName);
    await sessionNameLink.click();

    const sessionDetailDrawer = this.page
      .locator('.ant-drawer')
      .filter({ hasText: 'Session Info' });
    await expect(sessionDetailDrawer).toBeVisible({ timeout: 10000 });

    // Find the terminate button and check both visibility AND enabled state
    const terminateButton = sessionDetailDrawer
      .getByRole('button')
      .filter({ has: this.page.getByLabel('terminate') });

    const terminateButtonVisible = await terminateButton
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (!terminateButtonVisible) {
      await this.closeDrawer(sessionDetailDrawer);
      return;
    }

    // Check if the terminate button is enabled (not disabled)
    const isEnabled = await terminateButton
      .isEnabled({ timeout: 1000 })
      .catch(() => false);

    if (!isEnabled) {
      console.log(
        `Terminate button is disabled for session ${sessionName}, may already be in terminal state`,
      );
      await this.closeDrawer(sessionDetailDrawer);
      return;
    }

    // Click with a short timeout to avoid hanging if button becomes disabled mid-action
    await terminateButton.click({ timeout: 5000 });

    // Confirm termination
    const confirmModal = this.page.getByRole('dialog', {
      name: 'Terminate Session',
    });
    await expect(confirmModal).toBeVisible({ timeout: 5000 });
    await confirmModal.getByRole('button', { name: 'Terminate' }).click();
    await expect(confirmModal).not.toBeVisible({ timeout: 5000 });

    // Close the drawer
    await this.closeDrawer(sessionDetailDrawer);
  }

  /**
   * Wait for the session to reach RUNNING status
   * @param timeout - Timeout in ms (default: 180000 = 3 minutes)
   */
  async waitForRunning(timeout: number = 180000): Promise<void> {
    const sessionRow = this.getSessionRow();

    // Use expect.poll to check status and fail fast on terminal states
    await expect
      .poll(
        async () => {
          // Check for terminal/error states first to fail fast
          const statusCell = sessionRow.locator('td').nth(2);
          const statusText = await statusCell
            .textContent({ timeout: 3000 })
            .catch(() => '');

          if (
            statusText?.includes('CANCELLED') ||
            statusText?.includes('TERMINATED') ||
            statusText?.includes('ERROR')
          ) {
            throw new Error(
              `Session "${this.options.sessionName}" entered terminal state: ${statusText?.trim()}`,
            );
          }

          // Check if RUNNING
          const runningText = await sessionRow
            .getByText('RUNNING')
            .isVisible({ timeout: 1000 })
            .catch(() => false);
          return runningText;
        },
        {
          message: `Waiting for session "${this.options.sessionName}" to reach RUNNING status`,
          timeout,
          intervals: [2000, 3000, 5000],
        },
      )
      .toBe(true);
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
      const commandInput = this.page.getByRole('textbox', {
        name: 'Startup Command',
      });
      // Wait for the input to be visible with a longer timeout
      await commandInput.waitFor({ state: 'visible', timeout: 5000 });
      await commandInput.fill(this.options.batchCommand);
      // Trigger blur event to ensure form validation
      await commandInput.blur();
      // Wait for form validation to complete by checking the input value is set
      await expect(commandInput).toHaveValue(this.options.batchCommand);
    }

    // TODO: Add schedule date configuration if needed
  }

  /**
   * Select the container image.
   *
   * The environment select supports full-name search: typing the full image URL
   * (e.g., "cr.backend.ai/stable/python:3.13-ubuntu24.04-amd64@x86_64") into
   * the Environments combobox will match an option whose text contains the URL.
   * We wait for the dropdown to appear with a short timeout and fail fast with a
   * clear error if the image is not found.
   */
  private async selectImage(): Promise<void> {
    // Step 1: Select the environment from the first dropdown using full-name search
    const environmentsSelect = this.page
      .getByRole('combobox', { name: 'Environments' })
      .first();
    await environmentsSelect.click();
    await environmentsSelect.fill(this.options.image);

    // Wait for the dropdown to show options after filling
    await this.page
      .locator('.ant-select-dropdown')
      .waitFor({ state: 'visible', timeout: 5000 });

    // Look for the option that contains the image string with a reasonable timeout.
    // If the image is not installed in the environment, no matching option appears.
    const imageOption = this.page
      .getByRole('option')
      .filter({ hasText: this.options.image });

    const optionVisible = await imageOption
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    if (!optionVisible) {
      // Close the dropdown before throwing
      await this.page.keyboard.press('Escape');
      throw new Error(
        `Image "${this.options.image}" not found in the environment dropdown. ` +
          `The image may not be installed on this backend. ` +
          `Available options did not match the requested image.`,
      );
    }

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
