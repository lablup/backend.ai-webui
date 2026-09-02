/**
 * @generated SignedSource<<6a99ed31d156c85b9b22492a7da4942a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserRoleV2 = "ADMIN" | "MONITOR" | "SUPERADMIN" | "USER" | "%future added value";
export type UserStatusV2 = "ACTIVE" | "BEFORE_VERIFICATION" | "DELETED" | "INACTIVE" | "%future added value";
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
export type AdminUserManagementUpdateUserMutation$variables = {
  input: UpdateUserV2Input;
  userId: string;
};
export type AdminUserManagementUpdateUserMutation$data = {
  readonly adminUpdateUserV2: {
    readonly user: {
      readonly id: string;
    };
  } | null | undefined;
};
export type AdminUserManagementUpdateUserMutation = {
  response: AdminUserManagementUpdateUserMutation$data;
  variables: AdminUserManagementUpdateUserMutation$variables;
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
  "name": "userId"
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
        "name": "userId",
        "variableName": "userId"
      }
    ],
    "concreteType": "UpdateUserV2Payload",
    "kind": "LinkedField",
    "name": "adminUpdateUserV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "user",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminUserManagementUpdateUserMutation",
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
    "name": "AdminUserManagementUpdateUserMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "110dd81e48285a9c65ccd92b637cf083",
    "id": null,
    "metadata": {},
    "name": "AdminUserManagementUpdateUserMutation",
    "operationKind": "mutation",
    "text": "mutation AdminUserManagementUpdateUserMutation(\n  $userId: UUID!\n  $input: UpdateUserV2Input!\n) {\n  adminUpdateUserV2(userId: $userId, input: $input) {\n    user {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "05073e5ace10d1925fb899826b61ee8b";

export default node;
