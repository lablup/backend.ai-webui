/**
 * @generated SignedSource<<0d317c25d8cbea83f3b1c4ed9274105e>>
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
export type RBACElementType = "AGENT" | "APP_CONFIG" | "APP_CONFIG_ALLOW_LIST" | "APP_CONFIG_DEFINITION" | "APP_CONFIG_FRAGMENT" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
export type RoleAssignmentOrderField = "EMAIL" | "GRANTED_AT" | "USERNAME" | "%future added value";
export type RoleSource = "CUSTOM" | "SYSTEM" | "%future added value";
export type RoleStatus = "ACTIVE" | "DELETED" | "INACTIVE" | "%future added value";
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
  entityType?: RBACElementTypeFilter | null | undefined;
  operation?: OperationTypeFilter | null | undefined;
  scopeId?: StringFilter | null | undefined;
  scopeType?: RBACElementTypeFilter | null | undefined;
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
export type RoleAssignmentTabRefetchQuery$variables = {
  filter?: RoleAssignmentFilter | null | undefined;
  id: string;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<RoleAssignmentOrderBy> | null | undefined;
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
v5 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v6 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "orderBy"
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RoleAssignmentTabRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": (v6/*: any*/),
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
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "RoleAssignmentTabRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
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
          (v7/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
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
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "scopeType",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "scopeId",
                            "storageKey": null
                          },
                          (v7/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "scopes(first:1)"
              },
              {
                "alias": null,
                "args": (v6/*: any*/),
                "concreteType": "RoleAssignmentConnection",
                "kind": "LinkedField",
                "name": "users",
                "plural": false,
                "selections": [
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
                          (v7/*: any*/),
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
                            "name": "grantedBy",
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
                              (v7/*: any*/),
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
    "cacheID": "e0f84306e5926664a1ba3b6b4732125a",
    "id": null,
    "metadata": {},
    "name": "RoleAssignmentTabRefetchQuery",
    "operationKind": "query",
    "text": "query RoleAssignmentTabRefetchQuery(\n  $filter: RoleAssignmentFilter\n  $limit: Int = 10\n  $offset: Int = 0\n  $orderBy: [RoleAssignmentOrderBy!]\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RoleAssignmentTabFragment_40cQ3G\n    id\n  }\n}\n\nfragment RoleAssignmentTabFragment_40cQ3G on Role {\n  id\n  firstScope: scopes(first: 1) {\n    edges {\n      node {\n        scopeType\n        scopeId\n        id\n      }\n    }\n  }\n  users(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        userId\n        grantedBy\n        grantedAt\n        user {\n          id\n          basicInfo {\n            email\n            fullName\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "409010db642c0926546832b7d5e21e2f";

export default node;
