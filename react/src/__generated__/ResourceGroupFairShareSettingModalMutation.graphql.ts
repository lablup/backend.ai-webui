/**
 * @generated SignedSource<<ac568e203884659c8b863f094ef4b20f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateResourceGroupFairShareSpecInput = {
  decayUnitDays?: number | null | undefined;
  defaultWeight?: any | null | undefined;
  halfLifeDays?: number | null | undefined;
  lookbackDays?: number | null | undefined;
  resourceGroupName: string;
  resourceWeights?: ReadonlyArray<ResourceWeightEntryInput> | null | undefined;
};
export type ResourceWeightEntryInput = {
  resourceType: string;
  weight?: any | null | undefined;
};
export type ResourceGroupFairShareSettingModalMutation$variables = {
  input: UpdateResourceGroupFairShareSpecInput;
};
export type ResourceGroupFairShareSettingModalMutation$data = {
  readonly updateResourceGroupFairShareSpec: {
    readonly resourceGroup: {
      readonly fairShareSpec: {
        readonly decayUnitDays: number;
        readonly defaultWeight: any;
        readonly halfLifeDays: number;
        readonly lookbackDays: number;
        readonly resourceWeights: ReadonlyArray<{
          readonly resourceType: string;
          readonly usesDefault: boolean;
          readonly weight: any;
        }>;
      } | null | undefined;
      readonly id: string;
      readonly name: string;
    };
  } | null | undefined;
};
export type ResourceGroupFairShareSettingModalMutation = {
  response: ResourceGroupFairShareSettingModalMutation$data;
  variables: ResourceGroupFairShareSettingModalMutation$variables;
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
    "concreteType": "UpdateResourceGroupFairShareSpecPayload",
    "kind": "LinkedField",
    "name": "updateResourceGroupFairShareSpec",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ResourceGroup",
        "kind": "LinkedField",
        "name": "resourceGroup",
        "plural": false,
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
            "concreteType": "FairShareScalingGroupSpec",
            "kind": "LinkedField",
            "name": "fairShareSpec",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "halfLifeDays",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "lookbackDays",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "decayUnitDays",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "defaultWeight",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "ResourceWeightEntry",
                "kind": "LinkedField",
                "name": "resourceWeights",
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
                    "name": "weight",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "usesDefault",
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
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceGroupFairShareSettingModalMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceGroupFairShareSettingModalMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "727604c5ce7dc23ca214d444165e5ac7",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupFairShareSettingModalMutation",
    "operationKind": "mutation",
    "text": "mutation ResourceGroupFairShareSettingModalMutation(\n  $input: UpdateResourceGroupFairShareSpecInput!\n) {\n  updateResourceGroupFairShareSpec(input: $input) {\n    resourceGroup {\n      id\n      name\n      fairShareSpec {\n        halfLifeDays\n        lookbackDays\n        decayUnitDays\n        defaultWeight\n        resourceWeights {\n          resourceType\n          weight\n          usesDefault\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6adee96699695ade0313c9a3d80b5e61";

export default node;
