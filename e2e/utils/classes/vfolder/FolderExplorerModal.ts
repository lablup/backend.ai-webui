import { BaseModal } from '../base/BaseModal';
import { expect, Locator, Page } from '@playwright/test';

/**
 * Page Object Model for VFolder Explorer Modal
 * Handles file and folder operations within a vFolder
 */
export class FolderExplorerModal extends BaseModal {
  private readonly modal: Locator;

  constructor(page: Page) {
    super(page);
    this.modal = page.getByRole('dialog').first();
  }

  async waitForModalOpen(): Promise<void> {
    await this.waitForVisible(this.modal);
    await this.verifyFileExplorerLoaded();
  }

  /**
   * Alias for waitForModalOpen() for backward compatibility
   */
  async waitForOpen(): Promise<void> {
    await this.waitForModalOpen();
  }

  async waitForModalClose(): Promise<void> {
    await this.waitForHidden(this.modal);
  }

  /**
   * Verify folder name is displayed
   */
  async verifyFolderName(folderName: string): Promise<void> {
    await expect(
      this.modal.getByRole('heading').filter({ hasText: folderName }),
    ).toBeVisible();
  }

  /**
   * Verify folder permission
   */
  async verifyPermission(
    permission: 'Read & Write' | 'Read only',
  ): Promise<void> {
    await expect(this.modal.getByText(permission)).toBeVisible();
  }

  /**
   * Verify file explorer table is loaded
   */
  async verifyFileExplorerLoaded(): Promise<void> {
    await expect(
      this.modal.getByRole('columnheader', { name: 'Name' }),
    ).toBeVisible();
  }

  /**
   * Verify file explorer is not loaded (permission denied)
   */
  async verifyFileExplorerNotLoaded(): Promise<void> {
    const fileTableInModal = this.modal.getByRole('columnheader', {
      name: 'Name',
    });
    await expect(fileTableInModal).not.toBeVisible();
  }

  /**
   * Upload a file to the current folder
   */
  async uploadFile(filePath: string): Promise<void> {
    const uploadButton = await this.getUploadButton();
    await uploadButton.click();

    // Click "Upload Files" button in the popup
    const uploadFilesButton = this.page.getByRole('button', {
      name: 'file-add Upload Files',
    });

    // Wait for file chooser event when clicking the button
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      uploadFilesButton.click(),
    ]);
    await fileChooser.setFiles(filePath);

    // Wait for upload to complete - look for file list refresh or upload completion
    try {
      await this.page.waitForResponse(
        (response) =>
          (response.url().includes('/files?path=') ||
            response.url().includes('/upload')) &&
          response.status() === 200,
        { timeout: 15000 },
      );
    } catch {
      // If no specific response, wait for general timeout
      await this.page.waitForTimeout(3000);
    }

    // Additional wait for UI to update
    await this.page.waitForTimeout(1000);
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(filePaths: string[]): Promise<void> {
    const uploadButton = await this.getUploadButton();
    await uploadButton.click();

    // Click "Upload Files" button in the popup
    const uploadFilesButton = this.page.getByRole('button', {
      name: 'file-add Upload Files',
    });

    // Wait for file chooser event when clicking the button
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      uploadFilesButton.click(),
    ]);
    await fileChooser.setFiles(filePaths);

    // Wait for uploads to complete
    try {
      await this.page.waitForResponse(
        (response) =>
          (response.url().includes('/files?path=') ||
            response.url().includes('/upload')) &&
          response.status() === 200,
        { timeout: 15000 },
      );
    } catch {
      // If no specific response, wait for general timeout
      await this.page.waitForTimeout(3000);
    }

    // Additional wait for UI to update
    await this.page.waitForTimeout(1000);
  }

  /**
   * Create a new folder
   */
  async createFolder(folderName: string): Promise<void> {
    const createButton = await this.getCreateFolderButton();
    await createButton.click();

    // Fill folder name in dialog - use label "Folder Name"
    const folderNameInput = this.page.getByLabel('Folder Name');
    await this.fillInput(folderNameInput, folderName);

    // Confirm creation - scope to the "Create a new folder" dialog
    const createDialog = this.page.getByRole('dialog', {
      name: 'Create a new folder',
    });
    const confirmButton = createDialog.getByRole('button', {
      name: 'Create',
      exact: true,
    });
    await confirmButton.click();

    // Wait for folder to appear
    await this.page.waitForTimeout(500);
  }

  /**
   * Create nested folder structure
   */
  async createNestedFolder(folderPath: string): Promise<void> {
    const folders = folderPath.split('/').filter((f) => f);

    for (const folder of folders) {
      await this.createFolder(folder);
      // Navigate into the folder
      await this.openFolder(folder);
    }
  }

  /**
   * Open/navigate into a folder
   */
  async openFolder(folderName: string): Promise<void> {
    const folderRow = this.modal.getByRole('row').filter({
      hasText: folderName,
    });
    await folderRow.dblclick();
    await this.page.waitForTimeout(500);
  }

  /**
   * Rename a file or folder
   */
  async renameItem(oldName: string, newName: string): Promise<void> {
    // Find item row
    const itemRow = this.modal.getByRole('row').filter({
      hasText: oldName,
    });

    // Click the edit icon on the file name to trigger inline editing
    // The edit icon appears in the name cell (Ant Design Typography.Text editable)
    // The edit button has class "ant-typography-edit" and aria-label="Edit"
    const nameCell = itemRow.getByRole('cell').nth(1); // Name column is second cell

    // Hover over the name cell to make the edit button visible (it has opacity:0 by default)
    await nameCell.hover();

    // Find the edit button - it's a button element with class ant-typography-edit
    const editButton = nameCell.locator('button.ant-typography-edit');
    await expect(editButton).toBeVisible({ timeout: 5000 });
    await editButton.click();

    // Wait for the inline textbox to appear and fill the new name
    // The Form replaces the Typography component when editing
    const nameInput = this.modal.locator('input').filter({
      has: this.page.locator('[placeholder]'),
    });
    await nameInput.first().waitFor({ state: 'visible', timeout: 5000 });
    await nameInput.first().clear();
    await nameInput.first().fill(newName);

    // Press Enter to confirm (inline editing submits on Enter)
    await nameInput.first().press('Enter');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Delete a file or folder
   */
  async deleteItem(itemName: string): Promise<void> {
    // Find item row
    const itemRow = this.modal.getByRole('row').filter({
      hasText: itemName,
    });

    // Click the trash bin button directly (it's the second button in FileItemControls)
    const deleteButton = itemRow.getByLabel('trash bin');
    await deleteButton.click();

    // Type the item name in the confirmation textbox to enable the Delete button
    const confirmDialog = this.page.getByRole('dialog', {
      name: /delete confirmation/i,
    });
    const confirmTextbox = confirmDialog.locator('input[type="text"]');
    await confirmTextbox.fill(itemName);

    // Click the Delete button (now enabled after typing the name)
    const confirmButton = confirmDialog.getByRole('button', {
      name: /delete/i,
    });
    await confirmButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Download a file
   */
  async downloadFile(fileName: string): Promise<void> {
    // Find file row
    const fileRow = this.modal.getByRole('row').filter({
      hasText: fileName,
    });

    // Click download button
    const downloadButton = fileRow.locator('[icon="cloud-download"]');
    await downloadButton.click();

    // Wait for download to start
    await this.page.waitForEvent('download');
  }

  /**
   * Verify file or folder exists
   */
  async verifyFileExists(fileName: string): Promise<boolean> {
    const fileRow = this.modal.getByRole('row').filter({
      hasText: fileName,
    });
    try {
      await expect(fileRow).toBeVisible({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify file or folder does not exist
   */
  async verifyFileNotExists(fileName: string): Promise<void> {
    const fileRow = this.modal.getByRole('row').filter({
      hasText: fileName,
    });
    await expect(fileRow).not.toBeVisible();
  }

  /**
   * Get upload button
   */
  async getUploadButton(): Promise<Locator> {
    const uploadButton = this.modal.getByRole('button', {
      name: 'upload Upload',
    });
    await expect(uploadButton).toBeVisible();
    return uploadButton;
  }

  /**
   * Get create folder button
   */
  async getCreateFolderButton(): Promise<Locator> {
    const createButton = this.modal.getByRole('button', {
      name: 'folder-add Create',
    });
    await expect(createButton).toBeVisible();
    return createButton;
  }

  /**
   * Get file browser button
   */
  async getFileBrowserButton(): Promise<Locator> {
    const fileBrowserButton = this.modal.getByRole('button', {
      name: 'File Browser Execute filebrowser',
    });
    await expect(fileBrowserButton).toBeVisible();
    return fileBrowserButton;
  }

  /**
   * Verify folder details are displayed
   */
  async verifyFolderDetails(): Promise<void> {
    await expect(this.modal.getByText('Ownership')).toBeVisible();
    await expect(this.modal.getByText('Mount Permission')).toBeVisible();
    await expect(this.modal.getByText('Read & Write')).toBeVisible();
  }

  /**
   * Verify ownership section
   */
  async verifyOwnership(): Promise<void> {
    await expect(this.modal.getByText('Ownership')).toBeVisible();
  }

  /**
   * Verify mount permission section
   */
  async verifyMountPermission(): Promise<void> {
    await expect(this.modal.getByText('Mount Permission')).toBeVisible();
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessage(message: string): Promise<void> {
    await expect(this.modal.getByText(message)).toBeVisible();
  }

  /**
   * Check if modal is visible
   */
  async isModalVisible(): Promise<boolean> {
    return await this.modal.isVisible();
  }

  /**
   * Get close button
   */
  async getCloseButton(): Promise<Locator> {
    const closeButton = this.modal.getByRole('button', { name: 'Close' });
    await expect(closeButton).toBeVisible();
    return closeButton;
  }

  /**
   * Get list of visible files and folders
   */
  async getVisibleItems(): Promise<string[]> {
    // Target the file list table (first table in modal)
    // Skip the details table which comes second
    const fileTable = this.modal.getByRole('table').first();

    const rows = fileTable.getByRole('row');
    const count = await rows.count();

    const items: string[] = [];
    for (let i = 1; i < count; i++) {
      // Skip header row (index 0)
      const row = rows.nth(i);
      // Get the second cell (index 1) which contains the name
      // First cell (index 0) is the checkbox
      const nameCell = row.getByRole('cell').nth(1);
      const text = await nameCell.textContent();
      if (text) {
        // Extract just the file/folder name, removing any extra content
        // The name cell contains "folder {name} Edit" or just "{name} Edit"
        const cleanText = text
          .replace(/^folder\s+/, '')
          .replace(/\s+Edit$/, '')
          .trim();

        // If still contains "No data", skip it
        if (cleanText && cleanText !== 'No data') {
          items.push(cleanText);
        }
      }
    }

    return items;
  }

  /**
   * Navigate to parent folder
   */
  async navigateToParent(): Promise<void> {
    const parentButton = this.modal.getByRole('button', {
      name: /parent|up|back/i,
    });
    await parentButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Select multiple items
   */
  async selectItems(itemNames: string[]): Promise<void> {
    for (const itemName of itemNames) {
      const itemRow = this.modal.getByRole('row').filter({
        hasText: itemName,
      });
      const checkbox = itemRow.locator('input[type="checkbox"]');
      await checkbox.check();
    }
  }

  /**
   * Delete multiple items
   */
  async deleteMultipleItems(itemNames: string[]): Promise<void> {
    await this.selectItems(itemNames);

    // Click bulk delete button
    const deleteButton = this.modal.getByRole('button', {
      name: /delete/i,
    });
    await deleteButton.click();

    // Confirm deletion
    const confirmButton = this.page.getByRole('button', {
      name: /ok|delete|confirm/i,
    });
    await confirmButton.click();
    await this.page.waitForTimeout(500);
  }
}
