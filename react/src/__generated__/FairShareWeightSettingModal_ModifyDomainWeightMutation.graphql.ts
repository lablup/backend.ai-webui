/**
 * @generated SignedSource<<cc59bedf317ff5734e9e8010799372c3>>
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
    "cacheID": "d608e5ddd16537c5b2d3db26d60f9e0d",
    "id": null,
    "metadata": {},
    "name": "FairShareWeightSettingModal_ModifyDomainWeightMutation",
    "operationKind": "mutation",
    "text": "mutation FairShareWeightSettingModal_ModifyDomainWeightMutation(\n  $input: UpsertDomainFairShareWeightInput!\n) {\n  adminUpsertDomainFairShareWeight(input: $input) {\n    domainFairShare {\n      id\n      spec {\n        weight\n        usesDefault\n      }\n      updatedAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d7cc914366ce48002a09fde191048f4f";

export default node;
