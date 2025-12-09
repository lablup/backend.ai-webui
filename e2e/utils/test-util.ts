import { FolderCreationModal } from './classes/FolderCreationModal';
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
  try {
    const filterChip = page
      .getByTestId('vfolder-filter')
      .locator('div')
      .filter({ hasText: `Name: ${folderName}` })
      .locator('svg')
      .first();

    // Only try to click if the filter chip exists
    if (await filterChip.isVisible({ timeout: 1000 })) {
      await filterChip.click();
    }
  } catch (error) {
    // Silently ignore if filter chip doesn't exist
    // This prevents cascading failures when the filter was already removed
  }
}

async function clearAllFilters(page: Page) {
  try {
    // Find all filter chips in the vfolder-filter component
    const filterChips = page
      .getByTestId('vfolder-filter')
      .locator('.ant-tag-close-icon');

    // Get count of filter chips
    const count = await filterChips.count();

    // Remove all filter chips one by one
    for (let i = 0; i < count; i++) {
      // Always click the first chip since the list updates after each removal
      const firstChip = filterChips.first();
      if (await firstChip.isVisible({ timeout: 500 })) {
        await firstChip.click();
        // Wait for the filter chip count to decrease
        await expect(filterChips).toHaveCount(count - i - 1);
      }
    }
  } catch (error) {
    // Silently ignore if no filters exist
  }
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

  const modal = new FolderCreationModal(page);
  await modal.modalToBeVisible();

  // Fill folder name
  await modal.fillFolderName(folderName);

  // Select usage mode
  if (usageMode === 'general') {
    await (await modal.getGeneralUsageModeRadio()).click();
  } else if (usageMode === 'model') {
    await (await modal.getModelUsageModeRadio()).click();
  }

  // Select type
  if (type === 'user') {
    await (await modal.getUserTypeRadio()).click();
  } else if (type === 'project') {
    await (await modal.getProjectTypeRadio()).click();
  }

  // Select permission
  if (permission === 'rw') {
    await (await modal.getReadWritePermissionRadio()).click();
  } else if (permission === 'ro') {
    await (await modal.getReadOnlyPermissionRadio()).click();
  }

  await (await modal.getCreateButton()).click();
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

  // Clear any existing filters before searching for the folder to delete
  await clearAllFilters(page);

  // Set filter to search by Name
  await page.getByTestId('vfolder-filter').locator('div').nth(2).click();
  await page.getByRole('option', { name: 'Name' }).locator('div').click();

  const searchInput = page.locator('input[type="search"].ant-input');
  await searchInput.fill(folderName);
  await page.getByRole('button', { name: 'search' }).click();

  // Verify the folder row exists before attempting deletion
  const folderRow = page.getByRole('row', {
    name: `VFolder Identicon ${folderName}`,
  });

  // Add proper error handling when folder is not found
  try {
    await expect(folderRow).toBeVisible({ timeout: 5000 });
  } catch (error) {
    throw new Error(
      `Folder '${folderName}' not found in Trash. This may be due to active filters or the folder was already deleted.`,
    );
  }

  // Delete forever
  await folderRow.getByRole('button').nth(1).click();
  await page.locator('#confirmText').click();
  await page.locator('#confirmText').fill(folderName);
  await page.getByRole('button', { name: 'Delete forever' }).click();

  // Verify deletion - clear filters again and search
  await clearAllFilters(page);
  await page.getByTestId('vfolder-filter').locator('div').nth(2).click();
  await page.getByRole('option', { name: 'Name' }).locator('div').click();
  await searchInput.fill(folderName);
  await page.getByRole('button', { name: 'search' }).click();

  await expect(
    page
      .getByRole('cell', { name: `VFolder Identicon ${folderName}` })
      .filter({ hasText: folderName }),
  ).toHaveCount(0);

  // Clean up the search filter
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
  await page
    .locator('.ant-notification-notice')
    .getByText('See Detail')
    .click();

  await page.waitForLoadState('networkidle');
  // Accept all invitations one by one
  const acceptButtons = await page
    .getByRole('button', { name: 'Accept' })
    .all();
  for (const acceptButton of acceptButtons) {
    await acceptButton.click();
  }
  await page.waitForLoadState('networkidle');

  await navigateTo(page, 'data');
  // Select the search input - use type="search" with ant-input class for the folder search
  const searchInput = page.locator('input.ant-input[type="search"]');
  await searchInput.fill(folderName);
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
  // Navigate to sessions page if not already there
  if (!page.url().includes('/session')) {
    await page.goto('/session');
    await page.waitForLoadState('networkidle');
  }

  // Search by session name using the search input
  const searchInput = page
    .locator('input[placeholder*="검색"]')
    .or(page.locator('input').filter({ hasText: /search|검색/ }));

  if ((await searchInput.count()) > 0) {
    await searchInput.fill(sessionName);
    await page.waitForTimeout(1000); // Wait for search results
  }

  // Find session row and terminate it
  const sessionRow = page.locator('tr').filter({ hasText: sessionName });

  if ((await sessionRow.count()) > 0) {
    // Select the session checkbox
    const checkbox = sessionRow.locator('input[type="checkbox"]').first();
    if ((await checkbox.count()) > 0) {
      await checkbox.check();
    }

    // Click terminate button - look for power/stop icon
    const terminateButton = page
      .locator('button')
      .filter({ hasText: /power|terminate|종료/ })
      .first()
      .or(page.locator('[data-testid*="terminate"]'))
      .or(page.locator('button:has(svg)').filter({ hasText: /power/ }));

    if ((await terminateButton.count()) > 0) {
      await terminateButton.click();

      // Confirm termination in modal
      const confirmButton = page.getByRole('button', { name: /okay|확인|ok/i });
      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();
      }
    }
  }

  // Clear search and verify session is removed
  if ((await searchInput.count()) > 0) {
    await searchInput.fill('');
    await page.waitForTimeout(1000);
  }

  // Wait for session to be removed
  await expect(page.locator('tr').filter({ hasText: sessionName })).toBeHidden({
    timeout: 30_000,
  });
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
