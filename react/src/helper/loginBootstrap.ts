/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { createFetchFn, createRelayEnvironment } from '../RelayEnvironment';
import type {
  loginBootstrapQuery,
  loginBootstrapQuery$data,
  loginBootstrapQuery$variables,
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
 * round trip, sent only after `login-check` said the session is live. Only
 * the starting project is needed: the remembered one if it is still a GENERAL
 * project of the user, else the first by name (the header's order).
 *
 * No version directives (`@since` …) here: it runs alongside
 * `get_manager_version`, so the manager version is unknown while it is sent.
 */
export const loginBootstrapQueryNode = graphql`
  query loginBootstrapQuery(
    $recentProjectName: String!
    $hasRecentProject: Boolean!
    $needsAccessKey: Boolean!
  ) {
    myUserV2 {
      id
      entityId
      basicInfo {
        email
        fullName
      }
      organization {
        domainName
        role
      }
      domain {
        entityId
        basicInfo {
          name
        }
      }
      recentProject: projects(
        filter: {
          isActive: true
          type: { equals: GENERAL }
          name: { equals: $recentProjectName }
        }
        limit: 1
      ) @include(if: $hasRecentProject) {
        edges {
          node {
            id
            entityId
            basicInfo {
              name
            }
          }
        }
      }
      defaultProject: projects(
        filter: { isActive: true, type: { equals: GENERAL } }
        orderBy: [{ field: NAME, direction: ASC }]
        limit: 1
      ) {
        edges {
          node {
            id
            entityId
            basicInfo {
              name
            }
          }
        }
      }
    }
    # Under act-as the manager authorizes with the target's default keypair.
    myKeypairs(filter: { isDefault: true }, limit: 1)
      @include(if: $needsAccessKey) {
      edges {
        node {
          id
          accessKey
        }
      }
    }
    # Seeds myAppConfigState (ADR 0033); a failed read keeps the base config.
    myAppConfigs(
      configNames: ["publicConfigByDomain", "domainConfig", "userConfig"]
    ) @catch(to: NULL) {
      configName
      config
    }
  }
`;

export type LoginBootstrap = loginBootstrapQuery$data;

/** The query's variables for `client`, from the remembered project and act-as. */
export function loginBootstrapVariables(
  client: BackendAIClient,
): loginBootstrapQuery$variables {
  const recentProjectName: string =
    (globalThis as any).backendaiutils?._peekRecentProjectGroup?.() ?? '';
  return {
    recentProjectName,
    hasRecentProject: !!recentProjectName,
    needsAccessKey: !!client.actAsUserId,
  };
}

/** The access key the bootstrapped session authorizes with under act-as. */
export const bootstrapAccessKey = (
  bootstrap: LoginBootstrap | null | undefined,
): string | undefined => bootstrap?.myKeypairs?.edges[0]?.node.accessKey;

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

/** The manager's own text for a refusal, whichever layer wrapped it. */
export function refusalDetail(cause: unknown): string {
  let current = cause as {
    description?: unknown;
    message?: unknown;
    cause?: unknown;
    name?: unknown;
  } | null;
  while (current && typeof current === 'object') {
    if (current.name !== 'AuthorizationError') {
      const text = current.description ?? current.message;
      if (typeof text === 'string' && text) return text;
    } else if (typeof current.description === 'string') {
      return current.description;
    }
    current = current.cause as typeof current;
  }
  return '';
}

/** `message` is the manager's text when it sent one, else empty. */
export class SessionAuthFailureError extends Error {
  readonly cause: unknown;
  constructor(cause: unknown) {
    super(refusalDetail(cause));
    this.name = 'SessionAuthFailureError';
    this.cause = cause;
  }
}

/**
 * The session is live but the manager failed to resolve `myUserV2`
 * (an `errors[]` entry that is not a refusal). Not a reason to log out.
 * `message` is the manager's text, else empty.
 */
export class LoginBootstrapIncompleteError extends Error {
  readonly cause: unknown;
  constructor(cause: unknown) {
    const { errors, message } =
      (cause as {
        errors?: Array<{ message?: unknown }>;
        message?: unknown;
      } | null) ?? {};
    const detail =
      errors?.find((e) => typeof e?.message === 'string')?.message ?? message;
    super(typeof detail === 'string' ? detail : '');
    this.name = 'LoginBootstrapIncompleteError';
    this.cause = cause;
  }
}

/**
 * A throwaway Relay environment bound to `client`. The app environment waits
 * for the global client, which is exactly what signing in has yet to create.
 * Same fetch as the app's; only the refusal and a missing identity are
 * reported differently.
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
      // Any other HTTP failure (a wrapped manager 5xx, a timeout) leaves the
      // session cookie live; 403 stays a refusal for connectViaGQL's logout.
      const status = (err as { statusCode?: unknown } | null)?.statusCode;
      if (typeof status === 'number' && status >= 400 && status !== 403) {
        throw new LoginBootstrapIncompleteError(err);
      }
      throw err;
    }
    if (isSessionAuthFailure(result)) {
      throw new SessionAuthFailureError(result);
    }
    // Relay would hand back the nulls as data; `client.query` threw instead.
    const { data, errors } = result as {
      data?: { myUserV2?: unknown } | null;
      errors?: unknown[];
    };
    if (errors?.length && data?.myUserV2 == null) {
      throw new LoginBootstrapIncompleteError(result);
    }
    return result;
  };
  return createRelayEnvironment(loginFetch, null);
}

export async function fetchLoginBootstrap(
  client: BackendAIClient,
  variables: loginBootstrapQuery$variables = loginBootstrapVariables(client),
): Promise<LoginBootstrap> {
  const data = await fetchQuery<loginBootstrapQuery>(
    createLoginEnvironment(client),
    loginBootstrapQueryNode,
    variables,
    { fetchPolicy: 'network-only' },
  ).toPromise();
  if (!data) {
    throw new Error('The login bootstrap query returned no data.');
  }
  return data;
}

/** A refusal reads as "no session"; another HTTP failure leaves it live. */
function classifyProbeFailure(err: unknown): never {
  if (isSessionAuthFailure(err)) throw new SessionAuthFailureError(err);
  const status = (err as { statusCode?: unknown } | null)?.statusCode;
  if (typeof status === 'number' && status >= 400 && status !== 403) {
    throw new LoginBootstrapIncompleteError(err);
  }
  throw err;
}

/**
 * Ask the webserver whether it holds a session for this browser
 * (`login-check`), and only then load the bootstrap together with the manager
 * version. `null` means no session; any other failure is thrown, so an outage
 * is not mistaken for a logged-out browser.
 */
export async function probeLoginSession(
  client: BackendAIClient,
): Promise<LoginBootstrap | null> {
  try {
    const authenticated = await client
      .check_login({ rethrow: true })
      .catch(classifyProbeFailure);
    if (authenticated !== true) return null;
    const [, bootstrap] = await Promise.all([
      client.get_manager_version().catch(classifyProbeFailure),
      fetchLoginBootstrap(client),
    ]);
    return bootstrap;
  } catch (err) {
    if (err instanceof SessionAuthFailureError) return null;
    throw err;
  }
}
