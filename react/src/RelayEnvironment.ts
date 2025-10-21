// import { createClient } from "graphql-ws";
import { manipulateGraphQLQueryWithClientDirectives } from './helper/graphql-transformer';
import { createClient } from 'graphql-ws';
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
} from 'relay-runtime';

RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;

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
};
const getSubscriptionEndpoint = async () => {
  await waitForBAIClient();
  let api_endpoint: any = localStorage.getItem('backendaiwebui.api_endpoint');
  if (api_endpoint !== null) {
    api_endpoint = api_endpoint.replace('http://', 'ws://');
    api_endpoint = api_endpoint.replace(/^"+|"+$/g, ''); // Remove trailing slashes

    if (api_endpoint.endsWith('/')) {
      api_endpoint += 'func/admin/gql';
    } else {
      api_endpoint += '/func/admin/gql';
    }
  }
  return api_endpoint;
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

const subscriptionsClient = createClient({
  url: getSubscriptionEndpoint,
  connectionParams: () => {
    // Note: getSession() is a placeholder function created by you
    // const session = getSession();
    // if (!session) {
    //   return {};
    // }
    return {
      // 'X-BackendAI-SessionID': '--',
      // Authorization: `Bearer ${session.token}`,
    };
  },
});

function fetchOrSubscribe(
  operation: RequestParameters,
  variables: Variables,
): Observable<any> {
  return Observable.create((sink) => {
    if (!operation.text) {
      return sink.error(new Error('Operation text cannot be empty'));
    }
    // const transformedOperation = manipulateGraphQLQueryWithClientDirectives(
    //   operation.text || '',
    //   variables,
    //   (version) => {
    //     // @ts-ignore
    //     return !globalThis.backendaiclient?.isManagerVersionCompatibleWith(
    //       version,
    //     );
    //   },
    // );

    return subscriptionsClient.subscribe(
      {
        operationName: operation.name,
        // query: transformedOperation,
        query: operation.text,
        variables,
      },
      sink,
    );
  });
}

// const subscribeFn: SubscribeFunction | undefined = undefined;
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
    network: Network.create(fetchFn, fetchOrSubscribe),
    store: new Store(new RecordSource()),
  });
}

export const RelayEnvironment = createRelayEnvironment();
