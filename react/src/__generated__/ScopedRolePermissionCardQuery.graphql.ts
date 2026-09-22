/**
 * @generated SignedSource<<692bfd31ce7faf6f02de900c8a58328a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OperationType = "CREATE" | "GRANT_ALL" | "GRANT_HARD_DELETE" | "GRANT_READ" | "GRANT_SOFT_DELETE" | "GRANT_UPDATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "APP_CONFIG_ALLOW_LIST" | "APP_CONFIG_DEFINITION" | "APP_CONFIG_FRAGMENT" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IDLE_CHECKER_ASSIGNMENT" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KERNEL_HISTORY" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
export type EntityFilter = {
  AND?: ReadonlyArray<EntityFilter> | null | undefined;
  NOT?: ReadonlyArray<EntityFilter> | null | undefined;
  OR?: ReadonlyArray<EntityFilter> | null | undefined;
  entityId?: StringFilter | null | undefined;
  entityType?: StringFilter | null | undefined;
  scopeId?: StringFilter | null | undefined;
  scopeType?: StringFilter | null | undefined;
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
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
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
export type ScopedRolePermissionCardQuery$variables = {
  permissionFilter?: PermissionFilter | null | undefined;
  permissionLimit?: number | null | undefined;
  roleId: string;
  scopeFilter?: EntityFilter | null | undefined;
  scopeLimit?: number | null | undefined;
  scopeOffset?: number | null | undefined;
};
export type ScopedRolePermissionCardQuery$data = {
  readonly adminRole: {
    readonly permissions: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly entityType: string;
          readonly operation: OperationType | null | undefined;
          readonly permission: PermissionBit;
          readonly scopeId: string | null | undefined;
          readonly " $fragmentSpreads": FragmentRefs<"RoleScopePermissionEditModal_permissionsFragment">;
        };
      }>;
    } | null | undefined;
    readonly scope: {
      readonly basicInfo?: {
        readonly domainName: string;
        readonly email?: string;
        readonly projectName?: string;
      };
      readonly metadata?: {
        readonly deploymentName?: string;
        readonly sessionName: string;
      };
      readonly project?: string | null | undefined;
      readonly registryName?: string;
      readonly resourceGroupName?: string;
      readonly vfolderName?: string | null | undefined;
    } | null | undefined;
    readonly scopeId: string;
    readonly scopeType: string;
    readonly scopes: {
      readonly count: number;
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly scope: {
            readonly basicInfo?: {
              readonly domainName: string;
              readonly email?: string;
              readonly projectName?: string;
            };
            readonly metadata?: {
              readonly deploymentName?: string;
              readonly sessionName: string;
            };
            readonly project?: string | null | undefined;
            readonly registryName?: string;
            readonly resourceGroupName?: string;
            readonly vfolderName?: string | null | undefined;
          } | null | undefined;
          readonly scopeId: string;
          readonly scopeType: string;
        };
      }>;
    } | null | undefined;
  } | null | undefined;
};
export type ScopedRolePermissionCardQuery = {
  response: ScopedRolePermissionCardQuery$data;
  variables: ScopedRolePermissionCardQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "permissionFilter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "permissionLimit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "roleId"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeFilter"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeLimit"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeOffset"
},
v6 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "roleId"
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeType",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeId",
  "storageKey": null
},
v9 = {
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
v10 = {
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
v11 = {
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
          "alias": null,
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
v12 = {
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
v13 = {
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
v14 = {
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
v15 = {
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
v16 = {
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
v17 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "scope",
  "plural": false,
  "selections": [
    (v9/*: any*/),
    (v10/*: any*/),
    (v11/*: any*/),
    (v12/*: any*/),
    (v13/*: any*/),
    (v14/*: any*/),
    (v15/*: any*/),
    (v16/*: any*/)
  ],
  "storageKey": null
},
v18 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "scopeFilter"
  },
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "scopeLimit"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "scopeOffset"
  }
],
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v20 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "permissionFilter"
  },
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "permissionLimit"
  }
],
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "operation",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityType",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permission",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v25 = [
  (v24/*: any*/)
],
v26 = {
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
    (v9/*: any*/),
    (v10/*: any*/),
    (v11/*: any*/),
    (v12/*: any*/),
    (v13/*: any*/),
    (v14/*: any*/),
    (v15/*: any*/),
    (v16/*: any*/),
    {
      "kind": "InlineFragment",
      "selections": (v25/*: any*/),
      "type": "Node",
      "abstractKey": "__isNode"
    },
    {
      "kind": "InlineFragment",
      "selections": (v25/*: any*/),
      "type": "ArtifactRegistry",
      "abstractKey": null
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
      (v5/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ScopedRolePermissionCardQuery",
    "selections": [
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "Role",
        "kind": "LinkedField",
        "name": "adminRole",
        "plural": false,
        "selections": [
          (v7/*: any*/),
          (v8/*: any*/),
          (v17/*: any*/),
          {
            "alias": null,
            "args": (v18/*: any*/),
            "concreteType": "EntityConnection",
            "kind": "LinkedField",
            "name": "scopes",
            "plural": false,
            "selections": [
              (v19/*: any*/),
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
                      (v7/*: any*/),
                      (v8/*: any*/),
                      (v17/*: any*/)
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
            "args": (v20/*: any*/),
            "concreteType": "PermissionConnection",
            "kind": "LinkedField",
            "name": "permissions",
            "plural": false,
            "selections": [
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
                      (v8/*: any*/),
                      (v21/*: any*/),
                      (v22/*: any*/),
                      (v23/*: any*/),
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "RoleScopePermissionEditModal_permissionsFragment"
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
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "ScopedRolePermissionCardQuery",
    "selections": [
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "Role",
        "kind": "LinkedField",
        "name": "adminRole",
        "plural": false,
        "selections": [
          (v7/*: any*/),
          (v8/*: any*/),
          (v26/*: any*/),
          {
            "alias": null,
            "args": (v18/*: any*/),
            "concreteType": "EntityConnection",
            "kind": "LinkedField",
            "name": "scopes",
            "plural": false,
            "selections": [
              (v19/*: any*/),
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
                      (v7/*: any*/),
                      (v8/*: any*/),
                      (v26/*: any*/),
                      (v24/*: any*/)
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
            "args": (v20/*: any*/),
            "concreteType": "PermissionConnection",
            "kind": "LinkedField",
            "name": "permissions",
            "plural": false,
            "selections": [
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
                      (v8/*: any*/),
                      (v21/*: any*/),
                      (v22/*: any*/),
                      (v23/*: any*/),
                      (v24/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v24/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "6be14a01aa54b657ed719493e669a1fc",
    "id": null,
    "metadata": {},
    "name": "ScopedRolePermissionCardQuery",
    "operationKind": "query",
    "text": "query ScopedRolePermissionCardQuery(\n  $roleId: UUID!\n  $scopeFilter: EntityFilter\n  $scopeLimit: Int\n  $scopeOffset: Int\n  $permissionFilter: PermissionFilter\n  $permissionLimit: Int\n) {\n  adminRole(id: $roleId) {\n    scopeType @since(version: \"26.9.0a4\")\n    scopeId @since(version: \"26.9.0a4\")\n    scope @since(version: \"26.9.0a4\") {\n      __typename\n      ... on DomainV2 {\n        basicInfo {\n          domainName: name\n        }\n      }\n      ... on ProjectV2 {\n        basicInfo {\n          projectName: name\n        }\n      }\n      ... on UserV2 {\n        basicInfo {\n          email\n        }\n      }\n      ... on VirtualFolderNode {\n        vfolderName: name\n      }\n      ... on SessionV2 {\n        metadata {\n          sessionName: name\n        }\n      }\n      ... on ModelDeployment {\n        metadata {\n          deploymentName: name\n        }\n      }\n      ... on ResourceGroup {\n        resourceGroupName: name\n      }\n      ... on ContainerRegistryV2 {\n        registryName\n        project\n      }\n      ... on Node {\n        __isNode: __typename\n        id\n      }\n      ... on ArtifactRegistry {\n        id\n      }\n    }\n    scopes(filter: $scopeFilter, limit: $scopeLimit, offset: $scopeOffset) @deprecatedSince(version: \"26.9.0a4\") {\n      count\n      edges {\n        node {\n          scopeType\n          scopeId\n          scope {\n            __typename\n            ... on DomainV2 {\n              basicInfo {\n                domainName: name\n              }\n            }\n            ... on ProjectV2 {\n              basicInfo {\n                projectName: name\n              }\n            }\n            ... on UserV2 {\n              basicInfo {\n                email\n              }\n            }\n            ... on VirtualFolderNode {\n              vfolderName: name\n            }\n            ... on SessionV2 {\n              metadata {\n                sessionName: name\n              }\n            }\n            ... on ModelDeployment {\n              metadata {\n                deploymentName: name\n              }\n            }\n            ... on ResourceGroup {\n              resourceGroupName: name\n            }\n            ... on ContainerRegistryV2 {\n              registryName\n              project\n            }\n            ... on Node {\n              __isNode: __typename\n              id\n            }\n            ... on ArtifactRegistry {\n              id\n            }\n          }\n          id\n        }\n      }\n    }\n    permissions(filter: $permissionFilter, limit: $permissionLimit) {\n      edges {\n        node {\n          scopeId @deprecatedSince(version: \"26.9.0a4\")\n          operation @deprecatedSince(version: \"26.9.0a4\")\n          entityType\n          permission @since(version: \"26.9.0a4\")\n          ...RoleScopePermissionEditModal_permissionsFragment\n          id\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment RoleScopePermissionEditModal_permissionsFragment on Permission {\n  id\n  scopeId @deprecatedSince(version: \"26.9.0a4\")\n  entityType\n  operation @deprecatedSince(version: \"26.9.0a4\")\n  permission @since(version: \"26.9.0a4\")\n}\n"
  }
};
})();

(node as any).hash = "92b88d1162a6e3d9b4fef4e9e9140394";

export default node;
