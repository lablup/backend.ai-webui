/**
 * @generated SignedSource<<45112442a35adb8409a240d608eab5a3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserRoleV2 = "ADMIN" | "MONITOR" | "SUPERADMIN" | "USER" | "%future added value";
export type UserStatusV2 = "ACTIVE" | "BEFORE_VERIFICATION" | "DELETED" | "INACTIVE" | "%future added value";
export type BulkUpdateUserV2Input = {
  users: ReadonlyArray<BulkUpdateUserV2ItemInput>;
};
export type BulkUpdateUserV2ItemInput = {
  input: UpdateUserV2Input;
  userId: string;
};
export type UpdateUserV2Input = {
  allowedClientIp?: ReadonlyArray<string> | null | undefined;
  containerGids?: ReadonlyArray<number> | null | undefined;
  containerMainGid?: number | null | undefined;
  containerUid?: number | null | undefined;
  description?: string | null | undefined;
  domainName?: string | null | undefined;
  fullName?: string | null | undefined;
  groupIds?: ReadonlyArray<string> | null | undefined;
  mainAccessKey?: string | null | undefined;
  needPasswordChange?: boolean | null | undefined;
  password?: string | null | undefined;
  resourcePolicy?: string | null | undefined;
  role?: UserRoleV2 | null | undefined;
  status?: UserStatusV2 | null | undefined;
  sudoSessionEnabled?: boolean | null | undefined;
  username?: string | null | undefined;
};
export type UpdateUsersModalBulkUpdateMutation$variables = {
  input: BulkUpdateUserV2Input;
};
export type UpdateUsersModalBulkUpdateMutation$data = {
  readonly adminBulkUpdateUsersV2: {
    readonly failed: ReadonlyArray<{
      readonly message: string;
      readonly userId: string;
    }>;
    readonly updatedUsers: ReadonlyArray<{
      readonly id: string;
    }>;
  } | null | undefined;
};
export type UpdateUsersModalBulkUpdateMutation = {
  response: UpdateUsersModalBulkUpdateMutation$data;
  variables: UpdateUsersModalBulkUpdateMutation$variables;
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
    "concreteType": "BulkUpdateUsersV2Payload",
    "kind": "LinkedField",
    "name": "adminBulkUpdateUsersV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "updatedUsers",
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
        "concreteType": "BulkUpdateUserV2Error",
        "kind": "LinkedField",
        "name": "failed",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "userId",
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
    "name": "UpdateUsersModalBulkUpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UpdateUsersModalBulkUpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ec1278040046eb9a4a271b83dffbbc6d",
    "id": null,
    "metadata": {},
    "name": "UpdateUsersModalBulkUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation UpdateUsersModalBulkUpdateMutation(\n  $input: BulkUpdateUserV2Input!\n) {\n  adminBulkUpdateUsersV2(input: $input) {\n    updatedUsers {\n      id\n    }\n    failed {\n      userId\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "755dd50b5a60464607abd86cb39ff96e";

export default node;
