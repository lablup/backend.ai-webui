/**
 * @generated SignedSource<<f1746f98fd33d4784b42d17b9a8a5f7e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EntityOrderField = "ENTITY_TYPE" | "REGISTERED_AT" | "%future added value";
export type OperationType = "CREATE" | "GRANT_ALL" | "GRANT_HARD_DELETE" | "GRANT_READ" | "GRANT_SOFT_DELETE" | "GRANT_UPDATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
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
export type PermissionFilter = {
  AND?: ReadonlyArray<PermissionFilter> | null | undefined;
  NOT?: ReadonlyArray<PermissionFilter> | null | undefined;
  OR?: ReadonlyArray<PermissionFilter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  entityType?: RBACElementTypeFilter | null | undefined;
  roleId?: UUIDFilter | null | undefined;
  scopeId?: StringFilter | null | undefined;
  scopeType?: RBACElementTypeFilter | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type EntityFilter = {
  AND?: ReadonlyArray<EntityFilter> | null | undefined;
  NOT?: ReadonlyArray<EntityFilter> | null | undefined;
  OR?: ReadonlyArray<EntityFilter> | null | undefined;
  entityId?: StringFilter | null | undefined;
  entityType?: RBACElementTypeFilter | null | undefined;
};
export type EntityOrderBy = {
  direction?: OrderDirection;
  field: EntityOrderField;
};
export type RoleDetailDrawerQuery$variables = {
  assignmentFilter?: RoleAssignmentFilter | null | undefined;
  assignmentLimit?: number | null | undefined;
  assignmentOffset?: number | null | undefined;
  id: string;
  permissionFilter?: PermissionFilter | null | undefined;
  permissionLimit?: number | null | undefined;
  permissionOffset?: number | null | undefined;
  scopeFilter?: EntityFilter | null | undefined;
  scopeLimit?: number | null | undefined;
  scopeOffset?: number | null | undefined;
  scopeOrderBy?: ReadonlyArray<EntityOrderBy> | null | undefined;
};
export type RoleDetailDrawerQuery$data = {
  readonly adminRole: {
    readonly name: string;
    readonly source: RoleSource;
    readonly " $fragmentSpreads": FragmentRefs<"RoleDetailDrawerContentFragment" | "RoleFormModalFragment">;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"RoleAssignmentTabFragment" | "RolePermissionTabFragment" | "RoleScopeTabFragment">;
};
export type RoleDetailDrawerQuery = {
  response: RoleDetailDrawerQuery$data;
  variables: RoleDetailDrawerQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "assignmentFilter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "assignmentLimit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "assignmentOffset"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "permissionFilter"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "permissionLimit"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "permissionOffset"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeFilter"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeLimit"
},
v9 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeOffset"
},
v10 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeOrderBy"
},
v11 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "source",
  "storageKey": null
},
v14 = {
  "kind": "Variable",
  "name": "filter",
  "variableName": "scopeFilter"
},
v15 = {
  "kind": "Variable",
  "name": "limit",
  "variableName": "scopeLimit"
},
v16 = {
  "kind": "Variable",
  "name": "offset",
  "variableName": "scopeOffset"
},
v17 = {
  "kind": "Variable",
  "name": "orderBy",
  "variableName": "scopeOrderBy"
},
v18 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "assignmentFilter"
  },
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "assignmentLimit"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "assignmentOffset"
  }
],
v19 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "permissionFilter"
  },
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "permissionLimit"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "permissionOffset"
  }
],
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeType",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeId",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v24 = {
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
        }
      ],
      "storageKey": null
    }
  ],
  "type": "DomainV2",
  "abstractKey": null
},
v25 = {
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
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ProjectV2",
  "abstractKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "email",
  "storageKey": null
},
v27 = [
  (v20/*: any*/)
],
v28 = {
  "kind": "InlineFragment",
  "selections": (v27/*: any*/),
  "type": "Node",
  "abstractKey": "__isNode"
},
v29 = {
  "kind": "InlineFragment",
  "selections": (v27/*: any*/),
  "type": "ArtifactRegistry",
  "abstractKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "scope",
  "plural": false,
  "selections": [
    (v23/*: any*/),
    (v24/*: any*/),
    (v25/*: any*/),
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
            (v26/*: any*/)
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
          "alias": "vfolderName",
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "type": "VirtualFolderNode",
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
          "selections": [
            {
              "alias": "deploymentName",
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "type": "ModelDeployment",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": "resourceGroupName",
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
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
    (v28/*: any*/),
    (v29/*: any*/)
  ],
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
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
      (v6/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/),
      (v9/*: any*/),
      (v10/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RoleDetailDrawerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v11/*: any*/),
        "concreteType": "Role",
        "kind": "LinkedField",
        "name": "adminRole",
        "plural": false,
        "selections": [
          (v12/*: any*/),
          (v13/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RoleDetailDrawerContentFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RoleFormModalFragment"
          }
        ],
        "storageKey": null
      },
      {
        "args": [
          (v14/*: any*/),
          (v15/*: any*/),
          (v16/*: any*/),
          (v17/*: any*/),
          {
            "kind": "Variable",
            "name": "roleId",
            "variableName": "id"
          }
        ],
        "kind": "FragmentSpread",
        "name": "RoleScopeTabFragment"
      },
      {
        "args": (v18/*: any*/),
        "kind": "FragmentSpread",
        "name": "RoleAssignmentTabFragment"
      },
      {
        "args": (v19/*: any*/),
        "kind": "FragmentSpread",
        "name": "RolePermissionTabFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*: any*/),
      (v0/*: any*/),
      (v4/*: any*/),
      (v7/*: any*/),
      (v10/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v8/*: any*/),
      (v9/*: any*/)
    ],
    "kind": "Operation",
    "name": "RoleDetailDrawerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v11/*: any*/),
        "concreteType": "Role",
        "kind": "LinkedField",
        "name": "adminRole",
        "plural": false,
        "selections": [
          (v12/*: any*/),
          (v13/*: any*/),
          (v20/*: any*/),
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
            "name": "status",
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
            "name": "deletedAt",
            "storageKey": null
          },
          {
            "alias": null,
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
                      (v21/*: any*/),
                      (v22/*: any*/),
                      (v20/*: any*/)
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
            "alias": "allScopes",
            "args": [
              {
                "kind": "Literal",
                "name": "first",
                "value": 100
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
                      (v21/*: any*/),
                      (v22/*: any*/),
                      (v30/*: any*/),
                      (v20/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "scopes(first:100)"
          },
          {
            "alias": "paginatedScopes",
            "args": [
              (v14/*: any*/),
              (v15/*: any*/),
              (v16/*: any*/),
              (v17/*: any*/)
            ],
            "concreteType": "EntityConnection",
            "kind": "LinkedField",
            "name": "scopes",
            "plural": false,
            "selections": [
              (v31/*: any*/),
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
                      (v21/*: any*/),
                      (v22/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "scope",
                        "plural": false,
                        "selections": [
                          (v23/*: any*/),
                          (v25/*: any*/),
                          (v24/*: any*/),
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
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "type": "UserV2",
                            "abstractKey": null
                          },
                          (v28/*: any*/),
                          (v29/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v20/*: any*/)
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
        "args": (v18/*: any*/),
        "concreteType": "RoleAssignmentConnection",
        "kind": "LinkedField",
        "name": "adminRoleAssignments",
        "plural": false,
        "selections": [
          (v31/*: any*/),
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
                  (v20/*: any*/),
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
                      (v20/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "UserV2BasicInfo",
                        "kind": "LinkedField",
                        "name": "basicInfo",
                        "plural": false,
                        "selections": [
                          (v26/*: any*/),
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
      },
      {
        "alias": null,
        "args": (v19/*: any*/),
        "concreteType": "PermissionConnection",
        "kind": "LinkedField",
        "name": "adminPermissions",
        "plural": false,
        "selections": [
          (v31/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "PermissionEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Permission",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v20/*: any*/),
                  (v21/*: any*/),
                  (v22/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "entityType",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "operation",
                    "storageKey": null
                  },
                  (v30/*: any*/)
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
    "cacheID": "89263c103dc812d7a2f4829ca54ece82",
    "id": null,
    "metadata": {},
    "name": "RoleDetailDrawerQuery",
    "operationKind": "query",
    "text": "query RoleDetailDrawerQuery(\n  $id: UUID!\n  $assignmentFilter: RoleAssignmentFilter\n  $permissionFilter: PermissionFilter\n  $scopeFilter: EntityFilter\n  $scopeOrderBy: [EntityOrderBy!]\n  $assignmentLimit: Int\n  $assignmentOffset: Int\n  $permissionLimit: Int\n  $permissionOffset: Int\n  $scopeLimit: Int\n  $scopeOffset: Int\n) {\n  adminRole(id: $id) {\n    name\n    source\n    ...RoleDetailDrawerContentFragment\n    ...RoleFormModalFragment\n    id\n  }\n  ...RoleScopeTabFragment_36zSEs\n  ...RoleAssignmentTabFragment_2I78zv\n  ...RolePermissionTabFragment_3Jtaxw\n}\n\nfragment CreatePermissionModal_roleScopeFragment on Role {\n  allScopes: scopes(first: 100) {\n    edges {\n      node {\n        scopeType\n        scopeId\n        scope {\n          __typename\n          ... on DomainV2 {\n            basicInfo {\n              domainName: name\n            }\n          }\n          ... on ProjectV2 {\n            basicInfo {\n              projectName: name\n            }\n          }\n          ... on UserV2 {\n            basicInfo {\n              email\n            }\n          }\n          ... on VirtualFolderNode {\n            vfolderName: name\n          }\n          ... on SessionV2 {\n            metadata {\n              sessionName: name\n            }\n          }\n          ... on ModelDeployment {\n            metadata {\n              deploymentName: name\n            }\n          }\n          ... on ResourceGroup {\n            resourceGroupName: name\n          }\n          ... on ContainerRegistryV2 {\n            registryName\n            project\n          }\n          ... on Node {\n            __isNode: __typename\n            id\n          }\n          ... on ArtifactRegistry {\n            id\n          }\n        }\n        id\n      }\n    }\n  }\n}\n\nfragment RoleAssignmentTabFragment_2I78zv on Query {\n  adminRoleAssignments(filter: $assignmentFilter, limit: $assignmentLimit, offset: $assignmentOffset) {\n    count\n    edges {\n      node {\n        id\n        userId\n        grantedBy\n        grantedAt\n        user {\n          id\n          basicInfo {\n            email\n            fullName\n          }\n        }\n      }\n    }\n  }\n}\n\nfragment RoleAssignmentTab_roleScopeFragment on Role {\n  scopes(first: 1) {\n    edges {\n      node {\n        scopeType\n        scopeId\n        id\n      }\n    }\n  }\n}\n\nfragment RoleDetailDrawerContentFragment on Role {\n  id\n  name\n  description\n  source\n  status\n  createdAt\n  updatedAt\n  deletedAt\n  ...RoleAssignmentTab_roleScopeFragment\n  ...CreatePermissionModal_roleScopeFragment\n}\n\nfragment RoleFormModalFragment on Role {\n  id\n  name\n  description\n}\n\nfragment RolePermissionTabFragment_3Jtaxw on Query {\n  adminPermissions(filter: $permissionFilter, limit: $permissionLimit, offset: $permissionOffset) {\n    count\n    edges {\n      node {\n        id\n        scopeType\n        scopeId\n        entityType\n        operation\n        scope {\n          __typename\n          ... on DomainV2 {\n            basicInfo {\n              domainName: name\n            }\n          }\n          ... on ProjectV2 {\n            basicInfo {\n              projectName: name\n            }\n          }\n          ... on UserV2 {\n            basicInfo {\n              email\n            }\n          }\n          ... on VirtualFolderNode {\n            vfolderName: name\n          }\n          ... on SessionV2 {\n            metadata {\n              sessionName: name\n            }\n          }\n          ... on ModelDeployment {\n            metadata {\n              deploymentName: name\n            }\n          }\n          ... on ResourceGroup {\n            resourceGroupName: name\n          }\n          ... on ContainerRegistryV2 {\n            registryName\n            project\n          }\n          ... on Node {\n            __isNode: __typename\n            id\n          }\n          ... on ArtifactRegistry {\n            id\n          }\n        }\n      }\n    }\n  }\n}\n\nfragment RoleScopeTabFragment_36zSEs on Query {\n  adminRole(id: $id) {\n    paginatedScopes: scopes(filter: $scopeFilter, orderBy: $scopeOrderBy, limit: $scopeLimit, offset: $scopeOffset) {\n      count\n      edges {\n        node {\n          scopeType\n          scopeId\n          scope {\n            __typename\n            ... on ProjectV2 {\n              basicInfo {\n                projectName: name\n              }\n            }\n            ... on DomainV2 {\n              basicInfo {\n                domainName: name\n              }\n            }\n            ... on UserV2 {\n              basicInfo {\n                userEmail: email\n              }\n            }\n            ... on Node {\n              __isNode: __typename\n              id\n            }\n            ... on ArtifactRegistry {\n              id\n            }\n          }\n          id\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "91200d57abba6b13badf4421e19ffbdb";

export default node;
