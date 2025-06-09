import { Locator, Page, expect } from '@playwright/test';

export async function checkActiveTab(
  tabsLocator: Locator,
  expectedTabName: string,
) {
  const activeTab = await tabsLocator.locator('.ant-tabs-tab-active');
  await expect(activeTab).toContainText(expectedTabName);
}

export async function getTableHeaders(locator: Locator) {
  return await locator.locator('.ant-table-thead th');
}

export async function findColumnIndex(
  tableLocator: Locator,
  columnTitle: string,
) {
  const headers = await getTableHeaders(tableLocator);
  const columnIndex = await headers.evaluateAll((ths, title) => {
    return ths.findIndex((th) => th.textContent?.trim() === title);
  }, columnTitle);

  return columnIndex;
}

export function getNotificationTextContainer(page: Page) {
  return page.locator('.ant-notification-notice-description');
}

export function getNotificationMessageBox(page: Page) {
  return getNotificationTextContainer(page).locator('li > div > div >> nth=0');
}

export function getNotificationDescriptionBox(page: Page) {
  return getNotificationTextContainer(page).locator('li > div > div >> nth=1');
}

export const getMenuItem = (page: Page, menuName: string) => {
  return page.getByRole('link', { name: menuName });
};

export const getCardItemByCardTitle = (page: Page, title: string) => {
  return page.locator(`.ant-card:has-text("${title}")`);
};

type LabelOrTestId =
  | { label: string; testid?: never }
  | { label?: never; testid: string };

type InputLocatorProps = {
  parent: Page | Locator;
} & LabelOrTestId;
export class InputLocator {
  private readonly input: Locator;
  constructor({ parent, testid, label }: InputLocatorProps) {
    this.input = testid
      ? parent
          .getByTestId(testid)
          .locator('.ant-form-item-control-input-content')
          .locator('input')
      : parent.getByLabel(label as string);
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

export const getCardByHeaderText = (
  parent: Page | Locator,
  title: string,
): Locator => {
  return parent.locator(`.ant-card:has-text("${title}")`);
};
