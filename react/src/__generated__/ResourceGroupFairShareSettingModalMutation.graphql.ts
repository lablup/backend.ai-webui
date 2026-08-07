/**
 * @generated SignedSource<<63d4b3828e21727d151f786f52f000f7>>
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
  readonly adminUpdateResourceGroupFairShareSpec: {
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
    "name": "adminUpdateResourceGroupFairShareSpec",
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
    "cacheID": "06b3668d30bd3e0cdb1a26e934580abe",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupFairShareSettingModalMutation",
    "operationKind": "mutation",
    "text": "mutation ResourceGroupFairShareSettingModalMutation(\n  $input: UpdateResourceGroupFairShareSpecInput!\n) {\n  adminUpdateResourceGroupFairShareSpec(input: $input) {\n    resourceGroup {\n      id\n      name\n      fairShareSpec {\n        halfLifeDays\n        lookbackDays\n        decayUnitDays\n        defaultWeight\n        resourceWeights {\n          resourceType\n          weight\n          usesDefault\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "bced39f3d091890c9d9b289b2dd5b9f7";

export default node;
