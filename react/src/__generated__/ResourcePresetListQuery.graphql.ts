/**
 * @generated SignedSource<<d4cf06629cf708c43f899bb8d0fda5cf>>
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
    readonly id: string | null | undefined;
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
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resource_slots",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "shared_memory",
  "storageKey": null
},
v4 = {
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
          (v4/*: any*/),
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
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "9864749c822cc7ac9ac501332e72cfe8",
    "id": null,
    "metadata": {},
    "name": "ResourcePresetListQuery",
    "operationKind": "query",
    "text": "query ResourcePresetListQuery {\n  resource_presets {\n    id\n    name\n    resource_slots\n    shared_memory\n    scaling_group_name\n    ...ResourcePresetSettingModalFragment\n  }\n}\n\nfragment ResourcePresetSettingModalFragment on ResourcePreset {\n  id\n  name\n  resource_slots\n  shared_memory\n  scaling_group_name\n}\n"
  }
};
})();

(node as any).hash = "df1a9815a24af0d892c62b23662ca8d0";

export default node;
