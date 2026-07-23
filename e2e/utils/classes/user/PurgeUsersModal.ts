import { expect, Locator, Page } from '@playwright/test';

/**
 * Page Object class for the Purge Users Modal (Permanently Delete Users)
 * Used in the credential page for permanently deleting inactive users
 */
export class PurgeUsersModal {
  private readonly modal: Locator;
  private readonly page: Page;

  constructor(page: Page) {
    this.modal = page.getByRole('dialog', {
      name: /Permanently Delete Users/i,
    });
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
  async waitForVisible(): Promise<void> {
    await expect(this.modal).toBeVisible();
  }

  /**
   * Wait for the modal to be hidden
   */
  async waitForHidden(timeout = 10000): Promise<void> {
    await expect(this.modal).toBeHidden({ timeout });
  }

  // =====================
  // Content Verification
  // =====================

  /**
   * Verify that a user email is displayed in the modal
   */
  async verifyUserEmailDisplayed(email: string): Promise<void> {
    await expect(this.modal.getByText(email)).toBeVisible();
  }

  /**
   * Verify the "Delete Shared Virtual Folders" checkbox is visible
   */
  async verifyDeleteVFoldersCheckboxVisible(): Promise<void> {
    await expect(
      this.modal.getByText('Delete Shared Virtual Folders'),
    ).toBeVisible();
  }

  // =====================
  // Form Field Locators
  // =====================

  /**
   * Get the confirmation input field
   */
  getConfirmationInput(): Locator {
    return this.modal.getByRole('textbox');
  }

  /**
   * Get the "Delete Shared Virtual Folders" checkbox
   */
  getDeleteVFoldersCheckbox(): Locator {
    return this.modal.getByRole('checkbox');
  }

  // =====================
  // Form Field Actions
  // =====================

  /**
   * Type the confirmation text "Permanently Delete"
   */
  async typeConfirmationText(): Promise<void> {
    await this.getConfirmationInput().fill('Permanently Delete');
  }

  /**
   * Check the "Delete Shared Virtual Folders" checkbox
   */
  async checkDeleteVFolders(): Promise<void> {
    const checkbox = this.getDeleteVFoldersCheckbox();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  }

  /**
   * Uncheck the "Delete Shared Virtual Folders" checkbox
   */
  async uncheckDeleteVFolders(): Promise<void> {
    const checkbox = this.getDeleteVFoldersCheckbox();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  }

  // =====================
  // Button Actions
  // =====================

  /**
   * Get the Delete button
   */
  getDeleteButton(): Locator {
    return this.modal.getByRole('button', { name: 'Delete' });
  }

  /**
   * Get the Cancel button
   */
  getCancelButton(): Locator {
    return this.modal.getByRole('button', { name: 'Cancel' });
  }

  /**
   * Click the Delete button to confirm deletion
   */
  async clickDelete(): Promise<void> {
    await this.getDeleteButton().click();
  }

  /**
   * Click the Cancel button to close the modal
   */
  async clickCancel(): Promise<void> {
    await this.getCancelButton().click();
  }

  // =====================
  // Convenience Methods
  // =====================

  /**
   * Confirm the deletion by typing the confirmation text and clicking Delete
   */
  async confirmDeletion(): Promise<void> {
    await this.typeConfirmationText();
    await this.clickDelete();
  }

  /**
   * Confirm deletion with virtual folder deletion option
   */
  async confirmDeletionWithVFolders(): Promise<void> {
    await this.checkDeleteVFolders();
    await this.typeConfirmationText();
    await this.clickDelete();
  }
}
