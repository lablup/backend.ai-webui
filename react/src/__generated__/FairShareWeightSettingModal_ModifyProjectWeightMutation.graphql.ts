/**
 * @generated SignedSource<<a239d586e6d8029407da42809cf9dceb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpsertProjectFairShareWeightInput = {
  domainName: string;
  projectId: string;
  resourceGroupName: string;
  weight?: any | null | undefined;
};
export type FairShareWeightSettingModal_ModifyProjectWeightMutation$variables = {
  input: UpsertProjectFairShareWeightInput;
};
export type FairShareWeightSettingModal_ModifyProjectWeightMutation$data = {
  readonly upsertProjectFairShareWeight: {
    readonly projectFairShare: {
      readonly id: string;
      readonly spec: {
        readonly usesDefault: boolean;
        readonly weight: any;
      };
      readonly updatedAt: string;
    };
  } | null | undefined;
};
export type FairShareWeightSettingModal_ModifyProjectWeightMutation = {
  response: FairShareWeightSettingModal_ModifyProjectWeightMutation$data;
  variables: FairShareWeightSettingModal_ModifyProjectWeightMutation$variables;
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
    "concreteType": "UpsertProjectFairShareWeightPayload",
    "kind": "LinkedField",
    "name": "upsertProjectFairShareWeight",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ProjectFairShare",
        "kind": "LinkedField",
        "name": "projectFairShare",
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
    "name": "FairShareWeightSettingModal_ModifyProjectWeightMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FairShareWeightSettingModal_ModifyProjectWeightMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "1debe9512e9a04426cc4139439950e63",
    "id": null,
    "metadata": {},
    "name": "FairShareWeightSettingModal_ModifyProjectWeightMutation",
    "operationKind": "mutation",
    "text": "mutation FairShareWeightSettingModal_ModifyProjectWeightMutation(\n  $input: UpsertProjectFairShareWeightInput!\n) {\n  upsertProjectFairShareWeight(input: $input) {\n    projectFairShare {\n      id\n      spec {\n        weight\n        usesDefault\n      }\n      updatedAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5b455b539d1a816666762cc15b792879";

export default node;
