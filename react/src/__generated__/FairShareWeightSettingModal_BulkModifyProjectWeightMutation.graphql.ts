/**
 * @generated SignedSource<<bb66fa7f6b88e8c00b8a9e8235968549>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BulkUpsertProjectFairShareWeightInput = {
  inputs: ReadonlyArray<ProjectWeightInputItem>;
  resourceGroupName: string;
};
export type ProjectWeightInputItem = {
  domainName: string;
  projectId: string;
  weight?: any | null | undefined;
};
export type FairShareWeightSettingModal_BulkModifyProjectWeightMutation$variables = {
  input: BulkUpsertProjectFairShareWeightInput;
};
export type FairShareWeightSettingModal_BulkModifyProjectWeightMutation$data = {
  readonly adminBulkUpsertProjectFairShareWeight: {
    readonly upsertedCount: number;
  } | null | undefined;
};
export type FairShareWeightSettingModal_BulkModifyProjectWeightMutation = {
  response: FairShareWeightSettingModal_BulkModifyProjectWeightMutation$data;
  variables: FairShareWeightSettingModal_BulkModifyProjectWeightMutation$variables;
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
    "concreteType": "BulkUpsertProjectFairShareWeightPayload",
    "kind": "LinkedField",
    "name": "adminBulkUpsertProjectFairShareWeight",
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
    "name": "FairShareWeightSettingModal_BulkModifyProjectWeightMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FairShareWeightSettingModal_BulkModifyProjectWeightMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "451f413446eb70383e926b8894c05b96",
    "id": null,
    "metadata": {},
    "name": "FairShareWeightSettingModal_BulkModifyProjectWeightMutation",
    "operationKind": "mutation",
    "text": "mutation FairShareWeightSettingModal_BulkModifyProjectWeightMutation(\n  $input: BulkUpsertProjectFairShareWeightInput!\n) {\n  adminBulkUpsertProjectFairShareWeight(input: $input) {\n    upsertedCount\n  }\n}\n"
  }
};
})();

(node as any).hash = "3afbbc36270ec769288d8a9c694849fc";

export default node;
