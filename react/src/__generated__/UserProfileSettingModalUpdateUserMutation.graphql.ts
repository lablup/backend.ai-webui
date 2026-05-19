/**
 * @generated SignedSource<<52554e5b8829aa262a8f33c45b9808d5>>
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
export type UserProfileSettingModalUpdateUserMutation$variables = {
  input: UpdateUserV2Input;
};
export type UserProfileSettingModalUpdateUserMutation$data = {
  readonly updateUserV2: {
    readonly user: {
      readonly id: string;
    };
  } | null | undefined;
};
export type UserProfileSettingModalUpdateUserMutation = {
  response: UserProfileSettingModalUpdateUserMutation$data;
  variables: UserProfileSettingModalUpdateUserMutation$variables;
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
    "concreteType": "UpdateUserV2Payload",
    "kind": "LinkedField",
    "name": "updateUserV2",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "UserProfileSettingModalUpdateUserMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserProfileSettingModalUpdateUserMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "00348894270991a274a0a6a92a354f14",
    "id": null,
    "metadata": {},
    "name": "UserProfileSettingModalUpdateUserMutation",
    "operationKind": "mutation",
    "text": "mutation UserProfileSettingModalUpdateUserMutation(\n  $input: UpdateUserV2Input!\n) {\n  updateUserV2(input: $input) {\n    user {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "541a512947ad1b30ddc4a21a07424c79";

export default node;
