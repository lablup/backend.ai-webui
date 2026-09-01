/**
 * @generated SignedSource<<3f5359b1caad6f6556c5096c7101351a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useStorageProxyDiagnosticsQuery$variables = Record<PropertyKey, never>;
export type useStorageProxyDiagnosticsQuery$data = {
  readonly storage_volume_list: {
    readonly items: ReadonlyArray<{
      readonly backend: string | null | undefined;
      readonly id: string | null | undefined;
      readonly usage: string | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type useStorageProxyDiagnosticsQuery = {
  response: useStorageProxyDiagnosticsQuery$data;
  variables: useStorageProxyDiagnosticsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "limit",
        "value": 100
      },
      {
        "kind": "Literal",
        "name": "offset",
        "value": 0
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
            "name": "usage",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": "storage_volume_list(limit:100,offset:0)"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "useStorageProxyDiagnosticsQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useStorageProxyDiagnosticsQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "bed06fbe871301c261629e59e4524a6b",
    "id": null,
    "metadata": {},
    "name": "useStorageProxyDiagnosticsQuery",
    "operationKind": "query",
    "text": "query useStorageProxyDiagnosticsQuery {\n  storage_volume_list(limit: 100, offset: 0) {\n    items {\n      id\n      backend\n      usage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "bc5556062e0b3fed8a8e076eeaf2c5a7";

export default node;
