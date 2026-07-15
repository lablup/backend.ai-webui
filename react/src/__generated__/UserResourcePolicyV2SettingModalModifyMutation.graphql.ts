/**
 * @generated SignedSource<<c54db8d5b5ac5a197f1fffe9ddd30fb8>>
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
  input: UpdateUserResourcePolicyInput;
  name: string;
};
export type UserResourcePolicyV2SettingModalModifyMutation$data = {
  readonly adminUpdateUserResourcePolicyV2: {
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
  } | null | undefined;
};
export type UserResourcePolicyV2SettingModalModifyMutation = {
  response: UserResourcePolicyV2SettingModalModifyMutation$data;
  variables: UserResourcePolicyV2SettingModalModifyMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "name"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      },
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      }
    ],
    "concreteType": "UpdateUserResourcePolicyPayload",
    "kind": "LinkedField",
    "name": "adminUpdateUserResourcePolicyV2",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "UserResourcePolicyV2SettingModalModifyMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "UserResourcePolicyV2SettingModalModifyMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "668ead374374e2bafbf822d7f3de3a81",
    "id": null,
    "metadata": {},
    "name": "UserResourcePolicyV2SettingModalModifyMutation",
    "operationKind": "mutation",
    "text": "mutation UserResourcePolicyV2SettingModalModifyMutation(\n  $name: String!\n  $input: UpdateUserResourcePolicyInput!\n) {\n  adminUpdateUserResourcePolicyV2(name: $name, input: $input) {\n    userResourcePolicy {\n      id\n      name\n      createdAt\n      maxVfolderCount\n      maxConcurrentLogins\n      maxSessionCountPerModelSession\n      maxQuotaScopeSize {\n        expr\n      }\n      maxCustomizedImageCount\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "748639f1ecc7608a99549d1cb7ecb1e2";

export default node;
