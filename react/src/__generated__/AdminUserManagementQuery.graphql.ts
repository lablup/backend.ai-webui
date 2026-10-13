/**
 * @generated SignedSource<<f140606aff8fcbde610347adb3055bc4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type UserRoleV2 = "ADMIN" | "MONITOR" | "SUPERADMIN" | "USER" | "%future added value";
export type UserStatusV2 = "ACTIVE" | "BEFORE_VERIFICATION" | "DELETED" | "INACTIVE" | "%future added value";
export type UserV2OrderField = "CONTAINER_MAIN_GID" | "CONTAINER_UID" | "CREATED_AT" | "DESCRIPTION" | "DOMAIN_ID" | "DOMAIN_NAME" | "EMAIL" | "ENTITY_ID" | "FULL_NAME" | "INTEGRATION_NAME" | "MODIFIED_AT" | "NEED_PASSWORD_CHANGE" | "PROJECT_NAME" | "RESOURCE_POLICY" | "ROLE" | "STATUS" | "STATUS_INFO" | "SUDO_SESSION_ENABLED" | "TOTP_ACTIVATED" | "TOTP_ACTIVATED_AT" | "USERNAME" | "%future added value";
export type UserScope = {
  domain?: ReadonlyArray<UUIDScope> | null | undefined;
  project?: ReadonlyArray<UUIDScope> | null | undefined;
  role?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
  value: string;
};
export type UserV2Filter = {
  AND?: ReadonlyArray<UserV2Filter> | null | undefined;
  NOT?: ReadonlyArray<UserV2Filter> | null | undefined;
  OR?: ReadonlyArray<UserV2Filter> | null | undefined;
  containerGids?: IntArrayFilter | null | undefined;
  containerMainGid?: IntFilter | null | undefined;
  containerUid?: IntFilter | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  description?: StringFilter | null | undefined;
  domain?: UserDomainNestedFilter | null | undefined;
  domainId?: UUIDFilter | null | undefined;
  domainName?: StringFilter | null | undefined;
  email?: StringFilter | null | undefined;
  fullName?: StringFilter | null | undefined;
  integrationName?: StringFilter | null | undefined;
  keypairs?: UserKeypairNestedFilter | null | undefined;
  modifiedAt?: DateTimeFilter | null | undefined;
  needPasswordChange?: boolean | null | undefined;
  project?: UserProjectNestedFilter | null | undefined;
  resourcePolicy?: StringFilter | null | undefined;
  role?: UserRoleV2EnumFilter | null | undefined;
  status?: UserStatusV2EnumFilter | null | undefined;
  statusInfo?: StringFilter | null | undefined;
  sudoSessionEnabled?: boolean | null | undefined;
  totpActivated?: boolean | null | undefined;
  totpActivatedAt?: NullableDateTimeFilter | null | undefined;
  username?: StringFilter | null | undefined;
  uuid?: UUIDFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type StringFilter = {
  contains?: string | null | undefined;
  endsWith?: string | null | undefined;
  equals?: string | null | undefined;
  iContains?: string | null | undefined;
  iEndsWith?: string | null | undefined;
  iEquals?: string | null | undefined;
  iIn?: ReadonlyArray<string> | null | undefined;
  iNotContains?: string | null | undefined;
  iNotEndsWith?: string | null | undefined;
  iNotEquals?: string | null | undefined;
  iNotIn?: ReadonlyArray<string> | null | undefined;
  iNotStartsWith?: string | null | undefined;
  iStartsWith?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notContains?: string | null | undefined;
  notEndsWith?: string | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
  notStartsWith?: string | null | undefined;
  startsWith?: string | null | undefined;
};
export type UserStatusV2EnumFilter = {
  equals?: UserStatusV2 | null | undefined;
  in?: ReadonlyArray<UserStatusV2> | null | undefined;
  notEquals?: UserStatusV2 | null | undefined;
  notIn?: ReadonlyArray<UserStatusV2> | null | undefined;
};
export type UserRoleV2EnumFilter = {
  equals?: UserRoleV2 | null | undefined;
  in?: ReadonlyArray<UserRoleV2> | null | undefined;
  notEquals?: UserRoleV2 | null | undefined;
  notIn?: ReadonlyArray<UserRoleV2> | null | undefined;
};
export type IntFilter = {
  equals?: number | null | undefined;
  greaterThan?: number | null | undefined;
  greaterThanOrEqual?: number | null | undefined;
  lessThan?: number | null | undefined;
  lessThanOrEqual?: number | null | undefined;
  notEquals?: number | null | undefined;
};
export type IntArrayFilter = {
  contains?: number | null | undefined;
  containsAll?: ReadonlyArray<number> | null | undefined;
  containsAny?: ReadonlyArray<number> | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type NullableDateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  isNull?: boolean | null | undefined;
  notEquals?: string | null | undefined;
};
export type UserKeypairNestedFilter = {
  every?: KeypairFilter | null | undefined;
  exists?: boolean | null | undefined;
  none?: KeypairFilter | null | undefined;
  some?: KeypairFilter | null | undefined;
};
export type KeypairFilter = {
  AND?: ReadonlyArray<KeypairFilter> | null | undefined;
  NOT?: ReadonlyArray<KeypairFilter> | null | undefined;
  OR?: ReadonlyArray<KeypairFilter> | null | undefined;
  accessKey?: StringFilter | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  isActive?: boolean | null | undefined;
  isAdmin?: boolean | null | undefined;
  isDefault?: boolean | null | undefined;
  lastUsed?: DateTimeFilter | null | undefined;
  resourcePolicy?: StringFilter | null | undefined;
  userId?: UUIDFilter | null | undefined;
};
export type UserDomainNestedFilter = {
  isActive?: boolean | null | undefined;
  name?: StringFilter | null | undefined;
};
export type UserProjectNestedFilter = {
  isActive?: boolean | null | undefined;
  name?: StringFilter | null | undefined;
};
export type UserV2OrderBy = {
  direction?: OrderDirection;
  field?: UserV2OrderField;
};
export type AdminUserManagementQuery$variables = {
  domainName: string;
  filter?: UserV2Filter | null | undefined;
  isNotSupportTotp: boolean;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<UserV2OrderBy> | null | undefined;
  scope: UserScope;
  useScopedSearch: boolean;
};
export type AdminUserManagementQuery$data = {
  readonly domainUsersV2?: {
    readonly " $fragmentSpreads": FragmentRefs<"AdminUserManagement_userConnection">;
  } | null | undefined;
  readonly scopedUsersV2?: {
    readonly " $fragmentSpreads": FragmentRefs<"AdminUserManagement_userConnection">;
  } | null | undefined;
};
export type AdminUserManagementQuery = {
  response: AdminUserManagementQuery$data;
  variables: AdminUserManagementQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainName"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isNotSupportTotp"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "orderBy"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "useScopedSearch"
},
v8 = {
  "kind": "Variable",
  "name": "filter",
  "variableName": "filter"
},
v9 = {
  "kind": "Variable",
  "name": "limit",
  "variableName": "limit"
},
v10 = {
  "kind": "Variable",
  "name": "offset",
  "variableName": "offset"
},
v11 = {
  "kind": "Variable",
  "name": "orderBy",
  "variableName": "orderBy"
},
v12 = [
  (v8/*: any*/),
  (v9/*: any*/),
  (v10/*: any*/),
  (v11/*: any*/),
  {
    "kind": "Variable",
    "name": "scope",
    "variableName": "scope"
  }
],
v13 = [
  {
    "args": null,
    "kind": "FragmentSpread",
    "name": "AdminUserManagement_userConnection"
  }
],
v14 = [
  (v8/*: any*/),
  (v9/*: any*/),
  (v10/*: any*/),
  (v11/*: any*/),
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "domainName",
        "variableName": "domainName"
      }
    ],
    "kind": "ObjectValue",
    "name": "scope"
  }
],
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v16 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "UserV2Edge",
    "kind": "LinkedField",
    "name": "edges",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v15/*: any*/),
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
            "args": [
              {
                "kind": "Literal",
                "name": "limit",
                "value": 1000
              }
            ],
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
                      (v15/*: any*/),
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
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "type",
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
            "storageKey": "projects(limit:1000)"
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
                "condition": "isNotSupportTotp",
                "kind": "Condition",
                "passingValue": false,
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
                  }
                ]
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
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminUserManagementQuery",
    "selections": [
      {
        "condition": "useScopedSearch",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v12/*: any*/),
            "concreteType": "UserV2Connection",
            "kind": "LinkedField",
            "name": "scopedUsersV2",
            "plural": false,
            "selections": (v13/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "condition": "useScopedSearch",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v14/*: any*/),
            "concreteType": "UserV2Connection",
            "kind": "LinkedField",
            "name": "domainUsersV2",
            "plural": false,
            "selections": (v13/*: any*/),
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v6/*: any*/),
      (v0/*: any*/),
      (v7/*: any*/),
      (v1/*: any*/),
      (v5/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "AdminUserManagementQuery",
    "selections": [
      {
        "condition": "useScopedSearch",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v12/*: any*/),
            "concreteType": "UserV2Connection",
            "kind": "LinkedField",
            "name": "scopedUsersV2",
            "plural": false,
            "selections": (v16/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "condition": "useScopedSearch",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v14/*: any*/),
            "concreteType": "UserV2Connection",
            "kind": "LinkedField",
            "name": "domainUsersV2",
            "plural": false,
            "selections": (v16/*: any*/),
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "eaef37fa474c97763b0b8eca24e089b2",
    "id": null,
    "metadata": {},
    "name": "AdminUserManagementQuery",
    "operationKind": "query",
    "text": "query AdminUserManagementQuery(\n  $scope: UserScope!\n  $domainName: String!\n  $useScopedSearch: Boolean!\n  $filter: UserV2Filter\n  $orderBy: [UserV2OrderBy!]\n  $limit: Int\n  $offset: Int\n  $isNotSupportTotp: Boolean!\n) {\n  scopedUsersV2(scope: $scope, filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) @include(if: $useScopedSearch) @since(version: \"26.9.0a4\") {\n    ...AdminUserManagement_userConnection\n  }\n  domainUsersV2(scope: {domainName: $domainName}, filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) @skip(if: $useScopedSearch) {\n    ...AdminUserManagement_userConnection\n  }\n}\n\nfragment AdminUserManagement_userConnection on UserV2Connection {\n  count\n  edges {\n    node {\n      id\n      basicInfo {\n        email\n      }\n      ...BAIAdminUserV2TableFragment_1wLHi5\n      ...PurgeUsersModalFragment\n      ...UpdateUsersModalFragment\n      ...UserInfoModalFragment\n      ...UserSettingModalFragment\n    }\n  }\n}\n\nfragment BAIAdminUserV2TableFragment_1wLHi5 on UserV2 {\n  id\n  basicInfo {\n    email\n    fullName\n    username\n    description\n    integrationName\n  }\n  organization {\n    domainName\n    role\n    resourcePolicy\n    mainAccessKey\n  }\n  projects(limit: 1000) {\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n  security {\n    totpActivated @skip(if: $isNotSupportTotp) @skipOnClient(if: $isNotSupportTotp)\n    totpActivatedAt @skip(if: $isNotSupportTotp) @skipOnClient(if: $isNotSupportTotp)\n    sudoSessionEnabled\n    allowedClientIp\n  }\n  status {\n    status\n    statusInfo\n    needPasswordChange\n  }\n  container {\n    containerUid\n    containerMainGid\n    containerGids\n  }\n  timestamps {\n    createdAt\n    modifiedAt\n  }\n}\n\nfragment PurgeUsersModalFragment on UserV2 {\n  id\n  basicInfo {\n    email\n  }\n}\n\nfragment TOTPActivateModalFragment on UserV2 {\n  basicInfo {\n    email\n  }\n  security {\n    totpActivated @skip(if: $isNotSupportTotp) @skipOnClient(if: $isNotSupportTotp)\n  }\n}\n\nfragment UpdateUsersModalFragment on UserV2 {\n  id\n  basicInfo {\n    email\n  }\n}\n\nfragment UserInfoModalFragment on UserV2 {\n  basicInfo {\n    email\n    username\n    fullName\n    description\n  }\n  status {\n    status\n    needPasswordChange\n  }\n  security {\n    totpActivated @skip(if: $isNotSupportTotp) @skipOnClient(if: $isNotSupportTotp)\n    sudoSessionEnabled\n  }\n  organization {\n    domainName\n    role\n    resourcePolicy\n    mainAccessKey\n  }\n  projects(limit: 1000) {\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n}\n\nfragment UserSettingModalFragment on UserV2 {\n  id\n  basicInfo {\n    email\n    username\n    fullName\n    description\n  }\n  status {\n    status\n    needPasswordChange\n  }\n  organization {\n    domainName\n    role\n    resourcePolicy\n    mainAccessKey\n  }\n  security {\n    totpActivated @skip(if: $isNotSupportTotp) @skipOnClient(if: $isNotSupportTotp)\n    sudoSessionEnabled\n    allowedClientIp\n  }\n  container {\n    containerUid\n    containerMainGid\n    containerGids\n  }\n  projects(limit: 1000) {\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n          type\n        }\n      }\n    }\n  }\n  ...TOTPActivateModalFragment\n}\n"
  }
};
})();

(node as any).hash = "b5b994e6f9e5ec6806ed4f5dadc934d1";

export default node;
