/**
 * @generated SignedSource<<5ba5b0a56fa4b6437778e503f0d1d7a6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIKeypairSelectAstryxPaginatedQuery$variables = {
  filter?: string | null | undefined;
  limit: number;
  offset: number;
};
export type BAIKeypairSelectAstryxPaginatedQuery$data = {
  readonly keypair_list: {
    readonly items: ReadonlyArray<{
      readonly access_key: string | null | undefined;
      readonly is_active: boolean | null | undefined;
      readonly user_id: string | null | undefined;
    } | null | undefined>;
    readonly total_count: number;
  } | null | undefined;
};
export type BAIKeypairSelectAstryxPaginatedQuery = {
  response: BAIKeypairSelectAstryxPaginatedQuery$data;
  variables: BAIKeypairSelectAstryxPaginatedQuery$variables;
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
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
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
  },
  {
    "kind": "Literal",
    "name": "order",
    "value": "-created_at"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "access_key",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "user_id",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "is_active",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "total_count",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIKeypairSelectAstryxPaginatedQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "KeyPairList",
        "kind": "LinkedField",
        "name": "keypair_list",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "KeyPair",
            "kind": "LinkedField",
            "name": "items",
            "plural": true,
            "selections": [
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/)
            ],
            "storageKey": null
          },
          (v7/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIKeypairSelectAstryxPaginatedQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "KeyPairList",
        "kind": "LinkedField",
        "name": "keypair_list",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "KeyPair",
            "kind": "LinkedField",
            "name": "items",
            "plural": true,
            "selections": [
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v7/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a115cccdbc7d74b6bdf6875ea747cc17",
    "id": null,
    "metadata": {},
    "name": "BAIKeypairSelectAstryxPaginatedQuery",
    "operationKind": "query",
    "text": "query BAIKeypairSelectAstryxPaginatedQuery(\n  $offset: Int!\n  $limit: Int!\n  $filter: String\n) {\n  keypair_list(offset: $offset, limit: $limit, filter: $filter, order: \"-created_at\") {\n    items {\n      access_key\n      user_id\n      is_active\n      id\n    }\n    total_count\n  }\n}\n"
  }
};
})();

(node as any).hash = "799a71610874a163d9e61af1bede9e20";

export default node;
