/**
 * @generated SignedSource<<ab59d6b59df37d995753f96f1de83d1c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourcePresetListQuery$variables = Record<PropertyKey, never>;
export type ResourcePresetListQuery$data = {
  readonly resource_presets: ReadonlyArray<{
    readonly name: string | null | undefined;
    readonly resource_slots: string | null | undefined;
    readonly scaling_group_name: string | null | undefined;
    readonly shared_memory: any | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"ResourcePresetSettingModalFragment">;
  } | null | undefined> | null | undefined;
};
export type ResourcePresetListQuery = {
  response: ResourcePresetListQuery$data;
  variables: ResourcePresetListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resource_slots",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "shared_memory",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scaling_group_name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourcePresetListQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ResourcePreset",
        "kind": "LinkedField",
        "name": "resource_presets",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ResourcePresetSettingModalFragment"
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ResourcePresetListQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ResourcePreset",
        "kind": "LinkedField",
        "name": "resource_presets",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
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
    ]
  },
  "params": {
    "cacheID": "5077b740e419c95cf7f162d8ad950d6d",
    "id": null,
    "metadata": {},
    "name": "ResourcePresetListQuery",
    "operationKind": "query",
    "text": "query ResourcePresetListQuery {\n  resource_presets {\n    name\n    resource_slots\n    shared_memory\n    scaling_group_name @since(version: \"25.4.0\")\n    ...ResourcePresetSettingModalFragment\n  }\n}\n\nfragment ResourcePresetSettingModalFragment on ResourcePreset {\n  id @since(version: \"25.4.0\")\n  name\n  resource_slots\n  shared_memory\n  scaling_group_name @since(version: \"25.4.0\")\n}\n"
  }
};
})();

(node as any).hash = "0284e5247dbfb40e6290f58570ba5fd7";

export default node;
