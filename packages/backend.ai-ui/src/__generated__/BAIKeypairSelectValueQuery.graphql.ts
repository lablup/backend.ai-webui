/**
 * @generated SignedSource<<47c7c476ec2f8c3cee908c079e25f33a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIKeypairSelectValueQuery$variables = {
  filter?: string | null | undefined;
  limit: number;
  offset: number;
  skipSelected: boolean;
};
export type BAIKeypairSelectValueQuery$data = {
  readonly keypair_list?: {
    readonly items: ReadonlyArray<{
      readonly access_key: string | null | undefined;
      readonly is_active: boolean | null | undefined;
      readonly user_id: string | null | undefined;
    } | null | undefined>;
    readonly total_count: number;
  } | null | undefined;
};
export type BAIKeypairSelectValueQuery = {
  response: BAIKeypairSelectValueQuery$data;
  variables: BAIKeypairSelectValueQuery$variables;
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
    "name": "BAIKeypairSelectValueQuery",
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
    "name": "BAIKeypairSelectValueQuery",
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
    "cacheID": "395813332d6c96ca7181792cabb9c0d9",
    "id": null,
    "metadata": {},
    "name": "BAIKeypairSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIKeypairSelectValueQuery(\n  $filter: String\n  $limit: Int!\n  $offset: Int!\n  $skipSelected: Boolean!\n) {\n  keypair_list(filter: $filter, limit: $limit, offset: $offset) @skip(if: $skipSelected) {\n    items {\n      access_key\n      user_id\n      is_active\n      id\n    }\n    total_count\n  }\n}\n"
  }
};
})();

(node as any).hash = "3d7f305b5f6569eac5ccbcbf3f988bba";

export default node;
