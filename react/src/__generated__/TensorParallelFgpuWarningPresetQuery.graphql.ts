/**
 * @generated SignedSource<<d924a1185ebaef6195eab04e0bd86387>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type TensorParallelFgpuWarningPresetQuery$variables = {
  id: string;
};
export type TensorParallelFgpuWarningPresetQuery$data = {
  readonly deploymentRevisionPreset: {
    readonly presetValues: ReadonlyArray<{
      readonly presetId: string;
      readonly value: string;
    }>;
    readonly resourceSlots: ReadonlyArray<{
      readonly quantity: any;
      readonly slotName: string;
    }> | null | undefined;
    readonly runtimeVariant: {
      readonly name: string;
      readonly readsVfolderConfigFiles: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type TensorParallelFgpuWarningPresetQuery = {
  response: TensorParallelFgpuWarningPresetQuery$data;
  variables: TensorParallelFgpuWarningPresetQuery$variables;
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
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "readsVfolderConfigFiles",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "concreteType": "AllocatedResourceSlot",
  "kind": "LinkedField",
  "name": "resourceSlots",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "slotName",
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
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "RuntimeVariantPresetValueEntry",
  "kind": "LinkedField",
  "name": "presetValues",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "presetId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "value",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v6 = {
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
    "name": "TensorParallelFgpuWarningPresetQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeploymentRevisionPreset",
        "kind": "LinkedField",
        "name": "deploymentRevisionPreset",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "RuntimeVariant",
            "kind": "LinkedField",
            "name": "runtimeVariant",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/)
            ],
            "storageKey": null
          },
          (v4/*: any*/),
          (v5/*: any*/)
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
    "name": "TensorParallelFgpuWarningPresetQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeploymentRevisionPreset",
        "kind": "LinkedField",
        "name": "deploymentRevisionPreset",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "RuntimeVariant",
            "kind": "LinkedField",
            "name": "runtimeVariant",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v6/*: any*/)
            ],
            "storageKey": null
          },
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "198737970066d65d37b839e28ce6838f",
    "id": null,
    "metadata": {},
    "name": "TensorParallelFgpuWarningPresetQuery",
    "operationKind": "query",
    "text": "query TensorParallelFgpuWarningPresetQuery(\n  $id: UUID!\n) {\n  deploymentRevisionPreset(id: $id) {\n    runtimeVariant {\n      name\n      readsVfolderConfigFiles @since(version: \"26.8.0\")\n      id\n    }\n    resourceSlots {\n      slotName\n      quantity\n    }\n    presetValues {\n      presetId\n      value\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "1e3fced3eb700ce6102236531b1ed1de";

export default node;
