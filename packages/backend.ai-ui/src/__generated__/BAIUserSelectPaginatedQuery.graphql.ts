/**
 * @generated SignedSource<<fa64d28ab60b1013ce519e106bdfb6b6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIUserSelectPaginatedQuery$variables = {
  filter?: string | null | undefined;
  limit: number;
  offset: number;
  order?: string | null | undefined;
};
export type BAIUserSelectPaginatedQuery$data = {
  readonly user_nodes: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly email: string | null | undefined;
        readonly full_name: string | null | undefined;
        readonly id: string;
        readonly role: string | null | undefined;
        readonly status: string | null | undefined;
        readonly username: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type BAIUserSelectPaginatedQuery = {
  response: BAIUserSelectPaginatedQuery$data;
  variables: BAIUserSelectPaginatedQuery$variables;
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
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "order"
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "filter"
      },
      {
        "kind": "Variable",
        "name": "first",
        "variableName": "limit"
      },
      {
        "kind": "Variable",
        "name": "offset",
        "variableName": "offset"
      },
      {
        "kind": "Variable",
        "name": "order",
        "variableName": "order"
      }
    ],
    "concreteType": "UserConnection",
    "kind": "LinkedField",
    "name": "user_nodes",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "count",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "UserEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserNode",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
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
                "name": "email",
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
                "name": "full_name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "status",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "role",
                "storageKey": null
              }
            ],
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
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIUserSelectPaginatedQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIUserSelectPaginatedQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "a24f43a238691bb0eaa379168e0ce314",
    "id": null,
    "metadata": {},
    "name": "BAIUserSelectPaginatedQuery",
    "operationKind": "query",
    "text": "query BAIUserSelectPaginatedQuery(\n  $offset: Int!\n  $limit: Int!\n  $filter: String\n  $order: String\n) {\n  user_nodes(offset: $offset, first: $limit, filter: $filter, order: $order) {\n    count\n    edges {\n      node {\n        id\n        email\n        username\n        full_name\n        status\n        role\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "60ba08de92d2afccc6f7bbe4b05e4f62";

export default node;
