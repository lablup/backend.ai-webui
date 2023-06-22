/**
 * @generated SignedSource<<7f0cf5d7cfc28120f84bff4753ad2400>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StorageHostSettingsQuery$variables = {
  id: string;
};
export type StorageHostSettingsQuery$data = {
  readonly storage_volume: {
    readonly id: string | null;
    readonly " $fragmentSpreads": FragmentRefs<"StorageHostResourcePanelFragment">;
  } | null;
};
export type StorageHostSettingsQuery = {
  response: StorageHostSettingsQuery$data;
  variables: StorageHostSettingsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "StorageHostSettingsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "StorageVolume",
        "kind": "LinkedField",
        "name": "storage_volume",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "StorageHostResourcePanelFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Queries",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "StorageHostSettingsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "StorageVolume",
        "kind": "LinkedField",
        "name": "storage_volume",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
            "name": "usage",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "40baa291aab2b2c671ebfa79a9b14111",
    "id": null,
    "metadata": {},
    "name": "StorageHostSettingsQuery",
    "operationKind": "query",
    "text": "query StorageHostSettingsQuery(\n  $id: String!\n) {\n  storage_volume(id: $id) {\n    id\n    ...StorageHostResourcePanelFragment\n  }\n}\n\nfragment StorageHostResourcePanelFragment on StorageVolume {\n  id\n  backend\n  capabilities\n  path\n  usage\n}\n"
  }
};
})();

(node as any).hash = "9b496800730dab86520ce26b3c358d65";

export default node;
