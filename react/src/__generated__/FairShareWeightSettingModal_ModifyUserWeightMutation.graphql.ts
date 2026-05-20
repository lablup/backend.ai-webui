/**
 * @generated SignedSource<<8197fbb69c76f63628c09cc58c85802b>>
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
  readonly adminUpsertUserFairShareWeight: {
    readonly userFairShare: {
      readonly id: string;
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
    "name": "adminUpsertUserFairShareWeight",
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
    "cacheID": "4381a110232d3634141d33b0775a0f66",
    "id": null,
    "metadata": {},
    "name": "FairShareWeightSettingModal_ModifyUserWeightMutation",
    "operationKind": "mutation",
    "text": "mutation FairShareWeightSettingModal_ModifyUserWeightMutation(\n  $input: UpsertUserFairShareWeightInput!\n) {\n  adminUpsertUserFairShareWeight(input: $input) {\n    userFairShare {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "edf934503a7592da41baba9ba62ae977";

export default node;
