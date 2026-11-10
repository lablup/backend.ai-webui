/**
 * @generated SignedSource<<03b96f9ca3e69c1fa73ba01940c902a7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BulkUpsertUserFairShareWeightInput = {
  inputs: ReadonlyArray<UserWeightInputItem>;
  resourceGroupName: string;
};
export type UserWeightInputItem = {
  domainName: string;
  projectId: string;
  userUuid: string;
  weight?: any | null | undefined;
};
export type FairShareWeightSettingModal_BulkModifyUserWeightMutation$variables = {
  input: BulkUpsertUserFairShareWeightInput;
};
export type FairShareWeightSettingModal_BulkModifyUserWeightMutation$data = {
  readonly atomicBulkUpsertUserFairShareWeights: {
    readonly upsertedCount: number;
  } | null | undefined;
};
export type FairShareWeightSettingModal_BulkModifyUserWeightMutation = {
  response: FairShareWeightSettingModal_BulkModifyUserWeightMutation$data;
  variables: FairShareWeightSettingModal_BulkModifyUserWeightMutation$variables;
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
    "concreteType": "BulkUpsertUserFairShareWeightPayload",
    "kind": "LinkedField",
    "name": "atomicBulkUpsertUserFairShareWeights",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "upsertedCount",
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
    "name": "FairShareWeightSettingModal_BulkModifyUserWeightMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FairShareWeightSettingModal_BulkModifyUserWeightMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "e530fe6759af4d1fdefca99ce1434fe0",
    "id": null,
    "metadata": {},
    "name": "FairShareWeightSettingModal_BulkModifyUserWeightMutation",
    "operationKind": "mutation",
    "text": "mutation FairShareWeightSettingModal_BulkModifyUserWeightMutation(\n  $input: BulkUpsertUserFairShareWeightInput!\n) {\n  atomicBulkUpsertUserFairShareWeights(input: $input) {\n    upsertedCount\n  }\n}\n"
  }
};
})();

(node as any).hash = "021adeaac0977c3850f903d193865f4a";

export default node;
