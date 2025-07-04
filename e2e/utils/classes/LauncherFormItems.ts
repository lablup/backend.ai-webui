import {
  InputLocator,
  InputNumberLocator,
  InputSelectorLocator,
} from '../test-util-antd';
import { Locator, Page } from '@playwright/test';

export class EnvironmentsVersion {
  private readonly environmentsSelector: InputSelectorLocator;
  private readonly versionSelector: InputSelectorLocator;
  private readonly imageNameInput: InputLocator;
  constructor(page: Page, parent?: Locator) {
    this.environmentsSelector = new InputSelectorLocator({
      page,
      parent,
      label: 'Environments',
    });
    this.versionSelector = new InputSelectorLocator({
      page,
      parent,
      testid: 'version-form-item',
    });
    this.imageNameInput = new InputLocator({
      parent: this.versionSelector.getInputSelector(),
      label: 'Image Name',
    });
  }

  getEnvironmentsInput(): Locator {
    return this.environmentsSelector.getInput();
  }

  async selectEnvironments(text: string): Promise<void> {
    await this.environmentsSelector.getInput().fill(text);
    await (await this.environmentsSelector.getOptionByText(text)).click();
  }

  getVersionInput(): Locator {
    return this.versionSelector.getInput();
  }

  async selectVersion(text: string): Promise<void> {
    await this.versionSelector.getInput().fill(text);
    await (await this.versionSelector.getOptionByText(text)).click();
  }

  getImageNameInput(): Locator {
    return this.imageNameInput.getInput();
  }
}

export class ResourceAllocation {
  private readonly resourceGroupFormItem: InputSelectorLocator;
  private readonly resourcePresetFormItem: InputSelectorLocator;
  private readonly resourcePresetCard: Locator;
  private readonly CPUInputNumber: InputNumberLocator;
  private readonly MEMInputNumber: InputNumberLocator;
  constructor(page: Page, parent?: Locator) {
    this.resourceGroupFormItem = new InputSelectorLocator({
      page,
      parent,
      label: 'Resource Group',
    });
    this.resourcePresetFormItem = new InputSelectorLocator({
      page,
      parent,
      label: 'Resource Presets',
    });
    this.resourcePresetCard = page.getByTestId('resource-preset-card');
    this.CPUInputNumber = new InputNumberLocator({
      parent: this.resourcePresetCard,
      label: 'CPU',
    });
    this.MEMInputNumber = new InputNumberLocator({
      parent: this.resourcePresetCard,
      label: 'Memory',
    });
  }

  getResourceGroupInput(): Locator {
    return this.resourceGroupFormItem.getInput();
  }

  async selectResourceGroup(text: string): Promise<void> {
    await this.resourceGroupFormItem.getInput().fill(text);
    await (await this.resourceGroupFormItem.getOptionByText(text)).click();
  }

  getResourcePresetInput(): Locator {
    return this.resourcePresetFormItem.getInput();
  }

  async selectResourcePreset(text: string): Promise<void> {
    await this.resourcePresetFormItem.getInput().fill(text);
    await (await this.resourcePresetFormItem.getOptionByText(text)).click();
  }

  // TODO: Add methods to allocate CPU and Memory
}
