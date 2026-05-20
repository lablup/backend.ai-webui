/**
 * @generated SignedSource<<e136dda5983ff012d9855cbe390fdb73>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIKeypairSelectPaginatedQuery$variables = {
  filter?: string | null | undefined;
  limit: number;
  offset: number;
};
export type BAIKeypairSelectPaginatedQuery$data = {
  readonly keypair_list: {
    readonly items: ReadonlyArray<{
      readonly access_key: string | null | undefined;
      readonly is_active: boolean | null | undefined;
      readonly user_id: string | null | undefined;
    } | null | undefined>;
    readonly total_count: number;
  } | null | undefined;
};
export type BAIKeypairSelectPaginatedQuery = {
  response: BAIKeypairSelectPaginatedQuery$data;
  variables: BAIKeypairSelectPaginatedQuery$variables;
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
    "name": "BAIKeypairSelectPaginatedQuery",
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
    "name": "BAIKeypairSelectPaginatedQuery",
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
    "cacheID": "c66dac249781944d750ad5aab75d5f30",
    "id": null,
    "metadata": {},
    "name": "BAIKeypairSelectPaginatedQuery",
    "operationKind": "query",
    "text": "query BAIKeypairSelectPaginatedQuery(\n  $offset: Int!\n  $limit: Int!\n  $filter: String\n) {\n  keypair_list(offset: $offset, limit: $limit, filter: $filter, order: \"-created_at\") {\n    items {\n      access_key\n      user_id\n      is_active\n      id\n    }\n    total_count\n  }\n}\n"
  }
};
})();

(node as any).hash = "d6f91aa26322b87c37ccf238415b798e";

export default node;
