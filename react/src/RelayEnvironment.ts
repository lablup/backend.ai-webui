// import { createClient } from "graphql-ws";
import { manipulateGraphQLQueryWithClientDirectives } from './helper/graphql-transformer';
import {
  Environment,
  Network,
  RecordSource,
  Store,
  FetchFunction,
  SubscribeFunction,
  RelayFeatureFlags,
} from 'relay-runtime';

RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;

const fetchFn: FetchFunction = async (
  request,
  variables,
  // cacheConfig,
  // uploadables
) => {
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

  const transformedQuery = manipulateGraphQLQueryWithClientDirectives(
    request.text || '',
    variables,
    (version) => {
      // @ts-ignore
      return !globalThis.backendaiclient?.isManagerVersionCompatibleWith(
        version,
      );
    },
  );

  const reqBody = {
    query: transformedQuery,
    variables: variables,
  };

  //@ts-ignore
  const reqInfo = globalThis.backendaiclient?.newSignedRequest(
    'POST',
    '/admin/gql',
    reqBody,
  );

  const result =
    //@ts-ignore
    (await globalThis.backendaiclient
      ?._wrapWithPromise(reqInfo)
      .catch((err: any) => {
        if (err.isError && err.statusCode === 401) {
          const error = new Error('GraphQL Authorization Error');
          error.name = 'AuthorizationError';
          throw error;
        }
      })) || {};

  return result;
};

const subscribeFn: SubscribeFunction | undefined = undefined;

// if (typeof window !== "undefined") {
//   // We only want to setup subscriptions if we are on the client.
//   const subscriptionsClient = createClient({
//     url: WEBSOCKET_ENDPOINT,
//   });

//   subscribeFn = (request, variables) => {
//     // To understand why we return Observable.create<any>,
//     // please see: https://github.com/enisdenjo/graphql-ws/issues/316#issuecomment-1047605774
//     return Observable.create<any>((sink) => {
//       if (!request.text) {
//         return sink.error(new Error("Operation text cannot be empty"));
//       }

//       return subscriptionsClient.subscribe(
//         {
//           operationName: request.name,
//           query: request.text,
//           variables,
//         },
//         sink
//       );
//     });
//   };
// }

function createRelayEnvironment() {
  return new Environment({
    network: Network.create(fetchFn, subscribeFn),
    store: new Store(new RecordSource()),
  });
}

export const RelayEnvironment = createRelayEnvironment();
