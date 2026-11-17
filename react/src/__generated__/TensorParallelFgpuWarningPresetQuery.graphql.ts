/**
 * @generated SignedSource<<f5253e45ce29aed4eb8e55c9ec6f77ea>>
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
v4 = {
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
v5 = {
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
              (v2/*: any*/)
            ],
            "storageKey": null
          },
          (v3/*: any*/),
          (v4/*: any*/)
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
              (v5/*: any*/)
            ],
            "storageKey": null
          },
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c706548b73f1976af41c8a19b21c67bb",
    "id": null,
    "metadata": {},
    "name": "TensorParallelFgpuWarningPresetQuery",
    "operationKind": "query",
    "text": "query TensorParallelFgpuWarningPresetQuery(\n  $id: UUID!\n) {\n  deploymentRevisionPreset(id: $id) {\n    runtimeVariant {\n      name\n      id\n    }\n    resourceSlots {\n      slotName\n      quantity\n    }\n    presetValues {\n      presetId\n      value\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "8515425d5d5e063b697d1d1b6606b71e";

export default node;
