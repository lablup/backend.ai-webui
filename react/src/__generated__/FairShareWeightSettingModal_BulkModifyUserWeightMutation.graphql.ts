/**
 * @generated SignedSource<<c3a16c3bd5c0120f032da1367aebe6bd>>
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
  readonly adminBulkUpsertUserFairShareWeight: {
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
    "name": "adminBulkUpsertUserFairShareWeight",
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
    "cacheID": "7c420d8808a88444c3c3e943487ac9dc",
    "id": null,
    "metadata": {},
    "name": "FairShareWeightSettingModal_BulkModifyUserWeightMutation",
    "operationKind": "mutation",
    "text": "mutation FairShareWeightSettingModal_BulkModifyUserWeightMutation(\n  $input: BulkUpsertUserFairShareWeightInput!\n) {\n  adminBulkUpsertUserFairShareWeight(input: $input) {\n    upsertedCount\n  }\n}\n"
  }
};
})();

(node as any).hash = "e9515c2b27c753e47fa6d60b0652e791";

export default node;
