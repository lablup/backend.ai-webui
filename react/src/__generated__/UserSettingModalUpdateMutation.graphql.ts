/**
 * @generated SignedSource<<a0d3314f6330ab3e582a48a90201ecbb>>
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
export type UserSettingModalUpdateMutation$variables = {
  input: UpdateUserV2Input;
  userId: string;
};
export type UserSettingModalUpdateMutation$data = {
  readonly adminUpdateUserV2: {
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
export type UserSettingModalUpdateMutation = {
  response: UserSettingModalUpdateMutation$data;
  variables: UserSettingModalUpdateMutation$variables;
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "UserSettingModalUpdateMutation",
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
    "name": "UserSettingModalUpdateMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "6d9694c22dd3d159d5a4e20ca653d6e1",
    "id": null,
    "metadata": {},
    "name": "UserSettingModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation UserSettingModalUpdateMutation(\n  $userId: UUID!\n  $input: UpdateUserV2Input!\n) {\n  adminUpdateUserV2(userId: $userId, input: $input) {\n    user {\n      id\n      basicInfo {\n        email\n        fullName\n        username\n        description\n        integrationName\n      }\n      organization {\n        domainName\n        role\n        resourcePolicy\n        mainAccessKey\n      }\n      security {\n        totpActivated\n        totpActivatedAt\n        sudoSessionEnabled\n        allowedClientIp\n      }\n      status {\n        status\n        statusInfo\n        needPasswordChange\n      }\n      container {\n        containerUid\n        containerMainGid\n        containerGids\n      }\n      timestamps {\n        createdAt\n        modifiedAt\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5846adb6fee8b57f1a573238dea83916";

export default node;
