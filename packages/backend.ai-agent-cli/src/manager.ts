import { CliError } from './errors.js';
import { CLI_NAME, cliVersion } from './meta.js';

/** Mirrors what the WebUI client sends in SESSION mode (`newSignedRequest`). */
export const MANAGER_API_VERSION = 'v8.20240915';
export const GQL_PATH = '/func/admin/gql';

export const WHOAMI_QUERY =
  'query { user { email role domain_name full_name status } }';

export interface ManagerSession {
  endpoint: string;
  sessionId: string;
}

export interface GqlRequest {
  query: string;
  variables?: Record<string, unknown>;
}

export interface ManagerRequestOptions {
  fetchImpl?: typeof fetch;
}

/** The webserver's marker for "this session is not (or no longer) valid". */
const AUTH_ERROR_CODE = 'user_auth_unauthorized';
const AUTH_PROBLEM_TYPE = 'auth-failed';

/**
 * A dead session comes back as HTTP 200 whose GraphQL `errors[]` wrap the
 * manager's 401 body, so status alone is not enough.
 */
export function isAuthFailure(status: number, body: unknown): boolean {
  if (status === 401) return true;
  if (!body || typeof body !== 'object') return false;
  const payload = body as Record<string, unknown>;
  if (payload.error_code === AUTH_ERROR_CODE) return true;
  if (
    typeof payload.type === 'string' &&
    payload.type.includes(AUTH_PROBLEM_TYPE)
  ) {
    return true;
  }
  const errors = Array.isArray(payload.errors) ? payload.errors : [];
  return errors.some((entry) => {
    const serialized = JSON.stringify(entry ?? null);
    return (
      serialized.includes(AUTH_ERROR_CODE) ||
      serialized.includes(AUTH_PROBLEM_TYPE)
    );
  });
}

export function authRequiredError(endpoint: string): CliError {
  return new CliError(
    'auth_required',
    `The session for ${endpoint} is not valid (the manager rejected it).`,
    { hint: `${CLI_NAME} login --endpoint ${endpoint}` },
  );
}

function graphQlErrorMessage(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const errors = (body as { errors?: unknown }).errors;
  if (!Array.isArray(errors) || errors.length === 0) return undefined;
  const first = errors[0] as { message?: unknown };
  return typeof first?.message === 'string'
    ? first.message
    : JSON.stringify(errors[0]);
}

/**
 * One authenticated GraphQL call against `<endpoint>/func/admin/gql`, with the
 * same headers the WebUI sends in SESSION mode.
 */
export async function gqlRequest<T = unknown>(
  session: ManagerSession,
  request: GqlRequest,
  options: ManagerRequestOptions = {},
): Promise<T> {
  const doFetch = options.fetchImpl ?? fetch;
  const url = `${session.endpoint}${GQL_PATH}`;

  let response: Response;
  try {
    response = await doFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `Backend.AI ${CLI_NAME}/${cliVersion()}`,
        'X-BackendAI-Version': MANAGER_API_VERSION,
        'X-BackendAI-Date': new Date().toISOString(),
        'X-BackendAI-SessionID': session.sessionId,
      },
      body: JSON.stringify({
        query: request.query,
        variables: request.variables ?? {},
      }),
    });
  } catch (error) {
    throw new CliError(
      'internal',
      `Cannot reach the manager at ${session.endpoint}: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { hint: `${CLI_NAME} doctor`, cause: error },
    );
  }

  const raw = await response.text();
  let body: unknown;
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    body = undefined;
  }

  if (isAuthFailure(response.status, body)) {
    throw authRequiredError(session.endpoint);
  }
  if (!response.ok) {
    throw new CliError(
      'internal',
      `Manager returned HTTP ${response.status} for ${GQL_PATH}.`,
      { hint: `${CLI_NAME} doctor` },
    );
  }

  const message = graphQlErrorMessage(body);
  if (message) {
    throw new CliError('internal', `GraphQL error: ${message}`, {
      hint: `${CLI_NAME} doctor`,
    });
  }

  return (body as { data?: T }).data as T;
}

export interface WhoAmI {
  email: string;
  role: string;
  domainName: string;
  fullName?: string;
  status?: string;
}

export async function fetchWhoAmI(
  session: ManagerSession,
  options: ManagerRequestOptions = {},
): Promise<WhoAmI> {
  const data = await gqlRequest<{
    user?: {
      email?: string;
      role?: string;
      domain_name?: string;
      full_name?: string;
      status?: string;
    } | null;
  }>(session, { query: WHOAMI_QUERY }, options);

  const user = data?.user;
  if (!user?.email) {
    throw authRequiredError(session.endpoint);
  }
  return {
    email: user.email,
    role: user.role ?? 'unknown',
    domainName: user.domain_name ?? 'unknown',
    fullName: user.full_name ?? undefined,
    status: user.status ?? undefined,
  };
}

/* -------------------------------------------------------------------------- */
/* Manager version                                                             */
/* -------------------------------------------------------------------------- */

/**
 * What the WebUI client calls for the manager version: in SESSION mode
 * `getServerVersion()` issues `newPublicRequest('GET', '/')`, which the client
 * rewrites to `<endpoint>/func/` and reads `{ version, manager }` from
 * (`packages/backend.ai-client/src/client.ts`, `get_manager_version`).
 */
export const VERSION_PATHS = ['/func/', '/server/version'] as const;

/** Reachability probe only; the SDL is never rebuilt from introspection. */
export const INTROSPECTION_PROBE = '{ __schema { queryType { name } } }';

export interface ManagerVersion {
  /** e.g. `26.4.10`. */
  manager: string;
  /** The API version the manager advertises, e.g. `v8.20240915`. */
  apiVersion?: string;
  /** The path the answer came from. */
  source: string;
}

const VERSION_CACHE = new Map<string, ManagerVersion>();

export function clearManagerVersionCache(): void {
  VERSION_CACHE.clear();
}

function readVersionPayload(
  body: unknown,
  source: string,
): ManagerVersion | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const payload = body as { manager?: unknown; version?: unknown };
  if (typeof payload.manager !== 'string' || payload.manager.length === 0) {
    return undefined;
  }
  return {
    manager: payload.manager,
    ...(typeof payload.version === 'string'
      ? { apiVersion: payload.version }
      : {}),
    source,
  };
}

/**
 * The manager version behind `session.endpoint`, cached per process so a run
 * asks once however many commands consult it.
 */
export async function fetchManagerVersion(
  session: ManagerSession,
  options: ManagerRequestOptions = {},
): Promise<ManagerVersion> {
  const cached = VERSION_CACHE.get(session.endpoint);
  if (cached) return cached;

  const doFetch = options.fetchImpl ?? fetch;
  let lastError: unknown;
  for (const path of VERSION_PATHS) {
    const url = `${session.endpoint}${path}`;
    try {
      const response = await doFetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': `Backend.AI ${CLI_NAME}/${cliVersion()}`,
          'X-BackendAI-Version': MANAGER_API_VERSION,
          'X-BackendAI-Date': new Date().toISOString(),
          'X-BackendAI-SessionID': session.sessionId,
        },
      });
      if (!response.ok) continue;
      const version = readVersionPayload(await response.json(), path);
      if (version) {
        VERSION_CACHE.set(session.endpoint, version);
        return version;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw new CliError(
    'internal',
    `Cannot read the manager version from ${session.endpoint} (tried ${VERSION_PATHS.join(', ')}).`,
    { hint: `${CLI_NAME} doctor`, cause: lastError },
  );
}

/**
 * One opportunistic introspection call, used only to confirm the GraphQL
 * endpoint answers. A manager with introspection disabled returns `undefined`
 * and nothing is reported — the schema always comes from the committed SDL.
 */
export async function probeIntrospection(
  session: ManagerSession,
  options: ManagerRequestOptions = {},
): Promise<boolean | undefined> {
  try {
    const data = await gqlRequest<{ __schema?: { queryType?: unknown } }>(
      session,
      { query: INTROSPECTION_PROBE },
      options,
    );
    return Boolean(data?.__schema?.queryType);
  } catch {
    return undefined;
  }
}
