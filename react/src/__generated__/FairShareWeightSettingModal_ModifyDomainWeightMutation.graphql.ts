/**
 * @generated SignedSource<<bfbed2e3407e5421a9cae6748cf3bb50>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpsertDomainFairShareWeightInput = {
  domainName: string;
  resourceGroupName: string;
  weight?: any | null | undefined;
};
export type FairShareWeightSettingModal_ModifyDomainWeightMutation$variables = {
  input: UpsertDomainFairShareWeightInput;
};
export type FairShareWeightSettingModal_ModifyDomainWeightMutation$data = {
  readonly adminUpsertDomainFairShareWeight: {
    readonly domainFairShare: {
      readonly id: string;
    };
  } | null | undefined;
};
export type FairShareWeightSettingModal_ModifyDomainWeightMutation = {
  response: FairShareWeightSettingModal_ModifyDomainWeightMutation$data;
  variables: FairShareWeightSettingModal_ModifyDomainWeightMutation$variables;
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
    "concreteType": "UpsertDomainFairShareWeightPayload",
    "kind": "LinkedField",
    "name": "adminUpsertDomainFairShareWeight",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "DomainFairShare",
        "kind": "LinkedField",
        "name": "domainFairShare",
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
    "name": "FairShareWeightSettingModal_ModifyDomainWeightMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FairShareWeightSettingModal_ModifyDomainWeightMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "36636e77cae90d767ddad7a509c9992a",
    "id": null,
    "metadata": {},
    "name": "FairShareWeightSettingModal_ModifyDomainWeightMutation",
    "operationKind": "mutation",
    "text": "mutation FairShareWeightSettingModal_ModifyDomainWeightMutation(\n  $input: UpsertDomainFairShareWeightInput!\n) {\n  adminUpsertDomainFairShareWeight(input: $input) {\n    domainFairShare {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4eb1c45647423a114e215c737f174b97";

export default node;
