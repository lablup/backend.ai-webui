import { FolderCreationModal } from './classes/vfolder/FolderCreationModal';
import TOML from '@iarna/toml';
import { APIRequestContext, Locator, Page, expect } from '@playwright/test';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

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
  const result = structuredClone(target);

  Object.keys(source).forEach((key) => {
    const sourceValue = (source as any)[key];
    const targetValue = (result as any)[key];

    if (sourceValue === undefined) {
      // Explicitly set undefined
      (result as any)[key] = undefined;
    } else if (
      isPlainObject(sourceValue) &&
      isPlainObject(targetValue) &&
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
  // Remove webpack-dev-server overlay iframe that can intercept pointer events
  await page
    .evaluate(() => {
      const overlay = document.getElementById(
        'webpack-dev-server-client-overlay',
      );
      if (overlay) overlay.remove();
    })
    .catch(() => {});
  await page.getByLabel('Email or Username').fill(username);
  await page.getByLabel('Password').fill(password);
  // Expand the endpoint section if it's not already visible
  const endpointInput = page.getByLabel('Endpoint');
  if (!(await endpointInput.isVisible({ timeout: 500 }).catch(() => false))) {
    await page.getByText('Advanced').click();
  }
  await endpointInput.fill(endpoint);
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
  // Remove webpack-dev-server overlay iframe that can intercept pointer events
  await page
    .evaluate(() => {
      const overlay = document.getElementById(
        'webpack-dev-server-client-overlay',
      );
      if (overlay) overlay.remove();
    })
    .catch(() => {});
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

export async function removeSearchButton(page: Page, folderName: string) {
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

export async function clearAllFilters(page: Page) {
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
export async function selectPropertyFilter(
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

  // Select the property option from the visible dropdown. Ant Design keeps
  // closed dropdowns mounted but hidden, so scope the option lookup to the
  // currently open popup to avoid clicking a stale/hidden orphan.
  await page
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
    .getByRole('option', { name: propertyName })
    .first()
    .click();

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
  // Use navigateTo for reliable navigation regardless of current page state
  await navigateTo(page, 'data');
  await page.getByRole('tab', { name: statusTab }).click();
  await clearAllFilters(page);
  await selectPropertyFilter(page, 'Name', folderName);
  const cell = page
    .getByRole('cell', { name: `VFolder Identicon ${folderName}` })
    .filter({ hasText: folderName })
    .first();
  // Eventual consistency: the list may lag behind the mutation. Retry by
  // re-applying the filter up to 3 times with 10s windows before failing.
  let found = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await expect(cell).toBeVisible({ timeout: 10000 });
      found = true;
      break;
    } catch {
      await clearAllFilters(page);
      await page.waitForTimeout(500);
      await selectPropertyFilter(page, 'Name', folderName);
    }
  }
  if (!found) {
    await expect(cell).toBeVisible({ timeout: 10000 });
  }
  await removeSearchButton(page, folderName);
}

export async function createVFolderAndVerify(
  page: Page,
  folderName: string,
  usageMode: 'general' | 'model' = 'general',
  type: 'user' | 'project' = 'user',
  permission: 'rw' | 'ro' = 'rw',
) {
  await navigateTo(page, 'data');
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
  // Use navigateTo to ensure a clean navigation to the data page regardless of current state
  await navigateTo(page, 'data');
  await page.getByRole('tab', { name: 'Active' }).click();
  await selectPropertyFilter(page, 'Name', folderName);

  await page
    .getByRole('row', { name: `VFolder Identicon ${folderName}` })
    .getByRole('button', { name: 'trash bin' })
    .click();
  // The "Move to trash" confirmation modal uses a standardized "Confirm"
  // button (t('button.Confirm')) instead of "Move".
  const confirmButton = page
    .locator('.ant-modal-confirm')
    .getByRole('button', { name: 'Confirm' });
  await expect(confirmButton).toBeVisible();
  await confirmButton.click();
  await removeSearchButton(page, folderName);
  await verifyVFolder(page, folderName, 'Trash');
}

export async function deleteForeverAndVerifyFromTrash(
  page: Page,
  folderName: string,
) {
  // Use navigateTo to ensure a clean navigation to the data page regardless of current state
  await navigateTo(page, 'data');
  await page.getByRole('tab', { name: 'Trash' }).click();

  // Clear any existing filters before searching for the folder to delete
  await clearAllFilters(page);

  // Set filter to search by Name
  await selectPropertyFilter(page, 'Name', folderName);

  // Verify the folder row exists before attempting deletion
  const folderRowToDelete = page.getByRole('row', {
    name: `VFolder Identicon ${folderName}`,
  });

  await expect(folderRowToDelete).toBeVisible({ timeout: 15000 });

  // Wait for the "Delete forever" button to be enabled (status must be 'delete-pending').
  // After moving to trash, the folder may briefly show other statuses before becoming delete-pending.
  const deleteForeverButton = folderRowToDelete.getByRole('button').nth(1);
  await expect(deleteForeverButton).toBeEnabled({ timeout: 15000 });

  // Click the delete forever button
  await deleteForeverButton.click();

  // Wait for confirmation modal to appear before interacting with it.
  // Use fill() directly (it waits for actionability) to avoid flakiness from
  // click() on a modal still playing its open animation ("element is not stable").
  const confirmInput = page.locator('#confirmText');
  await expect(confirmInput).toBeVisible();
  await confirmInput.fill(folderName);
  await page.getByRole('button', { name: 'Delete forever' }).click();

  // Wait for the deletion success notification to appear.
  // This confirms the backend accepted the delete request.
  const deletionNotification = page.getByRole('alert').filter({
    hasText: /deleted forever/i,
  });
  await expect(deletionNotification).toBeVisible({ timeout: 15000 });
  await expect(deletionNotification).toBeHidden({ timeout: 15000 });

  // After the notification is hidden, verify the folder row is gone
  await clearAllFilters(page);
  await selectPropertyFilter(page, 'Name', folderName);
  const folderRowAfterDelete = page.getByRole('row').filter({
    has: page.getByRole('cell', { name: `VFolder Identicon ${folderName}` }),
  });
  await expect(folderRowAfterDelete).toBeHidden({ timeout: 30000 });

  // Clean up the search filter
  await removeSearchButton(page, folderName);
}

export async function shareVFolderAndVerify(
  page: Page,
  folderName: string,
  invitedUser: string,
) {
  await navigateTo(page, 'data');
  await selectPropertyFilter(page, 'Name', folderName);

  // Click the share button inside the BAINameActionCell of the folder row.
  // Action buttons (share/trash) are embedded in the Name cell; locate the
  // "share" button by its icon's aria-label rather than by td index.
  const folderRow = page.getByRole('row', {
    name: `VFolder Identicon ${folderName}`,
  });
  await expect(folderRow).toBeVisible({ timeout: 10000 });
  await folderRow.getByRole('button', { name: 'share' }).first().click();

  // Fill in invited user's email in the share modal
  const shareModal = page.locator('.ant-modal');
  await expect(shareModal).toBeVisible();
  await shareModal.getByRole('textbox').fill(invitedUser);
  await shareModal.getByRole('button', { name: 'Add' }).click();
  await shareModal.getByRole('button', { name: 'close' }).click();

  await removeSearchButton(page, folderName);
}

export async function acceptAllInvitationAndVerifySpecificFolder(
  page: Page,
  folderName: string,
) {
  // Open the FolderInvitationResponseModal directly via its query param.
  // The notification-based "See Detail" entry was replaced by an Invited
  // Folders badge + modal; using the query param avoids a brittle click path.
  await navigateTo(page, 'data');
  await page.evaluate(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('invitation', 'true');
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new PopStateEvent('popstate'));
  });

  const invitationModal = page.locator('.ant-modal').filter({
    has: page.getByRole('button', { name: /Accept/i }),
  });
  await expect(invitationModal.first()).toBeVisible({ timeout: 15000 });

  // Accept all pending invitations one by one. The list shrinks as each
  // acceptance resolves, and the clicked button detaches from the DOM mid-click,
  // so re-query each iteration and tolerate detach races.
  for (let i = 0; i < 20; i++) {
    const acceptButton = invitationModal
      .getByRole('button', { name: /Accept/i })
      .first();
    const visible = await acceptButton
      .isVisible({ timeout: 1000 })
      .catch(() => false);
    if (!visible) break;
    await acceptButton.click({ force: true }).catch(() => {});
    await page.waitForTimeout(800);
  }

  // Close the modal if still open
  await page
    .locator('.ant-modal')
    .getByRole('button', { name: /close|Cancel/i })
    .first()
    .click({ timeout: 2000 })
    .catch(() => {});

  // Verify the shared folder appears in the user's data page
  await navigateTo(page, 'data');
  await page.getByRole('tab', { name: 'Active' }).click();
  await selectPropertyFilter(page, 'Name', folderName);
  // Shared folders appear as a row in the table - look for the folder name in any table cell
  await expect(
    page.locator('tbody tr').filter({ hasText: folderName }),
  ).toBeVisible({ timeout: 15000 });
  await removeSearchButton(page, folderName);
}

export async function restoreVFolderAndVerify(page: Page, folderName: string) {
  await navigateTo(page, 'data');
  await page.getByRole('tab', { name: 'Trash' }).click();

  // Clear any existing filters before searching
  await clearAllFilters(page);
  await selectPropertyFilter(page, 'Name', folderName);

  // Find the folder row and click the Restore button (first action button)
  const folderRowToRestore = page.getByRole('row', {
    name: `VFolder Identicon ${folderName}`,
  });
  await expect(folderRowToRestore).toBeVisible({ timeout: 10000 });
  await folderRowToRestore.getByRole('button').first().click();
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
 * Convert a config object to TOML string that is compatible with the app's TOML parser.
 *
 * The app's preprocessToml processes apiEndpointText with JSON.parse, which keeps
 * the original value on failure (try/catch with no-op catch).
 *
 * Additionally, some TOML serializers emit underscore-separated numbers
 * (e.g., 4_294_967_296) which may be parsed as strings instead of numbers.
 *
 * This function uses @iarna/toml stringify and post-processes the output to:
 * 1. Remove lines with empty string values (the app treats missing keys as empty)
 * 2. Remove underscore separators from numbers
 */
function tomlStringifyCompatible(config: any): string {
  let tomlStr = TOML.stringify(config);

  // Fix 1: Remove lines with empty string values `= ""`
  // The app treats undefined/missing the same as empty string for most fields
  tomlStr = tomlStr.replace(/^.+ = ""\s*$/gm, '');

  // Fix 2: Remove underscore separators from large numbers
  // Some serializers emit `4_294_967_296` which may be parsed as a string
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

/**
 * Deduplicate keys within each TOML section.
 *
 * @iarna/toml throws on duplicate keys, but config.toml files in some
 * environments contain duplicate keys (e.g., `debug = true` appearing twice).
 * This function removes earlier occurrences, keeping the last value for each key
 * within each section, matching the last-wins behavior of most TOML parsers.
 */
function deduplicateTomlKeys(tomlStr: string): string {
  const lines = tomlStr.split('\n');
  const sections: string[][] = [];
  let currentSection: string[] = [];

  // Split the TOML content into sections delimited by [header] lines
  for (const line of lines) {
    if (/^\[/.test(line.trim())) {
      sections.push(currentSection);
      currentSection = [line];
    } else {
      currentSection.push(line);
    }
  }
  sections.push(currentSection);

  // Deduplicate keys within each section, keeping the last occurrence
  const deduped = sections.map((sectionLines) => {
    const seenKeys = new Set<string>();
    const reversed = [...sectionLines].reverse();
    const kept = reversed.filter((line) => {
      const match = /^(\w[\w-]*)(\s*=)/.exec(line.trim());
      if (!match) return true; // Keep non-key lines (headers, comments, blanks)
      const key = match[1];
      if (seenKeys.has(key)) return false; // Duplicate – drop this earlier occurrence
      seenKeys.add(key);
      return true;
    });
    return kept.reverse().join('\n');
  });

  return deduped.join('\n');
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
        // Deduplicate keys within each TOML section before parsing.
        // @iarna/toml throws on duplicate keys; the production app (smol-toml) may not.
        // When duplicate keys exist in config.toml, keep the last occurrence of each key.
        const deduplicatedToml = deduplicateTomlKeys(configToml);
        config = TOML.parse(deduplicatedToml);
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
      // Fallback: use an empty config object so the requested changes can still be
      // applied and served via route interception. This makes login resilient when
      // the server cannot be reached at the configured webuiEndpoint (e.g., when
      // running tests via the Playwright MCP tool without the env var set).
      console.warn(
        `Failed to fetch config.toml from ${webuiEndpoint} after ${maxRetries} attempts: ${lastError}. ` +
          `Using empty base config — only explicitly requested keys will be set.`,
      );
      config = {};
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
