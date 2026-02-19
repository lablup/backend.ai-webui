import { BasePage } from '../base/BasePage';
import { Page, expect } from '@playwright/test';

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
    await this.verifyPageLoaded();
  }

  async verifyPageLoaded(): Promise<void> {
    // Verify session list table is visible
    // The session page uses a table element, not vaadin-grid
    const sessionTable = this.page.locator('table').first();
    await this.waitForVisible(sessionTable, 10000);
  }

  /**
   * Get session status from session list or detail view
   * Searches in both Running and Finished categories if not found in current view
   */
  async getSessionStatus(sessionId: string): Promise<SessionStatus> {
    // Try to find session row in current view
    const sessionRow = this.page.getByRole('row', {
      name: new RegExp(sessionId),
    });
    const isVisible = (await sessionRow.count()) > 0;

    if (!isVisible) {
      // Session not in current view - try switching categories
      // Try finished category first (sessions might have terminated)
      try {
        await this.filterByStatusCategory('finished');
        // Wait for table to update by waiting for network idle
        await this.page.waitForLoadState('networkidle');
      } catch {
        // If that fails, try running category
        await this.filterByStatusCategory('running');
        // Wait for table to update by waiting for network idle
        await this.page.waitForLoadState('networkidle');
      }
    }

    // Now find the session row
    await this.waitForVisible(sessionRow);

    // Get status from the status cell
    const statusCell = sessionRow.getByRole('cell').nth(2); // Status is the 3rd column
    const statusText = await this.getTextContent(statusCell);

    return statusText.trim().toUpperCase() as SessionStatus;
  }

  /**
   * Wait for session to reach a specific status
   * Uses Playwright's auto-waiting mechanism
   */
  async waitForStatus(
    sessionId: string,
    expectedStatus: SessionStatus,
    timeout = 60000,
  ): Promise<void> {
    // Use Playwright's expect().toPass() for proper retry logic
    await expect
      .poll(
        async () => {
          const currentStatus = await this.getSessionStatus(sessionId);

          // Check for error states
          if (currentStatus === 'ERROR' || currentStatus === 'CANCELLED') {
            throw new Error(
              `Session entered ${currentStatus} state while waiting for ${expectedStatus}`,
            );
          }

          return currentStatus;
        },
        {
          message: `Timeout waiting for session ${sessionId} to reach ${expectedStatus} status`,
          timeout,
        },
      )
      .toBe(expectedStatus);
  }

  /**
   * Terminate a running session
   * This method triggers the termination but does not wait for completion.
   * Use verifySessionTerminated() or waitForStatus() to verify termination.
   */
  async terminateSession(sessionId: string): Promise<void> {
    // Check if there's a session notification alert with terminate button
    const sessionAlert = this.page.getByRole('alert');
    const hasAlert = (await sessionAlert.count()) > 0;

    if (hasAlert) {
      // Check if the alert is for the target session
      const alertText = await sessionAlert.textContent();
      if (alertText?.includes(sessionId)) {
        // Use terminate button from the notification alert
        const terminateButton = sessionAlert.getByRole('button', {
          name: 'terminate',
        });
        await terminateButton.click();

        // Confirm in dialog - the button text is "Terminate" in the confirmation modal
        const confirmButton = this.page
          .getByRole('button', {
            name: /terminate|ok|confirm|yes/i,
          })
          .last(); // Use last() to get the button in the dialog, not the one in the alert
        await confirmButton.click();

        // Wait for the confirmation dialog to close
        const dialog = this.page.getByRole('dialog');
        await this.waitForHidden(dialog, 3000);
        return;
      }
    }

    // Fallback: If no notification alert, try to find session in table and use row actions
    // This handles cases where the notification might have been closed
    const sessionRow = this.page.getByRole('row', {
      name: new RegExp(sessionId),
    });
    await this.waitForVisible(sessionRow);

    // Sessions table doesn't have action buttons in rows - they appear in notification alerts
    // If we reach here, the session exists but we can't terminate it via UI
    // This likely means the notification was closed and we need to refresh the page
    throw new Error(
      `Cannot terminate session ${sessionId} - session notification not found. ` +
        'Session action buttons only appear in notification alerts.',
    );
  }

  /**
   * Open app launcher modal for a session
   */
  async openAppLauncher(sessionId: string): Promise<void> {
    const sessionRow = this.page.getByRole('row', {
      name: new RegExp(sessionId),
    });
    await this.waitForVisible(sessionRow);

    // Click app launcher button
    const appLauncherButton = sessionRow.getByLabel('view comfy');
    await appLauncherButton.click();

    // Wait for app launcher modal (React Ant Design modal)
    const appLauncherModal = this.page.getByTestId('app-launcher-modal');
    await this.waitForVisible(appLauncherModal);
  }

  /**
   * View container logs for a session
   * Opens the logs modal, reads the logs, and closes the modal
   */
  async viewContainerLogs(sessionId: string): Promise<string> {
    const sessionRow = this.page.getByRole('row', {
      name: new RegExp(sessionId),
    });
    await this.waitForVisible(sessionRow);

    // Click the session log button from the notification toast
    // The notification toast shows after session creation with action buttons
    const logsButton = this.page.getByRole('button', { name: 'session log' });
    await logsButton.waitFor({ state: 'visible', timeout: 5000 });
    await logsButton.click();

    // Wait for logs modal/dialog to be visible
    // The modal contains the react-lazylog component
    const logsModal = this.page.locator(
      '.ant-modal:has(.react-lazylog), backend-ai-dialog:has(.react-lazylog)',
    );
    await logsModal.waitFor({ state: 'visible', timeout: 5000 });

    // Wait for log lines to be rendered in the lazylog component
    // Lazylog renders logs as spans with specific classes
    const logLines = logsModal.locator(
      '.react-lazylog span, .react-lazylog div[class*="line"]',
    );
    await logLines.first().waitFor({ state: 'visible', timeout: 5000 });

    // Get all text content from the modal body
    const modalBody = logsModal.locator('.ant-modal-body, .dialog-body');
    const logsText = await modalBody.textContent();

    // Close the logs modal by clicking the close button
    // Find the dialog role that contains the logs modal and click its close button
    const logsDialog = this.page.getByRole('dialog', {
      name: new RegExp(`Container Logs.*${sessionId}`),
    });
    const closeButton = logsDialog.getByRole('button', { name: 'Close' });
    await closeButton.click();

    // Wait for the modal to be hidden
    await this.waitForHidden(logsDialog, 3000);

    return logsText || '';
  }

  /**
   * Get resource usage for a running session
   */
  async getResourceUsage(sessionId: string): Promise<ResourceUsage> {
    const sessionRow = this.page.getByRole('row', {
      name: new RegExp(sessionId),
    });
    await this.waitForVisible(sessionRow);

    // Get all cells using role-based selector
    const cells = sessionRow.getByRole('cell');

    // CPU is in the 5th column (index 4)
    const cpu = await this.getTextContent(cells.nth(4));

    // Memory is in the 6th column (index 5)
    const memory = await this.getTextContent(cells.nth(5));

    // GPU is in the 4th column (index 3) - AI Accelerator
    let gpu: string | undefined;
    const gpuText = await this.getTextContent(cells.nth(3));
    if (gpuText && gpuText !== '-') {
      gpu = gpuText;
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
    // Click the text label for the category (radio button input is hidden)
    // UI displays "Running" and "Finished" with capital letters
    const displayCategory =
      category.charAt(0).toUpperCase() + category.slice(1);
    const filterLabel = this.page.getByText(displayCategory, { exact: true });
    await filterLabel.click();

    // Wait for table to update by checking for loading state
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Select session by checkbox (for bulk operations)
   */
  async selectSession(sessionId: string): Promise<void> {
    const sessionRow = this.page.getByRole('row', {
      name: new RegExp(sessionId),
    });
    await this.waitForVisible(sessionRow);

    const checkbox = sessionRow.getByRole('checkbox');
    await checkbox.check();
  }

  /**
   * Get all visible session IDs
   */
  async getVisibleSessionIds(): Promise<string[]> {
    // Get all data rows (excluding header row)
    const sessionRows = this.page.getByRole('row').filter({
      has: this.page.getByRole('cell'),
    });
    const count = await sessionRows.count();

    const sessionIds: string[] = [];
    for (let i = 0; i < count; i++) {
      const row = sessionRows.nth(i);
      // Session name is in the 2nd cell (index 1)
      const sessionCell = row.getByRole('cell').nth(1);
      const text = await sessionCell.textContent();
      if (text) {
        sessionIds.push(text.trim());
      }
    }

    return sessionIds;
  }
}
