/**
 * @generated SignedSource<<192807f0ed29e484e2f153a994ce9f19>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourcePresetSettingModalTestQuery$variables = Record<PropertyKey, never>;
export type ResourcePresetSettingModalTestQuery$data = {
  readonly resource_presets: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"ResourcePresetSettingModalFragment">;
  } | null | undefined> | null | undefined;
};
export type ResourcePresetSettingModalTestQuery = {
  response: ResourcePresetSettingModalTestQuery$data;
  variables: ResourcePresetSettingModalTestQuery$variables;
};

const node: ConcreteRequest = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourcePresetSettingModalTestQuery",
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
    "name": "ResourcePresetSettingModalTestQuery",
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
    "cacheID": "128c19c229888a9c80b15b7ae3069364",
    "id": null,
    "metadata": {},
    "name": "ResourcePresetSettingModalTestQuery",
    "operationKind": "query",
    "text": "query ResourcePresetSettingModalTestQuery {\n  resource_presets {\n    ...ResourcePresetSettingModalFragment\n  }\n}\n\nfragment ResourcePresetSettingModalFragment on ResourcePreset {\n  id\n  name\n  resource_slots\n  shared_memory\n  scaling_group_name\n}\n"
  }
};

(node as any).hash = "3acb41e0a7778347d30b8d51bc97e31a";

export default node;
