/**
 * @generated SignedSource<<133654740c0a12ca07e0fdec128fba9c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
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
      readonly storageVolumeFrgmt: {
        readonly " $fragmentSpreads": FragmentRefs<"StorageHostDetailDrawerFragment">;
      };
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
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "backend",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "capabilities",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "path",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "fsprefix",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "usage",
  "storageKey": null
},
v9 = {
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
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "StorageProxyListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              {
                "fragment": {
                  "kind": "InlineFragment",
                  "selections": [
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "StorageHostDetailDrawerFragment"
                    }
                  ],
                  "type": "StorageVolume",
                  "abstractKey": null
                },
                "kind": "AliasedInlineFragmentSpread",
                "name": "storageVolumeFrgmt"
              }
            ],
            "storageKey": null
          },
          (v9/*: any*/)
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
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "StorageProxyListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/)
            ],
            "storageKey": null
          },
          (v9/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4f1462cec52085765aa46752d679da09",
    "id": null,
    "metadata": {},
    "name": "StorageProxyListQuery",
    "operationKind": "query",
    "text": "query StorageProxyListQuery(\n  $offset: Int!\n  $limit: Int!\n) {\n  storage_volume_list(limit: $limit, offset: $offset) {\n    items {\n      id\n      backend\n      capabilities\n      path\n      fsprefix\n      usage\n      ...StorageHostDetailDrawerFragment\n    }\n    total_count\n  }\n}\n\nfragment StorageHostDetailDrawerContentFragment on StorageVolume {\n  id\n  path\n  capabilities\n  ...StorageHostResourcePanelFragment\n  ...StorageHostSettingsPanel_storageVolumeFrgmt\n}\n\nfragment StorageHostDetailDrawerFragment on StorageVolume {\n  id\n  ...StorageHostDetailDrawerContentFragment\n}\n\nfragment StorageHostResourcePanelFragment on StorageVolume {\n  id\n  backend\n  capabilities\n  path\n  usage\n}\n\nfragment StorageHostSettingsPanel_storageVolumeFrgmt on StorageVolume {\n  id\n  capabilities\n}\n"
  }
};
})();

(node as any).hash = "5978dbc7a150e4d15665d13e16f4469a";

export default node;
