/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { createFetchFn, createRelayEnvironment } from '../RelayEnvironment';
import type {
  loginBootstrapQuery,
  loginBootstrapQuery$data,
} from '../__generated__/loginBootstrapQuery.graphql';
import type { BackendAIClient } from '../hooks';
import { graphql } from 'react-relay';
import {
  fetchQuery,
  type FetchFunction,
  type GraphQLResponse,
} from 'relay-runtime';

/**
 * Everything the app needs to come up as the signed-in user, in one GraphQL
 * round trip. The webserver refuses it for a session it does not hold, so the
 * same document doubles as the login check (FR-2367). `keypair` and `user`
 * resolve to the requester when called without arguments.
 *
 * No version directives (`@since` …) here: the probe runs alongside
 * `get_manager_version`, so the manager version is unknown while this is
 * sent and any gated field would be stripped.
 */
const loginBootstrapQueryNode = graphql`
  query loginBootstrapQuery {
    keypair {
      access_key
      user_id
      resource_policy
      user
    }
    user {
      username
      email
      full_name
      is_active
      role
      domain_name
      groups {
        name
        id
      }
      need_password_change
      uuid
    }
    groups(is_active: true, type: ["GENERAL"]) {
      id
      name
      description
      is_active
    }
  }
`;

export type LoginBootstrap = loginBootstrapQuery$data;

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
  const { statusCode, response, errors, data } = err as {
    statusCode?: unknown;
    response?: { type?: unknown } | null;
    errors?: unknown;
    data?: Record<string, unknown> | null;
  };
  if (statusCode === 401 || response?.type === AUTH_FAILED_TYPE) return true;
  if (!Array.isArray(errors)) return false;
  const refused = errors.some((e: GraphQLErrorEntry) => {
    const downstream = e?.extensions?.response;
    return (
      downstream?.status === 401 || downstream?.body?.type === AUTH_FAILED_TYPE
    );
  });
  // A refusal empties every root field; anything resolved means the session
  // is live and one subgraph failed on its own.
  return (
    refused &&
    (data == null || Object.values(data).every((value) => value == null))
  );
}

export class SessionAuthFailureError extends Error {
  readonly cause: unknown;
  constructor(cause: unknown) {
    super('The webserver holds no session for this browser.');
    this.name = 'SessionAuthFailureError';
    this.cause = cause;
  }
}

/**
 * A throwaway Relay environment bound to `client`. The app environment waits
 * for the global client, which is exactly what signing in has yet to create.
 * Same fetch as the app's; only the refusal is reported differently.
 */
function createLoginEnvironment(client: BackendAIClient) {
  const fetch = createFetchFn(async () => client);
  const loginFetch: FetchFunction = async (...args) => {
    let result: GraphQLResponse;
    try {
      result = (await fetch(...args)) as GraphQLResponse;
    } catch (err) {
      if (
        isSessionAuthFailure(err) ||
        (err as Error | null)?.name === 'AuthorizationError'
      ) {
        throw new SessionAuthFailureError(err);
      }
      throw err;
    }
    if (isSessionAuthFailure(result)) {
      throw new SessionAuthFailureError(result);
    }
    return result;
  };
  return createRelayEnvironment(loginFetch, null);
}

export async function fetchLoginBootstrap(
  client: BackendAIClient,
): Promise<LoginBootstrap> {
  const data = await fetchQuery<loginBootstrapQuery>(
    createLoginEnvironment(client),
    loginBootstrapQueryNode,
    {},
  ).toPromise();
  if (!data) {
    throw new Error('The login bootstrap query returned no data.');
  }
  return data;
}

/**
 * Ask the manager for the signed-in user's bootstrap data. `null` means the
 * webserver holds no session for this browser; any other failure is thrown.
 * On success the client adopts the identity `login-check` used to supply;
 * when the session id is not known locally, `check_login` supplies it and
 * its verdict wins.
 */
export async function probeLoginSession(
  client: BackendAIClient,
): Promise<LoginBootstrap | null> {
  let bootstrap: LoginBootstrap;
  try {
    bootstrap = await fetchLoginBootstrap(client);
  } catch (err) {
    if (err instanceof SessionAuthFailureError) return null;
    throw err;
  }
  if (!client.adoptLoginSession(bootstrap.keypair?.access_key)) {
    if (!(await client.check_login())) return null;
  }
  return bootstrap;
}
