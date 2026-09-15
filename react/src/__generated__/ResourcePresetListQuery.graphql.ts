/**
 * @generated SignedSource<<4719cef6302f8d534b88c61db6558260>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourcePresetListQuery$variables = {
  filter?: string | null | undefined;
  order?: string | null | undefined;
};
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
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "filter"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "order"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Variable",
    "name": "order",
    "variableName": "order"
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
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resource_slots",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "shared_memory",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scaling_group_name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourcePresetListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ResourcePreset",
        "kind": "LinkedField",
        "name": "resource_presets",
        "plural": true,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourcePresetListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ResourcePreset",
        "kind": "LinkedField",
        "name": "resource_presets",
        "plural": true,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "fef7b8a53c943055f0efa0261d6bc4b2",
    "id": null,
    "metadata": {},
    "name": "ResourcePresetListQuery",
    "operationKind": "query",
    "text": "query ResourcePresetListQuery(\n  $filter: String\n  $order: String\n) {\n  resource_presets(filter: $filter, order: $order) {\n    id\n    name\n    resource_slots\n    shared_memory\n    scaling_group_name\n    ...ResourcePresetSettingModalFragment\n  }\n}\n\nfragment ResourcePresetSettingModalFragment on ResourcePreset {\n  id\n  name\n  resource_slots\n  shared_memory\n  scaling_group_name\n}\n"
  }
};
})();

(node as any).hash = "2249f5b0d108458668ebf6c5ae57ff39";

export default node;
