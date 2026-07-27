/**
 * @generated SignedSource<<ff2500a675204f6fdb9cfb2c41e40c55>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
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
      readonly id: string;
      readonly name: string;
      readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupFairShareSettingModalFragment">;
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
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceGroupFairShareSettingModalMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
              (v2/*: any*/),
              (v3/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ResourceGroupFairShareSettingModalFragment"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceGroupFairShareSettingModalMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
              (v2/*: any*/),
              (v3/*: any*/),
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
                    "name": "decayUnitDays",
                    "storageKey": null
                  },
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
    ]
  },
  "params": {
    "cacheID": "20d5244a21df29598309f43c062167cc",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupFairShareSettingModalMutation",
    "operationKind": "mutation",
    "text": "mutation ResourceGroupFairShareSettingModalMutation(\n  $input: UpdateResourceGroupFairShareSpecInput!\n) {\n  adminUpdateResourceGroupFairShareSpec(input: $input) {\n    resourceGroup {\n      id\n      name\n      ...ResourceGroupFairShareSettingModalFragment\n    }\n  }\n}\n\nfragment ResourceGroupFairShareSettingModalFragment on ResourceGroup {\n  name\n  fairShareSpec {\n    decayUnitDays\n    halfLifeDays\n    lookbackDays\n    defaultWeight\n    resourceWeights {\n      resourceType\n      weight\n      usesDefault\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "eb7acd8f2a8aa3d6cc0175857a7bed06";

export default node;
