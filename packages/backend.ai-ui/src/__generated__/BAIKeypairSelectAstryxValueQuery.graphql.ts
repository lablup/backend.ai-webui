/**
 * @generated SignedSource<<d212557c350e678c1ae70c6c04b8d892>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIKeypairSelectAstryxValueQuery$variables = {
  filter?: string | null | undefined;
  limit: number;
  offset: number;
  skipSelected: boolean;
};
export type BAIKeypairSelectAstryxValueQuery$data = {
  readonly keypair_list?: {
    readonly items: ReadonlyArray<{
      readonly access_key: string | null | undefined;
      readonly is_active: boolean | null | undefined;
      readonly user_id: string | null | undefined;
    } | null | undefined>;
    readonly total_count: number;
  } | null | undefined;
};
export type BAIKeypairSelectAstryxValueQuery = {
  response: BAIKeypairSelectAstryxValueQuery$data;
  variables: BAIKeypairSelectAstryxValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "filter"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "offset"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skipSelected"
  }
],
v1 = [
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
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "access_key",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "user_id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "is_active",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "total_count",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIKeypairSelectAstryxValueQuery",
    "selections": [
      {
        "condition": "skipSelected",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
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
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/)
                ],
                "storageKey": null
              },
              (v5/*: any*/)
            ],
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIKeypairSelectAstryxValueQuery",
    "selections": [
      {
        "condition": "skipSelected",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
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
              },
              (v5/*: any*/)
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "ab8a77f66583b2c55ab0298d203ecb6f",
    "id": null,
    "metadata": {},
    "name": "BAIKeypairSelectAstryxValueQuery",
    "operationKind": "query",
    "text": "query BAIKeypairSelectAstryxValueQuery(\n  $filter: String\n  $limit: Int!\n  $offset: Int!\n  $skipSelected: Boolean!\n) {\n  keypair_list(filter: $filter, limit: $limit, offset: $offset) @skip(if: $skipSelected) {\n    items {\n      access_key\n      user_id\n      is_active\n      id\n    }\n    total_count\n  }\n}\n"
  }
};
})();

(node as any).hash = "bfde110b3855e803cd143b999267ad29";

export default node;
