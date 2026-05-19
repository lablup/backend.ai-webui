/**
 * @generated SignedSource<<6ab89330c9dbab6688b7e83669a9b612>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type StorageProxyListQuery$variables = {
  limit: number;
  offset: number;
};
export type StorageProxyListQuery$data = {
  readonly storage_volume_list: {
    readonly items: ReadonlyArray<{
      readonly backend: string | null | undefined;
      readonly capabilities: ReadonlyArray<string | null | undefined> | null | undefined;
      readonly fsprefix: string | null | undefined;
      readonly id: string | null | undefined;
      readonly path: string | null | undefined;
      readonly performance_metric: string | null | undefined;
      readonly usage: string | null | undefined;
    } | null | undefined>;
    readonly total_count: number;
  } | null | undefined;
};
export type StorageProxyListQuery = {
  response: StorageProxyListQuery$data;
  variables: StorageProxyListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v2 = [
  {
    "alias": null,
    "args": [
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
            "name": "capabilities",
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
            "name": "fsprefix",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "performance_metric",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "usage",
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
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "StorageProxyListQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "StorageProxyListQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "00f25e00fb3163b514baaa3ef857ead0",
    "id": null,
    "metadata": {},
    "name": "StorageProxyListQuery",
    "operationKind": "query",
    "text": "query StorageProxyListQuery(\n  $offset: Int!\n  $limit: Int!\n) {\n  storage_volume_list(limit: $limit, offset: $offset) {\n    items {\n      id\n      backend\n      capabilities\n      path\n      fsprefix\n      performance_metric\n      usage\n    }\n    total_count\n  }\n}\n"
  }
};
})();

(node as any).hash = "8eea8c97cb39a266757eaa25705b6633";

export default node;
