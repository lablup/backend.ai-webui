/**
 * @generated SignedSource<<227f2de1e98cde2aebb30c1139e06541>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpsertUserFairShareWeightInput = {
  domainName: string;
  projectId: string;
  resourceGroupName: string;
  userUuid: string;
  weight?: any | null | undefined;
};
export type FairShareWeightSettingModal_ModifyUserWeightMutation$variables = {
  input: UpsertUserFairShareWeightInput;
};
export type FairShareWeightSettingModal_ModifyUserWeightMutation$data = {
  readonly upsertUserFairShareWeight: {
    readonly userFairShare: {
      readonly id: string;
      readonly spec: {
        readonly usesDefault: boolean;
        readonly weight: any;
      };
      readonly updatedAt: string;
    };
  } | null | undefined;
};
export type FairShareWeightSettingModal_ModifyUserWeightMutation = {
  response: FairShareWeightSettingModal_ModifyUserWeightMutation$data;
  variables: FairShareWeightSettingModal_ModifyUserWeightMutation$variables;
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
    "concreteType": "UpsertUserFairShareWeightPayload",
    "kind": "LinkedField",
    "name": "upsertUserFairShareWeight",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserFairShare",
        "kind": "LinkedField",
        "name": "userFairShare",
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
            "concreteType": "FairShareSpec",
            "kind": "LinkedField",
            "name": "spec",
            "plural": false,
            "selections": [
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "updatedAt",
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
    "name": "FairShareWeightSettingModal_ModifyUserWeightMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FairShareWeightSettingModal_ModifyUserWeightMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "65a43fab2c5ef63c7bfb6f231a341220",
    "id": null,
    "metadata": {},
    "name": "FairShareWeightSettingModal_ModifyUserWeightMutation",
    "operationKind": "mutation",
    "text": "mutation FairShareWeightSettingModal_ModifyUserWeightMutation(\n  $input: UpsertUserFairShareWeightInput!\n) {\n  upsertUserFairShareWeight(input: $input) {\n    userFairShare {\n      id\n      spec {\n        weight\n        usesDefault\n      }\n      updatedAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "099aa52589dd7c06531da138437988d7";

export default node;
