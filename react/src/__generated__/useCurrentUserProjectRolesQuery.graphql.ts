/**
 * @generated SignedSource<<7fbb13cc38f76399a15a127cd0276025>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type OperationType = "CREATE" | "GRANT_ALL" | "GRANT_HARD_DELETE" | "GRANT_READ" | "GRANT_SOFT_DELETE" | "GRANT_UPDATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "APP_CONFIG_ALLOW_LIST" | "APP_CONFIG_DEFINITION" | "APP_CONFIG_FRAGMENT" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IDLE_CHECKER_ASSIGNMENT" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KERNEL_HISTORY" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
export type PermissionTarget = {
  entityType: string;
  scopeId: string;
  scopeType: string;
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
export type useCurrentUserProjectRolesQuery$variables = {
  legacyPermissionFilter?: PermissionNestedFilter | null | undefined;
  supportsHeldPermissions: boolean;
  targets: ReadonlyArray<PermissionTarget>;
};
export type useCurrentUserProjectRolesQuery$data = {
  readonly heldPermissions?: Result<{
    readonly items: ReadonlyArray<{
      readonly permissions: ReadonlyArray<PermissionBit>;
      readonly scopeId: string;
    }>;
  } | null | undefined, unknown>;
  readonly legacyRoles?: Result<{
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly role: {
          readonly id: string;
          readonly scopes: {
            readonly edges: ReadonlyArray<{
              readonly node: {
                readonly scopeId: string;
                readonly scopeType: string;
              };
            }>;
          } | null | undefined;
        } | null | undefined;
      };
    }>;
  } | null | undefined, unknown>;
};
export type useCurrentUserProjectRolesQuery = {
  response: useCurrentUserProjectRolesQuery$data;
  variables: useCurrentUserProjectRolesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "legacyPermissionFilter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "supportsHeldPermissions"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "targets"
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeId",
  "storageKey": null
},
v4 = {
  "alias": "heldPermissions",
  "args": [
    {
      "fields": [
        {
          "kind": "Variable",
          "name": "targets",
          "variableName": "targets"
        }
      ],
      "kind": "ObjectValue",
      "name": "input"
    }
  ],
  "concreteType": "MyAtomicBulkScopePermissionsPayload",
  "kind": "LinkedField",
  "name": "myAtomicBulkScopePermissions",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ScopeEntityPermission",
      "kind": "LinkedField",
      "name": "items",
      "plural": true,
      "selections": [
        (v3/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "permissions",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v5 = [
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "permission",
        "variableName": "legacyPermissionFilter"
      }
    ],
    "kind": "ObjectValue",
    "name": "filter"
  },
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeType",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useCurrentUserProjectRolesQuery",
    "selections": [
      {
        "condition": "supportsHeldPermissions",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v4/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "supportsHeldPermissions",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "kind": "CatchField",
            "field": {
              "alias": "legacyRoles",
              "args": (v5/*: any*/),
              "concreteType": "RoleAssignmentConnection",
              "kind": "LinkedField",
              "name": "myRoles",
              "plural": false,
              "selections": [
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
                        (v6/*: any*/),
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "Role",
                          "kind": "LinkedField",
                          "name": "role",
                          "plural": false,
                          "selections": [
                            (v6/*: any*/),
                            {
                              "alias": null,
                              "args": (v7/*: any*/),
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
                                        (v3/*: any*/),
                                        (v8/*: any*/)
                                      ],
                                      "storageKey": null
                                    }
                                  ],
                                  "storageKey": null
                                }
                              ],
                              "storageKey": "scopes(first:1)"
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
            "to": "RESULT"
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
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "useCurrentUserProjectRolesQuery",
    "selections": [
      {
        "condition": "supportsHeldPermissions",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v4/*: any*/)
        ]
      },
      {
        "condition": "supportsHeldPermissions",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": "legacyRoles",
            "args": (v5/*: any*/),
            "concreteType": "RoleAssignmentConnection",
            "kind": "LinkedField",
            "name": "myRoles",
            "plural": false,
            "selections": [
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
                      (v6/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Role",
                        "kind": "LinkedField",
                        "name": "role",
                        "plural": false,
                        "selections": [
                          (v6/*: any*/),
                          {
                            "alias": null,
                            "args": (v7/*: any*/),
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
                                      (v3/*: any*/),
                                      (v8/*: any*/),
                                      (v6/*: any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": "scopes(first:1)"
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
        ]
      }
    ]
  },
  "params": {
    "cacheID": "d201629aae89eaff579e6c436291b768",
    "id": null,
    "metadata": {},
    "name": "useCurrentUserProjectRolesQuery",
    "operationKind": "query",
    "text": "query useCurrentUserProjectRolesQuery(\n  $targets: [PermissionTarget!]!\n  $legacyPermissionFilter: PermissionNestedFilter\n  $supportsHeldPermissions: Boolean!\n) {\n  heldPermissions: myAtomicBulkScopePermissions(input: {targets: $targets}) @include(if: $supportsHeldPermissions) @since(version: \"26.9.0\") {\n    items {\n      scopeId\n      permissions\n    }\n  }\n  legacyRoles: myRoles(first: 100, filter: {permission: $legacyPermissionFilter}) @skip(if: $supportsHeldPermissions) @deprecatedSince(version: \"26.9.0\") {\n    edges {\n      node {\n        id\n        role {\n          id\n          scopes(first: 1) {\n            edges {\n              node {\n                scopeId\n                scopeType\n                id\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "980bff276095d5b37f8dbf497e0ebccc";

export default node;
