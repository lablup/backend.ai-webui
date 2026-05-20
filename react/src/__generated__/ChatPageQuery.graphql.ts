/**
 * @generated SignedSource<<b9c835ae59fc4454a8cb72eb6ef1f909>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ChatPageQuery$variables = {
  filter?: string | null | undefined;
};
export type ChatPageQuery$data = {
  readonly endpoint_list: {
    readonly items: ReadonlyArray<{
      readonly endpoint_id: string | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type ChatPageQuery = {
  response: ChatPageQuery$data;
  variables: ChatPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "filter"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
  },
  {
    "kind": "Literal",
    "name": "offset",
    "value": 0
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "endpoint_id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ChatPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "EndpointList",
        "kind": "LinkedField",
        "name": "endpoint_list",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Endpoint",
            "kind": "LinkedField",
            "name": "items",
            "plural": true,
            "selections": [
              (v2/*: any*/)
            ],
            "storageKey": null
          }
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
    "name": "ChatPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "EndpointList",
        "kind": "LinkedField",
        "name": "endpoint_list",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Endpoint",
            "kind": "LinkedField",
            "name": "items",
            "plural": true,
            "selections": [
              (v2/*: any*/),
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "763e262ee50ff2487754885efebacb90",
    "id": null,
    "metadata": {},
    "name": "ChatPageQuery",
    "operationKind": "query",
    "text": "query ChatPageQuery(\n  $filter: String\n) {\n  endpoint_list(limit: 1, offset: 0, filter: $filter) {\n    items {\n      endpoint_id\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "81b9bb8d9bd90410dd13088b30f18dc2";

export default node;
