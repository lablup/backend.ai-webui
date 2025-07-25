import { loginAsUser2, webuiEndpoint } from './utils/test-util';
import { expect, test, Page, BrowserContext } from '@playwright/test';

const folderName = 'vrt_data_test';
test.describe.configure({ mode: 'serial' });
test.describe('Vfolder page Visual Regression Test', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await loginAsUser2(page);
    await page.setViewportSize({
      width: 1500,
      height: 1000,
    });
    await page.goto(`${webuiEndpoint}/data`);
    await page.waitForLoadState('networkidle');
  });

  test('Full page', async () => {
    await expect(page).toHaveScreenshot('vfolder_page.png', {
      fullPage: true,
    });
  });

  test('Create Folder modal', async () => {
    await page.getByRole('button', { name: 'Create Folder' }).first().click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('create_folder_modal.png', {
      fullPage: true,
    });

    // create a new folder
    await page.getByLabel('Folder name').fill(folderName);
    await page.getByTestId('create-folder-button').click();
    await page.getByLabel('Close', { exact: true }).first().click();
  });

  test('Folder info modal', async () => {
    await page.reload();
    await page.getByRole('link', { name: folderName }).first().click();
    await expect(page).toHaveScreenshot('folder_info_modal.png', {
      fullPage: true,
      mask: [
        page.locator('tr.ant-descriptions-row', {
          hasText: 'Created At',
        }),
        page.locator('tr.ant-descriptions-row', {
          hasText: 'Path',
        }),
      ],
    });

    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('Modify Permission modal', async () => {
    await page.waitForLoadState('networkidle');
    await page
      .getByRole('row', { name: 'VFolder Identicon' })
      .getByRole('button')
      .first()
      .click();
    await expect(page).toHaveScreenshot('modify_permission_modal.png', {
      fullPage: true,
      mask: [page.getByRole('img', { name: 'VFolder Identicon' })],
    });

    await page.getByRole('button', { name: 'Close' }).click();
  });

  test.afterAll(async () => {
    await page.goto(`${webuiEndpoint}/data`);
    await page.waitForLoadState('networkidle');

    await page
      .getByRole('row', { name: 'VFolder Identicon' })
      .getByRole('button')
      .nth(1)
      .click();
    await page.getByRole('button', { name: 'Move' }).click();

    await page
      .locator('div')
      .filter({ hasText: /^Trash$/ })
      .first()
      .click();
    await page
      .getByRole('row', { name: 'VFolder Identicon' })
      .getByRole('button')
      .nth(1)
      .click();
    await page.locator('#confirmText').fill(folderName);
    await page.getByRole('button', { name: 'Delete forever' }).click();
    await page.close();
    await context.close();
  });
});
