/**
 * @generated SignedSource<<396a0b321092f41cd83ed26af33f368b>>
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
  readonly adminUpsertProjectFairShareWeight: {
    readonly projectFairShare: {
      readonly id: string;
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
    "name": "adminUpsertProjectFairShareWeight",
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
    "cacheID": "57da9877f8e9de7e9e6493d1b18ece4b",
    "id": null,
    "metadata": {},
    "name": "FairShareWeightSettingModal_ModifyProjectWeightMutation",
    "operationKind": "mutation",
    "text": "mutation FairShareWeightSettingModal_ModifyProjectWeightMutation(\n  $input: UpsertProjectFairShareWeightInput!\n) {\n  adminUpsertProjectFairShareWeight(input: $input) {\n    projectFairShare {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c706d161db116c6b402955210682f8a1";

export default node;
