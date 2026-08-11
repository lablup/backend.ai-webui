/**
 * @generated SignedSource<<db0835aa82db1e1721be298b90ebbc64>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIStorageHostSelectAstryxValueQuery$variables = {
  filter?: string | null | undefined;
  limit: number;
  offset: number;
  skipSelected: boolean;
};
export type BAIStorageHostSelectAstryxValueQuery$data = {
  readonly storage_volume_list?: {
    readonly items: ReadonlyArray<{
      readonly backend: string | null | undefined;
      readonly id: string | null | undefined;
      readonly path: string | null | undefined;
      readonly proxy: string | null | undefined;
    } | null | undefined>;
    readonly total_count: number;
  } | null | undefined;
};
export type BAIStorageHostSelectAstryxValueQuery = {
  response: BAIStorageHostSelectAstryxValueQuery$data;
  variables: BAIStorageHostSelectAstryxValueQuery$variables;
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
    "condition": "skipSelected",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
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
            "name": "limit",
            "variableName": "limit"
          },
          {
            "kind": "Variable",
            "name": "offset",
            "variableName": "offset"
          }
        ],
        "concreteType": "StorageVolumeList",
        "kind": "LinkedField",
        "name": "storage_volume_list",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "StorageVolume",
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
                "name": "backend",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "path",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "proxy",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "total_count",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIStorageHostSelectAstryxValueQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIStorageHostSelectAstryxValueQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9ee1c57323bad7682cc32cb08df64ac0",
    "id": null,
    "metadata": {},
    "name": "BAIStorageHostSelectAstryxValueQuery",
    "operationKind": "query",
    "text": "query BAIStorageHostSelectAstryxValueQuery(\n  $filter: String\n  $limit: Int!\n  $offset: Int!\n  $skipSelected: Boolean!\n) {\n  storage_volume_list(filter: $filter, limit: $limit, offset: $offset) @skip(if: $skipSelected) {\n    items {\n      id\n      backend\n      path\n      proxy\n    }\n    total_count\n  }\n}\n"
  }
};
})();

(node as any).hash = "df826315ef9ffdc6e6385c47870d1f81";

export default node;
