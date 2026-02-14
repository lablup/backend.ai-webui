/**
 * Mock API orchestrator for Playwright-based testing without a Backend.AI cluster.
 *
 * Uses Playwright's `page.route()` network interception to mock all REST and
 * GraphQL endpoints that the app calls during login and dashboard rendering.
 *
 * Architecture:
 * ┌──────────────────────────────────────────────────────┐
 * │  Browser (Playwright)                                │
 * │                                                      │
 * │  WebUI app  ─── fetch() ──→  page.route() intercept  │
 * │                                ↓                      │
 * │                          Mock fixtures returned       │
 * └──────────────────────────────────────────────────────┘
 *
 * URL routing in session mode:
 * - /server/*  → endpoint/server/*          (login endpoints)
 * - /*         → endpoint/func/*            (GraphQL, REST APIs)
 * - GET /      → endpoint/func/             (server version)
 *
 * IMPORTANT: Playwright matches routes in reverse registration order (LIFO).
 * We use a single route handler with URL-based dispatch to avoid ordering issues.
 */
import { modifyConfigToml, webuiEndpoint } from '../utils/test-util';
import { getDashboardQueryResponse } from './fixtures/graphql/dashboard-queries';
import {
  getGroupListResponse,
  getScalingGroupResponse,
  getUserResourcePolicyResponse,
  getUserResponse,
  getVFolderHostsResponse,
} from './fixtures/graphql/login-flow-queries';
import {
  getLoginCheckResponse,
  getLoginResponse,
  logoutResponse,
  type MockRole,
} from './fixtures/login-responses';
import {
  getServerVersionResponse,
  resourceSlotsResponse,
} from './fixtures/server-info';
import { APIRequestContext, Page, Route } from '@playwright/test';

// The mock backend endpoint that the app will be configured to talk to.
// This URL never actually resolves - Playwright intercepts all requests.
const MOCK_ENDPOINT = 'http://mock-backend:8090';

const MOCK_USER_UUID = 'mock-user-uuid-0001';
const MOCK_GROUP_ID = 'mock-group-id-0001';

/**
 * Set up all mock API route interceptors on the given page.
 *
 * Uses a single catch-all route handler that dispatches based on URL path
 * and HTTP method. This avoids Playwright's LIFO route matching pitfalls.
 */
export async function setupMockApi(
  page: Page,
  request: APIRequestContext,
  options: { role?: MockRole } = {},
): Promise<void> {
  const role = options.role ?? 'user';

  // Override config.toml to use session mode with our mock endpoint
  await modifyConfigToml(page, request, {
    general: {
      connectionMode: 'SESSION',
      apiEndpoint: '',
    },
  });

  // Reset login state for this test
  hasLoggedIn = false;

  // Single route handler for ALL requests to the mock endpoint.
  // URL dispatch logic is inside the handler.
  await page.route(`${MOCK_ENDPOINT}/**`, (route) =>
    handleMockRoute(route, role),
  );

  // Also handle the exact root (without trailing path)
  await page.route(MOCK_ENDPOINT, (route) => handleMockRoute(route, role));
}

/**
 * Central route dispatcher for all mock endpoint requests.
 *
 * Uses `hasLoggedIn` to track whether `/server/login` has been called.
 * The initial `/server/login-check` (on page load) must return `false`,
 * otherwise the app will try to auto-login before the user clicks Login.
 */
let hasLoggedIn = false;

async function handleMockRoute(route: Route, role: MockRole): Promise<void> {
  const request = route.request();
  const url = new URL(request.url());
  const method = request.method();
  const path = url.pathname;

  // --- REST: Login endpoints (no /func prefix) ---

  if (path === '/server/login' && method === 'POST') {
    hasLoggedIn = true;
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'X-BackendAI-SessionID': 'mock-session-id-' + role,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(getLoginResponse(role)),
    });
  }

  if (path === '/server/login-check' && method === 'POST') {
    // Before login: return not authenticated so the login dialog shows
    // After login: return authenticated so the session is valid
    if (!hasLoggedIn) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: false }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'X-BackendAI-SessionID': 'mock-session-id-' + role,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(getLoginCheckResponse(role)),
    });
  }

  if (path === '/server/logout' && method === 'POST') {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(logoutResponse),
    });
  }

  // --- REST: /func/* endpoints ---

  // GET /func/ (root) - server version (getServerVersion via newPublicRequest)
  if ((path === '/func/' || path === '/func') && method === 'GET') {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(getServerVersionResponse(role)),
    });
  }

  // GET /func/config/resource-slots
  if (path === '/func/config/resource-slots' && method === 'GET') {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(resourceSlotsResponse),
    });
  }

  // GET /func/totp - 404 (TOTP not supported)
  if (path === '/func/totp' && method === 'GET') {
    return route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Not found' }),
    });
  }

  // POST /func/resource/check-presets
  // Used by both legacy backend-ai-resource-broker._aggregateCurrentResource()
  // and React useResourceLimitAndRemaining hook.
  // ResourcePreset.check() uses _wrapWithPromise() which returns the raw JSON body.
  // IMPORTANT: resource_slots must be a parsed object (not JSON string) because
  // the legacy resource-broker uses `'cpu' in item.resource_slots`.
  // IMPORTANT: group_remaining must be present — React's useResourceLimitAndRemaining
  // accesses checkPresetInfo?.group_remaining[key] which throws if group_remaining is undefined.
  if (path === '/func/resource/check-presets' && method === 'POST') {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        presets: [
          {
            name: 'default',
            resource_slots: {
              cpu: 1,
              mem: 1073741824,
            },
            shared_memory: null,
            allocatable: true,
          },
        ],
        keypair_limits: {
          cpu: 'Infinity',
          mem: 'Infinity',
          'cuda.device': 'Infinity',
          'cuda.shares': 'Infinity',
        },
        keypair_remaining: {
          cpu: 6,
          mem: 25769803776,
          'cuda.device': 1,
          'cuda.shares': 3,
        },
        keypair_using: {
          cpu: 2,
          mem: 8589934592,
          'cuda.device': 1,
          'cuda.shares': 1,
        },
        group_limits: {
          cpu: 8,
          mem: 34359738368,
          'cuda.device': 2,
          'cuda.shares': 4,
        },
        group_remaining: {
          cpu: 6,
          mem: 25769803776,
          'cuda.device': 1,
          'cuda.shares': 3,
        },
        group_using: {
          cpu: 2,
          mem: 8589934592,
          'cuda.device': 1,
          'cuda.shares': 1,
        },
        scaling_groups: {
          default: {
            using: {
              cpu: 2,
              mem: 8589934592,
              'cuda.device': 1,
              'cuda.shares': 1,
            },
            remaining: {
              cpu: 6,
              mem: 25769803776,
              'cuda.device': 1,
              'cuda.shares': 3,
            },
          },
        },
        scaling_group_remaining: {
          cpu: 6,
          mem: 25769803776,
          'cuda.device': 1,
          'cuda.shares': 3,
        },
      }),
    });
  }

  // GET /func/scaling-groups - REST endpoint for scaling group list
  // Called by scalingGroup.list(groupName) with ?group=<name>
  if (path === '/func/scaling-groups' && method === 'GET') {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        scaling_groups: [
          {
            name: 'default',
            description: 'Default scaling group',
            is_active: true,
            created_at: '2024-01-01T00:00:00+00:00',
            driver: 'static',
            driver_opts: '{}',
            scheduler: 'fifo',
            scheduler_opts: '{}',
            wsproxy_addr: '',
            is_public: true,
          },
        ],
      }),
    });
  }

  // GET /func/folders/_/hosts - REST endpoint for vfolder hosts
  // Called by vfolder.list_hosts(groupId) with ?group_id=<id>
  // Returns { allowed, default, volume_info } — used by resource-broker and useCurrentProject
  if (path === '/func/folders/_/hosts') {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        allowed: ['local:volume1'],
        default: 'local:volume1',
        volume_info: {
          'local:volume1': {
            backend: 'local',
            capabilities: ['vfolder-read', 'vfolder-write'],
            usage: {
              percentage: 25.0,
            },
            sftp_scaling_groups: [],
          },
        },
      }),
    });
  }

  // GET /func/config/resource-slots/details - resource slot details with metadata
  // Used by useResourceSlotsDetails() hook in backend.ai-ui
  if (path === '/func/config/resource-slots/details' && method === 'GET') {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        cpu: {
          slot_name: 'cpu',
          description: 'CPU',
          human_readable_name: 'CPU',
          display_unit: 'Core',
          number_format: { binary: false, round_length: 0 },
        },
        mem: {
          slot_name: 'mem',
          description: 'Memory',
          human_readable_name: 'RAM',
          display_unit: 'GiB',
          number_format: { binary: true, round_length: 0 },
        },
        'cuda.device': {
          slot_name: 'cuda.device',
          description: 'GPU',
          human_readable_name: 'GPU',
          display_unit: 'GPU',
          number_format: { binary: false, round_length: 0 },
        },
        'cuda.shares': {
          slot_name: 'cuda.shares',
          description: 'fGPU',
          human_readable_name: 'fGPU',
          display_unit: 'fGPU',
          number_format: { binary: false, round_length: 2 },
        },
      }),
    });
  }

  // GET /func/config/* - other config endpoints (settings, etc.)
  if (path.startsWith('/func/config/') && method === 'GET') {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  }

  // POST /func/config/* - config set/get endpoints
  if (path.startsWith('/func/config/') && method === 'POST') {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  }

  // GET /func/cloud/verify-recaptcha - reCAPTCHA endpoint
  if (path === '/func/cloud/verify-recaptcha') {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  }

  // GET /func/etcd/resource/* - etcd resource queries
  if (path.startsWith('/func/etcd/')) {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  }

  // --- GraphQL: POST /func/admin/gql ---

  if (path === '/func/admin/gql' && method === 'POST') {
    let postData: string;
    try {
      postData = request.postData() ?? '';
    } catch {
      postData = '';
    }

    const response = matchGraphQLQuery(postData, role);

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  }

  // --- Catch-all: return empty 200 ---
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({}),
  });
}

/**
 * Set up mock API routes and perform login UI interaction.
 *
 * This is the main convenience function for tests. It:
 * 1. Sets up all mock routes via setupMockApi()
 * 2. Navigates to the WebUI
 * 3. Fills in login form and clicks Login
 * 4. Waits for successful login (user-dropdown-button visible)
 */
export async function mockLogin(
  page: Page,
  request: APIRequestContext,
  options: { role?: MockRole } = {},
): Promise<void> {
  const role = options.role ?? 'user';
  await setupMockApi(page, request, { role });

  // Navigate to the WebUI
  await page.goto(webuiEndpoint);

  // Wait for login form to appear
  await page.getByLabel('Email or Username').waitFor({ timeout: 10_000 });

  // Fill in login credentials (values don't matter since the response is mocked)
  const email = role === 'superadmin' ? 'admin@lablup.com' : 'user@lablup.com';
  await page.getByLabel('Email or Username').fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('mock-password');
  await page.getByRole('textbox', { name: 'Endpoint' }).fill(MOCK_ENDPOINT);
  await page.getByLabel('Login', { exact: true }).click();

  // Wait for login to complete
  await page.waitForSelector('[data-testid="user-dropdown-button"]', {
    timeout: 30_000,
  });
}

/**
 * Match a GraphQL POST body to the appropriate mock response.
 *
 * The login flow's legacy GraphQL queries don't use operationName, so we
 * match by keywords in the query text. Relay queries include operationName
 * but we still use text matching for consistency.
 *
 * Matching order matters: more specific patterns should come first.
 */
function matchGraphQLQuery(
  postData: string,
  role: MockRole,
): Record<string, unknown> {
  let parsed: {
    query?: string;
    operationName?: string;
    variables?: Record<string, unknown>;
  } = {};
  try {
    parsed = JSON.parse(postData);
  } catch {
    // If not JSON, treat the whole postData as query text
  }

  const queryText = parsed.query ?? postData;
  const operationName = parsed.operationName ?? '';

  const email = role === 'superadmin' ? 'admin@lablup.com' : 'user@lablup.com';

  // ---- Relay queries (matched by operationName first, then text) ----

  // Relay DashboardPage query
  if (
    operationName === 'DashboardPageQuery' ||
    queryText.includes('DashboardPageQuery') ||
    queryText.includes('SessionCountDashboardItemFragment')
  ) {
    return getDashboardQueryResponse(role);
  }

  // Relay ProjectSelectorQuery — used by ProjectSelect component in the header
  if (
    operationName === 'ProjectSelectorQuery' ||
    queryText.includes('ProjectSelectorQuery')
  ) {
    return {
      data: {
        groups: [
          {
            id: MOCK_GROUP_ID,
            is_active: true,
            name: 'default',
            resource_policy: 'default',
            type: 'GENERAL',
          },
        ],
        user: {
          groups: [
            {
              id: MOCK_GROUP_ID,
              name: 'default',
            },
          ],
        },
      },
    };
  }

  // Relay useViewerQuery - returns viewer info with encoded role
  if (
    operationName === 'useViewerQuery' ||
    queryText.includes('useViewerQuery') ||
    queryText.includes('encoded_user_role')
  ) {
    return {
      data: {
        viewer: {
          user: {
            email,
            id: 'VXNlck5vZGU6bW9jay11c2VyLXV1aWQtMDAwMQ==',
          },
          encoded_user_role: btoa(role),
        },
      },
    };
  }

  // Relay ForceTOTPCheckerQuery
  if (
    operationName === 'ForceTOTPCheckerQuery' ||
    queryText.includes('ForceTOTPCheckerQuery') ||
    queryText.includes('TOTPActivateModalFragment')
  ) {
    return {
      data: {
        user: {
          totp_activated: false,
          id: 'VXNlck5vZGU6bW9jay11c2VyLXV1aWQtMDAwMQ==',
        },
      },
    };
  }

  // Relay PasswordChangeRequestAlertQuery
  if (
    operationName === 'PasswordChangeRequestAlertQuery' ||
    queryText.includes('PasswordChangeRequestAlertQuery')
  ) {
    return {
      data: {
        user: {
          need_password_change: false,
          id: 'VXNlck5vZGU6bW9jay11c2VyLXV1aWQtMDAwMQ==',
        },
      },
    };
  }

  // Relay useMergedAllowedStorageHostPermission_KeypairQuery
  if (
    operationName === 'useMergedAllowedStorageHostPermission_KeypairQuery' ||
    queryText.includes('useMergedAllowedStorageHostPermission_KeypairQuery')
  ) {
    return {
      data: {
        keypair: {
          resource_policy: 'default',
        },
      },
    };
  }

  // Relay useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery
  if (
    operationName ===
      'useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery' ||
    queryText.includes(
      'useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery',
    )
  ) {
    return {
      data: {
        domain: {
          allowed_vfolder_hosts: JSON.stringify({
            'local:volume1': ['read-write'],
          }),
        },
        group: {
          allowed_vfolder_hosts: JSON.stringify({
            'local:volume1': ['read-write'],
          }),
        },
        keypair_resource_policy: {
          allowed_vfolder_hosts: JSON.stringify({
            'local:volume1': ['read-write'],
          }),
        },
      },
    };
  }

  // Relay NoResourceGroupAlertQuery
  if (
    operationName === 'NoResourceGroupAlertQuery' ||
    queryText.includes('NoResourceGroupAlertQuery')
  ) {
    return {
      data: {
        scaling_groups: [
          {
            name: 'default',
          },
        ],
      },
    };
  }

  // Relay SessionCountDashboardItemRefetchQuery (auto-refetch)
  if (
    operationName === 'SessionCountDashboardItemRefetchQuery' ||
    queryText.includes('SessionCountDashboardItemRefetchQuery')
  ) {
    return getDashboardQueryResponse(role);
  }

  // Relay RecentlyCreatedSessionRefetchQuery
  if (
    operationName === 'RecentlyCreatedSessionRefetchQuery' ||
    queryText.includes('RecentlyCreatedSessionRefetchQuery')
  ) {
    return {
      data: {
        compute_session_nodes: {
          edges: [],
        },
      },
    };
  }

  // ---- Legacy GQL queries (matched by query text keywords) ----

  // Keypair info query (both login flow and resource broker variants)
  // Login flow: keypair { user_id resource_policy user }
  // Resource broker: keypair { concurrency_used } or keypair { resource_policy concurrency_used }
  if (
    queryText.includes('keypair') &&
    !queryText.includes('keypair_resource_polic') &&
    !queryText.includes('useMergedAllowedStorageHostPermission')
  ) {
    return {
      data: {
        keypair: {
          user_id: email,
          resource_policy: 'default',
          user: MOCK_USER_UUID,
          concurrency_used: 0,
          access_key: 'MOCK_ACCESS_KEY',
          secret_key: 'mock-secret-key',
          is_active: true,
          is_admin: role === 'superadmin' || role === 'admin',
          created_at: '2024-01-01T00:00:00+00:00',
          last_used: '2024-01-01T00:00:00+00:00',
          concurrency_limit: 30,
          rate_limit: 10000,
          num_queries: 0,
        },
      },
    };
  }

  // Login flow query 2: user profile (with full_name)
  // IMPORTANT: Must come BEFORE need_password_change check,
  // because the user profile query also contains 'need_password_change'
  if (queryText.includes('full_name') && queryText.includes('user')) {
    return getUserResponse(role);
  }

  // Legacy need_password_change query (non-Relay)
  if (
    queryText.includes('need_password_change') &&
    !queryText.includes('full_name')
  ) {
    return {
      data: {
        user: {
          need_password_change: false,
          id: 'VXNlck5vZGU6bW9jay11c2VyLXV1aWQtMDAwMQ==',
        },
      },
    };
  }

  // Legacy user role query: `query { user { role } }`
  if (
    queryText.includes('user') &&
    queryText.includes('role') &&
    !queryText.includes('groups') &&
    !queryText.includes('full_name')
  ) {
    return {
      data: {
        user: {
          role,
        },
      },
    };
  }

  // Login flow query 3: group list
  if (queryText.includes('groups') && queryText.includes('is_active')) {
    return getGroupListResponse();
  }

  // Scaling group list (GQL)
  if (
    queryText.includes('scaling_groups') ||
    (queryText.includes('scaling_group') &&
      !queryText.includes('compute_session'))
  ) {
    return getScalingGroupResponse();
  }

  // User resource policy (combined)
  if (queryText.includes('user_resource_policy')) {
    return getUserResourcePolicyResponse();
  }

  // Keypair resource policies list
  if (queryText.includes('keypair_resource_policies')) {
    return getUserResourcePolicyResponse();
  }

  // Single keypair_resource_policy (by name) — used by resourcePolicy.get()
  if (queryText.includes('keypair_resource_policy')) {
    return {
      data: {
        keypair_resource_policy: {
          name: 'default',
          default_for_unspecified: 'UNLIMITED',
          total_resource_slots: JSON.stringify({
            cpu: 8,
            mem: 34359738368,
            'cuda.device': 2,
            'cuda.shares': 4,
          }),
          max_concurrent_sessions: 5,
          max_containers_per_session: 1,
          max_vfolder_count: 10,
          allowed_vfolder_hosts: JSON.stringify({
            'local:volume1': ['read-write'],
          }),
          idle_timeout: 1800,
          max_session_lifetime: 0,
        },
      },
    };
  }

  // VFolder hosts (GQL)
  if (
    queryText.includes('allowed_vfolder_hosts') ||
    queryText.includes('vfolder_hosts')
  ) {
    return getVFolderHostsResponse();
  }

  // Images list query (legacy)
  if (queryText.includes('images') && queryText.includes('is_installed')) {
    return {
      data: {
        images: [],
      },
    };
  }

  // Domain info query
  if (
    queryText.includes('domain') &&
    queryText.includes('allowed_vfolder_hosts')
  ) {
    return {
      data: {
        domain: {
          allowed_vfolder_hosts: JSON.stringify({
            'local:volume1': ['read-write'],
          }),
        },
      },
    };
  }

  // Compute session nodes queries (Relay)
  if (
    queryText.includes('compute_session_nodes') ||
    queryText.includes('compute_session_node')
  ) {
    return {
      data: {
        compute_session_nodes: {
          edges: [],
          count: 0,
        },
      },
    };
  }

  // Legacy compute_session_list query (used by backend-ai-resource-broker)
  if (queryText.includes('compute_session_list')) {
    return {
      data: {
        compute_session_list: {
          items: [],
          total_count: 0,
        },
      },
    };
  }

  // Legacy legacy_compute_session_list
  if (queryText.includes('legacy_compute_session_list')) {
    return {
      data: {
        legacy_compute_session_list: {
          items: [],
          total_count: 0,
        },
      },
    };
  }

  // Agent summary/nodes queries
  if (
    queryText.includes('agent_summary_list') ||
    queryText.includes('agent_nodes')
  ) {
    return getDashboardQueryResponse(role);
  }

  // Fallback: return empty data
  return { data: {} };
}
