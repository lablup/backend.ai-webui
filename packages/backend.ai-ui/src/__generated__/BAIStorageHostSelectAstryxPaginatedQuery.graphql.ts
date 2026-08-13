/**
 * @generated SignedSource<<4c622e1c515978be8a07ddfb06cef8a8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIStorageHostSelectAstryxPaginatedQuery$variables = {
  filter?: string | null | undefined;
  limit: number;
  offset: number;
  order?: string | null | undefined;
};
export type BAIStorageHostSelectAstryxPaginatedQuery$data = {
  readonly storage_volume_list: {
    readonly items: ReadonlyArray<{
      readonly backend: string | null | undefined;
      readonly id: string | null | undefined;
      readonly path: string | null | undefined;
      readonly proxy: string | null | undefined;
    } | null | undefined>;
    readonly total_count: number;
  } | null | undefined;
};
export type BAIStorageHostSelectAstryxPaginatedQuery = {
  response: BAIStorageHostSelectAstryxPaginatedQuery$data;
  variables: BAIStorageHostSelectAstryxPaginatedQuery$variables;
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
        "name": "limit",
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
    "name": "BAIStorageHostSelectAstryxPaginatedQuery",
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
    "name": "BAIStorageHostSelectAstryxPaginatedQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "dfe15d19ee2568d4ad74ba2afef694ed",
    "id": null,
    "metadata": {},
    "name": "BAIStorageHostSelectAstryxPaginatedQuery",
    "operationKind": "query",
    "text": "query BAIStorageHostSelectAstryxPaginatedQuery(\n  $offset: Int!\n  $limit: Int!\n  $filter: String\n  $order: String\n) {\n  storage_volume_list(offset: $offset, limit: $limit, filter: $filter, order: $order) {\n    items {\n      id\n      backend\n      path\n      proxy\n    }\n    total_count\n  }\n}\n"
  }
};
})();

(node as any).hash = "73c918e408d11488212fc74eb5136ba2";

export default node;
