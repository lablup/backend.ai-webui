// spec: e2e/401-404-Page-Handling-Test-Plan.md
// Tests for 401/404 page handling, blocklist, and inactiveList configurations
import {
  forbiddenPageHeading,
  loginAsAdmin,
  loginAsUser,
  modifyConfigToml,
  modifyThemeJson,
  notFoundPageHeading,
  webuiEndpoint,
} from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

/**
 * Locates a top-level sidebar nav item by its visible label.
 *
 * Astryx `SideNavItem` (to-astryx ticket 24, `react/src/components/BAIMenu.tsx`)
 * renders an enabled item as a real `<a>` (role "link") and a *disabled* item
 * as a `<button disabled>` (role "button") — see
 * `@astryxdesign/core/SideNav/SideNavItem.tsx`'s `NavItemElement`
 * (`if (href && !isDisabled) <a> else <button disabled>`). There is no single
 * ARIA role that covers both states (antd's old `role="menuitem"` no longer
 * exists), so this matches either role, scoped to the sidebar landmark
 * (`<nav aria-label="Side navigation">`) to avoid colliding with same-named
 * links elsewhere on the page (e.g. the breadcrumb).
 */
function getSideNavItem(
  page: Page,
  name: string | RegExp,
): ReturnType<Page['getByRole']> {
  const sideNav = page.getByRole('navigation', { name: 'Side navigation' });
  return sideNav
    .getByRole('link', { name, exact: typeof name === 'string' })
    .or(sideNav.getByRole('button', { name, exact: typeof name === 'string' }));
}

test.describe(
  'Page Access Control - Config-Based Menu Management',
  { tag: ['@critical', '@config', '@functional'] },
  () => {
    test.afterEach(async ({ page, request }) => {
      // Reset config after each test
      await modifyConfigToml(page, request, {
        menu: {
          blocklist: '',
          inactivelist: '',
        },
      });
    });

    test(
      'Superadmin sees 404 page when accessing blocklisted pages directly',
      { tag: ['@config', '@404'] },
      async ({ page, request }) => {
        // 1. Modify config.toml to set blocklist
        await modifyConfigToml(page, request, {
          menu: {
            blocklist: 'start,session',
            inactivelist: '',
          },
        });

        // 2. Login as superadmin user
        await loginAsAdmin(page, request);

        // 3. Verify "Start" menu item is not visible in sidebar
        await expect(
          page.getByRole('link', { name: 'Start', exact: true }),
        ).toBeHidden();

        // 4. Verify "Sessions" menu item is not visible in sidebar
        await expect(getSideNavItem(page, 'Sessions')).toBeHidden();

        // 5. Navigate directly to /session (legacy URL). The guard 404s the
        // blocklisted page at the legacy URL itself — no redirect happens,
        // so the URL stays /session while the 404 screen renders.
        await page.goto(`${webuiEndpoint}/session`);

        // 6. Verify the route-error 404 screen is displayed
        await expect(notFoundPageHeading(page)).toBeVisible({
          timeout: 15_000,
        });

        // 7. Resolve the project name via a NON-blocked shim (/dashboard
        // replace-redirects to /project/:name/dashboard), then enter the
        // canonical scope-aware session URL directly (no shim hop) — the
        // guard must 404 it identically to the legacy entry.
        await page.goto(`${webuiEndpoint}/dashboard`);
        await expect(page).toHaveURL(/\/project\/[^/]+\/dashboard/, {
          timeout: 15_000,
        });
        const projectName = new URL(page.url()).pathname.match(
          /^\/project\/([^/]+)\//,
        )?.[1];
        expect(projectName).toBeTruthy();
        await page.goto(`${webuiEndpoint}/project/${projectName}/session`);
        await expect(notFoundPageHeading(page)).toBeVisible({
          timeout: 15_000,
        });

        // 8. Navigate directly to /job (legacy alias for sessions)
        await page.goto(`${webuiEndpoint}/job`);

        // 9. Verify the route-error 404 screen is displayed
        await expect(notFoundPageHeading(page)).toBeVisible({
          timeout: 15_000,
        });
      },
    );

    test(
      'Superadmin sees pages in inactiveList as disabled in menu',
      { tag: ['@config', '@inactiveList'] },
      async ({ page, request }) => {
        // 1. Modify config.toml to set inactiveList
        await modifyConfigToml(page, request, {
          menu: {
            blocklist: '',
            inactivelist: 'dashboard',
          },
        });

        // 2. Login as superadmin user
        await loginAsAdmin(page, request);

        // 3. Verify "Dashboard" menu item is visible but has disabled attribute
        const dashboardMenuItem = getSideNavItem(page, 'Dashboard');
        await expect(dashboardMenuItem).toBeVisible();
        await expect(dashboardMenuItem).toBeDisabled();

        // 4. Click on disabled "Dashboard" menu item
        const currentUrl = page.url();
        await dashboardMenuItem.click({ force: true });

        // 5. Verify navigation does not occur (stays on current page)
        await expect(page).toHaveURL(currentUrl);

        // 6. Navigate directly to /dashboard via URL (legacy shim replace-redirects
        // to the canonical scope-aware path; the goto is a full app boot)
        await page.goto(`${webuiEndpoint}/dashboard`);

        // 7. Verify Dashboard page loads successfully (not 404)
        await expect(notFoundPageHeading(page)).toBeHidden();
        await expect(
          page.getByTestId('webui-breadcrumb').getByText('Dashboard'),
        ).toBeVisible({ timeout: 15_000 });
      },
    );

    test(
      'User is redirected to next available page when landing page is in inactiveList',
      { tag: ['@config', '@inactiveList', '@redirect'] },
      async ({ page, request }) => {
        // 1. Modify config.toml to set inactiveList with "start" (first menu item)
        await modifyConfigToml(page, request, {
          menu: {
            blocklist: '',
            inactivelist: 'start',
          },
        });

        // 2. Login as superadmin user
        await loginAsAdmin(page, request);

        // 3. Navigate to root / - currently redirects to /start even though it's inactive
        // NOTE: InactiveList only disables menu items but doesn't prevent direct access or redirect
        // This is expected behavior - inactive pages can still be accessed
        await page.goto(`${webuiEndpoint}/`);
        await page.waitForURL((url) => !url.pathname.endsWith('/'));

        // 4. Verify "Start" menu item appears disabled in sidebar
        const startMenuItem = getSideNavItem(page, /Start/);
        await expect(startMenuItem).toBeDisabled();

        // 5. Verify the page can still be accessed directly (inactive ≠
        // blocked): wait for real Start-page content — a missing 404 heading
        // alone would pass before the route resolves.
        await page.goto(`${webuiEndpoint}/start`);
        await expect(page.getByText('Start Interactive Session')).toBeVisible({
          timeout: 15_000,
        });
        await expect(notFoundPageHeading(page)).toBeHidden();
      },
    );

    test(
      'Configuration changes take effect after page reload',
      { tag: ['@config', '@inactiveList'] },
      async ({ page, request }) => {
        // 1. Modify config.toml to set inactiveList
        await modifyConfigToml(page, request, {
          menu: {
            blocklist: '',
            inactivelist: 'dashboard',
          },
        });

        // 2. Login as superadmin user
        await loginAsAdmin(page, request);

        // 3. Verify "Dashboard" menu item is disabled
        const dashboardMenuItem = getSideNavItem(page, 'Dashboard');
        await expect(dashboardMenuItem).toBeDisabled();

        // 4. Modify config.toml to clear inactiveList
        await modifyConfigToml(page, request, {
          menu: {
            blocklist: '',
            inactivelist: '',
          },
        });

        // 5. Reload page
        await page.reload();

        // 6. Verify "Dashboard" menu item is now active (no disabled attribute).
        // The reload is a full app boot against the remote backend, so wait
        // for the menu to re-render before asserting its state. Re-enabling
        // also flips the element from `<button disabled>` to `<a>` (see
        // `getSideNavItem`), which the `.or()` locator picks up live.
        await expect(dashboardMenuItem).toBeVisible({ timeout: 15_000 });
        await expect(dashboardMenuItem).not.toBeDisabled();

        // 7. Click "Dashboard" menu item
        await dashboardMenuItem.click();

        // 8. Verify navigation to Dashboard page succeeds
        await expect(
          page.getByTestId('webui-breadcrumb').getByText('Dashboard'),
        ).toBeVisible();
      },
    );
  },
);

// Not serial: tests are independent (each logs in fresh; afterEach resets config),
// so a failure doesn't cascade. mode: 'default' keeps them sequential on one worker
// because config.toml is server-global state.
test.describe(
  'Page Access Control - Permission-Based Access (401 Page)',
  { tag: ['@critical', '@config', '@functional'] },
  () => {
    test.describe.configure({ mode: 'default' });

    test.afterEach(async ({ page, request }) => {
      // Reset config after each test
      await modifyConfigToml(page, request, {
        menu: {
          blocklist: '',
          inactivelist: '',
        },
      });
    });

    test(
      'Regular user sees 401 page when accessing admin/superadmin pages',
      { tag: ['@401', '@permission'] },
      async ({ page, request }) => {
        // 1. Login as regular user (not admin/superadmin)
        await loginAsUser(page, request);

        // 2. Navigate directly to /credential (legacy URL; the shim
        // replace-redirects to the canonical /admin/users)
        await page.goto(`${webuiEndpoint}/credential`);

        // 3. Verify the forbidden (401) screen is displayed
        await expect(forbiddenPageHeading(page)).toBeVisible({
          timeout: 15_000,
        });

        // 4. Verify the forbidden screen shows its description copy
        await expect(
          page.getByText("You don't have permission to access this page."),
        ).toBeVisible();

        // 4b. Enter the canonical admin URL directly (no shim hop) — the
        // handle-declared access guard must forbid it identically.
        await expect(page).toHaveURL(/\/admin\/users/, { timeout: 15_000 });
        await page.goto(`${webuiEndpoint}/admin/users`);
        await expect(forbiddenPageHeading(page)).toBeVisible({
          timeout: 15_000,
        });

        // 5. Wait for "Go Back to" button to be visible and click it
        const goBackButton = page.getByRole('button', {
          name: /Go Back to|Go back to/,
        });
        await expect(goBackButton).toBeVisible();
        await goBackButton.click();

        // 6. Verify navigation to first available page
        await expect(forbiddenPageHeading(page)).toBeHidden();

        // 6b. Project-admin scope: enter the canonical project-admin URL for
        // the user's own project directly. The regular e2e user has no
        // project-admin RBAC role, so the URL-aware guard must forbid it.
        await expect(page).toHaveURL(/\/project\/[^/]+\//, {
          timeout: 15_000,
        });
        const projectName = new URL(page.url()).pathname.match(
          /^\/project\/([^/]+)\//,
        )?.[1];
        expect(projectName).toBeTruthy();
        await page.goto(`${webuiEndpoint}/project/${projectName}/admin/users`);
        await expect(forbiddenPageHeading(page)).toBeVisible({
          timeout: 15_000,
        });

        // 7. Navigate directly to /environment (admin page)
        await page.goto(`${webuiEndpoint}/environment`);

        // 8. Verify 401 page is displayed
        await expect(forbiddenPageHeading(page)).toBeVisible({
          timeout: 15_000,
        });

        // 9. Navigate directly to /agent (superadmin page)
        await page.goto(`${webuiEndpoint}/agent`);

        // 10. Verify 401 page is displayed
        await expect(forbiddenPageHeading(page)).toBeVisible({
          timeout: 15_000,
        });

        // 11. Navigate directly to /settings (superadmin page)
        await page.goto(`${webuiEndpoint}/settings`);

        // 12. Verify 401 page is displayed
        await expect(forbiddenPageHeading(page)).toBeVisible({
          timeout: 15_000,
        });
      },
    );

    test(
      'Superadmin user can access all pages without 401 error',
      { tag: ['@401', '@permission'] },
      async ({ page, request }) => {
        // 1. Login as superadmin user
        await loginAsAdmin(page, request);

        // Each page asserts positive content: the canonical URL settle plus a
        // visible breadcrumb. The breadcrumb is hidden on route-error screens,
        // so its presence proves a real page rendered — a missing forbidden
        // heading alone would pass before the suspended route resolves.
        const breadcrumb = page.getByTestId('webui-breadcrumb');

        // 2. Navigate to /credential (admin page; shim → /admin/users)
        await page.goto(`${webuiEndpoint}/credential`);

        // 3. Verify the page really renders (not 401)
        await expect(page).toHaveURL(/\/admin\/users/, { timeout: 15_000 });
        await expect(breadcrumb).toBeVisible({ timeout: 15_000 });
        await expect(forbiddenPageHeading(page)).toBeHidden();

        // 4. Navigate to /environment (admin page; shim → /admin/environment)
        await page.goto(`${webuiEndpoint}/environment`);

        // 5. Verify the page really renders (not 401)
        await expect(page).toHaveURL(/\/admin\/environment/, {
          timeout: 15_000,
        });
        await expect(breadcrumb).toBeVisible({ timeout: 15_000 });
        await expect(forbiddenPageHeading(page)).toBeHidden();

        // 6. Navigate to /agent (superadmin page; shim → /admin/agent)
        await page.goto(`${webuiEndpoint}/agent`);

        // 7. Verify the page really renders (not 401)
        await expect(page).toHaveURL(/\/admin\/agent/, { timeout: 15_000 });
        await expect(breadcrumb).toBeVisible({ timeout: 15_000 });
        await expect(forbiddenPageHeading(page)).toBeHidden();

        // 8. Navigate to /settings (superadmin page; shim → /admin/settings)
        await page.goto(`${webuiEndpoint}/settings`);

        // 9. Verify the page really renders (not 401)
        await expect(page).toHaveURL(/\/admin\/settings/, {
          timeout: 15_000,
        });
        await expect(breadcrumb).toBeVisible({ timeout: 15_000 });
        await expect(forbiddenPageHeading(page)).toBeHidden();

        // 10. Navigate to /maintenance (superadmin page; shim → /admin/maintenance)
        await page.goto(`${webuiEndpoint}/maintenance`);

        // 11. Verify the page really renders (not 401)
        await expect(page).toHaveURL(/\/admin\/maintenance/, {
          timeout: 15_000,
        });
        await expect(breadcrumb).toBeVisible({ timeout: 15_000 });
        await expect(forbiddenPageHeading(page)).toBeHidden();
      },
    );
  },
);

// Not serial: tests are independent (each sets its own config; afterEach resets),
// so a failure doesn't cascade. mode: 'default' keeps them sequential on one worker
// because config.toml is server-global state.
test.describe(
  'Page Access Control - Not Found Page (404)',
  { tag: ['@critical', '@config', '@functional'] },
  () => {
    test.describe.configure({ mode: 'default' });

    test.afterEach(async ({ page, request }) => {
      // Reset config after each test
      await modifyConfigToml(page, request, {
        menu: {
          blocklist: '',
          inactivelist: '',
        },
      });
    });

    test(
      'User sees 404 page when accessing non-existent routes',
      { tag: ['@404'] },
      async ({ page, request }) => {
        // 1. Login as superadmin user
        await loginAsAdmin(page, request);

        // 2. Navigate to /nonexistent (invalid route)
        await page.goto(`${webuiEndpoint}/nonexistent`);

        // 3. Verify the route-error 404 screen is displayed
        await expect(notFoundPageHeading(page)).toBeVisible({
          timeout: 15_000,
        });

        // 4. Verify the 404 screen shows its description copy
        await expect(
          page.getByText(
            'Sorry, the page you are looking for could not be found.',
          ),
        ).toBeVisible();

        // 5. Wait for "Go Back to" button to be visible and click it
        const goBackButton = page.getByRole('button', {
          name: /Go Back to|Go back to/,
        });
        await expect(goBackButton).toBeVisible();
        await goBackButton.click();

        // 6. Verify navigation to first available page
        await expect(notFoundPageHeading(page)).toBeHidden();

        // 7. Navigate to /invalid-page
        await page.goto(`${webuiEndpoint}/invalid-page`);

        // 8. Verify 404 page is displayed
        await expect(notFoundPageHeading(page)).toBeVisible({
          timeout: 15_000,
        });

        // 9. Navigate to /random-route-123
        await page.goto(`${webuiEndpoint}/random-route-123`);

        // 10. Verify 404 page is displayed
        await expect(notFoundPageHeading(page)).toBeVisible({
          timeout: 15_000,
        });
      },
    );

    test(
      'User sees 404 page when accessing blocklisted pages',
      { tag: ['@404', '@blocklist'] },
      async ({ page, request }) => {
        // Root redirect skips blocked pages since FR-3279: `/` redirects to the
        // first menu item that survives blocklist filtering.
        // 1. Modify config.toml to set blocklist
        await modifyConfigToml(page, request, {
          menu: {
            blocklist: 'start',
            inactivelist: '',
          },
        });

        await modifyThemeJson(page, request, {
          logo: {
            href: undefined,
          },
        });

        // 2. Login as superadmin user
        await loginAsAdmin(page, request);

        // 3. Navigate directly to /start
        await page.goto(`${webuiEndpoint}/start`);

        // 4. Verify 404 page is displayed (not 401)
        await expect(notFoundPageHeading(page)).toBeVisible({
          timeout: 15_000,
        });
        await expect(forbiddenPageHeading(page)).toBeHidden();

        // 5. Navigate to root /
        await page.goto(`${webuiEndpoint}/`);

        // 6. Verify user is redirected to first available menu item (not /start since it's blocked)
        await page.waitForURL((url) => !url.pathname.endsWith('/'));
        expect(page.url()).not.toContain('/start');
      },
    );

    test(
      'User sees 404 page when accessing a blocklisted project-admin page',
      { tag: ['@404', '@blocklist', '@project-admin'] },
      async ({ page, request }) => {
        // Blocklist keys stay the legacy menu keys (FR-3383), so the
        // project-admin Users page is still blocked via `project-admin-users`.
        // 1. Modify config.toml to blocklist the project-admin Users page
        await modifyConfigToml(page, request, {
          menu: {
            blocklist: 'project-admin-users',
            inactivelist: '',
          },
        });

        // 2. Login as superadmin user (has project-admin access everywhere,
        // so a 404 here proves the blocklist, not a missing permission)
        await loginAsAdmin(page, request);

        // 3. Resolve the current project name via the /start shim redirect
        // (the post-login landing page is not guaranteed to be project-scoped)
        await page.goto(`${webuiEndpoint}/start`);
        await expect(page).toHaveURL(/\/project\/[^/]+\/start/, {
          timeout: 15_000,
        });
        const projectName = new URL(page.url()).pathname.match(
          /^\/project\/([^/]+)\//,
        )?.[1];
        expect(projectName).toBeTruthy();

        // 4. Enter the canonical project-admin URL directly (no shim hop)
        await page.goto(`${webuiEndpoint}/project/${projectName}/admin/users`);

        // 5. Verify the route-error 404 screen is displayed (not 401)
        await expect(notFoundPageHeading(page)).toBeVisible({
          timeout: 15_000,
        });
        await expect(forbiddenPageHeading(page)).toBeHidden();

        // 6. Enter via the legacy shim URL as well — same 404
        await page.goto(`${webuiEndpoint}/project-admin-users`);
        await expect(notFoundPageHeading(page)).toBeVisible({
          timeout: 15_000,
        });
      },
    );
  },
);

// Not serial: single test — no ordering dependency. mode: 'default' keeps any
// future tests sequential on one worker because config.toml is server-global state.
test.describe(
  'Page Access Control - Root Redirect with Configuration',
  { tag: ['@critical', '@config', '@functional'] },
  () => {
    test.describe.configure({ mode: 'default' });

    test.afterEach(async ({ page, request }) => {
      // Reset config after each test
      await modifyConfigToml(page, request, {
        menu: {
          blocklist: '',
          inactivelist: '',
        },
      });
    });

    test(
      'User is redirected to first available page when accessing root with blocklist',
      { tag: ['@redirect', '@blocklist'] },
      async ({ page, request }) => {
        // Root redirect skips blocked pages since FR-3279: `/` redirects to the
        // first menu item that survives blocklist filtering.
        // 1. Modify config.toml to set blocklist = "start" and clear inactiveList
        await modifyConfigToml(page, request, {
          menu: {
            blocklist: 'start',
            inactivelist: '',
          },
        });
        await modifyThemeJson(page, request, {
          logo: {
            href: undefined,
          },
        });

        // 2. Login as superadmin user
        await loginAsAdmin(page, request);

        // 3. Navigate to root / to trigger redirect to first available page
        await page.goto(`${webuiEndpoint}/`);

        // 4. Verify user is redirected to first available page (not /start)
        await page.waitForURL((url) => !url.pathname.endsWith('/'));
        expect(page.url()).not.toContain('/start');

        // 5. Modify config.toml to set blocklist = "start,dashboard,job"
        await modifyConfigToml(page, request, {
          menu: {
            blocklist: 'start,dashboard,job',
            inactivelist: '',
          },
        });

        // 6. Reload page
        await page.reload();

        // 7. Navigate to root /
        await page.goto(`${webuiEndpoint}/`);

        // 8. Verify user is redirected to next available page
        await page.waitForURL((url) => !url.pathname.endsWith('/'));
        expect(page.url()).not.toContain('/start');
        expect(page.url()).not.toContain('/dashboard');
        expect(page.url()).not.toContain('/job');
      },
    );
  },
);

// Not serial: tests are independent (each sets its own config; afterEach resets),
// so a failure doesn't cascade. mode: 'default' keeps them sequential on one worker
// because config.toml is server-global state.
test.describe(
  'Page Access Control - Combined Scenarios (blocklist + inactiveList)',
  { tag: ['@critical', '@config', '@functional'] },
  () => {
    test.describe.configure({ mode: 'default' });

    test.afterEach(async ({ page, request }) => {
      // Reset config after each test
      await modifyConfigToml(page, request, {
        menu: {
          blocklist: '',
          inactivelist: '',
        },
      });
    });

    test(
      'User sees correct behavior when both blocklist and inactiveList are configured',
      { tag: ['@config', '@blocklist', '@inactiveList'] },
      async ({ page, request }) => {
        // Root redirect skips blocked pages since FR-3279 (inactive pages stay
        // reachable by design - inactive only greys the menu entry).
        // 1. Modify config.toml with both blocklist and inactiveList
        await modifyConfigToml(page, request, {
          menu: {
            blocklist: 'start',
            inactivelist: 'dashboard,my-environment',
          },
        });

        await modifyThemeJson(page, request, {
          logo: {
            href: undefined,
          },
        });

        // 2. Login as superadmin user
        await loginAsAdmin(page, request);

        // 3. Verify "Start" menu item is hidden
        await expect(
          page.getByRole('link', { name: 'Start', exact: true }),
        ).toBeHidden();

        // 4. Verify "Dashboard" menu item is disabled
        const dashboardMenuItem = getSideNavItem(page, 'Dashboard');
        await expect(dashboardMenuItem).toBeVisible();
        await expect(dashboardMenuItem).toBeDisabled();

        // 5. Navigate to /start
        await page.goto(`${webuiEndpoint}/start`);

        // 6. Verify 404 page is displayed (blocked)
        await expect(notFoundPageHeading(page)).toBeVisible({
          timeout: 15_000,
        });

        // 7. Navigate to /dashboard
        await page.goto(`${webuiEndpoint}/dashboard`);

        // 8. Verify Dashboard page loads successfully (inactive but accessible).
        // `/dashboard` is a legacy shim that replace-redirects to the canonical
        // scope-aware path, so wait for the redirect to settle before reading
        // the URL — capturing it mid-redirect would compare against a stale URL.
        await expect(page).toHaveURL(/\/project\/[^/]+\/dashboard/, {
          timeout: 15_000,
        });
        await expect(
          page.getByTestId('webui-breadcrumb').getByText('Dashboard'),
        ).toBeVisible({ timeout: 15_000 });
        await expect(notFoundPageHeading(page)).toBeHidden();

        // 9. Click disabled "Dashboard" menu item
        const currentUrl = page.url();
        await dashboardMenuItem.click({ force: true });

        // 10. Verify no navigation occurs
        await expect(page).toHaveURL(currentUrl);

        // 11. Navigate to root / to trigger redirect
        await page.goto(`${webuiEndpoint}/`);

        // 12. Verify user is redirected to first active, non-blocked page
        await page.waitForURL((url) => !url.pathname.endsWith('/'));
        expect(page.url()).not.toContain('/start');
        expect(page.url()).not.toContain('/dashboard');
      },
    );

    test(
      'Configuration can be cleared to restore normal behavior',
      { tag: ['@config', '@blocklist', '@inactiveList'] },
      async ({ page, request }) => {
        // 1. Modify config.toml with both blocklist and inactiveList
        await modifyConfigToml(page, request, {
          menu: {
            blocklist: 'start',
            inactivelist: 'dashboard',
          },
        });
        await modifyThemeJson(page, request, {
          logo: {
            href: undefined,
          },
        });

        // 2. Login as superadmin user
        await loginAsAdmin(page, request);

        // 3. Verify "Start" is hidden
        await expect(
          page.getByRole('link', { name: 'Start', exact: true }),
        ).toBeHidden();

        // 4. Verify "Dashboard" is disabled
        const dashboardMenuItem = getSideNavItem(page, 'Dashboard');
        await expect(dashboardMenuItem).toBeDisabled();

        // 5. Modify config.toml to clear both
        await modifyConfigToml(page, request, {
          menu: {
            blocklist: '',
            inactivelist: '',
          },
        });

        // 6. Reload page
        await page.reload();

        // 7. Verify "Start" menu item is now visible (the reload is a full
        // app boot, so wait for the menu to re-render)
        await expect(
          page.getByRole('link', { name: 'Start', exact: true }),
        ).toBeVisible({ timeout: 15_000 });

        // 8. Verify "Dashboard" menu item is now active (not disabled)
        await expect(dashboardMenuItem).not.toBeDisabled();

        // 9. Navigate to /start
        await page.goto(`${webuiEndpoint}/start`);

        // 10. Verify Start page loads successfully (not 404): wait for real
        // Start-page content — a missing 404 heading alone would pass before
        // the route resolves.
        await expect(page.getByText('Start Interactive Session')).toBeVisible({
          timeout: 15_000,
        });
        await expect(notFoundPageHeading(page)).toBeHidden();
      },
    );
  },
);
