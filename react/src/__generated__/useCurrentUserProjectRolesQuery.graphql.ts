/**
 * @generated SignedSource<<2898388137f2190ad11ea796b5aa88a1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type OperationType = "CREATE" | "GRANT_ALL" | "GRANT_HARD_DELETE" | "GRANT_READ" | "GRANT_SOFT_DELETE" | "GRANT_UPDATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
export type PermissionNestedFilter = {
  AND?: ReadonlyArray<PermissionNestedFilter> | null | undefined;
  NOT?: ReadonlyArray<PermissionNestedFilter> | null | undefined;
  OR?: ReadonlyArray<PermissionNestedFilter> | null | undefined;
  entityType?: RBACElementTypeFilter | null | undefined;
  operation?: OperationTypeFilter | null | undefined;
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
  permissionFilter?: PermissionNestedFilter | null | undefined;
};
export type useCurrentUserProjectRolesQuery$data = {
  readonly myRolesResult: Result<{
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly role: {
          readonly id: string;
          readonly scopes: {
            readonly edges: ReadonlyArray<{
              readonly node: {
                readonly scopeId: string;
                readonly scopeType: RBACElementType;
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
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "permissionFilter"
  }
],
v1 = [
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "permission",
        "variableName": "permissionFilter"
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
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeId",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeType",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useCurrentUserProjectRolesQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
          "alias": "myRolesResult",
          "args": (v1/*: any*/),
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
                    (v2/*: any*/),
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "Role",
                      "kind": "LinkedField",
                      "name": "role",
                      "plural": false,
                      "selections": [
                        (v2/*: any*/),
                        {
                          "alias": null,
                          "args": (v3/*: any*/),
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
                                    (v4/*: any*/),
                                    (v5/*: any*/)
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
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useCurrentUserProjectRolesQuery",
    "selections": [
      {
        "alias": "myRolesResult",
        "args": (v1/*: any*/),
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
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Role",
                    "kind": "LinkedField",
                    "name": "role",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      {
                        "alias": null,
                        "args": (v3/*: any*/),
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
                                  (v4/*: any*/),
                                  (v5/*: any*/),
                                  (v2/*: any*/)
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
  },
  "params": {
    "cacheID": "5eded640065127c5714bd52980e64c02",
    "id": null,
    "metadata": {},
    "name": "useCurrentUserProjectRolesQuery",
    "operationKind": "query",
    "text": "query useCurrentUserProjectRolesQuery(\n  $permissionFilter: PermissionNestedFilter\n) {\n  myRolesResult: myRoles(first: 100, filter: {permission: $permissionFilter}) {\n    edges {\n      node {\n        id\n        role {\n          id\n          scopes(first: 1) {\n            edges {\n              node {\n                scopeId\n                scopeType\n                id\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ac9b1935fcf340c2333c3e50f9623092";

export default node;
