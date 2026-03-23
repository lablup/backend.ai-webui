import { expect, Locator, Page } from '@playwright/test';

/**
 * Page Object class for the Bulk Create Users Modal
 * Used in the credential page for bulk user creation operations
 */
export class BulkCreateUserModal {
  private readonly modal: Locator;
  private readonly page: Page;

  constructor(page: Page) {
    this.modal = page.getByRole('dialog', { name: 'Bulk Create Users' });
    this.page = page;
  }

  /**
   * Get the modal locator
   */
  getModal(): Locator {
    return this.modal;
  }

  /**
   * Wait for the modal to be visible
   */
  async waitForVisible(timeout = 10000): Promise<void> {
    await expect(this.modal).toBeVisible({ timeout });
  }

  /**
   * Wait for the modal to be hidden
   */
  async waitForHidden(timeout = 10000): Promise<void> {
    await expect(this.modal).toBeHidden({ timeout });
  }

  // =====================
  // Form Field Locators
  // =====================

  /**
   * Get the Email Prefix input field
   */
  getEmailPrefixInput(): Locator {
    return this.modal.getByLabel('Email prefix (before @)');
  }

  /**
   * Get the Email Suffix input field
   */
  getEmailSuffixInput(): Locator {
    return this.modal.getByLabel('Email suffix (after @)');
  }

  /**
   * Get the Number of Users spinbutton
   */
  getUserCountInput(): Locator {
    return this.modal.getByRole('spinbutton', { name: 'Number of users' });
  }

  /**
   * Get the Password input field
   * Uses getByLabel with exact match to avoid matching "Confirm Password" field
   */
  getPasswordInput(): Locator {
    return this.modal.getByLabel('Password', { exact: true });
  }

  /**
   * Get the Confirm Password input field
   */
  getConfirmPasswordInput(): Locator {
    return this.modal.getByLabel('Confirm Password');
  }

  /**
   * Get the OK button
   */
  getOkButton(): Locator {
    return this.modal.getByRole('button', { name: 'OK' });
  }

  /**
   * Get the Cancel button
   */
  getCancelButton(): Locator {
    return this.modal.getByRole('button', { name: 'Cancel' });
  }

  /**
   * Get the Close (X) button
   */
  getCloseButton(): Locator {
    return this.modal.getByRole('button', { name: 'Close' });
  }

  /**
   * Get the Decrease Value button on the user count spinner
   */
  getDecreaseValueButton(): Locator {
    return this.modal.getByRole('button', { name: 'Decrease Value' });
  }

  // =====================
  // Form Field Actions
  // =====================

  /**
   * Fill the email prefix field
   */
  async fillEmailPrefix(prefix: string): Promise<void> {
    await this.getEmailPrefixInput().fill(prefix);
  }

  /**
   * Fill the email suffix field
   */
  async fillEmailSuffix(suffix: string): Promise<void> {
    await this.getEmailSuffixInput().fill(suffix);
  }

  /**
   * Fill the number of users field
   */
  async fillUserCount(count: number): Promise<void> {
    await this.getUserCountInput().fill(String(count));
  }

  /**
   * Fill the password field
   */
  async fillPassword(password: string): Promise<void> {
    await this.getPasswordInput().fill(password);
  }

  /**
   * Fill the confirm password field
   */
  async fillConfirmPassword(password: string): Promise<void> {
    await this.getConfirmPasswordInput().fill(password);
  }

  // =====================
  // Button Actions
  // =====================

  /**
   * Click the OK button to submit the form
   */
  async submit(): Promise<void> {
    await this.getOkButton().click();
  }

  /**
   * Click the Cancel button to close without submitting
   */
  async cancel(): Promise<void> {
    await this.getCancelButton().click();
  }

  /**
   * Click the Close (X) button to close the modal
   */
  async close(): Promise<void> {
    await this.getCloseButton().click();
  }

  // =====================
  // Convenience Methods
  // =====================

  /**
   * Fill all required fields for bulk user creation
   */
  async fillRequiredFields(
    prefix: string,
    suffix: string,
    count: number,
    password: string,
  ): Promise<void> {
    await this.fillEmailPrefix(prefix);
    await this.fillEmailSuffix(suffix);
    await this.fillUserCount(count);
    await this.fillPassword(password);
    await this.fillConfirmPassword(password);
  }
}
