import { expect, Locator, Page } from '@playwright/test';

export class FolderCreationModal {
  private readonly modal: Locator;
  private readonly page: Page;
  constructor(page: Page) {
    this.modal = page
      .getByRole('dialog')
      .filter({ hasText: 'Create a new storage folder' });

    this.page = page;
  }

  async modalToBeVisible(): Promise<void> {
    await expect(this.modal).toBeVisible();
  }

  async getFolderNameInput(): Promise<Locator> {
    const folderNameInput = (
      await this.getFormItemByLabel('Folder Name')
    ).locator('input');

    await expect(folderNameInput).toBeVisible();
    return folderNameInput;
  }

  async fillFolderName(folderName: string): Promise<void> {
    const folderNameInput = await this.getFolderNameInput();
    await folderNameInput.fill(folderName);
    await expect(folderNameInput).toHaveValue(folderName);
  }

  async getLocationSelector(): Promise<Locator> {
    const locationSelector = (
      await this.getFormItemByLabel('Location')
    ).locator(
      '.ant-form-item-control-input-content > .ant-select > .ant-select-selector',
    );
    await expect(locationSelector).toBeVisible();
    return locationSelector;
  }

  async getLocationSelectorInput(): Promise<Locator> {
    const locationSelectorInput = (await this.getLocationSelector()).locator(
      'input',
    );
    await expect(locationSelectorInput).toBeVisible();
    return locationSelectorInput;
  }

  async fillLocationSelector(text: string): Promise<void> {
    const locationSelectorInput = await this.getLocationSelectorInput();
    await locationSelectorInput.fill(text);
    await expect(locationSelectorInput).toHaveValue(text);
  }

  async getLocationOptionContainer(): Promise<Locator> {
    await (await this.getLocationSelector()).click();
    const locationOptionContainer = this.page.locator('.ant-select-dropdown');
    await expect(locationOptionContainer).toBeVisible();
    return locationOptionContainer;
  }

  async getLocationOptionByText(text: string): Promise<Locator> {
    const locationOptionContainer = await this.getLocationOptionContainer();
    const locationOption = locationOptionContainer
      .getByRole('option', {
        name: text,
      })
      .first();
    await expect(locationOption).toBeVisible();
    return locationOption;
  }

  async selectLocationOptionByText(text: string): Promise<void> {
    const locationOption = await this.getLocationOptionByText(text);
    await locationOption.click();
    await expect(locationOption).toHaveAttribute('aria-selected', 'true');
  }

  async getFormItemByLabel(label: string): Promise<Locator> {
    const RadioContainer = this.modal.locator(
      `.ant-form-item-row:has-text("${label}")`,
    );
    await expect(RadioContainer).toBeVisible();
    return RadioContainer;
  }

  async getUsageModeFormItem(): Promise<Locator> {
    return await this.getFormItemByLabel('Usage Mode');
  }

  async getTypeFormItem(): Promise<Locator> {
    return await this.getFormItemByLabel('Type');
  }

  async getPermissionFormItem(): Promise<Locator> {
    return await this.getFormItemByLabel('Permission');
  }

  async getProjectFormItem(): Promise<Locator> {
    return await this.getFormItemByLabel('Project');
  }

  async getCloneableFormItem(): Promise<Locator> {
    return await this.getFormItemByLabel('Cloneable');
  }

  async getCloneableSwitchButton(): Promise<Locator> {
    const cloneableToggleButton = (
      await this.getCloneableFormItem()
    ).getByLabel('Cloneable');
    await expect(cloneableToggleButton).toBeVisible();
    return cloneableToggleButton;
  }

  async getGeneralUsageModeRadio(): Promise<Locator> {
    const usageModeFormItem = await this.getUsageModeFormItem();
    return usageModeFormItem.getByLabel('General', {
      exact: true,
    });
  }

  async getModelUsageModeRadio(): Promise<Locator> {
    const usageModeFormItem = await this.getUsageModeFormItem();
    return usageModeFormItem.getByLabel('Models', {
      exact: true,
    });
  }

  async getAutoMountUsageModeRadio(): Promise<Locator> {
    const usageModeFormItem = await this.getUsageModeFormItem();
    return usageModeFormItem.getByLabel('Auto Mount', { exact: true });
  }

  async getUserTypeRadio(): Promise<Locator> {
    const typeFormItem = await this.getTypeFormItem();
    return typeFormItem.getByLabel('User', {
      exact: true,
    });
  }

  async getProjectTypeRadio(): Promise<Locator> {
    const typeFormItem = await this.getTypeFormItem();
    return typeFormItem.getByLabel('Project', {
      exact: true,
    });
  }

  async getReadWritePermissionRadio(): Promise<Locator> {
    const permissionFormItem = await this.getPermissionFormItem();
    return permissionFormItem.getByLabel('Read & Write', {
      exact: true,
    });
  }

  async getReadOnlyPermissionRadio(): Promise<Locator> {
    const permissionFormItem = await this.getPermissionFormItem();
    return permissionFormItem.getByLabel('Read only', {
      exact: true,
    });
  }

  async getCreateButton(): Promise<Locator> {
    const createButton = this.modal.getByTestId('create-folder-button');
    await expect(createButton).toBeVisible();
    return createButton;
  }

  async getCancelButton(): Promise<Locator> {
    const cancelButton = this.modal.getByRole('button', {
      name: 'Cancel',
      exact: true,
    });
    await expect(cancelButton).toBeVisible();
    return cancelButton;
  }

  async getResetButton(): Promise<Locator> {
    const resetButton = this.modal.getByRole('button', {
      name: 'Reset',
      exact: true,
    });
    await expect(resetButton).toBeVisible();
    return resetButton;
  }
}
