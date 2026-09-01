/**
 * Mocked error responses that the Backend.AI app-launch path
 * (start-service → appproxy) can produce.
 *
 * Body schemas and error_code values were extracted directly from the
 * backend.ai sources (main as of 2026-08-11).
 * - Common body schema: src/ai/backend/common/exception.py BackendAIError
 *   → { type, title, error_code, msg?, data? }
 * - manager response header: Content-Type: application/problem+json
 * - appproxy (coordinator/worker) response header: the exception middleware
 *   re-serializes via web.json_response, so application/json +
 *   Access-Control-Allow-Origin: *
 *
 * Caveats:
 * - The manager ServiceUnavailable title carries the actual typo in the code,
 *   "Serivce unavailable." → never branch on title strings; use error_code or
 *   the type URL instead.
 * - Errors sharing the same type/title arise from multiple causes (e.g. the
 *   four invalid-api-params variants). The cause can only be told apart by the
 *   E-code inside msg (E20007, E20011, E20002).
 */

export interface BackendAIErrorBody {
  type: string;
  title: string;
  /** Stable identifier in the "{domain}_{operation}_{error-detail}" format */
  error_code: string;
  msg?: string;
  data?: unknown;
}

export interface MockedErrorResponse {
  status: number;
  headers: Record<string, string>;
  body: BackendAIErrorBody;
}

const MANAGER_HEADERS = { 'Content-Type': 'application/problem+json' };
const APPPROXY_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
};

// ─────────────────────────────────────────────────────────────
// Stage 1: manager POST /session/{id}/start-service (via webserver)
// ─────────────────────────────────────────────────────────────
export const managerErrors = {
  /** Session ID does not exist */
  sessionNotFound: {
    status: 404,
    headers: MANAGER_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/object-not-found',
      title: 'No such session.',
      error_code: 'session_read_not-found',
    },
  },
  /** Session has no resource group assigned */
  noScalingGroup: {
    status: 503,
    headers: MANAGER_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/service-unavailable',
      title: 'Serivce unavailable.', // actual typo in the backend code
      error_code: 'backendai_generic_unavailable',
      msg: 'Session has no scaling group assigned',
    },
  },
  /** No app proxy address configured for the resource group */
  noCoordinator: {
    status: 503,
    headers: MANAGER_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/service-unavailable',
      title: 'Serivce unavailable.',
      error_code: 'backendai_generic_unavailable',
      msg: 'No coordinator configured for this resource group',
    },
  },
  /** Attempted to run an inference app as interactive */
  inferenceAppRejected: {
    status: 400,
    headers: MANAGER_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/invalid-api-params',
      title: 'Missing or invalid API parameters.',
      error_code: 'api_generic_invalid-parameters',
      msg: 'ttyd is an inference app. Starting inference apps can only be done by starting an inference service.',
    },
  },
  /** The app did not open the requested port */
  portNotOpened: {
    status: 400,
    headers: MANAGER_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/invalid-api-params',
      title: 'Missing or invalid API parameters.',
      error_code: 'api_generic_invalid-parameters',
      msg: 'Service ttyd does not open the port number 7681.',
    },
  },
  /** App name not present in the session's service_ports */
  appNotFound: {
    status: 404,
    headers: MANAGER_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/object-not-found',
      title: 'No such app service.',
      error_code: 'backendai_read_not-found',
      msg: 'mysession:ttyd',
    },
  },
  /** No agent allocated to the main kernel */
  agentNotAllocated: {
    status: 500,
    headers: MANAGER_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/agent-not-allocated',
      title: 'Agent ID has not been allocated for the session.',
      error_code: 'agent_access_internal-error',
      msg: 'Session e961a85c-29b3-429e-b140-b01dcd80b689 main kernel has no agent allocated',
    },
  },
  /**
   * The app process (ttyd, etc.) failed to start inside the container —
   * the agent error is carried verbatim in data
   */
  appLaunchFailed: {
    status: 500,
    headers: MANAGER_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/internal-server-error',
      title: 'Internal server error.',
      error_code: 'backendai_generic_internal-error',
      msg: 'Failed to launch the app service',
      data: {
        src: 'other',
        name: 'RuntimeError',
        repr: "RuntimeError('ttyd exited unexpectedly')",
      },
    },
  },
} satisfies Record<string, MockedErrorResponse>;

// ─────────────────────────────────────────────────────────────
// Stage 2: coordinator GET /v2/proxy/{token}/{session}/add → /v2/proxy/auth
// ─────────────────────────────────────────────────────────────
export const coordinatorErrors = {
  /** Token is not in the coordinator DB (expired / tampered) */
  tokenNotFound: {
    status: 404,
    headers: APPPROXY_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/object-not-found',
      title: 'E00002: No such token.',
      error_code: 'agent_read_not-found',
    },
  },
  /** Token's session ≠ session_id in the URL */
  sessionIdMismatch: {
    status: 401,
    headers: APPPROXY_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/invalid-credentials',
      title: 'Authentication credentials not valid.',
      error_code: 'agent_auth_unauthorized',
      msg: 'E20007: Session ID mismatch',
    },
  },
  /** Unsupported protocol */
  unsupportedProtocol: {
    status: 400,
    headers: APPPROXY_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/appproxy/unsupported-protocol',
      title: 'Unsupported protocol.',
      error_code: 'agent_request_invalid-parameters',
      msg: 'GRPC',
    },
  },
  /** No matching worker / port slots exhausted */
  workerNotAvailable: {
    status: 503,
    headers: APPPROXY_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/appproxy/worker-not-available',
      title: 'Worker not available.',
      error_code: 'agent_access_not-found',
    },
  },
  /** Designated port / subdomain already occupied */
  portNotAvailable: {
    status: 409,
    headers: APPPROXY_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/appproxy/port-not-available',
      title: 'Designated port already occupied.',
      error_code: 'agent_setup_already-exists',
    },
  },
  /**
   * Circuit creation failed (the code has no HTTP status mixin, so noted as
   * 500 — verify against a live deployment when possible)
   */
  circuitCreationFailed: {
    status: 500,
    headers: APPPROXY_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/appproxy/circuit-creation-failed',
      title: 'Failed to create circuit.',
      error_code: 'kernel_create_internal-error',
      msg: 'Failed to create circuit and worker.',
    },
  },
} satisfies Record<string, MockedErrorResponse>;

// ─────────────────────────────────────────────────────────────
// Stage 3: worker /setup and actual app traffic
// ─────────────────────────────────────────────────────────────
export const workerErrors = {
  /** JWT signature mismatch / tampering */
  invalidJwt: {
    status: 401,
    headers: APPPROXY_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/invalid-credentials',
      title: 'Authentication credentials not valid.',
      error_code: 'agent_auth_unauthorized',
    },
  },
  /** allowed_client_ips restriction */
  clientIpNotAllowed: {
    status: 403,
    headers: APPPROXY_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/client-ip-not-allowed',
      title: 'Client address not allowed.',
      error_code: 'appproxy_access_forbidden',
      msg: 'E20011: Client address not allowed',
    },
  },
  /** Inference app accessed via the interactive path */
  inferenceNotSupported: {
    status: 400,
    headers: APPPROXY_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/invalid-api-params',
      title: 'Missing or invalid API parameters.',
      error_code: 'agent_request_invalid-parameters',
      msg: 'E20011: Not supported for inference apps',
    },
  },
  /** Protocol not usable as interactive */
  protocolNotInteractive: {
    status: 400,
    headers: APPPROXY_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/invalid-api-params',
      title: 'Missing or invalid API parameters.',
      error_code: 'agent_request_invalid-parameters',
      msg: 'E20002: Protocol not available as interactive app',
    },
  },
  /** Missing worker configuration (traefik/wildcard, etc.) */
  serverMisconfigured: {
    status: 500,
    headers: APPPROXY_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/server-misconfigured',
      title: 'E00001: Service misconfigured.',
      error_code: 'agent_setup_invalid-parameters',
      msg: "proxy_worker: Missing 'traefik' config section",
    },
  },
  /** Kernel app port connection refused — the app process died */
  containerConnectionRefused: {
    status: 502,
    headers: APPPROXY_HEADERS,
    body: {
      type: 'https://api.backend.ai/probs/appproxy/container-connection-refused',
      title: 'Cannot connect to Backend.AI kernel.',
      error_code: 'kernel_access_unreachable',
    },
  },
} satisfies Record<string, MockedErrorResponse>;

// ─────────────────────────────────────────────────────────────
// Stage 0: network level — cases with no HTTP response at all.
// fetch itself rejects, so mock these as network errors instead of a
// Response (e.g. msw: http.get(url, () => HttpResponse.error());
// jest: fetchMock.mockReject(new TypeError('Failed to fetch'))).
// ─────────────────────────────────────────────────────────────
export const networkLevelFailures = {
  /** The advertised appproxy address is unreachable from the browser (connection refused) */
  unreachableAppProxy: () => new TypeError('Failed to fetch'),
} as const;
