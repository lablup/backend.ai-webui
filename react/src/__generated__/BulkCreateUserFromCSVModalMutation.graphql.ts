/**
 * @generated SignedSource<<b0aa40e3b1e9932914b53cfda22eadb0>>
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
export type BulkCreateUserFromCSVModalMutation$variables = {
  input: BulkCreateUserV2Input;
};
export type BulkCreateUserFromCSVModalMutation$data = {
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
export type BulkCreateUserFromCSVModalMutation = {
  response: BulkCreateUserFromCSVModalMutation$data;
  variables: BulkCreateUserFromCSVModalMutation$variables;
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
    "name": "BulkCreateUserFromCSVModalMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BulkCreateUserFromCSVModalMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3f654de48fc6eca4f88c85d9acc1a488",
    "id": null,
    "metadata": {},
    "name": "BulkCreateUserFromCSVModalMutation",
    "operationKind": "mutation",
    "text": "mutation BulkCreateUserFromCSVModalMutation(\n  $input: BulkCreateUserV2Input!\n) {\n  adminBulkCreateUsersV2(input: $input) {\n    createdUsers {\n      id\n    }\n    failed {\n      index\n      username\n      email\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d20f072f895e0a19c9d2b2815bbdfda4";

export default node;
