/**
 * @generated SignedSource<<2d16a06beb2bd16bb0eb53daff4dc169>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type UserSelectorQuery$variables = {
  filter?: string | null;
  limit: number;
  offset: number;
};
export type UserSelectorQuery$data = {
  readonly user_list: {
    readonly items: ReadonlyArray<{
      readonly id: string | null;
      readonly is_active: boolean | null;
      readonly resource_policy: string | null;
      readonly username: string | null;
    } | null>;
  } | null;
};
export type UserSelectorQuery = {
  response: UserSelectorQuery$data;
  variables: UserSelectorQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "filter"
      },
      {
        "kind": "Literal",
        "name": "is_active",
        "value": true
      },
      {
        "kind": "Variable",
        "name": "limit",
        "variableName": "limit"
      },
      {
        "kind": "Variable",
        "name": "offset",
        "variableName": "offset"
      }
    ],
    "concreteType": "UserList",
    "kind": "LinkedField",
    "name": "user_list",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
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
            "name": "is_active",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "username",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "resource_policy",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "UserSelectorQuery",
    "selections": (v3/*: any*/),
    "type": "Queries",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "UserSelectorQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "09dbd9bf5dab92b023be3c3c1401a57e",
    "id": null,
    "metadata": {},
    "name": "UserSelectorQuery",
    "operationKind": "query",
    "text": "query UserSelectorQuery(\n  $limit: Int!\n  $offset: Int!\n  $filter: String\n) {\n  user_list(limit: $limit, offset: $offset, filter: $filter, is_active: true) {\n    items {\n      id\n      is_active\n      username\n      resource_policy\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ba16f5707f025478e8739eed645dc2f9";

export default node;
