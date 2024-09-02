import { Locator, Page, expect } from "@playwright/test";

const webuiEndpoint = "http://127.0.0.1:9081";
const webServerEndpoint = "http://127.0.0.1:8090";
export async function login(
  page: Page,
  username: string,
  password: string,
  endpoint: string,
) {
  await page.goto(webuiEndpoint);
  await page.getByLabel("E-mail or Username").fill(username);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("textbox", { name: "Endpoint" }).fill(endpoint);
  await page.getByLabel("Login", { exact: true }).click();
  await page.waitForSelector('[data-testid="user-dropdown-button"]');
}

export const userInfo = {
  admin: {
    email: "admin@lablup.com",
    password: "wJalrXUt",
  },
  user: {
    email: "user@lablup.com",
    password: "C8qnIo29",
  },
  user2: {
    email: "user2@lablup.com",
    password: "P7oxTDdz",
  },
  monitor: {
    email: "monitor@lablup.com",
    password: "7tuEwF1J",
  },
  domainAdmin: {
    email: "domain-admin@lablup.com",
    password: "cWbsM_vB",
  }
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
    "http://127.0.0.1:8090",
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
  await login(page, userInfo.monitor.email, userInfo.monitor.password, webServerEndpoint);
}

export async function logout(page: Page) {
  await page.getByTestId("user-dropdown-button").click();
  await page.getByText("Log Out").click();
  await page.waitForTimeout(1000);
}

export async function navigateTo(page: Page, path: string) {
  //merge the base url with the path
  const url = new URL(path, webuiEndpoint);
  await page.goto(url.toString());
}

export async function fillOutVaadinGridCellFilter(gridWrap:Locator, columnTitle:string, inputValue:string ) {
  const nameInput = gridWrap.locator("vaadin-grid-cell-content")
    .filter({ hasText: columnTitle })
    .locator("vaadin-text-field")
    .nth(1)
    .locator("input");
  await nameInput.click();
  await nameInput.fill(inputValue);
}

export async function createVFolderAndVerify(page: Page, folderName: string) {
  await navigateTo(page, "data");

  await page.getByRole("button", { name: "plus Add" }).click();
  // TODO: wait for initial rendering without timeout
  await page.waitForTimeout(1000);
  await page.getByRole("textbox", { name: "Folder name*" }).click();
  await page.getByRole("textbox", { name: "Folder name*" }).fill(folderName);
  await page.getByRole("button", { name: "Create", exact: true }).click();

  const nameInput = page
    .locator("#general-folder-storage vaadin-grid-cell-content")
    .filter({ hasText: "Name" })
    .locator("vaadin-text-field")
    .nth(1)
    .locator("input");
  await nameInput.click();
  await nameInput.fill(folderName);
  await page.waitForSelector(`text=folder_open ${folderName}`);
  await nameInput.fill("");
}

export async function deleteVFolderAndVerify(page: Page, folderName: string) {
  await navigateTo(page, "data");
  const nameInput = page
    .locator("#general-folder-storage vaadin-grid-cell-content")
    .filter({ hasText: "Name" })
    .locator("vaadin-text-field")
    .nth(1)
    .locator("input");
  await nameInput.click();
  await nameInput.fill(folderName);
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "delete" }).first().click();
  await page
    .locator("#delete-without-confirm-button")
    .getByLabel("delete")
    .click();
  await page.waitForLoadState('networkidle');
  await page.getByRole("tab", { name: "delete" }).click();
  const nameInputInTrash = page
    .locator("#trash-bin-folder-storage vaadin-grid-cell-content")
    .filter({ hasText: "Name" })
    .locator("vaadin-text-field")
    .nth(1)
    .locator("input");
  await nameInputInTrash.fill(folderName);
  // after filling the input, the vaadin-grid will be updated asynchronously. So we need to wait for the grid to be updated.
  await page.waitForTimeout(1000);
  await page.locator("vaadin-grid-cell-content").filter({ hasText: folderName }).locator("//following-sibling::*[7]").getByRole('button', { name: 'delete_forever' }).click();
  await page
    .getByRole("textbox", { name: "Type folder name to delete" })
    .fill(folderName);
  await page.getByRole("button", { name: "Delete forever" }).click();
  await expect(
    page.locator("vaadin-grid-cell-content").filter({ hasText: folderName }).locator(':visible')
  ).toHaveCount(0);
  await nameInputInTrash.fill("");
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
