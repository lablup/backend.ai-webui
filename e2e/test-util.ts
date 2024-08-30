import { Page, expect } from '@playwright/test';

const webuiEndpoint = 'http://127.0.0.1:9081';
const webServerEndpoint = 'http://127.0.0.1:8090';
export async function login(
  page: Page,
  username: string,
  password: string,
  endpoint: string,
) {
  await page.goto(webuiEndpoint);
  await page.locator('#id_password label').click();
  await page.getByLabel('E-mail or Username').click();
  await page.getByLabel('E-mail or Username').fill(username);
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('textbox', { name: 'Endpoint' }).click();
  await page.getByRole('textbox', { name: 'Endpoint' }).fill(endpoint);
  await page.getByLabel('Login', { exact: true }).click();
  await page.waitForSelector('[data-testid="user-dropdown-button"]');
}

export async function loginAsAdmin(page: Page) {
  await login(page, 'admin@lablup.com', 'wJalrXUt', webServerEndpoint);
}
export async function loginAsDomainAdmin(page: Page) {
  await login(
    page,
    'domain-admin@lablup.com',
    'cWbsM_vB',
    'http://127.0.0.1:8090',
  );
}
export async function loginAsUser(page: Page) {
  await login(page, 'user@lablup.com', 'C8qnIo29', webServerEndpoint);
}
export async function loginAsUser2(page: Page) {
  await login(page, 'user2@lablup.com', 'P7oxTDdz', webServerEndpoint);
}
export async function loginAsMonitor(page: Page) {
  await login(page, 'monitor@lablup.com', '7tuEwF1J', webServerEndpoint);
}

export async function logout(page: Page) {
  await page.locator('text=Logout').click();
  await page.getByTestId('user-dropdown-button').click();
  await page.getByText('Log Out').click();
}

export async function navigateTo(page: Page, path: string) {
  //merge the base url with the path
  const url = new URL(path, webuiEndpoint);
  await page.goto(url.toString());
}

export async function createVFolderAndVerify(page: Page, folderName: string) {
  await navigateTo(page, 'data');

  await page.getByRole('button', { name: 'plus Add' }).click();
  // TODO: wait for initial rendering without timeout
  await page.waitForTimeout(2000);
  await page.getByRole('textbox', { name: 'Folder name*' }).click();
  await page.getByRole('textbox', { name: 'Folder name*' }).fill(folderName);
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  const nameInput = page
    .locator('#general-folder-storage vaadin-grid-cell-content')
    .filter({ hasText: 'Name' })
    .locator('vaadin-text-field')
    .nth(1)
    .locator('input');
  await nameInput.click();
  await nameInput.fill(folderName);
  await page.waitForSelector(`text=folder_open ${folderName}`);
}

export async function deleteVFolderAndVerify(page: Page, folderName: string) {
  await navigateTo(page, 'data');
  const nameInput = page
    .locator('#general-folder-storage vaadin-grid-cell-content')
    .filter({ hasText: 'Name' })
    .locator('vaadin-text-field')
    .nth(1)
    .locator('input');
  await nameInput.click();
  await nameInput.fill(folderName);
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'delete' }).first().click();
  await page
    .locator('#delete-without-confirm-button')
    .getByLabel('delete')
    .click();
  await page.getByRole('tab', { name: 'delete' }).click();

  await page.waitForTimeout(1000);
  const nameInputInTrash = page
    .locator('#trash-bin-folder-storage vaadin-grid-cell-content')
    .filter({ hasText: 'Name' })
    .locator('vaadin-text-field')
    .nth(1)
    .locator('input');
  await nameInputInTrash.click();
  await nameInputInTrash.fill(folderName);
  await page.getByLabel('delete_forever').click();
  await page
    .getByRole('textbox', { name: 'Type folder name to delete' })
    .fill(folderName);
  await page.waitForTimeout(1000);
  await page
    .getByRole('textbox', { name: 'Type folder name to delete' })
    .click();

  await expect(
    page
      .locator('#trash-bin-folder-storage')
      .getByText('e2e-test-folder', { exact: true }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Delete forever' }).click();
  await expect(
    page
      .locator('#trash-bin-folder-storage')
      .getByText('e2e-test-folder', { exact: true }),
  ).toBeHidden();
}

export async function createSession(page: Page, sessionName: string) {
  await navigateTo(page, 'job');
  await page.locator('#launch-session').filter({ hasText: 'Start' }).click();

  // Session launch
  const sessionNameInput = page.locator('#sessionName');
  await sessionNameInput.fill(sessionName);
  await page.getByRole('button', { name: 'Skip to review' }).click();

  await page.locator('button').filter({ hasText: 'Launch' }).click();
  await expect(page.locator('.ant-modal-confirm-title')).toHaveText(
    'No storage folder is mounted',
  );
  await page.getByRole('button', { name: 'Start' }).click();

  // Wait for App dialog and close it
  await page
    .getByRole('heading', { name: 'App close' })
    .getByLabel('close')
    .click();

  // Verify that a cell exists to display the session name
  const session = page
    .locator('vaadin-grid-cell-content')
    .filter({ hasText: `${sessionName} edit done` });
  // it takes time to show the created session
  await expect(session).toBeVisible({ timeout: 10000 });
}

export async function deleteSession(page: Page, sessionName: string) {
  // Search by session name
  const sessionList = page.locator('#running-jobs').locator('#list-grid');
  const searchSessionInfo = sessionList
    .locator('vaadin-grid-cell-content')
    .nth(2)
    .locator('vaadin-text-field')
    .nth(1)
    .locator('input');
  await searchSessionInfo.fill(sessionName);

  // Click terminate button
  await page
    .locator('[id="\\30 -power"]')
    .getByLabel('power_settings_new')
    .click();
  await page.getByRole('button', { name: 'Okay' }).click();

  // Verify session is cleared
  await searchSessionInfo.fill('');
  await expect(page.getByText(sessionName)).toBeHidden();
}
