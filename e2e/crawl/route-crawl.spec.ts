// spec: e2e/.agent-output/test-plan-route-crawl.md
// scenarios: 1 (Admin Route Crawl - Operations), 2 (Infrastructure), 3 (System),
//            4 (Common Route Crawl - Admin Session), 5 (Common Route Crawl - User Session),
//            6 (Sidebar Route Visibility Differs by Role), 7 (Admin-Only Route Access Control)
//
// Read-only smoke crawl: every top-level route reachable from the sidebar is
// visited and checked for (a) its documented landmark rendering and (b) the
// absence of unexpected console errors / uncaught page errors / failed
// (>=400) network responses. No resources are created, modified, or deleted.
import {
  loginAsAdmin,
  loginAsUser,
  navigateTo,
  webuiEndpoint,
} from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

// Routes noted in the test plan as slow to hydrate on the QA264 cluster
// (5-15s of real wall-clock time before their landmark renders). Everything
// else uses DEFAULT_LANDMARK_TIMEOUT.
//
// Both tiers were bumped up from an original 10s/15s split after observing
// (via repeated isolated runs, not just parallel-worker contention) that
// routes *not* on the "slow" list - e.g. /start, /data, /credential - can
// also take just over 10s to render past a full page reload (navigateTo
// does a full `page.goto`, so every route pays a full app-boot cost against
// the shared QA server). 20s/30s keeps the same relative "default vs slow"
// tiering while giving realistic headroom instead of chasing individual
// routes into the slow list one at a time.
const DEFAULT_LANDMARK_TIMEOUT = 20_000;
const SLOW_LANDMARK_TIMEOUT = 30_000;

/**
 * Known console-error / failed-request patterns that fire on nearly every
 * route in this crawl, independent of the page under test. See
 * e2e/.agent-output/test-plan-route-crawl.md ("Known console-error patterns
 * to ignore during the crawl") for the full investigation. Filtering these
 * out first is required, or every scenario in the crawl fails unconditionally.
 */
const IGNORED_URL_SUBSTRINGS = [
  // Looks like a periodic/background 2FA-status poll; fires repeatedly on
  // every route regardless of which page is active.
  '/func/totp',
  // Fires on any route that renders a resource-usage widget (Dashboard,
  // Sessions list, Session Launcher); unrelated to the specific route.
  '/func/resource/check-presets',
];

// QA-cluster TLS certificate mismatch on the per-endpoint wildcard subdomain
// (`*.inference.qa264.test.backend.ai`) - only fires on /chat when an
// inference endpoint is selected. Not a WebUI regression.
const IGNORED_CONSOLE_PATTERNS = [/ERR_CERT_COMMON_NAME_INVALID/];

function isIgnoredUrl(url: string): boolean {
  return IGNORED_URL_SUBSTRINGS.some((substring) => url.includes(substring));
}

/**
 * Attach console/pageerror/response listeners to `page` and return the
 * accumulated arrays. Must be called before any navigation the caller wants
 * covered by the assertion.
 */
function collectPageIssues(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedResponses: Array<{ url: string; status: number }> = [];

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    // Browser-generated "Failed to load resource" messages never include the
    // failing URL in msg.text() (it's always the same generic string) - the
    // URL only lives on msg.location().url. Confirmed against this cluster:
    // logging both side by side showed text() constant across /func/totp and
    // /func/resource/check-presets hits, while location().url varied per hit.
    if (isIgnoredUrl(msg.location().url)) return;
    if (IGNORED_CONSOLE_PATTERNS.some((pattern) => pattern.test(text))) return;
    consoleErrors.push(text);
  });
  page.on('pageerror', (err) => {
    pageErrors.push(`${err.message}\n${err.stack ?? ''}`);
  });
  page.on('response', (resp) => {
    if (resp.status() < 400) return;
    if (isIgnoredUrl(resp.url())) return;
    failedResponses.push({ url: resp.url(), status: resp.status() });
  });

  return { consoleErrors, pageErrors, failedResponses };
}

function assertNoUnexpectedPageIssues(
  issues: ReturnType<typeof collectPageIssues>,
  context: string,
) {
  expect(
    issues.consoleErrors,
    `no unexpected console errors ${context}`,
  ).toEqual([]);
  expect(issues.pageErrors, `no uncaught page errors ${context}`).toEqual([]);
  expect(
    issues.failedResponses,
    `no unexpected failed network requests ${context}`,
  ).toEqual([]);
}

// Breadcrumb text is the most reliable per-route landmark: it renders with
// the route's main content, not with the sidebar (which renders
// immediately). See e2e/auth/login.spec.ts and e2e/agent/agent.spec.ts for
// the same `webui-breadcrumb` testid pattern used throughout the suite.
async function expectBreadcrumb(
  page: Page,
  text: string,
  timeout: number = DEFAULT_LANDMARK_TIMEOUT,
) {
  await expect(
    page.getByTestId('webui-breadcrumb').getByText(text),
  ).toBeVisible({ timeout });
}

interface RouteLandmark {
  /** Manifest id from the test plan, e.g. 'A1' or 'C2' */
  id: string;
  /** Path passed to navigateTo (no leading slash, per project convention) */
  path: string;
  /** Human-readable description of the route's landmark(s), for traceability */
  description: string;
  /** Waits for and asserts the route's breadcrumb + structural landmark(s) */
  verifyLandmark: (page: Page) => Promise<void>;
}

// Admin-only routes reachable via the "Admin Settings" nested sidebar
// (superadmin/admin only). Order matches the plan's Operations >
// Infrastructure > System section grouping.
const ADMIN_ONLY_ROUTES: RouteLandmark[] = [
  {
    id: 'A1',
    path: 'credential',
    description: 'Users — Users tab (selected) and user table',
    verifyLandmark: async (page) => {
      await expectBreadcrumb(page, 'User Credentials & Policies');
      await expect(
        page.getByRole('tab', { name: 'Users', selected: true }),
      ).toBeVisible({ timeout: DEFAULT_LANDMARK_TIMEOUT });
      await expect(page.getByRole('table')).toBeVisible({
        timeout: DEFAULT_LANDMARK_TIMEOUT,
      });
    },
  },
  {
    id: 'A2',
    path: 'project',
    description: 'Projects — Projects tab and project table',
    verifyLandmark: async (page) => {
      await expectBreadcrumb(page, 'Projects');
      await expect(page.getByRole('tab', { name: 'Projects' })).toBeVisible({
        timeout: DEFAULT_LANDMARK_TIMEOUT,
      });
      await expect(page.getByRole('table')).toBeVisible({
        timeout: DEFAULT_LANDMARK_TIMEOUT,
      });
    },
  },
  {
    id: 'A3',
    path: 'admin-data',
    description: 'Data — Active tab and org-wide folder table',
    verifyLandmark: async (page) => {
      await expectBreadcrumb(page, 'Data');
      await expect(page.getByRole('tab', { name: /^Active/ })).toBeVisible({
        timeout: DEFAULT_LANDMARK_TIMEOUT,
      });
      await expect(page.getByRole('table')).toBeVisible({
        timeout: DEFAULT_LANDMARK_TIMEOUT,
      });
    },
  },
  {
    id: 'A4',
    path: 'admin-session',
    description: 'Sessions — session-type tablist "All" tab (slow to hydrate)',
    verifyLandmark: async (page) => {
      await expectBreadcrumb(page, 'Sessions', SLOW_LANDMARK_TIMEOUT);
      await expect(page.getByRole('tab', { name: 'All' })).toBeVisible({
        timeout: SLOW_LANDMARK_TIMEOUT,
      });
    },
  },
  {
    id: 'A5',
    path: 'admin-deployments',
    description:
      'Deployments — breadcrumb reads "Serving" (differs from sidebar label)',
    verifyLandmark: async (page) => {
      await expectBreadcrumb(page, 'Serving');
      await expect(
        page.getByRole('tab', { name: 'Deployments', selected: true }),
      ).toBeVisible({ timeout: DEFAULT_LANDMARK_TIMEOUT });
    },
  },
  {
    id: 'A6',
    path: 'environment',
    description: 'Environments — Images tab (selected) and image table',
    verifyLandmark: async (page) => {
      await expectBreadcrumb(page, 'Environments');
      await expect(
        page.getByRole('tab', { name: 'Images', selected: true }),
      ).toBeVisible({ timeout: DEFAULT_LANDMARK_TIMEOUT });
      await expect(page.getByRole('table')).toBeVisible({
        timeout: DEFAULT_LANDMARK_TIMEOUT,
      });
    },
  },
  {
    id: 'A7',
    path: 'scheduler',
    description:
      'Scheduler — Fair Share Setting tab and fair-share table (slow to hydrate)',
    verifyLandmark: async (page) => {
      await expectBreadcrumb(page, 'Scheduler', SLOW_LANDMARK_TIMEOUT);
      await expect(
        page.getByRole('tab', { name: 'Fair Share Setting' }),
      ).toBeVisible({ timeout: SLOW_LANDMARK_TIMEOUT });
    },
  },
  {
    id: 'A8',
    path: 'resource-policy',
    description: 'Resource Policies — Keypair Resource Policy tab (selected)',
    verifyLandmark: async (page) => {
      await expectBreadcrumb(page, 'Resource Policies');
      await expect(
        page.getByRole('tab', {
          name: 'Keypair Resource Policy',
          selected: true,
        }),
      ).toBeVisible({ timeout: DEFAULT_LANDMARK_TIMEOUT });
    },
  },
  {
    id: 'A9',
    path: 'agent',
    description:
      'Resources — Agent tab (selected) and agent table (slow to hydrate)',
    verifyLandmark: async (page) => {
      await expectBreadcrumb(page, 'Resources', SLOW_LANDMARK_TIMEOUT);
      await expect(
        page.getByRole('tab', { name: 'Agent', selected: true }),
      ).toBeVisible({ timeout: SLOW_LANDMARK_TIMEOUT });
      await expect(page.getByRole('table')).toBeVisible({
        timeout: SLOW_LANDMARK_TIMEOUT,
      });
    },
  },
  {
    id: 'A10',
    path: 'settings',
    description:
      'Configurations — "All (N)" tab selected by default (slow to hydrate)',
    verifyLandmark: async (page) => {
      await expectBreadcrumb(page, 'Configurations', SLOW_LANDMARK_TIMEOUT);
      await expect(page.getByRole('tab', { name: /^All/ })).toBeVisible({
        timeout: SLOW_LANDMARK_TIMEOUT,
      });
    },
  },
  {
    id: 'A11',
    path: 'maintenance',
    description:
      'Maintenance — Recalculate Usage / Rescan Images buttons, not clicked (slow to hydrate)',
    verifyLandmark: async (page) => {
      await expectBreadcrumb(page, 'Maintenance', SLOW_LANDMARK_TIMEOUT);
      await expect(
        page.getByRole('button', { name: 'Recalculate Usage' }),
      ).toBeVisible({ timeout: SLOW_LANDMARK_TIMEOUT });
      await expect(
        page.getByRole('button', { name: 'Rescan Images' }),
      ).toBeVisible({ timeout: SLOW_LANDMARK_TIMEOUT });
    },
  },
  {
    id: 'A12',
    path: 'diagnostics',
    description:
      'Diagnostics — Re-run Diagnostics button and Endpoint Connectivity health check',
    verifyLandmark: async (page) => {
      await expectBreadcrumb(page, 'Diagnostics');
      await expect(
        page.getByRole('button', { name: 'Re-run Diagnostics' }),
      ).toBeVisible({ timeout: DEFAULT_LANDMARK_TIMEOUT });
      await expect(page.getByText('API Endpoint Reachable')).toBeVisible({
        timeout: DEFAULT_LANDMARK_TIMEOUT,
      });
    },
  },
  {
    id: 'A13',
    path: 'rbac',
    description:
      'RBAC Management — Create Role button and role table (slowest route observed)',
    verifyLandmark: async (page) => {
      await expectBreadcrumb(page, 'RBAC Management', SLOW_LANDMARK_TIMEOUT);
      await expect(
        page.getByRole('button', { name: 'Create Role' }),
      ).toBeVisible({ timeout: SLOW_LANDMARK_TIMEOUT });
      await expect(page.getByRole('table')).toBeVisible({
        timeout: SLOW_LANDMARK_TIMEOUT,
      });
    },
  },
  {
    id: 'A14',
    path: 'branding',
    description:
      'Branding — view-only tabs and warning alert; Reset/edit never clicked (slow to hydrate)',
    verifyLandmark: async (page) => {
      await expectBreadcrumb(page, 'Branding', SLOW_LANDMARK_TIMEOUT);
      await expect(page.getByRole('tab', { name: /^All/ })).toBeVisible({
        timeout: SLOW_LANDMARK_TIMEOUT,
      });
      await expect(
        page.getByText('The updated theme cannot be applied immediately'),
      ).toBeVisible({ timeout: SLOW_LANDMARK_TIMEOUT });
    },
  },
  {
    id: 'A15',
    path: 'information',
    description: 'Information — Core/Security/Component/License sections',
    verifyLandmark: async (page) => {
      await expectBreadcrumb(page, 'Information');
      await expect(page.getByText('Manager version')).toBeVisible({
        timeout: DEFAULT_LANDMARK_TIMEOUT,
      });
    },
  },
];

// Common routes visible to both `admin` and `user` roles. `dashboardWidgetTitle`
// is parameterized because the session-count widget title differs by role
// ("Active Sessions" for admin, "My Sessions" for a regular user).
function getCommonRoutes(dashboardWidgetTitle: string): RouteLandmark[] {
  return [
    {
      id: 'C1',
      path: 'start',
      description:
        'Start — storage folder / interactive session / model service cards',
      verifyLandmark: async (page) => {
        await expectBreadcrumb(page, 'Start');
        await expect(page.getByText('Create New Storage Folder')).toBeVisible({
          timeout: DEFAULT_LANDMARK_TIMEOUT,
        });
        await expect(page.getByText('Start Interactive Session')).toBeVisible({
          timeout: DEFAULT_LANDMARK_TIMEOUT,
        });
        // Confirms `enableModelFolders` is enabled cluster-wide for this
        // account; do not assume this card is admin-only.
        await expect(page.getByText('Start Model Service')).toBeVisible({
          timeout: DEFAULT_LANDMARK_TIMEOUT,
        });
      },
    },
    {
      id: 'C2',
      path: 'dashboard',
      description: `Dashboard — "${dashboardWidgetTitle}" session-count widget (slow to hydrate: GraphQL-backed widget, observed ~12s on QA264)`,
      verifyLandmark: async (page) => {
        await expectBreadcrumb(page, 'Dashboard', SLOW_LANDMARK_TIMEOUT);
        await expect(
          page.getByRole('heading', { name: dashboardWidgetTitle }),
        ).toBeVisible({ timeout: SLOW_LANDMARK_TIMEOUT });
      },
    },
    {
      id: 'C3',
      path: 'data',
      description: 'Data — Create Folder button and Active tab',
      verifyLandmark: async (page) => {
        await expectBreadcrumb(page, 'Data');
        await expect(
          page.getByRole('button', { name: 'Create Folder' }).first(),
        ).toBeVisible({ timeout: DEFAULT_LANDMARK_TIMEOUT });
        await expect(page.getByRole('tab', { name: /^Active/ })).toBeVisible({
          timeout: DEFAULT_LANDMARK_TIMEOUT,
        });
      },
    },
    {
      id: 'C4',
      path: 'session',
      description:
        'Sessions — Start Session control and session-type tablist (slow to hydrate: "All" tab observed ~11s on QA264)',
      verifyLandmark: async (page) => {
        await expectBreadcrumb(page, 'Sessions', SLOW_LANDMARK_TIMEOUT);
        await expect(
          page
            .getByRole('button', { name: 'Start Session' })
            .or(page.getByRole('link', { name: 'Start Session' }))
            .first(),
        ).toBeVisible({ timeout: SLOW_LANDMARK_TIMEOUT });
        await expect(page.getByRole('tab', { name: 'All' })).toBeVisible({
          timeout: SLOW_LANDMARK_TIMEOUT,
        });
      },
    },
    {
      id: 'C5',
      path: 'my-environment',
      description: 'My Environments — Images tab and image table',
      verifyLandmark: async (page) => {
        await expectBreadcrumb(page, 'My Environments');
        await expect(page.getByRole('tab', { name: 'Images' })).toBeVisible({
          timeout: DEFAULT_LANDMARK_TIMEOUT,
        });
        await expect(page.getByRole('table')).toBeVisible({
          timeout: DEFAULT_LANDMARK_TIMEOUT,
        });
      },
    },
    {
      id: 'C6',
      path: 'chat',
      description:
        'Chat — message input placeholder (role/data-independent: the ' +
        '"Refresh Model Information" button only renders when the account ' +
        'has at least one visible deployed model endpoint, which a plain ' +
        'user account may not have; the message input renders regardless)',
      verifyLandmark: async (page) => {
        await expectBreadcrumb(page, 'Chat');
        await expect(
          page.getByPlaceholder('Type your message here...'),
        ).toBeVisible({ timeout: DEFAULT_LANDMARK_TIMEOUT });
      },
    },
    {
      id: 'C7',
      path: 'deployments',
      description: 'Deployments — Create Deployment button',
      verifyLandmark: async (page) => {
        await expectBreadcrumb(page, 'Deployments');
        await expect(
          page.getByRole('button', { name: 'Create Deployment' }),
        ).toBeVisible({ timeout: DEFAULT_LANDMARK_TIMEOUT });
      },
    },
    {
      id: 'C8',
      path: 'model-store',
      description: 'Model Store — Model Name filter (slow to hydrate)',
      verifyLandmark: async (page) => {
        await expectBreadcrumb(page, 'Model Store', SLOW_LANDMARK_TIMEOUT);
        await expect(page.getByText('Model Name')).toBeVisible({
          timeout: SLOW_LANDMARK_TIMEOUT,
        });
      },
    },
    {
      id: 'C9',
      path: 'statistics',
      description: 'Statistics — Allocation History tab',
      verifyLandmark: async (page) => {
        await expectBreadcrumb(page, 'Statistics');
        await expect(
          page.getByRole('tab', { name: 'Allocation History' }),
        ).toBeVisible({ timeout: DEFAULT_LANDMARK_TIMEOUT });
      },
    },
  ];
}

test.describe(
  'Route Crawl Smoke Test',
  { tag: ['@regression', '@route-crawl', '@functional'] },
  () => {
    // -----------------------------------------------------------------------
    // 1-4. Admin Route Crawl (Operations + Infrastructure + System + Common)
    // -----------------------------------------------------------------------
    test.describe('Admin Route Crawl', { tag: ['@admin', '@smoke'] }, () => {
      test('Admin can navigate through all admin-only routes without console errors', async ({
        page,
        request,
      }) => {
        // 1. Login as admin and open the "Admin Settings" entry from the sidebar
        await loginAsAdmin(page, request);
        await page.getByRole('menuitem', { name: 'Admin Settings' }).click();

        const issues = collectPageIssues(page);

        // 2-9. Crawl every Operations / Infrastructure / System admin-only
        // route, waiting for its breadcrumb and structural landmark(s).
        for (const route of ADMIN_ONLY_ROUTES) {
          // route.id — route.description
          await navigateTo(page, route.path);
          await route.verifyLandmark(page);
        }

        // 10. Assert zero unexpected console errors / failed responses across the crawl
        assertNoUnexpectedPageIssues(issues, 'during admin-only route crawl');
      });

      test('Admin can navigate through all common workspace routes without console errors', async ({
        page,
        request,
      }) => {
        // 1. Login as admin
        await loginAsAdmin(page, request);

        const issues = collectPageIssues(page);

        // 2-9. Crawl every common workspace route as an admin session; the
        // session-count widget on /dashboard is titled "Active Sessions" for this role.
        for (const route of getCommonRoutes('Active Sessions')) {
          // route.id — route.description
          await navigateTo(page, route.path);
          await route.verifyLandmark(page);
        }

        // 10. Assert zero unexpected console errors / failed responses across the crawl
        assertNoUnexpectedPageIssues(issues, 'during admin common-route crawl');
      });
    });

    // -----------------------------------------------------------------------
    // 5. Common Route Crawl (User Session)
    // -----------------------------------------------------------------------
    test.describe('User Route Crawl', { tag: ['@smoke'] }, () => {
      test('User can navigate through all common workspace routes without console errors', async ({
        page,
        request,
      }) => {
        // 1. Login as regular user
        await loginAsUser(page, request);

        const issues = collectPageIssues(page);

        // 2-9. Crawl every common workspace route as a regular-user session;
        // the session-count widget on /dashboard is titled "My Sessions" for this role.
        for (const route of getCommonRoutes('My Sessions')) {
          // route.id — route.description
          await navigateTo(page, route.path);
          await route.verifyLandmark(page);
        }

        // 10. Assert zero unexpected console errors / failed responses across the crawl
        assertNoUnexpectedPageIssues(issues, 'during user common-route crawl');
      });
    });

    // -----------------------------------------------------------------------
    // 6. Sidebar Route Visibility Differs by Role
    // -----------------------------------------------------------------------
    test.describe(
      'Sidebar Route Visibility Differs by Role',
      { tag: ['@access-control'] },
      () => {
        test('User cannot see the Admin Settings entry point in the sidebar', async ({
          page,
          request,
        }) => {
          // 1. Login as user@backend.ai
          await loginAsUser(page, request);

          // 2. Land on /start
          await navigateTo(page, 'start');
          await expectBreadcrumb(page, 'Start');

          // 3. Inspect the sidebar menu items
          const sidebarMenu = page.locator('aside').getByRole('menu');
          const commonMenuLabels = [
            'Start',
            'Dashboard',
            'Data',
            'Sessions',
            'My Environments',
            'Chat',
            'Deployments',
            'Model Store',
            'Statistics',
          ];
          for (const label of commonMenuLabels) {
            await expect(
              sidebarMenu.getByRole('menuitem', { name: label }),
            ).toBeVisible();
          }
          await expect(
            sidebarMenu.getByRole('menuitem', { name: 'Admin Settings' }),
          ).not.toBeVisible();
        });
      },
    );

    // -----------------------------------------------------------------------
    // 7. Admin-Only Route Access Control
    // -----------------------------------------------------------------------
    test.describe(
      'Admin-Only Route Access Control',
      { tag: ['@access-control', '@critical'] },
      () => {
        test('User sees an Unauthorized Access page when directly navigating to an admin-only route URL', async ({
          page,
          request,
        }) => {
          // 1. Login as user@backend.ai
          await loginAsUser(page, request);

          // 2. Navigate directly to the admin-only /credential URL (typed URL, not a sidebar click)
          await page.goto(`${webuiEndpoint}/credential`);

          // 3-4. Wait for the page to settle and inspect the rendered content.
          // Page401's <Typography.Title> wraps the text in a <Trans>
          // fragment, so it is not exposed as an accessible "heading" name;
          // match on the text itself, per e2e/config/page-access-control.spec.ts.
          await expect(page.getByText('Unauthorized Access')).toBeVisible({
            timeout: DEFAULT_LANDMARK_TIMEOUT,
          });
          await expect(
            page.getByText("You don't have permission to access this page."),
          ).toBeVisible();

          const goBackButton = page.getByRole('button', {
            name: 'Go back to the Start page',
          });
          await expect(goBackButton).toBeVisible();

          // The URL remains /credential - this is a client-side gate, not a server redirect
          expect(page.url()).toBe(`${webuiEndpoint}/credential`);

          // Clicking "Go back to the Start page" navigates to /start
          await goBackButton.click();
          await page.waitForURL(`${webuiEndpoint}/start`);
          await expectBreadcrumb(page, 'Start');
        });
      },
    );
  },
);
