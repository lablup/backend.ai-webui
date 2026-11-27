/**
 * @generated SignedSource<<44b74d8156b7cb73c0d5b5e3e1d66566>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourcePresetSettingModalSharedTestQuery$variables = Record<PropertyKey, never>;
export type ResourcePresetSettingModalSharedTestQuery$data = {
  readonly resource_presets: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"ResourcePresetSettingModalFragment">;
  } | null | undefined> | null | undefined;
};
export type ResourcePresetSettingModalSharedTestQuery = {
  response: ResourcePresetSettingModalSharedTestQuery$data;
  variables: ResourcePresetSettingModalSharedTestQuery$variables;
};

const node: ConcreteRequest = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourcePresetSettingModalSharedTestQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ResourcePreset",
        "kind": "LinkedField",
        "name": "resource_presets",
        "plural": true,
        "selections": [
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
    "name": "ResourcePresetSettingModalSharedTestQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ResourcePreset",
        "kind": "LinkedField",
        "name": "resource_presets",
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
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "resource_slots",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "shared_memory",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "scaling_group_name",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d19d85626140f5f6fb6c8a6e2432b2d3",
    "id": null,
    "metadata": {},
    "name": "ResourcePresetSettingModalSharedTestQuery",
    "operationKind": "query",
    "text": "query ResourcePresetSettingModalSharedTestQuery {\n  resource_presets {\n    ...ResourcePresetSettingModalFragment\n  }\n}\n\nfragment ResourcePresetSettingModalFragment on ResourcePreset {\n  id\n  name\n  resource_slots\n  shared_memory\n  scaling_group_name\n}\n"
  }
};

(node as any).hash = "4b3b34139fff3fb47265a5ae2d62627e";

export default node;
