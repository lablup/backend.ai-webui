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
