import { Locator, Page } from '@playwright/test';

type LabelOrTestId =
  | { label: string; testid?: never }
  | { label?: never; testid: string };

type InputLocatorProps = {
  parent: Page | Locator;
} & LabelOrTestId;
export class InputLocator {
  private readonly input: Locator;
  constructor({ parent, testid, label }: InputLocatorProps) {
    this.input = (
      testid
        ? parent.getByTestId(testid)
        : parent.locator(`.ant-form-item:has-text("${label}")`)
    )
      .locator('.ant-form-item-control-input-content')
      .locator('input');
  }

  getInput(): Locator {
    return this.input;
  }
}

type InputNumberLocatorProps = {
  parent: Locator | Page;
} & LabelOrTestId;
export class InputNumberLocator {
  private readonly inputNumber: Locator;
  constructor({ parent, label, testid }: InputNumberLocatorProps) {
    this.inputNumber = testid
      ? parent.getByTestId(testid)
      : parent
          .locator(`.ant-form-item:has-text("${label}")`)
          .locator('.ant-input-number-wrapper');
  }
  getInputNumber(): Locator {
    return this.inputNumber;
  }
  getInput(): Locator {
    return this.inputNumber.locator('.ant-input-number').locator('input');
  }
  getAddonBefore(): Locator {
    return this.inputNumber.locator('.ant-input-number-group-addon').nth(0);
  }
  getAddonAfter(): Locator {
    return this.inputNumber.locator('.ant-input-number-group-addon').nth(1);
  }
}

type InputSelectorLocatorProps = {
  page: Page;
  parent?: Locator;
} & LabelOrTestId;
export class InputSelectorLocator {
  private readonly page: Page;
  private readonly inputSelector: Locator;
  constructor({ page, parent, label, testid }: InputSelectorLocatorProps) {
    this.page = page;
    this.inputSelector = (
      testid
        ? (parent ?? page).getByTestId(testid)
        : (parent ?? page).locator(`.ant-form-item:has-text("${label}")`)
    ).locator(
      '.ant-form-item-control-input-content > .ant-select > .ant-select-selector',
    );
  }

  getInputSelector(): Locator {
    return this.inputSelector;
  }
  getInput(): Locator {
    return this.inputSelector.locator('input');
  }
  async getOptionContainer(): Promise<Locator> {
    await this.inputSelector.click();
    return this.page.locator(
      '.ant-select-dropdown:not(.ant-select-dropdown-hidden)',
    );
  }
  async getOptionByText(text: string): Promise<Locator> {
    return (await this.getOptionContainer())
      .getByRole('option', {
        name: text,
      })
      .first();
  }
}

export class EnvironmentsVersionFormItem {
  private readonly environmentsSelector: InputSelectorLocator;
  private readonly versionSelector: InputSelectorLocator;
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
  }

  getEnvironmentsSelector(): Locator {
    return this.environmentsSelector.getInputSelector();
  }

  getVersionSelector(): Locator {
    return this.versionSelector.getInputSelector();
  }

  getEnvironmentsSelectorInput(): Locator {
    return this.environmentsSelector.getInput();
  }

  getVersionSelectorInput(): Locator {
    return this.versionSelector.getInput();
  }

  async getEnvironmentsOptionContainer(): Promise<Locator> {
    return this.environmentsSelector.getOptionContainer();
  }

  async getVersionOptionContainer(): Promise<Locator> {
    return this.versionSelector.getOptionContainer();
  }

  async getEnvironmentsOptionByText(text: string): Promise<Locator> {
    return this.environmentsSelector.getOptionByText(text);
  }

  async getVersionOptionByText(text: string): Promise<Locator> {
    return this.versionSelector.getOptionByText(text);
  }
}

export class ImageNameFormItem {
  private readonly imageNameInput: InputLocator;
  constructor(parent: Locator | Page) {
    this.imageNameInput = new InputLocator({
      parent,
      label: 'Image Name',
    });
  }
  getImageNameInput(): Locator {
    return this.imageNameInput.getInput();
  }
}

export class ResourceGroupFormItem {
  private readonly resourceGroupInputSelector: InputSelectorLocator;
  constructor(page: Page, parent?: Locator) {
    this.resourceGroupInputSelector = new InputSelectorLocator({
      page,
      parent,
      label: 'Resource Group',
    });
  }
  getResourceGroupInputSelector(): Locator {
    return this.resourceGroupInputSelector.getInputSelector();
  }
  getResourceGroupInput(): Locator {
    return this.resourceGroupInputSelector.getInput();
  }
  async getResourceGroupOptionContainer(): Promise<Locator> {
    return this.resourceGroupInputSelector.getOptionContainer();
  }
  async getResourceGroupOptionByText(text: string): Promise<Locator> {
    return this.resourceGroupInputSelector.getOptionByText(text);
  }
}

export class ResourcePresetFormItem {
  private readonly page: Page;
  private readonly resourcePresetInputSelector: InputSelectorLocator;
  private readonly resourcePresetFormItemCard: Locator;
  private readonly CPUInputNumber: InputNumberLocator;
  constructor(page: Page, parent?: Locator) {
    this.page = page;
    this.resourcePresetInputSelector = new InputSelectorLocator({
      page,
      parent,
      label: 'Resource Preset',
    });
    this.resourcePresetFormItemCard = page.getByTestId('resource-preset-card');
    this.CPUInputNumber = new InputNumberLocator({
      parent: this.resourcePresetFormItemCard,
      label: 'CPU',
    });
  }

  getResourcePresetInputSelector(): Locator {
    return this.resourcePresetInputSelector.getInputSelector();
  }
  getResourcePresetInput(): Locator {
    return this.resourcePresetInputSelector.getInput();
  }
  getResourcePresetCard(): Locator {
    return this.resourcePresetFormItemCard;
  }
  async getResourcePresetOptionContainer(): Promise<Locator> {
    return this.resourcePresetInputSelector.getOptionContainer();
  }
  async getResourcePresetOptionByText(text: string): Promise<Locator> {
    return this.resourcePresetInputSelector.getOptionByText(text);
  }
  getCPUInputNumber(): InputNumberLocator {
    return this.CPUInputNumber;
  }
  // TODO: add more form items
}
