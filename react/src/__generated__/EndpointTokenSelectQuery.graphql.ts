/**
 * @generated SignedSource<<b4c2bd16d169a3749d9ec76613a28da2>>
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
      readonly id: string | null | undefined;
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
v1 = {
  "alias": null,
  "args": [
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
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "token",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "created_at",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "valid_until",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
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
        "field": (v1/*: any*/),
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
      (v1/*: any*/)
    ]
  },
  "params": {
    "cacheID": "f8777131f4094de086beaa0e11d6ae09",
    "id": null,
    "metadata": {},
    "name": "EndpointTokenSelectQuery",
    "operationKind": "query",
    "text": "query EndpointTokenSelectQuery(\n  $endpointId: UUID!\n  $isEmptyEndpointId: Boolean!\n) {\n  endpoint_token_list(offset: 0, limit: 100, endpoint_id: $endpointId) @skipOnClient(if: $isEmptyEndpointId) {\n    items {\n      id\n      token\n      created_at\n      valid_until\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "839fdaad7009de6f1d8dc79de4e35a3d";

export default node;
