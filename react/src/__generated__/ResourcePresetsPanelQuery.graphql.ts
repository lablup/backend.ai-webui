/**
 * @generated SignedSource<<132c7f8760613f5d028d3f5b94d14edf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CheckPresetAvailabilityV2Input = {
  projectId: string;
  resourceGroupName: string;
};
export type ResourcePresetsPanelQuery$variables = {
  input: CheckPresetAvailabilityV2Input;
};
export type ResourcePresetsPanelQuery$data = {
  readonly checkPresetAvailabilityV2: {
    readonly presets: ReadonlyArray<{
      readonly available: boolean;
      readonly id: string;
      readonly name: string;
      readonly resourceSlots: ReadonlyArray<{
        readonly quantity: any;
        readonly resourceType: string;
      }>;
    }>;
  } | null | undefined;
};
export type ResourcePresetsPanelQuery = {
  response: ResourcePresetsPanelQuery$data;
  variables: ResourcePresetsPanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "CheckPresetAvailabilityPayloadV2",
    "kind": "LinkedField",
    "name": "checkPresetAvailabilityV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "PresetAvailabilityV2",
        "kind": "LinkedField",
        "name": "presets",
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
            "name": "available",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ResourceSlotEntry",
            "kind": "LinkedField",
            "name": "resourceSlots",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "resourceType",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "quantity",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourcePresetsPanelQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourcePresetsPanelQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "7d7d2e122fb0ea6e12c71f0121bdf18f",
    "id": null,
    "metadata": {},
    "name": "ResourcePresetsPanelQuery",
    "operationKind": "query",
    "text": "query ResourcePresetsPanelQuery(\n  $input: CheckPresetAvailabilityV2Input!\n) {\n  checkPresetAvailabilityV2(input: $input) {\n    presets {\n      id\n      name\n      available\n      resourceSlots {\n        resourceType\n        quantity\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f568ea2b5bb3c15cb03cba96932603e7";

export default node;
