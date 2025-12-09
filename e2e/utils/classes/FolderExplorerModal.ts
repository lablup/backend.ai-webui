import { expect, Locator, Page } from '@playwright/test';

export class FolderExplorerModal {
  private readonly modal: Locator;
  private readonly page: Page;

  constructor(page: Page) {
    this.modal = page.locator('.ant-modal').first();
    this.page = page;
  }

  async waitForOpen(): Promise<void> {
    await expect(this.modal).toBeVisible();
  }

  async clickCloseButton(): Promise<void> {
    const closeButton = await this.getCloseButton();
    await closeButton.click();
  }

  async close(): Promise<void> {
    await this.clickCloseButton();
    await expect(this.modal).not.toBeVisible({ timeout: 2000 });
  }

  async verifyFolderName(folderName: string): Promise<void> {
    await expect(
      this.modal.getByRole('heading').filter({ hasText: folderName }),
    ).toBeVisible();
  }

  async verifyPermission(
    permission: 'Read & Write' | 'Read only',
  ): Promise<void> {
    await expect(this.modal.getByText(permission)).toBeVisible();
  }

  async verifyFileExplorerLoaded(): Promise<void> {
    await expect(
      this.modal.getByRole('columnheader', { name: 'Name' }),
    ).toBeVisible();
  }

  async verifyFileExplorerNotLoaded(): Promise<void> {
    const fileTableInModal = this.modal.getByRole('columnheader', {
      name: 'Name',
    });
    await expect(fileTableInModal).not.toBeVisible();
  }

  async getUploadButton(): Promise<Locator> {
    const uploadButton = this.modal.getByRole('button', {
      name: 'upload Upload',
    });
    await expect(uploadButton).toBeVisible();
    return uploadButton;
  }

  async getCreateFolderButton(): Promise<Locator> {
    const createButton = this.modal.getByRole('button', {
      name: 'folder-add Create',
    });
    await expect(createButton).toBeVisible();
    return createButton;
  }

  async getFileBrowserButton(): Promise<Locator> {
    const fileBrowserButton = this.modal.getByRole('button', {
      name: 'File Browser Execute filebrowser',
    });
    await expect(fileBrowserButton).toBeVisible();
    return fileBrowserButton;
  }

  async verifyFolderDetails(): Promise<void> {
    await expect(this.modal.getByText('Ownership')).toBeVisible();
    await expect(this.modal.getByText('Mount Permission')).toBeVisible();
    await expect(this.modal.getByText('Read & Write')).toBeVisible();
  }

  async verifyOwnership(): Promise<void> {
    await expect(this.modal.getByText('Ownership')).toBeVisible();
  }

  async verifyMountPermission(): Promise<void> {
    await expect(this.modal.getByText('Mount Permission')).toBeVisible();
  }

  async verifyErrorMessage(message: string): Promise<void> {
    await expect(this.modal.getByText(message)).toBeVisible();
  }

  async isModalVisible(): Promise<boolean> {
    return await this.modal.isVisible();
  }

  async getCloseButton(): Promise<Locator> {
    const closeButton = this.modal.getByRole('button', { name: 'Close' });
    await expect(closeButton).toBeVisible();
    return closeButton;
  }
}
