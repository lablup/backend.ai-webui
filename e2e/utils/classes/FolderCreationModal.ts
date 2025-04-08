import { expect, Locator, Page } from '@playwright/test';

export class FolderCreationModal {
  private readonly modal: Locator;
  constructor(page: Page) {
    this.modal = page.locator('#create-folder-modal');
  }

  async getFolderNameInput(): Promise<Locator> {
    const folderNameInput = this.modal
      .locator('ant-form-item-row:has-text("Folder name")')
      .locator('input');
    await expect(folderNameInput).toBeVisible();
    return folderNameInput;
  }

  async fillFolderName(folderName: string): Promise<void> {
    const folderNameInput = await this.getFolderNameInput();
    await folderNameInput.fill(folderName);
    await expect(folderNameInput).toHaveValue(folderName);
  }

  async getLocationSelector(): Promise<Locator> {
    const locationSelector = this.modal
      .locator('ant-form-item-row:has-text("Location")')
      .locator(
        '.ant-form-item-control-input-content > .ant-select > .ant-select-selector',
      );
    await expect(locationSelector).toBeVisible();
    return locationSelector;
  }

  async getRadioByLabel(label: string): Promise<Locator> {
    const RadioContainer = this.modal.locator(
      `ant-form-item-row:has-text("${label}")`,
    );
    await expect(RadioContainer).toBeVisible();
    return RadioContainer;
  }
}
