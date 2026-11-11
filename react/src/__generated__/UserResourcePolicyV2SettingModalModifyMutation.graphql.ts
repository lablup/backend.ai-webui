/**
 * @generated SignedSource<<a0c9259ce0b3d902477488384537a7b8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateUserResourcePolicyInput = {
  maxConcurrentLogins?: number | null | undefined;
  maxCustomizedImageCount?: number | null | undefined;
  maxQuotaScopeSize?: BinarySizeInput | null | undefined;
  maxSessionCountPerModelSession?: number | null | undefined;
  maxVfolderCount?: number | null | undefined;
};
export type BinarySizeInput = {
  expr: string;
};
export type UserResourcePolicyV2SettingModalModifyMutation$variables = {
  id: string;
  input: UpdateUserResourcePolicyInput;
};
export type UserResourcePolicyV2SettingModalModifyMutation$data = {
  readonly updateUserResourcePolicyV2: {
    readonly userResourcePolicy: {
      readonly createdAt: string | null | undefined;
      readonly id: string;
      readonly maxConcurrentLogins: number | null | undefined;
      readonly maxCustomizedImageCount: number;
      readonly maxQuotaScopeSize: {
        readonly expr: string;
      };
      readonly maxSessionCountPerModelSession: number;
      readonly maxVfolderCount: number;
      readonly name: string;
    };
  };
};
export type UserResourcePolicyV2SettingModalModifyMutation = {
  response: UserResourcePolicyV2SettingModalModifyMutation$data;
  variables: UserResourcePolicyV2SettingModalModifyMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
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
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "UpdateUserResourcePolicyPayload",
    "kind": "LinkedField",
    "name": "updateUserResourcePolicyV2",
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "createdAt",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "maxVfolderCount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "maxConcurrentLogins",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "maxSessionCountPerModelSession",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "BinarySizeInfo",
            "kind": "LinkedField",
            "name": "maxQuotaScopeSize",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "expr",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "maxCustomizedImageCount",
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
    "name": "UserResourcePolicyV2SettingModalModifyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserResourcePolicyV2SettingModalModifyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "a528bc47ddafbae7b828942defabf33a",
    "id": null,
    "metadata": {},
    "name": "UserResourcePolicyV2SettingModalModifyMutation",
    "operationKind": "mutation",
    "text": "mutation UserResourcePolicyV2SettingModalModifyMutation(\n  $id: UUID!\n  $input: UpdateUserResourcePolicyInput!\n) {\n  updateUserResourcePolicyV2(id: $id, input: $input) {\n    userResourcePolicy {\n      id\n      name\n      createdAt\n      maxVfolderCount\n      maxConcurrentLogins\n      maxSessionCountPerModelSession\n      maxQuotaScopeSize {\n        expr\n      }\n      maxCustomizedImageCount\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "074893475b985a2042c8b61deddc0efe";

export default node;
