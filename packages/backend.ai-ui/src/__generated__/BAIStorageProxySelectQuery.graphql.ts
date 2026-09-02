/**
 * @generated SignedSource<<d09af534edf474e3d59b59003cfc7c73>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIStorageProxySelectQuery$variables = {
  limit: number;
};
export type BAIStorageProxySelectQuery$data = {
  readonly storage_volume_list: {
    readonly items: ReadonlyArray<{
      readonly proxy: string | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type BAIStorageProxySelectQuery = {
  response: BAIStorageProxySelectQuery$data;
  variables: BAIStorageProxySelectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "kind": "Literal",
    "name": "offset",
    "value": 0
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "proxy",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIStorageProxySelectQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
              (v2/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIStorageProxySelectQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "b18d8c964bbf7af60d564f4fa0f82338",
    "id": null,
    "metadata": {},
    "name": "BAIStorageProxySelectQuery",
    "operationKind": "query",
    "text": "query BAIStorageProxySelectQuery(\n  $limit: Int!\n) {\n  storage_volume_list(limit: $limit, offset: 0) {\n    items {\n      proxy\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e0ada7211322acef77d2fdb321215b0b";

export default node;
