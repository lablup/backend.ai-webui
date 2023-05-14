import _ from "lodash";
import {
  Environment,
  Network,
  RecordSource,
  Store,
  Observable,
  FetchFunction,
  SubscribeFunction,
  RelayFeatureFlags,
} from "relay-runtime";
// import { createClient } from "graphql-ws";
import * as RelayRuntime from "relay-runtime";

RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;

const HTTP_ENDPOINT = "http://localhost:5000/graphql";
const WEBSOCKET_ENDPOINT = "ws://localhost:5000/graphql";

const fetchFn: FetchFunction = async (
  request,
  variables
  // cacheConfig,
  // uploadables
) => {
  // const resp = await fetch(HTTP_ENDPOINT, {
  //   method: "POST",
  //   headers: {
  //     Accept:
  //       "application/graphql-response+json; charset=utf-8, application/json; charset=utf-8",
  //     "Content-Type": "application/json",
  //     // <-- Additional headers like 'Authorization' would go here
  //   },
  //   body: JSON.stringify({
  //     query: request.text, // <-- The GraphQL document composed by Relay
  //     variables,
  //   }),
  // });

  // return await resp.json();

  // globalThis.backendaiclient.

  console.log("###", request.text, variables);
  console.log(removeSkipDirective(request.text || "", variables));
  const reqBody = {
    query: request.text, // <-- The GraphQL document composed by Relay
    variables,
  };
  // const reqBody = {
  //   query:
  //     "query($limit:Int!, $offset:Int!, $ak:String, $group_id:String, $status:String) {\n      compute_session_list(limit:$limit, offset:$offset, access_key:$ak, group_id:$group_id, status:$status) {\n        items { name hello}\n        total_count\n      }\n    }",
  //   variables: { limit: 1000, offset: 0, status: "RUNNING", ak: null },
  // };

  //@ts-ignore
  const reqInfo = globalThis.backendaiclient.newSignedRequest(
    "POST",
    "/admin/gql",
    reqBody
  );

  //@ts-ignore
  const result = await globalThis.backendaiclient._wrapWithPromise(
    reqInfo,
    false,
    null,
    10000,
    0
  );

  console.log("##", result);
  return result;

  // const resp = await fetch(reqInfo.uri, {
  //   method: reqInfo.method,
  //   headers: reqInfo.headers,
  //   body: reqInfo.body,
  //   cache: "no-cache",
  // });
  // return await resp.json();
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

function parseDirectives(str: string) {
  const pattern = /(\w+)\s@\s*(\w+)\s*\(\s*(\w+)\s*:\s*(\$?\w+)\s*\)/g;
  const directives = [];

  let result;
  while ((result = pattern.exec(str)) !== null) {
    const [originFieldStr, fieldName, directive, argumentName, argumentValue] =
      result;
    directives.push({
      fieldName,
      directive,
      argumentName,
      argumentValue,
      originFieldStr,
    });
  }

  return directives;
}

function removeSkipDirective(str: string, variables: any) {
  const directives = parseDirectives(str);
  directives.forEach((directive) => {
    if (
      directive.directive === "skip" &&
      directive.argumentName === "if" &&
      directive.argumentValue &&
      variables[directive.argumentValue.replace("$", "")] === true
    ) {
      str = str.replace(directive.originFieldStr, "");
    }
  });
  return str;
}
