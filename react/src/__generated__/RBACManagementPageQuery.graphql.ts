/**
 * @generated SignedSource<<01146fa1c1f2dfb19d29c7bc6e683576>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "APP_CONFIG_ALLOW_LIST" | "APP_CONFIG_DEFINITION" | "APP_CONFIG_FRAGMENT" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IDLE_CHECKER_ASSIGNMENT" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KERNEL_HISTORY" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
export type RoleOrderField = "CREATED_AT" | "NAME" | "UPDATED_AT" | "%future added value";
export type RoleSource = "CUSTOM" | "SYSTEM" | "%future added value";
export type RoleStatus = "ACTIVE" | "DELETED" | "INACTIVE" | "%future added value";
export type RoleFilter = {
  AND?: ReadonlyArray<RoleFilter> | null | undefined;
  NOT?: ReadonlyArray<RoleFilter> | null | undefined;
  OR?: ReadonlyArray<RoleFilter> | null | undefined;
  assignedUser?: RoleUserNestedFilter | null | undefined;
  mappedScope?: RoleMappedScopeNestedFilter | null | undefined;
  name?: StringFilter | null | undefined;
  permissions?: RolePermissionNestedFilter | null | undefined;
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
export type RoleUserNestedFilter = {
  AND?: ReadonlyArray<RoleUserNestedFilter> | null | undefined;
  NOT?: ReadonlyArray<RoleUserNestedFilter> | null | undefined;
  OR?: ReadonlyArray<RoleUserNestedFilter> | null | undefined;
  userId?: UUIDFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type RoleMappedScopeNestedFilter = {
  AND?: ReadonlyArray<RoleMappedScopeNestedFilter> | null | undefined;
  NOT?: ReadonlyArray<RoleMappedScopeNestedFilter> | null | undefined;
  OR?: ReadonlyArray<RoleMappedScopeNestedFilter> | null | undefined;
  scopeId?: UUIDFilter | null | undefined;
  scopeType?: StringFilter | null | undefined;
};
export type RolePermissionNestedFilter = {
  every?: PermissionFilter | null | undefined;
  exists?: boolean | null | undefined;
  none?: PermissionFilter | null | undefined;
  some?: PermissionFilter | null | undefined;
};
export type PermissionFilter = {
  AND?: ReadonlyArray<PermissionFilter> | null | undefined;
  NOT?: ReadonlyArray<PermissionFilter> | null | undefined;
  OR?: ReadonlyArray<PermissionFilter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  entityType?: StringFilter | null | undefined;
  permission?: PermissionBitFilter | null | undefined;
  roleId?: UUIDFilter | null | undefined;
  scopeId?: StringFilter | null | undefined;
  scopeType?: RBACElementTypeFilter | null | undefined;
};
export type PermissionBitFilter = {
  equals?: PermissionBit | null | undefined;
  in?: ReadonlyArray<PermissionBit> | null | undefined;
  notEquals?: PermissionBit | null | undefined;
  notIn?: ReadonlyArray<PermissionBit> | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type RBACElementTypeFilter = {
  equals?: RBACElementType | null | undefined;
  in?: ReadonlyArray<RBACElementType> | null | undefined;
  notEquals?: RBACElementType | null | undefined;
  notIn?: ReadonlyArray<RBACElementType> | null | undefined;
};
export type RoleOrderBy = {
  direction?: OrderDirection;
  field: RoleOrderField;
};
export type RBACManagementPageQuery$variables = {
  filter?: RoleFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<RoleOrderBy> | null | undefined;
};
export type RBACManagementPageQuery$data = {
  readonly adminRoles: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"RoleDetailDrawerV2Fragment" | "RoleNodesFragment">;
      };
    }>;
  } | null | undefined;
};
export type RBACManagementPageQuery = {
  response: RBACManagementPageQuery$data;
  variables: RBACManagementPageQuery$variables;
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
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "orderBy"
},
v4 = [
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
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "email",
  "storageKey": null
},
v10 = [
  (v8/*: any*/)
],
v11 = [
  (v6/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RBACManagementPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "RoleConnection",
        "kind": "LinkedField",
        "name": "adminRoles",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "RoleEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Role",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "RoleNodesFragment"
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "RoleDetailDrawerV2Fragment"
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
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "RBACManagementPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "RoleConnection",
        "kind": "LinkedField",
        "name": "adminRoles",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "RoleEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Role",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
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
                    "name": "source",
                    "storageKey": null
                  },
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
                    "name": "autoAssign",
                    "storageKey": null
                  },
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
                    "name": "updatedAt",
                    "storageKey": null
                  },
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
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "rolePresetId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "RolePreset",
                    "kind": "LinkedField",
                    "name": "rolePreset",
                    "plural": false,
                    "selections": [
                      (v8/*: any*/),
                      (v6/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "scope",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ProjectBasicInfo",
                            "kind": "LinkedField",
                            "name": "basicInfo",
                            "plural": false,
                            "selections": [
                              {
                                "alias": "projectName",
                                "args": null,
                                "kind": "ScalarField",
                                "name": "name",
                                "storageKey": null
                              },
                              (v8/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "type": "ProjectV2",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "DomainBasicInfo",
                            "kind": "LinkedField",
                            "name": "basicInfo",
                            "plural": false,
                            "selections": [
                              {
                                "alias": "domainName",
                                "args": null,
                                "kind": "ScalarField",
                                "name": "name",
                                "storageKey": null
                              },
                              (v8/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "type": "DomainV2",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "UserV2BasicInfo",
                            "kind": "LinkedField",
                            "name": "basicInfo",
                            "plural": false,
                            "selections": [
                              {
                                "alias": "userEmail",
                                "args": null,
                                "kind": "ScalarField",
                                "name": "email",
                                "storageKey": null
                              },
                              (v9/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "type": "UserV2",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "VFolderMetadataInfo",
                            "kind": "LinkedField",
                            "name": "metadata",
                            "plural": false,
                            "selections": (v10/*: any*/),
                            "storageKey": null
                          }
                        ],
                        "type": "VFolder",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "SessionV2MetadataInfo",
                            "kind": "LinkedField",
                            "name": "metadata",
                            "plural": false,
                            "selections": [
                              {
                                "alias": "sessionName",
                                "args": null,
                                "kind": "ScalarField",
                                "name": "name",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "type": "SessionV2",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ModelDeploymentMetadata",
                            "kind": "LinkedField",
                            "name": "metadata",
                            "plural": false,
                            "selections": (v10/*: any*/),
                            "storageKey": null
                          }
                        ],
                        "type": "ModelDeployment",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": (v10/*: any*/),
                        "type": "ResourceGroup",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "registryName",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "project",
                            "storageKey": null
                          }
                        ],
                        "type": "ContainerRegistryV2",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": (v11/*: any*/),
                        "type": "Node",
                        "abstractKey": "__isNode"
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": (v11/*: any*/),
                        "type": "ArtifactRegistry",
                        "abstractKey": null
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
                        "value": 10
                      },
                      {
                        "kind": "Literal",
                        "name": "offset",
                        "value": 0
                      }
                    ],
                    "concreteType": "UserV2Connection",
                    "kind": "LinkedField",
                    "name": "usersV2",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/),
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
                              (v6/*: any*/),
                              (v7/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "UserV2BasicInfo",
                                "kind": "LinkedField",
                                "name": "basicInfo",
                                "plural": false,
                                "selections": [
                                  (v9/*: any*/),
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
                    "storageKey": "usersV2(limit:10,offset:0)"
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
    ]
  },
  "params": {
    "cacheID": "c55b37034bf9d123ccea8c8a7c72e975",
    "id": null,
    "metadata": {},
    "name": "RBACManagementPageQuery",
    "operationKind": "query",
    "text": "query RBACManagementPageQuery(\n  $filter: RoleFilter\n  $orderBy: [RoleOrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  adminRoles(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        ...RoleNodesFragment\n        ...RoleDetailDrawerV2Fragment\n      }\n    }\n  }\n}\n\nfragment RoleAssignmentTabFragment on Role {\n  id\n  entityId\n  name\n  source\n  scopeType\n  scopeId\n  usersV2(limit: 10, offset: 0) {\n    count\n    edges {\n      node {\n        id\n        entityId\n        basicInfo {\n          email\n          fullName\n        }\n      }\n    }\n  }\n}\n\nfragment RoleDetailDrawerContentV2Fragment on Role {\n  id\n  entityId\n  name\n  description\n  source\n  status\n  autoAssign\n  createdAt\n  updatedAt\n  scopeType\n  scopeId\n  scope {\n    __typename\n    ... on DomainV2 {\n      basicInfo {\n        name\n      }\n    }\n    ... on ProjectV2 {\n      basicInfo {\n        name\n      }\n    }\n    ... on UserV2 {\n      basicInfo {\n        email\n      }\n    }\n    ... on VFolder {\n      metadata {\n        name\n      }\n    }\n    ... on SessionV2 {\n      metadata {\n        sessionName: name\n      }\n    }\n    ... on ModelDeployment {\n      metadata {\n        name\n      }\n    }\n    ... on ResourceGroup {\n      name\n    }\n    ... on ContainerRegistryV2 {\n      registryName\n      project\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n    ... on ArtifactRegistry {\n      id\n    }\n  }\n  rolePresetId\n  ...RoleAssignmentTabFragment\n  ...RolePermissionSummaryTableFragment\n}\n\nfragment RoleDetailDrawerV2Fragment on Role {\n  source\n  ...RoleDetailDrawerContentV2Fragment\n  ...RoleFormModalFragment\n  id\n}\n\nfragment RoleFormModalFragment on Role {\n  id\n  entityId\n  name\n  description\n  autoAssign\n}\n\nfragment RoleNodesFragment on Role {\n  id\n  entityId\n  name\n  description\n  source\n  status\n  autoAssign\n  createdAt\n  updatedAt\n  scopeType\n  scopeId\n  rolePresetId\n  rolePreset {\n    name\n    id\n  }\n  scope {\n    __typename\n    ... on ProjectV2 {\n      basicInfo {\n        projectName: name\n      }\n    }\n    ... on DomainV2 {\n      basicInfo {\n        domainName: name\n      }\n    }\n    ... on UserV2 {\n      basicInfo {\n        userEmail: email\n      }\n    }\n    ... on VFolder {\n      metadata {\n        name\n      }\n    }\n    ... on SessionV2 {\n      metadata {\n        sessionName: name\n      }\n    }\n    ... on ModelDeployment {\n      metadata {\n        name\n      }\n    }\n    ... on ResourceGroup {\n      name\n    }\n    ... on ContainerRegistryV2 {\n      registryName\n      project\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n    ... on ArtifactRegistry {\n      id\n    }\n  }\n}\n\nfragment RolePermissionSummaryTableFragment on Role {\n  id\n  entityId\n  source\n  scopeType\n}\n"
  }
};
})();

(node as any).hash = "3c80d020d1665e3ec569d2df411dda73";

export default node;
