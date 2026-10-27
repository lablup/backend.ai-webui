/**
 * @generated SignedSource<<760b150e8226ab43e751e20e5c41e1bd>>
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
  readonly upsertDomainFairShareWeight: {
    readonly domainFairShare: {
      readonly id: string;
      readonly spec: {
        readonly usesDefault: boolean;
        readonly weight: any;
      };
      readonly updatedAt: string;
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
    "name": "upsertDomainFairShareWeight",
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
    "cacheID": "c9cec21098f0941b326074737cbc7bb5",
    "id": null,
    "metadata": {},
    "name": "FairShareWeightSettingModal_ModifyDomainWeightMutation",
    "operationKind": "mutation",
    "text": "mutation FairShareWeightSettingModal_ModifyDomainWeightMutation(\n  $input: UpsertDomainFairShareWeightInput!\n) {\n  upsertDomainFairShareWeight(input: $input) {\n    domainFairShare {\n      id\n      spec {\n        weight\n        usesDefault\n      }\n      updatedAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "75a97c5a068cde1222f2ae782446243d";

export default node;
