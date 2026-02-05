import { FolderCreationModal } from './classes/vfolder/FolderCreationModal';
import TOML from '@iarna/toml';
import { APIRequestContext, Locator, Page, expect } from '@playwright/test';
import _ from 'lodash';

/**
 * Custom merge function that handles explicit undefined values.
 * Unlike lodash merge, this preserves undefined values when explicitly set.
 *
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 * @returns The merged object
 *
 * @example
 * const target = { a: 1, b: { c: 2, d: 3 } };
 * const source = { b: { c: undefined, e: 4 } };
 * mergeWithUndefined(target, source);
 * // Result: { a: 1, b: { c: undefined, d: 3, e: 4 } }
 */
function mergeWithUndefined<T extends object>(target: T, source: object): T {
  const result = _.cloneDeep(target);

  Object.keys(source).forEach((key) => {
    const sourceValue = (source as any)[key];
    const targetValue = (result as any)[key];

    if (sourceValue === undefined) {
      // Explicitly set undefined
      (result as any)[key] = undefined;
    } else if (
      _.isPlainObject(sourceValue) &&
      _.isPlainObject(targetValue) &&
      !Array.isArray(sourceValue)
    ) {
      // Recursively merge nested objects
      (result as any)[key] = mergeWithUndefined(targetValue, sourceValue);
    } else {
      // Directly assign other values (including arrays, null, primitives)
      (result as any)[key] = sourceValue;
    }
  });

  return result;
}

// Theme configuration types based on theme.schema.json
type ThemeLogoConfig = {
  src?: string;
  srcCollapsed?: string;
  srcDark?: string;
  srcCollapsedDark?: string;
  alt?: string;
  href?: string;
  size?: {
    width?: number;
    height?: number;
  };
  sizeCollapsed?: {
    width?: number;
    height?: number;
  };
};

type ThemeSiderConfig = {
  theme?: 'dark' | 'light' | 'auto';
};

type ThemeBrandingConfig = {
  companyName?: string;
  brandName?: string;
};

type AntdThemeConfig = {
  token?: Record<string, any>;
  components?: Record<string, any>;
};

export type ThemeConfig = {
  $schema?: string;
  light?: AntdThemeConfig;
  dark?: AntdThemeConfig;
  logo?: ThemeLogoConfig;
  sider?: ThemeSiderConfig;
  branding?: ThemeBrandingConfig;
};

export const webuiEndpoint =
  process.env.E2E_WEBUI_ENDPOINT || 'http://127.0.0.1:9081';
export const webServerEndpoint =
  process.env.E2E_WEBSERVER_ENDPOINT || 'http://127.0.0.1:8090';

export async function login(
  page: Page,
  request: APIRequestContext,
  username: string,
  password: string,
  endpoint: string,
) {
  // Modify config.toml to enable session-based login with manual endpoint input
  await modifyConfigToml(page, request, {
    general: {
      connectionMode: 'SESSION',
      apiEndpoint: '',
    },
  });

  await page.goto(webuiEndpoint);
  await page.getByLabel('Email or Username').fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('textbox', { name: 'Endpoint' }).fill(endpoint);
  await page.getByLabel('Login', { exact: true }).click();
  await page.waitForSelector('[data-testid="user-dropdown-button"]');
}

export const userInfo = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || 'admin@lablup.com',
    password: process.env.E2E_ADMIN_PASSWORD || 'wJalrXUt',
  },
  user: {
    email: process.env.E2E_USER_EMAIL || 'user@lablup.com',
    password: process.env.E2E_USER_PASSWORD || 'C8qnIo29',
  },
  user2: {
    email: process.env.E2E_USER2_EMAIL || 'user2@lablup.com',
    password: process.env.E2E_USER2_PASSWORD || 'P7oxTDdz',
  },
  monitor: {
    email: process.env.E2E_MONITOR_EMAIL || 'monitor@lablup.com',
    password: process.env.E2E_MONITOR_PASSWORD || '7tuEwF1J',
  },
  domainAdmin: {
    email: process.env.E2E_DOMAIN_ADMIN_EMAIL || 'domain-admin@lablup.com',
    password: process.env.E2E_DOMAIN_ADMIN_PASSWORD || 'cWbsM_vB',
  },
  visualRegressionAdmin: {
    email:
      process.env.E2E_ADMIN_EMAIL_FOR_VISUAL ||
      process.env.E2E_ADMIN_EMAIL ||
      'admin@lablup.com',
    password:
      process.env.E2E_ADMIN_PASSWORD_FOR_VISUAL ||
      process.env.E2E_ADMIN_PASSWORD ||
      'wJalrXUt',
  },
  visualRegressionUser: {
    email:
      process.env.E2E_USER_EMAIL_FOR_VISUAL ||
      process.env.E2E_USER_EMAIL ||
      'user@lablup.com',
    password:
      process.env.E2E_USER_PASSWORD_FOR_VISUAL ||
      process.env.E2E_USER_PASSWORD ||
      'C8qnIo29',
  },
};

export async function loginAsAdmin(page: Page, request: APIRequestContext) {
  await login(
    page,
    request,
    userInfo.admin.email,
    userInfo.admin.password,
    webServerEndpoint,
  );
}
export async function loginAsDomainAdmin(
  page: Page,
  request: APIRequestContext,
) {
  await login(
    page,
    request,
    userInfo.domainAdmin.email,
    userInfo.domainAdmin.password,
    webServerEndpoint,
  );
}
export async function loginAsUser(page: Page, request: APIRequestContext) {
  await login(
    page,
    request,
    userInfo.user.email,
    userInfo.user.password,
    webServerEndpoint,
  );
}
export async function loginAsUser2(page: Page, request: APIRequestContext) {
  await login(
    page,
    request,
    userInfo.user2.email,
    userInfo.user2.password,
    webServerEndpoint,
  );
}
export async function loginAsMonitor(page: Page, request: APIRequestContext) {
  await login(
    page,
    request,
    userInfo.monitor.email,
    userInfo.monitor.password,
    webServerEndpoint,
  );
}
export async function loginAsCreatedAccount(
  page: Page,
  request: APIRequestContext,
  email: string,
  password: string,
) {
  await login(page, request, email, password, webServerEndpoint);
}

export async function loginAsVisualRegressionAdmin(
  page: Page,
  request: APIRequestContext,
) {
  await login(
    page,
    request,
    userInfo.visualRegressionAdmin.email,
    userInfo.visualRegressionAdmin.password,
    webServerEndpoint,
  );
}

export async function loginAsVisualRegressionUser(
  page: Page,
  request: APIRequestContext,
) {
  await login(
    page,
    request,
    userInfo.visualRegressionUser.email,
    userInfo.visualRegressionUser.password,
    webServerEndpoint,
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
    .getByRole('button', { name: 'trash bin' })
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

  await expect(folderRow).toBeVisible({ timeout: 5000 });

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

  const searchInput = page.locator('input[type="search"].ant-input');
  await searchInput.fill(folderName);
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

// Store the accumulated config modifications in a WeakMap keyed by page
const configCache = new WeakMap<Page, any>();

export async function modifyConfigToml(
  page: Page,
  request: APIRequestContext,
  configColumn: Record<string, Record<string, any>>,
) {
  // Get or initialize the cached config for this page
  let config = configCache.get(page);

  if (!config) {
    // First time: fetch the original config from the server
    const configToml = await (
      await request.get(`${webuiEndpoint}/config.toml`)
    ).text();
    config = TOML.parse(configToml);
  }

  // Deep merge the new configuration into the existing config
  // Use custom merge that preserves explicit undefined values
  config = mergeWithUndefined(config, configColumn);

  // Cache the updated config
  configCache.set(page, config);

  // Clear all existing route handlers for config.toml
  await page.unroute(`${webuiEndpoint}/config.toml`);

  // Set up the new route handler with the current config
  // IMPORTANT: Use a closure to capture the current config value
  const configToServe = config;
  await page.route(`${webuiEndpoint}/config.toml`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: TOML.stringify(configToServe),
    });
  });
}

/**
 * Modify specific properties in the webui theme.json file
 *
 * @param page - The Playwright page instance
 * @param request - The API request context
 * @param themeConfig - The theme configuration object to merge
 *
 * @example
 * // Modify light mode primary color
 * await modifyThemeJson(page, request, {
 *   light: {
 *     token: {
 *       colorPrimary: '#FF0000',
 *       colorLink: '#FF0000',
 *     },
 *   },
 * });
 *
 * @example
 * // Remove logo href (set to undefined explicitly)
 * await modifyThemeJson(page, request, {
 *   logo: {
 *     href: undefined,
 *   },
 * });
 *
 * @example
 * // Modify branding
 * await modifyThemeJson(page, request, {
 *   branding: {
 *     companyName: 'Test Company',
 *     brandName: 'Test Brand',
 *   },
 * });
 */

// Store the accumulated theme modifications in a WeakMap keyed by page
const themeCache = new WeakMap<Page, ThemeConfig>();

export async function modifyThemeJson(
  page: Page,
  request: APIRequestContext,
  themeConfig: ThemeConfig,
) {
  // Get or initialize the cached theme for this page
  let theme = themeCache.get(page);

  if (!theme) {
    // First time: fetch the original theme from the server
    const themeJson = await (
      await request.get(`${webuiEndpoint}/resources/theme.json`)
    ).text();
    theme = JSON.parse(themeJson) as ThemeConfig;
  }

  // Deep merge the new theme configuration into the existing theme
  // Use custom merge that preserves explicit undefined values
  theme = mergeWithUndefined(theme, themeConfig);

  // Cache the updated theme
  themeCache.set(page, theme);

  // Clear all existing route handlers for theme.json
  await page.unroute(`${webuiEndpoint}/resources/theme.json`);

  // Set up the new route handler with the current theme
  // IMPORTANT: Use a closure to capture the current theme value
  const themeToServe = theme;
  await page.route(`${webuiEndpoint}/resources/theme.json`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(themeToServe),
    });
  });
}
