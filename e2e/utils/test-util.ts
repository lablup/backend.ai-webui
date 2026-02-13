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

/**
 * Check if running against a local development environment.
 * Config modification tests only work reliably in local environments
 * because external deployments (e.g., Amplify) may cache config.toml
 * before route interception can take effect.
 */
export const isLocalEnvironment =
  webuiEndpoint.includes('127.0.0.1') || webuiEndpoint.includes('localhost');

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
      apiEndpointText: '',
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
  } catch {
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
  } catch {
    // Silently ignore if no filters exist
  }
}

/**
 * Select a property filter and search for a value in BAIPropertyFilter component
 * @param page - Playwright Page object
 * @param propertyName - Name of the property to filter by (e.g., 'Name', 'Status')
 * @param searchValue - Value to search for
 * @param testId - Test ID of the filter component (default: 'vfolder-filter')
 */
async function selectPropertyFilter(
  page: Page,
  propertyName: string,
  searchValue: string,
  testId: string = 'vfolder-filter',
) {
  const filterContainer = page.getByTestId(testId);

  // The BAIPropertyFilter is inside .ant-space-compact with two .ant-select elements
  // 1. Property selector (first .ant-select in Space.Compact)
  // 2. Search input (AutoComplete, second .ant-select in Space.Compact)

  // Click the first Select in the Space.Compact (property selector)
  const propertySelect = filterContainer
    .locator('.ant-space-compact')
    .locator('.ant-select')
    .first();
  await propertySelect.click();

  // Select the property option from the dropdown
  await page.getByRole('option', { name: propertyName }).click();

  // Fill in the search value in the AutoComplete input
  // It's the second .ant-select in the Space.Compact
  const searchInput = filterContainer
    .locator('.ant-space-compact')
    .locator('.ant-select')
    .last()
    .locator('input[role="combobox"]');
  await searchInput.fill(searchValue);

  // Click search button
  await page.getByRole('button', { name: 'search' }).click();
}

export async function verifyVFolder(
  page: Page,
  folderName: string,
  statusTab: 'Active' | 'Trash' = 'Active',
) {
  await page.getByRole('link', { name: 'Data' }).click();
  await page.getByRole('tab', { name: statusTab }).click();
  await selectPropertyFilter(page, 'Name', folderName);
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
  await selectPropertyFilter(page, 'Name', folderName);

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
  await selectPropertyFilter(page, 'Name', folderName);

  // Verify the folder row exists before attempting deletion
  const folderRowToDelete = page.getByRole('row', {
    name: `VFolder Identicon ${folderName}`,
  });

  await expect(folderRowToDelete).toBeVisible({ timeout: 5000 });

  // Delete forever
  await folderRowToDelete.getByRole('button').nth(1).click();
  await page.locator('#confirmText').click();
  await page.locator('#confirmText').fill(folderName);
  await page.getByRole('button', { name: 'Delete forever' }).click();

  // Wait for the deletion notification to appear and disappear
  // This ensures the backend has completed the deletion before verification
  const deletionNotification = page.getByRole('alert').filter({
    hasText: /deleted forever/i,
  });
  await expect(deletionNotification).toBeVisible({ timeout: 10000 });
  await expect(deletionNotification).toBeHidden({ timeout: 10000 });

  // Verify deletion - clear filters again and search
  await clearAllFilters(page);
  await selectPropertyFilter(page, 'Name', folderName);

  // Verify the folder is either deleted (not visible) or in DELETE-ONGOING status
  const folderRowAfterDelete = page.getByRole('row').filter({
    has: page.getByRole('cell', { name: `VFolder Identicon ${folderName}` }),
  });
  await expect(folderRowAfterDelete).toBeHidden();

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

/**
 * Convert a config object to TOML string that is compatible with markty-toml parser.
 *
 * markty-toml has a known bug where it parses empty strings `""` as literal `""`
 * (with quote characters included in the value). This causes the app's _preprocessToml
 * to crash when it tries JSON.parse on the malformed value, which silently fails
 * due to .catch(() => undefined), resulting in an empty config object.
 *
 * Additionally, markty-toml parses underscore-separated numbers (e.g., 4_294_967_296)
 * as strings instead of numbers.
 *
 * This function uses @iarna/toml stringify and post-processes the output to:
 * 1. Remove lines with empty string values (the app treats missing keys as empty)
 * 2. Remove underscore separators from numbers
 */
function tomlStringifyCompatible(config: any): string {
  let tomlStr = TOML.stringify(config);

  // Fix 1: Remove lines with empty string values `= ""`
  // markty-toml parses `key = ""` as key: '""' instead of key: ''
  // The app treats undefined/missing the same as empty string for most fields
  tomlStr = tomlStr.replace(/^.+ = ""\s*$/gm, '');

  // Fix 2: Remove underscore separators from large numbers
  // markty-toml parses `4_294_967_296` as a string instead of a number
  tomlStr = tomlStr.replace(
    /^(.+ = )(\d[\d_]+\d)\s*$/gm,
    (_match, prefix, num) => {
      return prefix + num.replace(/_/g, '');
    },
  );

  // Clean up any resulting double blank lines
  tomlStr = tomlStr.replace(/\n{3,}/g, '\n\n');

  return tomlStr;
}

// Store the accumulated config modifications in a WeakMap keyed by page
const configCache = new WeakMap<Page, any>();

export async function modifyConfigToml(
  page: Page,
  _request: APIRequestContext,
  configColumn: Record<string, Record<string, any>>,
) {
  // Get or initialize the cached config for this page
  let config = configCache.get(page);

  if (!config) {
    // First time: Use a completely separate browser context to fetch original config
    // This prevents any cache pollution between the fetch and the main test
    const browser = page.context().browser();
    if (!browser) {
      throw new Error('Browser instance not available');
    }

    const tempContext = await browser.newContext();
    const tempPage = await tempContext.newPage();

    const maxRetries = 3;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Navigate temp page to fetch config
        await tempPage.goto(webuiEndpoint, { waitUntil: 'commit' });

        // Fetch config.toml from within the browser context (bypasses bot protection)
        const configToml = await tempPage.evaluate(async () => {
          const res = await fetch('/config.toml', { cache: 'no-store' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.text();
        });
        config = TOML.parse(configToml);
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          // Wait briefly before retrying
          await tempPage.waitForTimeout(500);
        }
      }
    }

    // Close temp context entirely
    await tempContext.close();

    if (!config) {
      throw new Error(
        `Failed to fetch config.toml from ${webuiEndpoint} after ${maxRetries} attempts: ${lastError}`,
      );
    }
  }

  // Deep merge the new configuration into the existing config
  // Use custom merge that preserves explicit undefined values
  config = mergeWithUndefined(config, configColumn);

  // Cache the updated config
  configCache.set(page, config);

  // Clear all existing route handlers for config.toml
  await page.unroute('**/config.toml**');

  // Set up the new route handler with the current config
  // IMPORTANT: Use a closure to capture the current config value
  const configToServe = config;
  await page.route('**/config.toml**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: tomlStringifyCompatible(configToServe),
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
  _request: APIRequestContext,
  themeConfig: ThemeConfig,
) {
  // Get or initialize the cached theme for this page
  let theme = themeCache.get(page);

  if (!theme) {
    // First time: fetch the original theme via browser context
    // Using page.evaluate to avoid ECONNRESET from bot protection on external deployments
    try {
      const themeJson = await page.evaluate(async (endpoint) => {
        const res = await fetch(`${endpoint}/resources/theme.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      }, webuiEndpoint);
      theme = JSON.parse(themeJson) as ThemeConfig;
    } catch (error) {
      // If fetching theme.json fails, use a minimal default theme configuration
      console.log(
        `Failed to fetch theme.json from ${webuiEndpoint}, using default theme:`,
        error,
      );
      theme = {
        light: {
          token: {
            fontFamily: "'Ubuntu', Roboto, sans-serif",
            colorPrimary: '#FF7A00',
            colorLink: '#FF7A00',
            colorText: '#141414',
            colorInfo: '#028DF2',
            colorError: '#FF4D4F',
            colorSuccess: '#00BD9B',
          },
          components: {},
        },
        dark: {
          token: {
            fontFamily: "'Ubuntu', Roboto, sans-serif",
            colorPrimary: '#DC6B03',
            colorLink: '#DC6B03',
            colorText: '#FFF',
            colorInfo: '#009BDD',
            colorError: '#DC4446',
            colorSuccess: '#03A487',
            colorFillSecondary: '#262626',
          },
          components: {},
        },
        logo: {
          src: '/manifest/backend.ai-webui-white.svg',
          srcCollapsed: '/manifest/backend.ai-brand-simple-white.svg',
          srcDark: '/manifest/backend.ai-webui-black.svg',
          srcCollapsedDark: '/manifest/backend.ai-brand-simple-black.svg',
          alt: 'Backend.AI Logo',
          href: '/start',
        },
        sider: {},
        branding: {
          companyName: 'Lablup Inc.',
          brandName: 'Backend.AI',
        },
      };
    }
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
