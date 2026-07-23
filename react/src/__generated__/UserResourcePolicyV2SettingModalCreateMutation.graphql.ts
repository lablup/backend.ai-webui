/**
 * @generated SignedSource<<e6deed280e58a57b3319a494273eb1e2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateUserResourcePolicyInputV2 = {
  maxConcurrentLogins?: number | null | undefined;
  maxCustomizedImageCount: number;
  maxQuotaScopeSize: BinarySizeInput;
  maxSessionCountPerModelSession: number;
  maxVfolderCount: number;
  name: string;
};
export type BinarySizeInput = {
  expr: string;
};
export type UserResourcePolicyV2SettingModalCreateMutation$variables = {
  input: CreateUserResourcePolicyInputV2;
};
export type UserResourcePolicyV2SettingModalCreateMutation$data = {
  readonly adminCreateUserResourcePolicyV2: {
    readonly userResourcePolicy: {
      readonly id: string;
    };
  } | null | undefined;
};
export type UserResourcePolicyV2SettingModalCreateMutation = {
  response: UserResourcePolicyV2SettingModalCreateMutation$data;
  variables: UserResourcePolicyV2SettingModalCreateMutation$variables;
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
    "concreteType": "CreateUserResourcePolicyPayload",
    "kind": "LinkedField",
    "name": "adminCreateUserResourcePolicyV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserResourcePolicyV2",
        "kind": "LinkedField",
        "name": "userResourcePolicy",
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
    "name": "UserResourcePolicyV2SettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserResourcePolicyV2SettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "7e98c512569c57d484c4c0104f2e1f84",
    "id": null,
    "metadata": {},
    "name": "UserResourcePolicyV2SettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation UserResourcePolicyV2SettingModalCreateMutation(\n  $input: CreateUserResourcePolicyInputV2!\n) {\n  adminCreateUserResourcePolicyV2(input: $input) {\n    userResourcePolicy {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "cfe35df6a2c4ec10fdb4984be609ca4b";

export default node;
