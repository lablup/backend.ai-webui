/**
 * @generated SignedSource<<389b8843cd851c62f37ecb543d1a975d>>
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
    "cacheID": "5e7a8541b7ec3c3f6feb16f376eac5d0",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupFairShareSettingModalMutation",
    "operationKind": "mutation",
    "text": "mutation ResourceGroupFairShareSettingModalMutation(\n  $input: UpdateResourceGroupFairShareSpecInput!\n) {\n  adminUpdateResourceGroupFairShareSpec(input: $input) {\n    resourceGroup {\n      id\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f848c0110a2067fb8c25467884d65eee";

export default node;
