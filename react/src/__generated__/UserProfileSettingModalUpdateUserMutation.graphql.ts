/**
 * @generated SignedSource<<5f5c34721426f8aaa8de6c4c4ac91864>>
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
      readonly basicInfo: {
        readonly description: string | null | undefined;
        readonly email: string;
        readonly fullName: string | null | undefined;
        readonly integrationName: string | null | undefined;
        readonly username: string | null | undefined;
      };
      readonly container: {
        readonly containerGids: ReadonlyArray<number> | null | undefined;
        readonly containerMainGid: number | null | undefined;
        readonly containerUid: number | null | undefined;
      };
      readonly id: string;
      readonly organization: {
        readonly domainName: string | null | undefined;
        readonly mainAccessKey: string | null | undefined;
        readonly resourcePolicy: string;
        readonly role: UserRoleV2 | null | undefined;
      };
      readonly security: {
        readonly allowedClientIp: ReadonlyArray<string> | null | undefined;
        readonly sudoSessionEnabled: boolean;
        readonly totpActivated: boolean | null | undefined;
        readonly totpActivatedAt: string | null | undefined;
      };
      readonly status: {
        readonly needPasswordChange: boolean | null | undefined;
        readonly status: UserStatusV2;
        readonly statusInfo: string | null | undefined;
      };
      readonly timestamps: {
        readonly createdAt: string | null | undefined;
        readonly modifiedAt: string | null | undefined;
      };
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
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "UserV2BasicInfo",
            "kind": "LinkedField",
            "name": "basicInfo",
            "plural": false,
            "selections": [
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
                "name": "fullName",
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
                "name": "description",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "integrationName",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "UserV2OrganizationInfo",
            "kind": "LinkedField",
            "name": "organization",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "domainName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "role",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "resourcePolicy",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "mainAccessKey",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "UserV2SecurityInfo",
            "kind": "LinkedField",
            "name": "security",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "totpActivated",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "totpActivatedAt",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "sudoSessionEnabled",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "allowedClientIp",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "UserV2StatusInfo",
            "kind": "LinkedField",
            "name": "status",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "status",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "statusInfo",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "needPasswordChange",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "UserV2ContainerSettings",
            "kind": "LinkedField",
            "name": "container",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "containerUid",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "containerMainGid",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "containerGids",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityTimestamps",
            "kind": "LinkedField",
            "name": "timestamps",
            "plural": false,
            "selections": [
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
                "name": "modifiedAt",
                "storageKey": null
              }
            ],
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
    "cacheID": "7058e74e168b78a893d20d6de8cc09db",
    "id": null,
    "metadata": {},
    "name": "UserProfileSettingModalUpdateUserMutation",
    "operationKind": "mutation",
    "text": "mutation UserProfileSettingModalUpdateUserMutation(\n  $input: UpdateUserV2Input!\n) {\n  updateUserV2(input: $input) {\n    user {\n      id\n      basicInfo {\n        email\n        fullName\n        username\n        description\n        integrationName\n      }\n      organization {\n        domainName\n        role\n        resourcePolicy\n        mainAccessKey\n      }\n      security {\n        totpActivated\n        totpActivatedAt\n        sudoSessionEnabled\n        allowedClientIp\n      }\n      status {\n        status\n        statusInfo\n        needPasswordChange\n      }\n      container {\n        containerUid\n        containerMainGid\n        containerGids\n      }\n      timestamps {\n        createdAt\n        modifiedAt\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d2dd9fa7dbd020c11fc03607d6400386";

export default node;
