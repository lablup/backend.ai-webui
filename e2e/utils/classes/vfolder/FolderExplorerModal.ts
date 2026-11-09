import { expect, Locator, Page } from '@playwright/test';

export class FolderExplorerModal {
  private readonly modal: Locator;
  private readonly page: Page;

  constructor(page: Page) {
    this.modal = page.getByRole('dialog').first();
    this.page = page;
  }

  async waitForOpen(): Promise<void> {
    await expect(this.modal).toBeVisible({ timeout: 10000 });
  }

  async clickCloseButton(): Promise<void> {
    const closeButton = await this.getCloseButton();
    await closeButton.click();
  }

  async close(): Promise<void> {
    await this.clickCloseButton();
    await expect(this.modal).not.toBeVisible({ timeout: 5000 });
  }

  async verifyFolderName(folderName: string): Promise<void> {
    await expect(
      this.modal.getByRole('heading').filter({ hasText: folderName }),
    ).toBeVisible();
  }

  async verifyFileExplorerLoaded(): Promise<void> {
    await expect(
      this.modal.getByRole('columnheader', { name: 'Name' }),
    ).toBeVisible({ timeout: 10000 });
  }

  async verifyFileExplorerNotLoaded(): Promise<void> {
    const fileTableInModal = this.modal.getByRole('columnheader', {
      name: 'Name',
    });
    await expect(fileTableInModal).not.toBeVisible();
  }

  async getUploadButton(): Promise<Locator> {
    // Astryx DropdownMenu trigger: accessible name is the visible label only
    // (no antd icon-name prefix).
    const uploadButton = this.modal.getByRole('button', {
      name: 'Upload',
      exact: true,
    });
    await expect(uploadButton).toBeVisible({ timeout: 10000 });
    // Give the modal toolbar a moment to settle so click() doesn't fail with
    // "element is not stable" under heavy parallel load.
    await this.page.waitForTimeout(300);
    return uploadButton;
  }

  async getCreateFolderButton(): Promise<Locator> {
    // lucide icon + aria-label: no antd icon-name prefix in the name.
    const createButton = this.modal.getByRole('button', {
      name: 'Create Folder',
      exact: true,
    });
    await expect(createButton).toBeVisible();
    await this.page.waitForTimeout(300);
    return createButton;
  }

  async getCreateFileButton(): Promise<Locator> {
    const createFileButton = this.modal.getByRole('button', {
      name: 'Create File',
      exact: true,
    });
    await expect(createFileButton).toBeVisible();
    await this.page.waitForTimeout(300);
    return createFileButton;
  }

  async getFileBrowserButton(): Promise<Locator> {
    const fileBrowserButton = this.modal.getByRole('button', {
      name: 'File Browser Execute filebrowser',
    });
    await expect(fileBrowserButton).toBeVisible();
    return fileBrowserButton;
  }

  private definitionOf(term: string): Locator {
    return this.modal
      .getByRole('term')
      .filter({ hasText: new RegExp(`^${term}$`) })
      .locator('xpath=following-sibling::*[1]');
  }

  // Mirrors VFolderNodeDescriptionV2: the owner always mounts read & write, so
  // the row only shows for folders the viewer does not own, project ones included.
  async verifyFolderDetails(
    viewerEmail: string,
    expectedMountPermission: 'Read only' | 'Read & Write',
  ): Promise<void> {
    const ownership = this.definitionOf('Ownership');
    await expect(ownership).toHaveText(/^(User|Project)$/);
    const isProjectFolder =
      (await ownership.textContent())?.trim() === 'Project';
    const ownerEmail = isProjectFolder
      ? null
      : (await this.definitionOf('User').textContent())?.trim().toLowerCase();

    const mountPermission = this.definitionOf('Mount Permission');
    if (ownerEmail === viewerEmail.toLowerCase()) {
      await expect(mountPermission).toHaveCount(0);
    } else {
      await expect(mountPermission).toHaveText(expectedMountPermission);
    }
  }

  async verifyOwnership(): Promise<void> {
    await expect(this.modal.getByText('Ownership')).toBeVisible();
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

  async verifyFileVisible(fileName: string): Promise<void> {
    // Two cells carry the file name per row (the selection checkbox cell,
    // named "Select <file>", and the name cell, named "<file> Rename"), so a
    // bare hasText filter strict-mode-violates. Anchor on the name cell via
    // an accessible-name prefix match.
    const escaped = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(
      this.modal.getByRole('cell', { name: new RegExp(`^${escaped}`) }),
    ).toBeVisible({
      timeout: 30000,
    });
  }
}
