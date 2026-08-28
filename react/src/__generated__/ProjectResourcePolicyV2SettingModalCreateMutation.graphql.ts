/**
 * @generated SignedSource<<022656eb899c9e241649d0769f2e036c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateProjectResourcePolicyInputV2 = {
  maxNetworkCount: number;
  maxQuotaScopeSize: BinarySizeInput;
  maxVfolderCount: number;
  name: string;
};
export type BinarySizeInput = {
  expr: string;
};
export type ProjectResourcePolicyV2SettingModalCreateMutation$variables = {
  input: CreateProjectResourcePolicyInputV2;
};
export type ProjectResourcePolicyV2SettingModalCreateMutation$data = {
  readonly adminCreateProjectResourcePolicyV2: {
    readonly projectResourcePolicy: {
      readonly id: string;
    };
  } | null | undefined;
};
export type ProjectResourcePolicyV2SettingModalCreateMutation = {
  response: ProjectResourcePolicyV2SettingModalCreateMutation$data;
  variables: ProjectResourcePolicyV2SettingModalCreateMutation$variables;
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
    "concreteType": "CreateProjectResourcePolicyPayload",
    "kind": "LinkedField",
    "name": "adminCreateProjectResourcePolicyV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ProjectResourcePolicyV2",
        "kind": "LinkedField",
        "name": "projectResourcePolicy",
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
    "name": "ProjectResourcePolicyV2SettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectResourcePolicyV2SettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9964624e0e8d972ab858a6d5522f47f0",
    "id": null,
    "metadata": {},
    "name": "ProjectResourcePolicyV2SettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectResourcePolicyV2SettingModalCreateMutation(\n  $input: CreateProjectResourcePolicyInputV2!\n) {\n  adminCreateProjectResourcePolicyV2(input: $input) {\n    projectResourcePolicy {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "918964fe51fe05bdcf812a61a70c8353";

export default node;
