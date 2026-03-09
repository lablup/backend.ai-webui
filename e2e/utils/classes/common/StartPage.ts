import { getMenuItem } from '../../test-util-antd';
import { Locator, Page } from '@playwright/test';

export class StartPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    // If in admin settings pages, click Go Back first
    const goBackButton = this.page.getByRole('button', { name: 'Go Back' });
    if (await goBackButton.isVisible()) {
      await goBackButton.click();
    }
    await getMenuItem(this.page, 'Start').click();
  }

  private getCardByTitle(title: string) {
    return this.page.locator(`.bai_grid_item:has-text("${title}")`);
  }
  getStorageFolderCard() {
    return this.getCardByTitle('Create New Storage Folder');
  }
  getInteractiveSessionCard() {
    return this.getCardByTitle('Start Interactive Session');
  }
  getBatchSessionCard() {
    return this.getCardByTitle('Start Batch Session');
  }
  getModelServiceCard() {
    return this.getCardByTitle('Start Model Service');
  }
  getStartFromURLCard() {
    return this.getCardByTitle('Start From URL');
  }
  getStartButtonFromCard(card: Locator) {
    return card.getByRole('button', { name: 'Start' });
  }
  getCreateFolderButton(card: Locator) {
    return card.getByRole('button', { name: 'Create Folder' });
  }
  getStartNowButton(card: Locator) {
    return card.getByRole('button', { name: 'Start Now' });
  }
  getStartSessionButton(card: Locator) {
    return card.getByRole('button', { name: 'Start Session' });
  }
  getStartServiceButton(card: Locator) {
    return card.getByRole('button', { name: 'Start Service' });
  }
  getBoardItems() {
    return this.page.locator('.bai_grid_item');
  }
  getDragHandles() {
    return this.page.locator('.bai_board_handle');
  }
}
