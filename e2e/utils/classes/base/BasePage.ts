import { Locator, Page } from '@playwright/test';

/**
 * Base class for all Page Object Model classes
 * Provides common functionality for page interactions
 */
export abstract class BasePage {
  constructor(protected page: Page) {}

  /**
   * Wait for page to fully load
   * Override in subclasses for page-specific load conditions
   */
  abstract waitForPageLoad(): Promise<void>;

  /**
   * Verify that the page is loaded correctly
   * Override in subclasses for page-specific verification
   */
  abstract verifyPageLoaded(): Promise<void>;

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
   * Click a button/element with visibility wait
   */
  protected async clickButton(locator: Locator): Promise<void> {
    await this.waitForVisible(locator);
    await locator.click();
  }

  /**
   * Fill input field with visibility wait
   */
  protected async fillInput(locator: Locator, value: string): Promise<void> {
    await this.waitForVisible(locator);
    await locator.clear();
    await locator.fill(value);
  }

  /**
   * Select option from dropdown
   */
  protected async selectOption(locator: Locator, value: string): Promise<void> {
    await this.waitForVisible(locator);
    await locator.selectOption(value);
  }

  /**
   * Get text content from element
   */
  protected async getTextContent(locator: Locator): Promise<string> {
    await this.waitForVisible(locator);
    const text = await locator.textContent();
    return text?.trim() || '';
  }

  /**
   * Check if element is visible
   */
  protected async isVisible(locator: Locator): Promise<boolean> {
    try {
      await this.waitForVisible(locator, 1000);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for network to be idle
   */
  protected async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to a specific path
   */
  protected async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitForNetworkIdle();
  }
}
