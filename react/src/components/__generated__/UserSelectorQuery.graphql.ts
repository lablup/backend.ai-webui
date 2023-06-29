/**
 * @generated SignedSource<<63313a3e1443ce845dad671cc4cd3221>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type UserSelectorQuery$variables = {
  limit: number;
  offset: number;
};
export type UserSelectorQuery$data = {
  readonly user_list: {
    readonly items: ReadonlyArray<{
      readonly id: string | null;
      readonly is_active: boolean | null;
      readonly username: string | null;
    } | null>;
  } | null;
};
export type UserSelectorQuery = {
  response: UserSelectorQuery$data;
  variables: UserSelectorQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "offset"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
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
            "name": "username",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "is_active",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "UserSelectorQuery",
    "selections": (v1/*: any*/),
    "type": "Queries",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserSelectorQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3895145a6da4be13bce21f5c9d551421",
    "id": null,
    "metadata": {},
    "name": "UserSelectorQuery",
    "operationKind": "query",
    "text": "query UserSelectorQuery(\n  $limit: Int!\n  $offset: Int!\n) {\n  user_list(limit: $limit, offset: $offset, is_active: true) {\n    items {\n      id\n      username\n      is_active\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b9c2dde6e43fc0de033badbb0f9035ae";

export default node;
