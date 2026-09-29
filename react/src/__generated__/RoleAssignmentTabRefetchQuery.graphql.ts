/**
 * @generated SignedSource<<d067e48368a957089870d360fdbc5743>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OperationType = "CREATE" | "GRANT_ALL" | "GRANT_HARD_DELETE" | "GRANT_READ" | "GRANT_SOFT_DELETE" | "GRANT_UPDATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "APP_CONFIG_ALLOW_LIST" | "APP_CONFIG_DEFINITION" | "APP_CONFIG_FRAGMENT" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IDLE_CHECKER_ASSIGNMENT" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KERNEL_HISTORY" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
export type RoleAssignmentOrderField = "EMAIL" | "GRANTED_AT" | "USERNAME" | "%future added value";
export type RoleSource = "CUSTOM" | "SYSTEM" | "%future added value";
export type RoleStatus = "ACTIVE" | "DELETED" | "INACTIVE" | "%future added value";
export type UserRoleV2 = "ADMIN" | "MONITOR" | "SUPERADMIN" | "USER" | "%future added value";
export type UserStatusV2 = "ACTIVE" | "BEFORE_VERIFICATION" | "DELETED" | "INACTIVE" | "%future added value";
export type UserV2OrderField = "CONTAINER_MAIN_GID" | "CONTAINER_UID" | "CREATED_AT" | "DESCRIPTION" | "DOMAIN_ID" | "DOMAIN_NAME" | "EMAIL" | "ENTITY_ID" | "FULL_NAME" | "INTEGRATION_NAME" | "MODIFIED_AT" | "NEED_PASSWORD_CHANGE" | "PROJECT_NAME" | "RESOURCE_POLICY" | "ROLE" | "STATUS" | "STATUS_INFO" | "SUDO_SESSION_ENABLED" | "TOTP_ACTIVATED" | "TOTP_ACTIVATED_AT" | "USERNAME" | "%future added value";
export type RoleAssignmentFilter = {
  AND?: ReadonlyArray<RoleAssignmentFilter> | null | undefined;
  NOT?: ReadonlyArray<RoleAssignmentFilter> | null | undefined;
  OR?: ReadonlyArray<RoleAssignmentFilter> | null | undefined;
  email?: StringFilter | null | undefined;
  permission?: PermissionNestedFilter | null | undefined;
  role?: RoleAssignmentRoleNestedFilter | null | undefined;
  roleId?: UUIDFilter | null | undefined;
  username?: StringFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type RoleAssignmentRoleNestedFilter = {
  AND?: ReadonlyArray<RoleAssignmentRoleNestedFilter> | null | undefined;
  NOT?: ReadonlyArray<RoleAssignmentRoleNestedFilter> | null | undefined;
  OR?: ReadonlyArray<RoleAssignmentRoleNestedFilter> | null | undefined;
  name?: StringFilter | null | undefined;
  source?: RoleSourceFilter | null | undefined;
  status?: RoleStatusFilter | null | undefined;
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
export type RoleSourceFilter = {
  equals?: RoleSource | null | undefined;
  in?: ReadonlyArray<RoleSource> | null | undefined;
  notEquals?: RoleSource | null | undefined;
  notIn?: ReadonlyArray<RoleSource> | null | undefined;
};
export type RoleStatusFilter = {
  equals?: RoleStatus | null | undefined;
  in?: ReadonlyArray<RoleStatus> | null | undefined;
  notEquals?: RoleStatus | null | undefined;
  notIn?: ReadonlyArray<RoleStatus> | null | undefined;
};
export type PermissionNestedFilter = {
  AND?: ReadonlyArray<PermissionNestedFilter> | null | undefined;
  NOT?: ReadonlyArray<PermissionNestedFilter> | null | undefined;
  OR?: ReadonlyArray<PermissionNestedFilter> | null | undefined;
  entityType?: StringFilter | null | undefined;
  operation?: OperationTypeFilter | null | undefined;
  permission?: PermissionBitFilter | null | undefined;
  scopeId?: StringFilter | null | undefined;
  scopeType?: RBACElementTypeFilter | null | undefined;
};
export type PermissionBitFilter = {
  equals?: PermissionBit | null | undefined;
  in?: ReadonlyArray<PermissionBit> | null | undefined;
  notEquals?: PermissionBit | null | undefined;
  notIn?: ReadonlyArray<PermissionBit> | null | undefined;
};
export type RBACElementTypeFilter = {
  equals?: RBACElementType | null | undefined;
  in?: ReadonlyArray<RBACElementType> | null | undefined;
  notEquals?: RBACElementType | null | undefined;
  notIn?: ReadonlyArray<RBACElementType> | null | undefined;
};
export type OperationTypeFilter = {
  equals?: OperationType | null | undefined;
  in?: ReadonlyArray<OperationType> | null | undefined;
  notEquals?: OperationType | null | undefined;
  notIn?: ReadonlyArray<OperationType> | null | undefined;
};
export type RoleAssignmentOrderBy = {
  direction?: OrderDirection;
  field: RoleAssignmentOrderField;
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
export type RoleAssignmentTabRefetchQuery$variables = {
  filter?: RoleAssignmentFilter | null | undefined;
  id: string;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<RoleAssignmentOrderBy> | null | undefined;
  userFilter?: UserV2Filter | null | undefined;
  userOrderBy?: ReadonlyArray<UserV2OrderBy> | null | undefined;
};
export type RoleAssignmentTabRefetchQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"RoleAssignmentTabFragment">;
  } | null | undefined;
};
export type RoleAssignmentTabRefetchQuery = {
  response: RoleAssignmentTabRefetchQuery$data;
  variables: RoleAssignmentTabRefetchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = {
  "defaultValue": 10,
  "kind": "LocalArgument",
  "name": "limit"
},
v3 = {
  "defaultValue": 0,
  "kind": "LocalArgument",
  "name": "offset"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "orderBy"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "userFilter"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "userOrderBy"
},
v7 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
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
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeType",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeId",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v16 = {
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
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RoleAssignmentTabRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v7/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": [
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              (v11/*: any*/),
              {
                "kind": "Variable",
                "name": "userFilter",
                "variableName": "userFilter"
              },
              {
                "kind": "Variable",
                "name": "userOrderBy",
                "variableName": "userOrderBy"
              }
            ],
            "kind": "FragmentSpread",
            "name": "RoleAssignmentTabFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "RoleAssignmentTabRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v7/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v12/*: any*/),
          {
            "kind": "InlineFragment",
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
                "name": "source",
                "storageKey": null
              },
              {
                "alias": "firstScope",
                "args": [
                  {
                    "kind": "Literal",
                    "name": "first",
                    "value": 1
                  }
                ],
                "concreteType": "EntityConnection",
                "kind": "LinkedField",
                "name": "scopes",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "EntityRefEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "EntityRef",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v13/*: any*/),
                          (v14/*: any*/),
                          (v12/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "scopes(first:1)"
              },
              (v13/*: any*/),
              (v14/*: any*/),
              {
                "alias": null,
                "args": [
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/)
                ],
                "concreteType": "RoleAssignmentConnection",
                "kind": "LinkedField",
                "name": "users",
                "plural": false,
                "selections": [
                  (v15/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "RoleAssignmentEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "RoleAssignment",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v12/*: any*/),
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
                            "name": "grantedAt",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "UserV2",
                            "kind": "LinkedField",
                            "name": "user",
                            "plural": false,
                            "selections": [
                              (v12/*: any*/),
                              (v16/*: any*/)
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
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Variable",
                    "name": "filter",
                    "variableName": "userFilter"
                  },
                  (v9/*: any*/),
                  (v10/*: any*/),
                  {
                    "kind": "Variable",
                    "name": "orderBy",
                    "variableName": "userOrderBy"
                  }
                ],
                "concreteType": "UserV2Connection",
                "kind": "LinkedField",
                "name": "usersV2",
                "plural": false,
                "selections": [
                  (v15/*: any*/),
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
                          (v12/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "entityId",
                            "storageKey": null
                          },
                          (v16/*: any*/)
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
            "type": "Role",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "15597cb5bb8ff4469d96ed6fef946e87",
    "id": null,
    "metadata": {},
    "name": "RoleAssignmentTabRefetchQuery",
    "operationKind": "query",
    "text": "query RoleAssignmentTabRefetchQuery(\n  $filter: RoleAssignmentFilter\n  $limit: Int = 10\n  $offset: Int = 0\n  $orderBy: [RoleAssignmentOrderBy!]\n  $userFilter: UserV2Filter\n  $userOrderBy: [UserV2OrderBy!]\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RoleAssignmentTabFragment_36l2j3\n    id\n  }\n}\n\nfragment RoleAssignmentTabFragment_36l2j3 on Role {\n  id\n  name\n  source\n  firstScope: scopes(first: 1) @deprecatedSince(version: \"26.9.0a4\") {\n    edges {\n      node {\n        scopeType\n        scopeId\n        id\n      }\n    }\n  }\n  scopeType @since(version: \"26.9.0a4\")\n  scopeId @since(version: \"26.9.0a4\")\n  users(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) @deprecatedSince(version: \"26.9.0a4\") {\n    count\n    edges {\n      node {\n        id\n        userId\n        grantedAt\n        user {\n          id\n          basicInfo {\n            email\n            fullName\n          }\n        }\n      }\n    }\n  }\n  usersV2(filter: $userFilter, orderBy: $userOrderBy, limit: $limit, offset: $offset) @since(version: \"26.9.0a4\") {\n    count\n    edges {\n      node {\n        id\n        entityId\n        basicInfo {\n          email\n          fullName\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c40588e5b4a36e7533b40d0bb2f41dc2";

export default node;
