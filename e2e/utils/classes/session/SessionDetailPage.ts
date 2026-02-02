import { BasePage } from '../base/BasePage';
import { Page } from '@playwright/test';

export type SessionStatus =
  | 'PENDING'
  | 'PREPARING'
  | 'PULLING'
  | 'RUNNING'
  | 'TERMINATING'
  | 'TERMINATED'
  | 'CANCELLED'
  | 'ERROR';

export interface ResourceUsage {
  cpu: string;
  memory: string;
  gpu?: string;
}

/**
 * Page Object Model for Session Detail/List Page
 * Handles session lifecycle operations and monitoring
 */
export class SessionDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async verifyPageLoaded(): Promise<void> {
    // Verify session list table is visible
    const sessionTable = this.page.locator('vaadin-grid');
    await this.waitForVisible(sessionTable);
  }

  /**
   * Get session status from session list or detail view
   */
  async getSessionStatus(sessionId: string): Promise<SessionStatus> {
    // Find session row by ID and get status badge
    const sessionRow = this.page.locator(
      `vaadin-grid-cell-content:has-text("${sessionId}")`,
    );
    await this.waitForVisible(sessionRow);

    // Get status from badge or cell
    const statusBadge = sessionRow.locator('lablup-shields, [class*="status"]');
    const statusText = await this.getTextContent(statusBadge);

    return statusText.toUpperCase() as SessionStatus;
  }

  /**
   * Wait for session to reach a specific status
   */
  async waitForStatus(
    sessionId: string,
    expectedStatus: SessionStatus,
    timeout = 60000,
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const currentStatus = await this.getSessionStatus(sessionId);

      if (currentStatus === expectedStatus) {
        return;
      }

      // Check for error states
      if (currentStatus === 'ERROR' || currentStatus === 'CANCELLED') {
        throw new Error(
          `Session entered ${currentStatus} state while waiting for ${expectedStatus}`,
        );
      }

      // Wait before polling again
      await this.page.waitForTimeout(2000);
    }

    throw new Error(
      `Timeout waiting for session ${sessionId} to reach ${expectedStatus} status`,
    );
  }

  /**
   * Terminate a running session
   */
  async terminateSession(sessionId: string): Promise<void> {
    // Find session row and click terminate button
    const sessionRow = this.page.locator(
      `vaadin-grid-cell-content:has-text("${sessionId}")`,
    );
    await this.waitForVisible(sessionRow);

    // Click control menu
    const controlButton = sessionRow.locator(
      '[id="controls-menu"], wl-button[class*="controls"]',
    );
    await controlButton.click();

    // Click terminate option
    const terminateButton = this.page.getByRole('menuitem', {
      name: /terminate|destroy/i,
    });
    await terminateButton.click();

    // Confirm in dialog
    const confirmButton = this.page.getByRole('button', {
      name: /ok|confirm|yes/i,
    });
    await confirmButton.click();

    // Wait for session to be terminated
    await this.waitForStatus(sessionId, 'TERMINATED');
  }

  /**
   * Open app launcher modal for a session
   */
  async openAppLauncher(sessionId: string): Promise<void> {
    const sessionRow = this.page.locator(
      `vaadin-grid-cell-content:has-text("${sessionId}")`,
    );
    await this.waitForVisible(sessionRow);

    // Click app launcher button
    const appLauncherButton = sessionRow.locator(
      '[icon="view-comfy"], [class*="app-launcher"]',
    );
    await appLauncherButton.click();

    // Wait for app launcher modal
    const appLauncherModal = this.page.locator('backend-ai-app-launcher');
    await this.waitForVisible(appLauncherModal);
  }

  /**
   * View container logs for a session
   */
  async viewContainerLogs(sessionId: string): Promise<string> {
    const sessionRow = this.page.locator(
      `vaadin-grid-cell-content:has-text("${sessionId}")`,
    );
    await this.waitForVisible(sessionRow);

    // Click logs button
    const logsButton = sessionRow.locator(
      '[icon="assignment"], [class*="logs"]',
    );
    await logsButton.click();

    // Wait for logs dialog
    const logsDialog = this.page.locator('backend-ai-dialog[id*="log"]');
    await this.waitForVisible(logsDialog);

    // Get logs content
    const logsContent = logsDialog.locator('pre, [class*="log-content"]');
    return await this.getTextContent(logsContent);
  }

  /**
   * Get resource usage for a running session
   */
  async getResourceUsage(sessionId: string): Promise<ResourceUsage> {
    const sessionRow = this.page.locator(
      `vaadin-grid-cell-content:has-text("${sessionId}")`,
    );
    await this.waitForVisible(sessionRow);

    // Get CPU usage
    const cpuCell = sessionRow.locator('[class*="cpu"], [data-field="cpu"]');
    const cpu = await this.getTextContent(cpuCell);

    // Get memory usage
    const memoryCell = sessionRow.locator('[class*="mem"], [data-field="mem"]');
    const memory = await this.getTextContent(memoryCell);

    // Get GPU usage if available
    let gpu: string | undefined;
    const gpuCell = sessionRow.locator('[class*="gpu"], [data-field="gpu"]');
    if (await this.isVisible(gpuCell)) {
      gpu = await this.getTextContent(gpuCell);
    }

    return { cpu, memory, gpu };
  }

  /**
   * Verify session is terminated
   */
  async verifySessionTerminated(sessionId: string): Promise<boolean> {
    try {
      const status = await this.getSessionStatus(sessionId);
      return status === 'TERMINATED' || status === 'CANCELLED';
    } catch {
      return false;
    }
  }

  /**
   * Filter sessions by status category
   */
  async filterByStatusCategory(
    category: 'running' | 'finished',
  ): Promise<void> {
    const filterButton = this.page.getByRole('button', {
      name: new RegExp(category, 'i'),
    });
    await filterButton.click();
    await this.waitForNetworkIdle();
  }

  /**
   * Select session by checkbox (for bulk operations)
   */
  async selectSession(sessionId: string): Promise<void> {
    const sessionRow = this.page.locator(
      `vaadin-grid-cell-content:has-text("${sessionId}")`,
    );
    await this.waitForVisible(sessionRow);

    const checkbox = sessionRow.locator('input[type="checkbox"]');
    await checkbox.check();
  }

  /**
   * Get all visible session IDs
   */
  async getVisibleSessionIds(): Promise<string[]> {
    const sessionCells = this.page.locator(
      'vaadin-grid-cell-content[class*="session-name"]',
    );
    const count = await sessionCells.count();

    const sessionIds: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await sessionCells.nth(i).textContent();
      if (text) {
        sessionIds.push(text.trim());
      }
    }

    return sessionIds;
  }
}
