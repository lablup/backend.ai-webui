// import { createClient } from "graphql-ws";
import { removeSkipOnClientDirective } from './helper/graphql-transformer';
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
  // @skipOnClient directive modifies GraphQL queries according to the availability of a supported field.
  const transformedData = removeSkipOnClientDirective(
    request.text || '',
    variables,
  );

  const reqBody = {
    query: transformedData.query,
    variables: transformedData.variables,
  };

  //@ts-ignore
  const reqInfo = globalThis.backendaiclient?.newSignedRequest(
    'POST',
    '/admin/gql',
    reqBody,
  );

  //@ts-ignore
  const result = await globalThis.backendaiclient?._wrapWithPromise(
    reqInfo,
    false,
    null,
    10000,
    0,
  );

  return result;
};

let subscribeFn: SubscribeFunction;

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
