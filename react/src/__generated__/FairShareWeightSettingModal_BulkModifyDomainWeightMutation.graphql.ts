/**
 * @generated SignedSource<<9149a30933c9506109c301609baa7fad>>
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
  readonly adminBulkUpsertDomainFairShareWeight: {
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
    "name": "adminBulkUpsertDomainFairShareWeight",
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
    "cacheID": "3524bdd31385cfe0a2c4ad5ebd44cf24",
    "id": null,
    "metadata": {},
    "name": "FairShareWeightSettingModal_BulkModifyDomainWeightMutation",
    "operationKind": "mutation",
    "text": "mutation FairShareWeightSettingModal_BulkModifyDomainWeightMutation(\n  $input: BulkUpsertDomainFairShareWeightInput!\n) {\n  adminBulkUpsertDomainFairShareWeight(input: $input) {\n    upsertedCount\n  }\n}\n"
  }
};
})();

(node as any).hash = "c1de3897945dcf537488f17a3f5f6749";

export default node;
