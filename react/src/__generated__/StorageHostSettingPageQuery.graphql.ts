/**
 * @generated SignedSource<<f417935369b18cd8afb1995aeed014a9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StorageHostSettingPageQuery$variables = {
  id?: string | null | undefined;
};
export type StorageHostSettingPageQuery$data = {
  readonly storage_volume: {
    readonly capabilities: ReadonlyArray<string | null | undefined> | null | undefined;
    readonly id: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"StorageHostResourcePanelFragment" | "StorageHostSettingsPanel_storageVolumeFrgmt">;
  } | null | undefined;
};
export type StorageHostSettingPageQuery = {
  response: StorageHostSettingPageQuery$data;
  variables: StorageHostSettingPageQuery$variables;
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
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "capabilities",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "StorageHostSettingPageQuery",
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
          (v3/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "StorageHostResourcePanelFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "StorageHostSettingsPanel_storageVolumeFrgmt"
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
    "name": "StorageHostSettingPageQuery",
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
          (v3/*: any*/),
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
            "name": "usage",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "821175f86743d9d81be2a55aca371919",
    "id": null,
    "metadata": {},
    "name": "StorageHostSettingPageQuery",
    "operationKind": "query",
    "text": "query StorageHostSettingPageQuery(\n  $id: String\n) {\n  storage_volume(id: $id) {\n    id\n    capabilities\n    ...StorageHostResourcePanelFragment\n    ...StorageHostSettingsPanel_storageVolumeFrgmt\n  }\n}\n\nfragment StorageHostResourcePanelFragment on StorageVolume {\n  id\n  backend\n  capabilities\n  path\n  usage\n}\n\nfragment StorageHostSettingsPanel_storageVolumeFrgmt on StorageVolume {\n  id\n  capabilities\n}\n"
  }
};
})();

(node as any).hash = "f6e77057e83b0449ef99e8918e794b24";

export default node;
