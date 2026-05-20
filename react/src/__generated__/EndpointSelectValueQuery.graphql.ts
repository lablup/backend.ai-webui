/**
 * @generated SignedSource<<517bf374e2ffd9c5f6e52c1bfe885b7b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EndpointSelectValueQuery$variables = {
  endpoint_id: string;
};
export type EndpointSelectValueQuery$data = {
  readonly endpoint: {
    readonly endpoint_id: string;
    readonly name: string | null | undefined;
    readonly url: string | null | undefined;
  } | null | undefined;
};
export type EndpointSelectValueQuery = {
  response: EndpointSelectValueQuery$data;
  variables: EndpointSelectValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "endpoint_id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "endpoint_id",
    "variableName": "endpoint_id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "endpoint_id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "EndpointSelectValueQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Endpoint",
        "kind": "LinkedField",
        "name": "endpoint",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "RequiredField",
            "field": (v3/*: any*/),
            "action": "NONE"
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EndpointSelectValueQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Endpoint",
        "kind": "LinkedField",
        "name": "endpoint",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "305b4336fc43ab460edf54efa95ff116",
    "id": null,
    "metadata": {},
    "name": "EndpointSelectValueQuery",
    "operationKind": "query",
    "text": "query EndpointSelectValueQuery(\n  $endpoint_id: UUID!\n) {\n  endpoint(endpoint_id: $endpoint_id) {\n    name\n    endpoint_id\n    url\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "5f7c6954ddf84a211dc8428e86004300";

export default node;
