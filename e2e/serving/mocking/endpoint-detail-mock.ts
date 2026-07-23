/**
 * Mock responses for EndpointDetailPageQuery.
 *
 * Provides multiple scenario variants:
 *   - Running routes (3 routes: HEALTHY+ACTIVE, PROVISIONING, UNHEALTHY+INACTIVE)
 *   - Finished routes (2 routes: TERMINATED, FAILED_TO_START with errorData)
 *   - Empty routes (0 routes)
 *   - Paginated routes (12 HEALTHY routes)
 *   - Legacy mock (routes: null, skipRouteNodes=true)
 *
 * The mock handler inspects `vars.routeFilter.status` and `vars.skipRouteNodes`
 * to determine which scenario to return.
 */

export const MOCK_ENDPOINT_UUID = 'aaaaaaaa-bbbb-cccc-dddd-000000000001';
const MOCK_ENDPOINT_GLOBAL_ID = btoa(`Endpoint:${MOCK_ENDPOINT_UUID}`);

// Route UUIDs
const MOCK_ROUTE_HEALTHY_UUID = 'route-uuid-healthy-001';
const MOCK_ROUTE_PROVISIONING_UUID = 'route-uuid-provisioning-001';
const MOCK_ROUTE_UNHEALTHY_UUID = 'route-uuid-unhealthy-001';
const MOCK_ROUTE_TERMINATED_UUID = 'route-uuid-terminated-001';
const MOCK_ROUTE_FAILED_UUID = 'route-uuid-failed-001';

// Relay global IDs for routes
const MOCK_ROUTE_HEALTHY_GID = btoa(`Route:${MOCK_ROUTE_HEALTHY_UUID}`);
const MOCK_ROUTE_PROVISIONING_GID = btoa(
  `Route:${MOCK_ROUTE_PROVISIONING_UUID}`,
);
const MOCK_ROUTE_UNHEALTHY_GID = btoa(`Route:${MOCK_ROUTE_UNHEALTHY_UUID}`);
const MOCK_ROUTE_TERMINATED_GID = btoa(`Route:${MOCK_ROUTE_TERMINATED_UUID}`);
const MOCK_ROUTE_FAILED_GID = btoa(`Route:${MOCK_ROUTE_FAILED_UUID}`);

// Session global IDs
const MOCK_SESSION_HEALTHY_GID = btoa(`ComputeSessionNode:session-healthy-001`);
const MOCK_SESSION_UNHEALTHY_GID = btoa(
  `ComputeSessionNode:session-unhealthy-001`,
);

// ─────────────────────────────────────────────────────────────────────────────
// Base endpoint object shared across all scenarios
// ─────────────────────────────────────────────────────────────────────────────

const BASE_ENDPOINT = {
  __typename: 'Endpoint' as const,
  id: MOCK_ENDPOINT_GLOBAL_ID,
  name: 'mock-endpoint',
  status: 'HEALTHY',
  endpoint_id: MOCK_ENDPOINT_UUID,
  project: 'mock-project-id-001',
  image_object: null,
  desired_session_count: null,
  replicas: 2,
  url: 'https://mock-endpoint.backend.ai/api',
  open_to_public: false,
  errors: [],
  retries: 0,
  runtime_variant: null,
  model: null,
  model_mount_destination: null,
  model_definition_path: null,
  extra_mounts: [],
  environ: '{}',
  resource_group: 'default',
  resource_slots: '{"cpu": 2, "mem": 2147483648}',
  resource_opts: '{}',
  cluster_mode: 'SINGLE_NODE',
  cluster_size: 1,
  routings: [],
  created_user_email: 'admin@lablup.com',
  // EndpointOwnerInfoFragment fields
  session_owner_email: 'admin@lablup.com',
};

// ─────────────────────────────────────────────────────────────────────────────
// Route edge definitions for each scenario
// ─────────────────────────────────────────────────────────────────────────────

const RUNNING_ROUTES_EDGES = [
  {
    __typename: 'RouteEdge' as const,
    node: {
      __typename: 'Route' as const,
      id: MOCK_ROUTE_HEALTHY_GID,
      status: 'HEALTHY',
      trafficRatio: 0.6,
      createdAt: '2026-01-01T10:00:00+00:00',
      errorData: null,
      session: MOCK_SESSION_HEALTHY_GID,
      trafficStatus: 'ACTIVE',
    },
  },
  {
    __typename: 'RouteEdge' as const,
    node: {
      __typename: 'Route' as const,
      id: MOCK_ROUTE_PROVISIONING_GID,
      status: 'PROVISIONING',
      trafficRatio: 0.0,
      createdAt: '2026-01-01T10:05:00+00:00',
      errorData: null,
      session: null,
      trafficStatus: 'INACTIVE',
    },
  },
  {
    __typename: 'RouteEdge' as const,
    node: {
      __typename: 'Route' as const,
      id: MOCK_ROUTE_UNHEALTHY_GID,
      status: 'UNHEALTHY',
      trafficRatio: 0.4,
      createdAt: '2026-01-01T10:10:00+00:00',
      errorData: null,
      session: MOCK_SESSION_UNHEALTHY_GID,
      trafficStatus: 'INACTIVE',
    },
  },
];

const FINISHED_ROUTES_EDGES = [
  {
    __typename: 'RouteEdge' as const,
    node: {
      __typename: 'Route' as const,
      id: MOCK_ROUTE_TERMINATED_GID,
      status: 'TERMINATED',
      trafficRatio: 0.0,
      createdAt: '2026-01-01T09:00:00+00:00',
      errorData: null,
      session: null,
      trafficStatus: 'INACTIVE',
    },
  },
  {
    __typename: 'RouteEdge' as const,
    node: {
      __typename: 'Route' as const,
      id: MOCK_ROUTE_FAILED_GID,
      status: 'FAILED_TO_START',
      trafficRatio: 0.0,
      createdAt: '2026-01-01T09:30:00+00:00',
      errorData: { message: 'OOMKilled', code: 137 },
      session: null,
      trafficStatus: 'INACTIVE',
    },
  },
];

function createPaginatedRoutes(
  count: number = 12,
  offset: number = 0,
  limit: number = 10,
) {
  const allEdges = Array.from({ length: count }, (_, i) => ({
    __typename: 'RouteEdge' as const,
    node: {
      __typename: 'Route' as const,
      id: btoa(`Route:route-paginated-${String(i).padStart(3, '0')}`),
      status: 'HEALTHY' as const,
      trafficRatio: parseFloat((1 / count).toFixed(4)),
      createdAt: new Date(
        new Date('2026-01-01T10:00:00Z').getTime() + i * 60000,
      ).toISOString(),
      errorData: null,
      session: btoa(
        `ComputeSessionNode:session-paginated-${String(i).padStart(3, '0')}`,
      ),
      trafficStatus: 'ACTIVE' as const,
    },
  }));
  return {
    edges: allEdges.slice(offset, offset + limit),
    count,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Token list and auto-scaling rules (shared across all scenarios)
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_TOKEN_LIST = {
  __typename: 'EndpointTokenList' as const,
  total_count: 0,
  items: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// Determine if the filter targets finished statuses
// ─────────────────────────────────────────────────────────────────────────────

const FINISHED_STATUSES = ['TERMINATED', 'FAILED_TO_START'];
const RUNNING_STATUSES = [
  'PROVISIONING',
  'HEALTHY',
  'UNHEALTHY',
  'DEGRADED',
  'TERMINATING',
];

function isFinishedFilter(routeFilter?: { status?: string[] }): boolean {
  if (!routeFilter?.status) return false;
  return routeFilter.status.some((s: string) => FINISHED_STATUSES.includes(s));
}

function isStatusSubFilter(routeFilter?: {
  status?: string[];
}): string[] | null {
  if (!routeFilter?.status) return null;
  // If it's a single-status filter within Running statuses
  if (
    routeFilter.status.length === 1 &&
    RUNNING_STATUSES.includes(routeFilter.status[0])
  ) {
    return routeFilter.status;
  }
  return null;
}

function isTrafficStatusFilter(routeFilter?: {
  trafficStatus?: string[];
}): string[] | null {
  if (!routeFilter?.trafficStatus) return null;
  return routeFilter.trafficStatus;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public mock response functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Running routes mock — returns 3 running routes by default.
 * Switches to finished routes when the filter contains finished statuses.
 * Supports single-status and trafficStatus sub-filters.
 */
export function endpointDetailRunningMockResponse(
  vars: Record<string, any>,
): Record<string, any> {
  if (vars.skipRouteNodes) {
    return buildResponse(null);
  }

  const routeFilter = vars.routeFilter;

  if (isFinishedFilter(routeFilter)) {
    return buildResponse({ edges: FINISHED_ROUTES_EDGES, count: 2 });
  }

  // Single-status sub-filter within Running
  const statusSubFilter = isStatusSubFilter(routeFilter);
  if (statusSubFilter) {
    const filtered = RUNNING_ROUTES_EDGES.filter((e) =>
      statusSubFilter.includes(e.node.status),
    );
    return buildResponse({ edges: filtered, count: filtered.length });
  }

  // Traffic status filter
  const trafficFilter = isTrafficStatusFilter(routeFilter);
  if (trafficFilter) {
    const filtered = RUNNING_ROUTES_EDGES.filter((e) =>
      trafficFilter.includes(e.node.trafficStatus),
    );
    return buildResponse({ edges: filtered, count: filtered.length });
  }

  return buildResponse({ edges: RUNNING_ROUTES_EDGES, count: 3 });
}

/**
 * Finished routes mock — returns 2 finished routes (TERMINATED, FAILED_TO_START).
 */
export function endpointDetailFinishedMockResponse(
  vars: Record<string, any>,
): Record<string, any> {
  if (vars.skipRouteNodes) {
    return buildResponse(null);
  }
  return buildResponse({ edges: FINISHED_ROUTES_EDGES, count: 2 });
}

/**
 * Empty routes mock — returns 0 routes.
 */
export function endpointDetailEmptyMockResponse(
  vars: Record<string, any>,
): Record<string, any> {
  if (vars.skipRouteNodes) {
    return buildResponse(null);
  }

  // Return empty for both running and finished categories
  return buildResponse({ edges: [], count: 0 });
}

/**
 * Paginated routes mock — returns 12 HEALTHY routes.
 * Respects `vars.routeOffset` and `vars.routeLimit` for pagination.
 * Switches to finished routes (empty) when the filter contains finished statuses.
 */
export function endpointDetailPaginatedMockResponse(
  vars: Record<string, any>,
): Record<string, any> {
  if (vars.skipRouteNodes) {
    return buildResponse(null);
  }

  const routeFilter = vars.routeFilter;
  if (isFinishedFilter(routeFilter)) {
    return buildResponse({ edges: [], count: 0 });
  }

  // Single-status sub-filter
  const statusSubFilter = isStatusSubFilter(routeFilter);
  if (statusSubFilter) {
    // All paginated routes are HEALTHY, so only return them for HEALTHY filter
    if (statusSubFilter.includes('HEALTHY')) {
      const result = createPaginatedRoutes(
        12,
        vars.routeOffset ?? 0,
        vars.routeLimit ?? 10,
      );
      return buildResponse(result);
    }
    return buildResponse({ edges: [], count: 0 });
  }

  const result = createPaginatedRoutes(
    12,
    vars.routeOffset ?? 0,
    vars.routeLimit ?? 10,
  );
  return buildResponse(result);
}

/**
 * Legacy mock — returns routes as null (for when skipRouteNodes = true).
 */
export function endpointDetailLegacyMockResponse(
  _vars: Record<string, any>,
): Record<string, any> {
  return buildResponse(null, true);
}

// ─────────────────────────────────────────────────────────────────────────────
// Response builder
// ─────────────────────────────────────────────────────────────────────────────

function buildResponse(
  routes: { edges: any[]; count: number } | null,
  isLegacy: boolean = false,
): Record<string, any> {
  const endpoint = {
    ...BASE_ENDPOINT,
    // For legacy path, populate routings with some data
    routings: isLegacy
      ? [
          {
            routing_id: 'legacy-route-001',
            session: 'legacy-session-001',
            traffic_ratio: 0.5,
            endpoint: MOCK_ENDPOINT_UUID,
            status: 'HEALTHY',
            error_data: null,
          },
          {
            routing_id: 'legacy-route-002',
            session: 'legacy-session-002',
            traffic_ratio: 0.5,
            endpoint: MOCK_ENDPOINT_UUID,
            status: 'HEALTHY',
            error_data: null,
          },
        ]
      : [],
  };

  return {
    endpoint,
    endpoint_token_list: EMPTY_TOKEN_LIST,
    endpoint_auto_scaling_rules: null,
    routes,
  };
}
