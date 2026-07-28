/**
 * @generated SignedSource<<45c65a09376aa922526e153447530538>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
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
  isNotSupportTotp: boolean;
};
export type UpdateUsersModalBulkUpdateMutation$data = {
  readonly adminBulkUpdateUsersV2: {
    readonly failed: ReadonlyArray<{
      readonly message: string;
      readonly userId: string;
    }>;
    readonly updatedUsers: ReadonlyArray<{
      readonly id: string;
      readonly projects: {
        readonly edges: ReadonlyArray<{
          readonly node: {
            readonly basicInfo: {
              readonly name: string;
            };
            readonly id: string;
          };
        }>;
      } | null | undefined;
      readonly " $fragmentSpreads": FragmentRefs<"BAIAdminUserV2TableFragment">;
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
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "isNotSupportTotp"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectV2Connection",
  "kind": "LinkedField",
  "name": "projects",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2Edge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectV2",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v2/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "ProjectBasicInfo",
              "kind": "LinkedField",
              "name": "basicInfo",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
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
  ],
  "storageKey": null
},
v4 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "UpdateUsersModalBulkUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
              (v2/*: any*/),
              (v3/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "BAIAdminUserV2TableFragment"
              }
            ],
            "storageKey": null
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UpdateUsersModalBulkUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
              (v2/*: any*/),
              (v3/*: any*/),
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
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c78bf104fe67345d10dd4c52953a5cea",
    "id": null,
    "metadata": {},
    "name": "UpdateUsersModalBulkUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation UpdateUsersModalBulkUpdateMutation(\n  $input: BulkUpdateUserV2Input!\n  $isNotSupportTotp: Boolean!\n) {\n  adminBulkUpdateUsersV2(input: $input) {\n    updatedUsers {\n      id\n      projects {\n        edges {\n          node {\n            id\n            basicInfo {\n              name\n            }\n          }\n        }\n      }\n      ...BAIAdminUserV2TableFragment\n    }\n    failed {\n      userId\n      message\n    }\n  }\n}\n\nfragment BAIAdminUserV2TableFragment on UserV2 {\n  id\n  basicInfo {\n    email\n    fullName\n    username\n    description\n    integrationName\n  }\n  organization {\n    domainName\n    role\n    resourcePolicy\n    mainAccessKey\n  }\n  security {\n    totpActivated @skipOnClient(if: $isNotSupportTotp)\n    totpActivatedAt @skipOnClient(if: $isNotSupportTotp)\n    sudoSessionEnabled\n    allowedClientIp\n  }\n  status {\n    status\n    statusInfo\n    needPasswordChange\n  }\n  container {\n    containerUid\n    containerMainGid\n    containerGids\n  }\n  timestamps {\n    createdAt\n    modifiedAt\n  }\n}\n"
  }
};
})();

(node as any).hash = "e99c549ef1d04421101b6f35ec6130ec";

export default node;
