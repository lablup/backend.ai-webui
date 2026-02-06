/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { manipulateGraphQLQueryWithClientDirectives } from './helper/graphql-transformer';
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
  Variables,
  Observable,
  GraphQLSingularResponse,
} from 'relay-runtime';

RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;

/**
 * Check if the manager version is not compatible with the given version(s).
 * Used for client-side GraphQL directive handling.
 */
const isNotCompatibleWithVersion = (version: string | string[]): boolean => {
  // @ts-ignore
  const client = globalThis.backendaiclient;
  if (!client?.isManagerVersionCompatibleWith) return false;
  if (Array.isArray(version)) {
    return version.some((v) => !client.isManagerVersionCompatibleWith(v));
  }
  return !client.isManagerVersionCompatibleWith(version);
};

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

const fetchFn: FetchFunction = async (
  request,
  variables,
  // cacheConfig,
  // uploadables
) => {
  await waitForBAIClient();

  const transformedQuery = manipulateGraphQLQueryWithClientDirectives(
    request.text || '',
    variables,
    isNotCompatibleWithVersion,
  );

  const reqBody = {
    query: transformedQuery,
    variables: variables,
  };

  // @ts-ignore
  const reqInfo = globalThis.backendaiclient?.newSignedRequest(
    'POST',
    '/admin/gql',
    reqBody,
  );

  const result =
    // @ts-ignore
    (await globalThis.backendaiclient
      ?._wrapWithPromise(reqInfo)
      .catch((err: any) => {
        if (err.isError && err.statusCode === 401) {
          const error = new Error('GraphQL Authorization Error');
          error.name = 'AuthorizationError';
          throw error;
        }
        throw err;
      })) || {};

  if (result.errors) {
    // NOTE: Starting from Relay 18.1.0, the error returned by @catch directive no longer has a message field,
    // so we store the original message in the extensions.rawErrorMessage field.
    // https://github.com/facebook/relay/releases/tag/v18.1.0
    result.errors.forEach((error: GraphQLFormattedError) => {
      if (error.extensions && error.message) {
        error.extensions.rawErrorMessage = error.message;
      }
    });
  }

  return result;
};

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

function createRelayEnvironment() {
  return new Environment({
    network: Network.create(fetchFn, fetchForSubscribe),
    store: new Store(new RecordSource()),
  });
}

export const RelayEnvironment = createRelayEnvironment();
