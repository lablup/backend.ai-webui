/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { manipulateGraphQLQueryWithClientDirectives } from './helper/graphql-transformer';
import type { BackendAIClient } from './hooks';
import { GraphQLFormattedError } from 'graphql';
import { createClient } from 'graphql-sse';
import {
  Environment,
  Network,
  RecordSource,
  Store,
  FetchFunction,
  RelayFeatureFlags,
  RequestParameters,
  SubscribeFunction,
  Variables,
  Observable,
  GraphQLSingularResponse,
} from 'relay-runtime';

RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;

/**
 * Check if the manager version is not compatible with the given version(s).
 * Used for client-side GraphQL directive handling.
 */
const isNotCompatibleWith = (
  client: BackendAIClient | null | undefined,
  version: string | string[],
): boolean => {
  if (!client?.isManagerVersionCompatibleWith) return false;
  if (Array.isArray(version)) {
    return version.some((v) => !client.isManagerVersionCompatibleWith(v));
  }
  return !client.isManagerVersionCompatibleWith(version);
};

const isNotCompatibleWithVersion = (version: string | string[]): boolean =>
  isNotCompatibleWith(globalThis.backendaiclient, version);

const waitForBAIClient = async () => {
  //@ts-ignore
  if (globalThis.backendaiclient === undefined) {
    // If globalThis.backendaiclient is not defined, wait for the backend-ai-connected event.
    await new Promise((resolve) => {
      const onBackendAIConnected = () => {
        // When the backend-ai-connected event occurs, remove the event listener and execute the function.
        document.removeEventListener(
          'backend-ai-connected',
          onBackendAIConnected,
        );
        resolve(undefined);
      };
      document.addEventListener('backend-ai-connected', onBackendAIConnected);
    });
  }
  // @ts-ignore
  return globalThis.backendaiclient;
};
const getSubscriptionEndpoint = async (): Promise<string> => {
  const baliClient = await waitForBAIClient();
  let api_endpoint = baliClient?._config.endpoint;
  if (api_endpoint) {
    api_endpoint = api_endpoint.replace(/^"+|"+$/g, ''); // Remove leading and trailing quotes
    api_endpoint += '/func/admin/gql';
  }
  return api_endpoint || '';
};

/**
 * The fetch behind every Relay operation: strip version-gated fields, sign
 * the request the way the rest of the client does, and hand Relay the whole
 * body (`errors` included). The app environment resolves the global client
 * once it connects; signing in resolves the client it is about to connect.
 */
export function createFetchFn(
  getClient: () => Promise<BackendAIClient | null | undefined>,
): FetchFunction {
  return async (request, variables) => {
    const client = await getClient();
    if (!client) return {};

    const transformedQuery = manipulateGraphQLQueryWithClientDirectives(
      request.text || '',
      variables,
      (version) => isNotCompatibleWith(client, version),
    );
    const reqInfo = client.newSignedRequest('POST', '/admin/gql', {
      query: transformedQuery,
      variables,
    });

    const result =
      (await client
        ._wrapWithPromise(reqInfo)
        .then((res: any) => {
          // A gateway reports an upstream HTTP failure as a 200 with all-null root
          // fields; throw it so the `.catch` below handles it like a direct one.
          const upstream = res?.errors?.find(
            (e: any) => e?.extensions?.response?.status >= 400,
          )?.extensions?.response;
          if (
            upstream &&
            !Object.values(res.data ?? {}).some((v) => v != null)
          ) {
            const detail = upstream.body?.msg ?? res.errors[0]?.message;
            throw {
              isError: true,
              ...upstream.body,
              statusCode: upstream.status,
              statusText: upstream.statusText,
              message: detail,
              description: detail,
            };
          }
          return res;
        })
        .catch((err: any) => {
          if (err.isError && err.statusCode === 401) {
            // The manager's IP-block 401 has no distinct error code, only this msg.
            const isIpBlocked = /is not allowed IP address/.test(
              err.description,
            );
            throw Object.assign(new Error('GraphQL Authorization Error'), {
              name: 'AuthorizationError',
              description: isIpBlocked ? err.description : undefined,
            });
          }
          throw err;
        })) || {};

    if (result.errors) {
      // Relay >= 18.1 drops `message` from @catch errors; keep the original text.
      result.errors.forEach((error: GraphQLFormattedError) => {
        if (error.extensions && error.message) {
          error.extensions.rawErrorMessage = error.message;
        }
      });
    }
    return result;
  };
}

const fetchFn = createFetchFn(waitForBAIClient);

const subscriptionsClient = createClient({
  url: getSubscriptionEndpoint,
  headers: () => {
    const sessionId: string | undefined =
      // @ts-ignore
      globalThis.backendaiclient?._loginSessionId;
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['X-BackendAI-SessionID'] = sessionId;
    }
    return headers;
  },
  retryAttempts: 3,
  retry: async () => {
    // Wait and retry on connection failure
    await new Promise((resolve) => setTimeout(resolve, 1000));
  },
});

function fetchForSubscribe(
  operation: RequestParameters,
  variables: Variables,
): Observable<GraphQLSingularResponse> {
  return Observable.create((sink) => {
    if (!operation.text) {
      return sink.error(new Error('Operation text cannot be empty'));
    }
    const transformedOperation = manipulateGraphQLQueryWithClientDirectives(
      operation.text || '',
      variables,
      isNotCompatibleWithVersion,
    );

    return subscriptionsClient.subscribe(
      {
        operationName: operation.name,
        query: transformedOperation,
        variables,
      },
      sink as Parameters<typeof subscriptionsClient.subscribe>[1],
    );
  });
}

export function createRelayEnvironment(
  fetch: FetchFunction = fetchFn,
  subscribe: SubscribeFunction | undefined = fetchForSubscribe,
) {
  return new Environment({
    network: Network.create(fetch, subscribe),
    store: new Store(new RecordSource(), {
      // FR-3430: retains step queries released during FairShare step navigation (default 10)
      gcReleaseBufferSize: 20,
    }),
    // fetchFn strips version-gated fields (@since etc.); store them as null, not
    // missing, so availability checks can serve the cache instead of refetching.
    treatMissingFieldsAsNull: true,
  });
}

export const RelayEnvironment = createRelayEnvironment();
