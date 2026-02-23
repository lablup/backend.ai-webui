import { expect, Locator, Page } from '@playwright/test';

/**
 * Page Object class for the User Setting Modal (Create/Edit User)
 * Used in the credential page for user management operations
 */
export class UserSettingModal {
  private readonly modal: Locator;
  private readonly page: Page;
  private readonly mode: 'create' | 'edit';

  constructor(page: Page, mode: 'create' | 'edit' = 'create') {
    this.mode = mode;
    this.modal =
      mode === 'create'
        ? page.getByRole('dialog', { name: 'Create User' })
        : page.getByRole('dialog', { name: 'Modify User Detail' });
    this.page = page;
  }

  /**
   * Create a UserSettingModal for creating a new user
   */
  static forCreate(page: Page): UserSettingModal {
    return new UserSettingModal(page, 'create');
  }

  /**
   * Create a UserSettingModal for editing an existing user
   */
  static forEdit(page: Page): UserSettingModal {
    return new UserSettingModal(page, 'edit');
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
  // Form Field Locators
  // =====================

  /**
   * Get the Email input field
   */
  getEmailInput(): Locator {
    return this.modal.getByLabel('Email');
  }

  /**
   * Get the User Name input field
   */
  getUserNameInput(): Locator {
    return this.modal.getByLabel('User Name');
  }

  /**
   * Get the Password input field (for create mode)
   */
  getPasswordInput(): Locator {
    return this.modal.getByLabel('Password', { exact: true });
  }

  /**
   * Get the Confirm Password input field (for create mode)
   */
  getConfirmPasswordInput(): Locator {
    return this.modal.getByLabel('Confirm Password');
  }

  /**
   * Get the New Password input field (for edit mode)
   */
  getNewPasswordInput(): Locator {
    return this.modal.getByLabel(/^New Password/);
  }

  /**
   * Get the Confirm New Password input field (for edit mode)
   */
  getConfirmNewPasswordInput(): Locator {
    return this.modal.getByLabel(/^New password \(again\)/);
  }

  /**
   * Get the Full Name input field
   */
  getFullNameInput(): Locator {
    return this.modal.getByLabel('Full Name');
  }

  /**
   * Get the Description textarea
   */
  getDescriptionInput(): Locator {
    return this.modal.getByLabel('Description');
  }

  // =====================
  // Form Field Actions
  // =====================

  /**
   * Fill the email field
   */
  async fillEmail(email: string): Promise<void> {
    const input = this.getEmailInput();
    await input.fill(email);
    await expect(input).toHaveValue(email);
  }

  /**
   * Fill the user name field
   */
  async fillUserName(userName: string): Promise<void> {
    const input = this.getUserNameInput();
    await input.fill(userName);
    await expect(input).toHaveValue(userName);
  }

  /**
   * Fill the password field (for create mode)
   */
  async fillPassword(password: string): Promise<void> {
    const input = this.getPasswordInput();
    await input.fill(password);
  }

  /**
   * Fill the confirm password field (for create mode)
   */
  async fillConfirmPassword(password: string): Promise<void> {
    const input = this.getConfirmPasswordInput();
    await input.fill(password);
  }

  /**
   * Fill both password and confirm password fields (for create mode)
   */
  async fillPasswords(password: string): Promise<void> {
    await this.fillPassword(password);
    await this.fillConfirmPassword(password);
  }

  /**
   * Fill the new password field (for edit mode)
   */
  async fillNewPassword(password: string): Promise<void> {
    const input = this.getNewPasswordInput();
    await input.fill(password);
  }

  /**
   * Fill the confirm new password field (for edit mode)
   */
  async fillConfirmNewPassword(password: string): Promise<void> {
    const input = this.getConfirmNewPasswordInput();
    await input.fill(password);
  }

  /**
   * Fill both new password fields (for edit mode)
   */
  async fillNewPasswords(password: string): Promise<void> {
    await this.fillNewPassword(password);
    await this.fillConfirmNewPassword(password);
  }

  /**
   * Fill the full name field
   */
  async fillFullName(fullName: string): Promise<void> {
    const input = this.getFullNameInput();
    await input.fill(fullName);
    await expect(input).toHaveValue(fullName);
  }

  /**
   * Fill the description field
   */
  async fillDescription(description: string): Promise<void> {
    const input = this.getDescriptionInput();
    await input.fill(description);
    await expect(input).toHaveValue(description);
  }

  // =====================
  // Button Actions
  // =====================

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
   * Click the OK button to submit the form
   */
  async clickOk(): Promise<void> {
    await this.getOkButton().click();
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
   * Fill all required fields for creating a new user
   */
  async fillRequiredFields(
    email: string,
    userName: string,
    password: string,
  ): Promise<void> {
    await this.fillEmail(email);
    await this.fillUserName(userName);
    await this.fillPasswords(password);
  }

  /**
   * Create a new user with required fields and submit
   */
  async createUser(
    email: string,
    userName: string,
    password: string,
  ): Promise<void> {
    await this.waitForVisible();
    await this.fillRequiredFields(email, userName, password);
    await this.clickOk();
  }

  /**
   * Update user's password (for edit mode)
   */
  async updatePassword(newPassword: string): Promise<void> {
    await this.waitForVisible();
    await this.fillNewPasswords(newPassword);
    await this.clickOk();
  }

  /**
   * Update user's name (for edit mode)
   */
  async updateUserName(userName: string): Promise<void> {
    await this.waitForVisible();
    await this.fillUserName(userName);
    await this.clickOk();
  }
}

/**
 * Page Object class for the Key Pair Modal that appears after user creation
 */
export class KeyPairModal {
  private readonly modal: Locator;
  private readonly page: Page;

  constructor(page: Page) {
    this.modal = page.getByRole('dialog', { name: /Key pair for new users/i });
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

  /**
   * Get the Close button
   */
  getCloseButton(): Locator {
    return this.modal
      .getByRole('button', { name: 'Close', exact: true })
      .last();
  }

  /**
   * Close the modal by clicking the Close button
   */
  async close(): Promise<void> {
    await this.getCloseButton().click();
    await this.waitForHidden();
  }
}

/**
 * Page Object class for the User Info Modal (View User Details)
 */
export class UserInfoModal {
  private readonly modal: Locator;
  private readonly page: Page;

  constructor(page: Page) {
    this.modal = page.getByRole('dialog', { name: 'User Detail' });
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

  /**
   * Verify that the user name is displayed
   */
  async verifyUserName(userName: string): Promise<void> {
    await expect(this.modal.getByText(userName)).toBeVisible();
  }

  /**
   * Verify that the email is displayed
   */
  async verifyEmail(email: string): Promise<void> {
    await expect(this.modal.getByText(email)).toBeVisible();
  }

  /**
   * Get the Close button
   */
  getCloseButton(): Locator {
    return this.modal.getByRole('button', { name: 'Close' });
  }

  /**
   * Close the modal by clicking Close
   */
  async close(): Promise<void> {
    await this.getCloseButton().click();
    await this.waitForHidden();
  }
}
