/**
 * @generated SignedSource<<b9d8b5576277f139343f0c32396c4d48>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BulkUpsertDomainFairShareWeightInput = {
  inputs: ReadonlyArray<DomainWeightInputItem>;
  resourceGroupName: string;
};
export type DomainWeightInputItem = {
  domainName: string;
  weight?: any | null | undefined;
};
export type FairShareWeightSettingModal_BulkModifyDomainWeightMutation$variables = {
  input: BulkUpsertDomainFairShareWeightInput;
};
export type FairShareWeightSettingModal_BulkModifyDomainWeightMutation$data = {
  readonly atomicBulkUpsertDomainFairShareWeights: {
    readonly upsertedCount: number;
  } | null | undefined;
};
export type FairShareWeightSettingModal_BulkModifyDomainWeightMutation = {
  response: FairShareWeightSettingModal_BulkModifyDomainWeightMutation$data;
  variables: FairShareWeightSettingModal_BulkModifyDomainWeightMutation$variables;
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
    "concreteType": "BulkUpsertDomainFairShareWeightPayload",
    "kind": "LinkedField",
    "name": "atomicBulkUpsertDomainFairShareWeights",
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
    "name": "FairShareWeightSettingModal_BulkModifyDomainWeightMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FairShareWeightSettingModal_BulkModifyDomainWeightMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "6aefd1e61bc4d95bda984db87263d704",
    "id": null,
    "metadata": {},
    "name": "FairShareWeightSettingModal_BulkModifyDomainWeightMutation",
    "operationKind": "mutation",
    "text": "mutation FairShareWeightSettingModal_BulkModifyDomainWeightMutation(\n  $input: BulkUpsertDomainFairShareWeightInput!\n) {\n  atomicBulkUpsertDomainFairShareWeights(input: $input) {\n    upsertedCount\n  }\n}\n"
  }
};
})();

(node as any).hash = "85c8486b8f14bdd876774c0f1b5ab476";

export default node;
