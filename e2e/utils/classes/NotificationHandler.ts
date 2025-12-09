import { expect, Locator, Page } from '@playwright/test';

/**
 * NotificationHandler class for managing Ant Design notifications in E2E tests.
 *
 * Handles notification interactions including:
 * - Waiting for notifications to appear/disappear
 * - Closing notifications programmatically
 * - Accessing notification content (message, description)
 * - Querying notification state
 */
export class NotificationHandler {
  private readonly page: Page;
  private readonly notificationSelector = '.ant-notification-notice';

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get all notification containers on the page
   */
  private getNotifications(): Locator {
    return this.page.locator(this.notificationSelector);
  }

  /**
   * Get a specific notification by index (0-based)
   */
  private getNotificationByIndex(index: number = 0): Locator {
    return this.page.locator(this.notificationSelector).nth(index);
  }

  /**
   * Wait for a notification to appear, optionally matching specific text
   * @param text - Optional text to match in notification message or description
   * @param timeout - Maximum wait time in milliseconds (default: 5000)
   */
  async waitForNotification(
    text?: string,
    timeout: number = 5000,
  ): Promise<void> {
    if (text) {
      const notification = this.page
        .locator(this.notificationSelector)
        .filter({ hasText: text });
      await expect(notification).toBeVisible({ timeout });
    } else {
      await expect(this.getNotifications().first()).toBeVisible({ timeout });
    }
  }

  /**
   * Wait for all notifications to disappear
   * @param timeout - Maximum wait time in milliseconds (default: 10000)
   */
  async waitForNotificationDisappear(timeout: number = 10000): Promise<void> {
    await expect(this.getNotifications()).toHaveCount(0, { timeout });
  }

  /**
   * Close a specific notification by clicking its close button
   * @param index - Index of notification to close (default: 0, first notification)
   */
  async closeNotification(index: number = 0): Promise<void> {
    const notification = this.getNotificationByIndex(index);
    const isVisible = await notification.isVisible().catch(() => false);

    if (!isVisible) {
      // No notification to close, silently return
      return;
    }

    const closeButton = notification.locator('.ant-notification-notice-close');
    const closeButtonVisible = await closeButton.isVisible().catch(() => false);

    if (closeButtonVisible) {
      await closeButton.click();
      // Wait for the notification to disappear after closing
      await expect(notification).not.toBeVisible();
    }
  }

  /**
   * Close all visible notifications
   */
  async closeAllNotifications(): Promise<void> {
    const count = await this.getNotificationCount();

    // Close notifications from last to first to avoid index shifting issues
    for (let i = count - 1; i >= 0; i--) {
      await this.closeNotification(i);
    }
  }

  /**
   * Get notification message text (header)
   * @param index - Index of notification (default: 0)
   */
  async getNotificationMessage(index: number = 0): Promise<string> {
    const notification = this.getNotificationByIndex(index);
    const message = notification.locator('.ant-notification-notice-message');
    return await message.textContent().then((text) => text || '');
  }

  /**
   * Get notification description text (body)
   * @param index - Index of notification (default: 0)
   */
  async getNotificationDescription(index: number = 0): Promise<string> {
    const notification = this.getNotificationByIndex(index);
    const description = notification.locator(
      '.ant-notification-notice-description',
    );
    return await description.textContent().then((text) => text || '');
  }

  /**
   * Check if any notification is currently visible
   */
  async isNotificationVisible(): Promise<boolean> {
    const count = await this.getNotificationCount();
    return count > 0;
  }

  /**
   * Get the count of currently visible notifications
   */
  async getNotificationCount(): Promise<number> {
    return await this.getNotifications().count();
  }

  /**
   * Get a notification by type (success, error, warning, info)
   * @param type - Notification type
   */
  getNotificationByType(
    type: 'success' | 'error' | 'warning' | 'info',
  ): Locator {
    return this.page.locator(
      `${this.notificationSelector}.ant-notification-notice-${type}`,
    );
  }

  /**
   * Wait for a notification of specific type to appear
   * @param type - Notification type
   * @param timeout - Maximum wait time in milliseconds (default: 5000)
   */
  async waitForNotificationType(
    type: 'success' | 'error' | 'warning' | 'info',
    timeout: number = 5000,
  ): Promise<void> {
    await expect(this.getNotificationByType(type)).toBeVisible({ timeout });
  }

  /**
   * Verify that a notification with specific text exists
   * @param text - Text to search for in notification
   * @param timeout - Maximum wait time in milliseconds (default: 5000)
   */
  async verifyNotificationWithText(
    text: string,
    timeout: number = 5000,
  ): Promise<void> {
    const notification = this.page
      .locator(this.notificationSelector)
      .filter({ hasText: text });
    await expect(notification).toBeVisible({ timeout });
  }
}
