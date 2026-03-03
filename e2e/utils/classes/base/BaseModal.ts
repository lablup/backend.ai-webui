import { Locator, Page } from '@playwright/test';

/**
 * Base class for all Modal Object Model classes
 * Provides common functionality for modal interactions
 */
export abstract class BaseModal {
  constructor(protected page: Page) {}

  /**
   * Wait for modal to open
   * Override in subclasses for modal-specific selectors
   */
  abstract waitForModalOpen(): Promise<void>;

  /**
   * Wait for modal to close
   * Override in subclasses for modal-specific selectors
   */
  abstract waitForModalClose(): Promise<void>;

  /**
   * Wait for a locator to be visible
   */
  protected async waitForVisible(
    locator: Locator,
    timeout = 5000,
  ): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for a locator to be hidden
   */
  protected async waitForHidden(
    locator: Locator,
    timeout = 5000,
  ): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Click OK/Confirm/Submit button
   * Common implementation - can be overridden
   */
  async clickOk(): Promise<void> {
    const okButton = this.page.getByRole('button', {
      name: /ok|confirm|submit|create|save/i,
    });
    await okButton.click();
    await this.waitForModalClose();
  }

  /**
   * Click Cancel button
   * Common implementation - can be overridden
   */
  async clickCancel(): Promise<void> {
    const cancelButton = this.page.getByRole('button', {
      name: /cancel/i,
    });
    await cancelButton.click();
    await this.waitForModalClose();
  }

  /**
   * Fill input field within modal
   */
  protected async fillInput(locator: Locator, value: string): Promise<void> {
    await this.waitForVisible(locator);
    await locator.clear();
    await locator.fill(value);
  }

  /**
   * Select option from dropdown within modal
   */
  protected async selectOption(locator: Locator, value: string): Promise<void> {
    await this.waitForVisible(locator);
    await locator.selectOption(value);
  }

  /**
   * Check if modal is open
   */
  async isOpen(): Promise<boolean> {
    try {
      await this.waitForModalOpen();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Close modal using X button or ESC key
   */
  async close(): Promise<void> {
    // Try X button first
    const closeButton = this.page.getByRole('button', {
      name: /close/i,
    });

    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Fallback to ESC key
      await this.page.keyboard.press('Escape');
    }

    await this.waitForModalClose();
  }
}
