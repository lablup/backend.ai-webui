import TOML from '@iarna/toml';
import { APIRequestContext, Locator, Page, expect } from '@playwright/test';

export const webuiEndpoint = 'http://127.0.0.1:9081';
export const webServerEndpoint = 'http://127.0.0.1:8090';
export const visualRegressionWebserverEndpoint = 'http://10.122.10.216:8090';

export async function login(
  page: Page,
  username: string,
  password: string,
  endpoint: string,
) {
  await page.goto(webuiEndpoint);
  await page.getByLabel('Email or Username').fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('textbox', { name: 'Endpoint' }).fill(endpoint);
  await page.getByLabel('Login', { exact: true }).click();
  await page.waitForSelector('[data-testid="user-dropdown-button"]');
}

export const userInfo = {
  admin: {
    email: 'admin@lablup.com',
    password: 'wJalrXUt',
  },
  user: {
    email: 'user@lablup.com',
    password: 'C8qnIo29',
  },
  user2: {
    email: 'user2@lablup.com',
    password: 'P7oxTDdz',
  },
  monitor: {
    email: 'monitor@lablup.com',
    password: '7tuEwF1J',
  },
  domainAdmin: {
    email: 'domain-admin@lablup.com',
    password: 'cWbsM_vB',
  },
};

export async function loginAsAdmin(page: Page) {
  await login(
    page,
    userInfo.admin.email,
    userInfo.admin.password,
    webServerEndpoint,
  );
}
export async function loginAsDomainAdmin(page: Page) {
  await login(
    page,
    userInfo.domainAdmin.email,
    userInfo.domainAdmin.password,
    'http://127.0.0.1:8090',
  );
}
export async function loginAsUser(page: Page) {
  await login(
    page,
    userInfo.user.email,
    userInfo.user.password,
    webServerEndpoint,
  );
}
export async function loginAsUser2(page: Page) {
  await login(
    page,
    userInfo.user2.email,
    userInfo.user2.password,
    webServerEndpoint,
  );
}
export async function loginAsMonitor(page: Page) {
  await login(
    page,
    userInfo.monitor.email,
    userInfo.monitor.password,
    webServerEndpoint,
  );
}
export async function loginAsCreatedAccount(
  page: Page,
  email: string,
  password: string,
) {
  await login(page, email, password, webServerEndpoint);
}

export async function loginAsVisualRegressionAdmin(page: Page) {
  await login(
    page,
    userInfo.admin.email,
    userInfo.admin.password,
    visualRegressionWebserverEndpoint,
  );
}

export async function loginAsVisualRegressionUser2(page: Page) {
  await login(
    page,
    userInfo.user2.email,
    userInfo.user2.password,
    visualRegressionWebserverEndpoint,
  );
}

export async function logout(page: Page) {
  await page.getByTestId('user-dropdown-button').click();
  await page.getByText('Log Out').click();
  await page.waitForTimeout(1000);
}

export async function navigateTo(page: Page, path: string) {
  //merge the base url with the path
  const url = new URL(path, webuiEndpoint);
  await page.goto(url.toString());
}

export async function fillOutVaadinGridCellFilter(
  gridWrap: Locator,
  columnTitle: string,
  inputValue: string,
) {
  const nameInput = gridWrap
    .locator('vaadin-grid-cell-content')
    .filter({ hasText: columnTitle })
    .locator('vaadin-text-field')
    .nth(1)
    .locator('input');
  await nameInput.click();
  await nameInput.fill(inputValue);
}

async function removeSearchButton(page: Page, folderName: string) {
  await page
    .getByTestId('vfolder-filter')
    .locator('div')
    .filter({ hasText: `Name: ${folderName}` })
    .locator('svg')
    .first()
    .click();
}

export async function verifyVFolder(
  page: Page,
  folderName: string,
  statusTab: 'Active' | 'Trash' = 'Active',
) {
  await page.getByRole('link', { name: 'Data' }).click();
  await page.getByRole('tab', { name: statusTab }).click();
  await page.getByTestId('vfolder-filter').locator('div').nth(2).click();
  await page.getByRole('option', { name: 'Name' }).locator('div').click();

  const searchInput = page.locator('input[type="search"].ant-input');
  await searchInput.fill(folderName);
  await page.getByRole('button', { name: 'search' }).click();
  await expect(
    page
      .getByRole('cell', { name: `VFolder Identicon ${folderName}` })
      .filter({ hasText: folderName }),
  ).toBeVisible();
  await removeSearchButton(page, folderName);
}

export async function createVFolderAndVerify(
  page: Page,
  folderName: string,
  usageMode: 'general' | 'model' = 'general',
  type: 'user' | 'project' = 'user',
  permission: 'rw' | 'ro' = 'rw',
) {
  await page.getByRole('link', { name: 'Data' }).click();
  await page.getByRole('button', { name: 'Create Folder' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Folder name' }).fill(folderName);

  // select parsed parameters in create modal form
  await page.getByTestId(`${usageMode}-usage-mode`).click();
  await page.getByTestId(`${type}-type`).click();
  await page.getByTestId(`${permission}-permission`).click();

  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await verifyVFolder(page, folderName);
}

export async function moveToTrashAndVerify(page: Page, folderName: string) {
  await page.getByRole('link', { name: 'Data' }).click();
  await page.getByTestId('vfolder-filter').locator('div').nth(2).click();
  await page.getByRole('option', { name: 'Name' }).locator('div').click();
  const searchInput = page.locator('input[type="search"].ant-input');
  await searchInput.fill(folderName);
  await page.getByRole('button', { name: 'search' }).click();
  await page
    .getByRole('row', { name: `VFolder Identicon ${folderName}` })
    .getByRole('button')
    .nth(1)
    .click();
  const moveButton = page.getByRole('button', { name: 'Move' });
  await expect(moveButton).toBeVisible();
  await moveButton.click();
  await removeSearchButton(page, folderName);
  await verifyVFolder(page, folderName, 'Trash');
}

export async function deleteForeverAndVerifyFromTrash(
  page: Page,
  folderName: string,
) {
  await page.getByRole('link', { name: 'Data' }).click();
  await page.getByRole('tab', { name: 'Trash' }).click();
  const searchInput = page.locator('input[type="search"].ant-input');
  await searchInput.fill(folderName);
  await page.getByRole('button', { name: 'search' }).click();
  // Delete forever
  await page
    .getByRole('row', { name: `VFolder Identicon ${folderName}` })
    .getByRole('button')
    .nth(1)
    .click();
  await page.locator('#confirmText').click();
  await page.locator('#confirmText').fill(folderName);
  await page.getByRole('button', { name: 'Delete forever' }).click();
  // Verify
  await page.getByTestId('vfolder-filter').locator('div').nth(2).click();
  await page.getByRole('option', { name: 'Name' }).locator('div').click();
  await searchInput.fill(folderName);
  await page.getByRole('button', { name: 'search' }).click();
  await expect(
    page
      .getByRole('cell', { name: `VFolder Identicon ${folderName}` })
      .filter({ hasText: folderName }),
  ).toHaveCount(0);
  await removeSearchButton(page, folderName);
}

export async function shareVFolderAndVerify(
  page: Page,
  folderName: string,
  invitedUser: string,
) {
  await navigateTo(page, 'data');

  await page.locator('#rc_select_8').fill(folderName);
  await page.getByRole('button', { name: 'search' }).click();

  // share folder
  await page
    .locator('.ant-table-row')
    .locator('td')
    .nth(2)
    .getByRole('button')
    .nth(0)
    .click();
  await page.locator('.ant-modal').getByRole('textbox').fill(invitedUser);
  await page.getByRole('button', { name: 'Add' }).click();
  await page
    .locator('.ant-modal')
    .getByRole('button', { name: 'close' })
    .click();
  await removeSearchButton(page, folderName);
}

export async function acceptAllInvitationAndVerifySpecificFolder(
  page: Page,
  folderName: string,
) {
  await navigateTo(page, 'summary');
  await page.waitForLoadState('networkidle');
  const invitations = await page.getByLabel('Accept').all();
  for (const invitation of invitations) {
    await invitation.click();
  }

  await navigateTo(page, 'data');
  await page.locator('#rc_select_8').fill(folderName);
  await page.getByRole('button', { name: 'search' }).click();
  expect(
    page.locator('.ant-table-row').locator('td').nth(1).getByText(folderName),
  );
}

export async function restoreVFolderAndVerify(page: Page, folderName: string) {
  await page.getByRole('link', { name: 'Data' }).click();
  await page.getByRole('tab', { name: 'Trash' }).click();
  await page.locator('#react-root').getByTitle('Name').click();
  await page.getByRole('option', { name: 'Name' }).locator('div').click();
  const searchInput = page.locator('input[type="search"].ant-input');
  await searchInput.fill(folderName);
  // Restore
  await page
    .getByRole('row', { name: 'VFolder Identicon e2e-test-' })
    .getByRole('button')
    .first()
    .click();
  await verifyVFolder(page, folderName, 'Active');
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
  await expect(page.getByRole('heading', { name: 'App close' })).toBeVisible;
  await page.getByRole('button', { name: 'close' }).click();

  // Verify that a cell exists to display the session name
  const session = page
    .locator('vaadin-grid-cell-content')
    .filter({ hasText: `${sessionName}` });
  // it takes time to show the created session
  await expect(session).toBeVisible({ timeout: 10000 });
}

export async function deleteSession(page: Page, sessionName: string) {
  // Search by session name
  const sessionList = page.locator('#running-jobs').locator('#list-grid');
  const searchSessionInfo = sessionList
    .locator('vaadin-grid-cell-content')
    .nth(1)
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
  await expect(
    page.locator('vaadin-grid-cell-content').filter({ hasText: sessionName }),
  ).toBeHidden({ timeout: 30_000 });
}

/**
 * Modify specific columns in the webui config.toml file
 *
 * @param page
 * @param request
 * @param configColumn
 * The object to modify the config.toml file
 *
 * e.g. { "environments": { "showNonInstalledImages": "true" } }
 */

export async function modifyConfigToml(
  page: Page,
  request: APIRequestContext,
  configColumn: Record<string, Record<string, any>>,
) {
  const configToml = await (
    await request.get(`${webuiEndpoint}/config.toml`)
  ).text();
  const config = TOML.parse(configToml);
  Object.assign(config, configColumn);

  await page.route(`${webuiEndpoint}/config.toml`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: TOML.stringify(config),
    });
  });
}
