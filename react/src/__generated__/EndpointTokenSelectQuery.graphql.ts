/**
 * @generated SignedSource<<80cec6642b351d05b7d470658e2cbe36>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type EndpointTokenSelectQuery$variables = {
  endpointId: string;
  isEmptyEndpointId: boolean;
};
export type EndpointTokenSelectQuery$data = {
  readonly endpoint_token_list: Result<{
    readonly items: ReadonlyArray<{
      readonly created_at: string;
      readonly token: string;
      readonly valid_until: string | null | undefined;
    } | null | undefined>;
  } | null | undefined, unknown>;
};
export type EndpointTokenSelectQuery = {
  response: EndpointTokenSelectQuery$data;
  variables: EndpointTokenSelectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "endpointId"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "isEmptyEndpointId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "endpoint_id",
    "variableName": "endpointId"
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 100
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
  "name": "token",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "created_at",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "valid_until",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "EndpointTokenSelectQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
          "alias": null,
          "args": (v1/*: any*/),
          "concreteType": "EndpointTokenList",
          "kind": "LinkedField",
          "name": "endpoint_token_list",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "EndpointToken",
              "kind": "LinkedField",
              "name": "items",
              "plural": true,
              "selections": [
                (v2/*: any*/),
                (v3/*: any*/),
                (v4/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EndpointTokenSelectQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "EndpointTokenList",
        "kind": "LinkedField",
        "name": "endpoint_token_list",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "EndpointToken",
            "kind": "LinkedField",
            "name": "items",
            "plural": true,
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "84d011fac998c133366cc63a2a96a765",
    "id": null,
    "metadata": {},
    "name": "EndpointTokenSelectQuery",
    "operationKind": "query",
    "text": "query EndpointTokenSelectQuery(\n  $endpointId: UUID!\n  $isEmptyEndpointId: Boolean!\n) {\n  endpoint_token_list(offset: 0, limit: 100, endpoint_id: $endpointId) @skipOnClient(if: $isEmptyEndpointId) {\n    items {\n      token\n      created_at\n      valid_until\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9268ac6db314e38aa00ab7825531aae6";

export default node;
