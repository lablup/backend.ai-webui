/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * Everything the app needs to come up as the signed-in user, in one GraphQL
 * round trip. The webserver answers 401 for a session it does not hold, so
 * the same document doubles as the login check (FR-2367). `keypair` and
 * `user` resolve to the requester when called without arguments.
 */
export const LOGIN_BOOTSTRAP_QUERY = `query LoginBootstrap {
  keypair { access_key user_id resource_policy user }
  user {
    username email full_name is_active role domain_name
    groups { name id } need_password_change uuid
  }
  groups(is_active: true, type: ["GENERAL"]) {
    id name description is_active
  }
}`;

export interface LoginBootstrap {
  keypair: {
    access_key: string;
    user_id: string;
    resource_policy: string;
    user: string;
  } | null;
  user: {
    username: string;
    email: string;
    full_name: string;
    is_active: boolean;
    role: string;
    domain_name: string;
    groups: Array<{ name: string; id: string }>;
    need_password_change: boolean;
    uuid: string;
  } | null;
  groups: Array<{
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
  }> | null;
}

const AUTH_FAILED_TYPE = 'https://api.backend.ai/probs/auth-failed';

interface GraphQLErrorEntry {
  extensions?: {
    response?: { status?: unknown; body?: { type?: unknown } | null } | null;
  } | null;
}

/**
 * True when the request was refused for lack of a live session. Two shapes:
 * the webserver's own 401 (thrown by `_wrapWithPromise`), and the GraphQL
 * router's 200 whose `errors[]` wrap the manager's 401 per subgraph.
 */
export function isSessionAuthFailure(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const { statusCode, response, errors } = err as {
    statusCode?: unknown;
    response?: { type?: unknown } | null;
    errors?: unknown;
  };
  if (statusCode === 401 || response?.type === AUTH_FAILED_TYPE) return true;
  return (
    Array.isArray(errors) &&
    errors.some((e: GraphQLErrorEntry) => {
      const downstream = e?.extensions?.response;
      return (
        downstream?.status === 401 ||
        downstream?.body?.type === AUTH_FAILED_TYPE
      );
    })
  );
}

export async function fetchLoginBootstrap(
  client: any,
): Promise<LoginBootstrap> {
  const envelope = await client.queryEnvelope(LOGIN_BOOTSTRAP_QUERY, null);
  return envelope.data;
}

/**
 * Ask the manager for the signed-in user's bootstrap data. `null` means the
 * webserver holds no session for this browser; any other failure is thrown.
 * On success the client adopts the identity `login-check` used to supply,
 * calling `check_login` only when the session id is not known locally.
 */
export async function probeLoginSession(
  client: any,
): Promise<LoginBootstrap | null> {
  let envelope: { data: LoginBootstrap; errors?: unknown };
  try {
    envelope = await client.queryEnvelope(LOGIN_BOOTSTRAP_QUERY, null);
  } catch (err) {
    if (isSessionAuthFailure(err)) return null;
    throw err;
  }
  if (isSessionAuthFailure(envelope)) return null;
  const bootstrap = envelope.data;
  if (!client.adoptLoginSession(bootstrap?.keypair?.access_key)) {
    await client.check_login();
  }
  return bootstrap;
}
