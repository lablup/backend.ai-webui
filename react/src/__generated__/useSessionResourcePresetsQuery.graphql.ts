/**
 * @generated SignedSource<<02ab89c32df5d7a1d37e475dcb061173>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useSessionResourcePresetsQuery$variables = {
  projectId: string;
  resourceGroupName: string;
  skip: boolean;
};
export type useSessionResourcePresetsQuery$data = {
  readonly checkPresetAvailabilityV2?: {
    readonly presets: ReadonlyArray<{
      readonly available: boolean;
      readonly name: string;
      readonly presetId: string;
      readonly resourceGroupName: string | null | undefined;
      readonly resourceSlots: ReadonlyArray<{
        readonly quantity: any;
        readonly resourceType: string;
      }>;
      readonly sharedMemory: {
        readonly expr: string;
      } | null | undefined;
    }>;
  } | null | undefined;
};
export type useSessionResourcePresetsQuery = {
  response: useSessionResourcePresetsQuery$data;
  variables: useSessionResourcePresetsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "projectId"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "resourceGroupName"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skip"
  }
],
v1 = [
  {
    "condition": "skip",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "fields": [
              {
                "kind": "Variable",
                "name": "projectId",
                "variableName": "projectId"
              },
              {
                "kind": "Variable",
                "name": "resourceGroupName",
                "variableName": "resourceGroupName"
              }
            ],
            "kind": "ObjectValue",
            "name": "input"
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
                "alias": "presetId",
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
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "BinarySizeInfo",
                "kind": "LinkedField",
                "name": "sharedMemory",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "expr",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "resourceGroupName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "available",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useSessionResourcePresetsQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useSessionResourcePresetsQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "c93af58091f1c0eb62b81edcd926023f",
    "id": null,
    "metadata": {},
    "name": "useSessionResourcePresetsQuery",
    "operationKind": "query",
    "text": "query useSessionResourcePresetsQuery(\n  $projectId: UUID!\n  $resourceGroupName: String!\n  $skip: Boolean!\n) {\n  checkPresetAvailabilityV2(input: {projectId: $projectId, resourceGroupName: $resourceGroupName}) @skip(if: $skip) {\n    presets {\n      presetId: id\n      name\n      resourceSlots {\n        resourceType\n        quantity\n      }\n      sharedMemory {\n        expr\n      }\n      resourceGroupName\n      available\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0de3821996bc94a1d20f03b806fe0139";

export default node;
