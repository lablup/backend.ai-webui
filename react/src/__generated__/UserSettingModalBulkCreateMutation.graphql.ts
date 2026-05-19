/**
 * @generated SignedSource<<f0d8794cbea3f0541c570a114a7629df>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserRoleV2 = "ADMIN" | "MONITOR" | "SUPERADMIN" | "USER" | "%future added value";
export type UserStatusV2 = "ACTIVE" | "BEFORE_VERIFICATION" | "DELETED" | "INACTIVE" | "%future added value";
export type BulkCreateUserV2Input = {
  users: ReadonlyArray<CreateUserV2Input>;
};
export type CreateUserV2Input = {
  allowedClientIp?: ReadonlyArray<string> | null | undefined;
  containerGids?: ReadonlyArray<number> | null | undefined;
  containerMainGid?: number | null | undefined;
  containerUid?: number | null | undefined;
  description?: string | null | undefined;
  domainName: string;
  email: string;
  fullName?: string | null | undefined;
  groupIds?: ReadonlyArray<string> | null | undefined;
  needPasswordChange: boolean;
  password: string;
  resourcePolicy?: string;
  role: UserRoleV2;
  status: UserStatusV2;
  sudoSessionEnabled?: boolean;
  totpActivated?: boolean;
  username: string;
};
export type UserSettingModalBulkCreateMutation$variables = {
  input: BulkCreateUserV2Input;
};
export type UserSettingModalBulkCreateMutation$data = {
  readonly adminBulkCreateUsersV2: {
    readonly createdUsers: ReadonlyArray<{
      readonly id: string;
    }>;
    readonly failed: ReadonlyArray<{
      readonly email: string;
      readonly index: number;
      readonly message: string;
      readonly username: string;
    }>;
  } | null | undefined;
};
export type UserSettingModalBulkCreateMutation = {
  response: UserSettingModalBulkCreateMutation$data;
  variables: UserSettingModalBulkCreateMutation$variables;
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
    "concreteType": "BulkCreateUsersV2Payload",
    "kind": "LinkedField",
    "name": "adminBulkCreateUsersV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "createdUsers",
        "plural": true,
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
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "BulkCreateUserV2Error",
        "kind": "LinkedField",
        "name": "failed",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "index",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "username",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "email",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "message",
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
    "name": "UserSettingModalBulkCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserSettingModalBulkCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "501b8d2ff71c923535e5fd3b603133e1",
    "id": null,
    "metadata": {},
    "name": "UserSettingModalBulkCreateMutation",
    "operationKind": "mutation",
    "text": "mutation UserSettingModalBulkCreateMutation(\n  $input: BulkCreateUserV2Input!\n) {\n  adminBulkCreateUsersV2(input: $input) {\n    createdUsers {\n      id\n    }\n    failed {\n      index\n      username\n      email\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a0d50f5234a2c465c3828841f747503c";

export default node;
