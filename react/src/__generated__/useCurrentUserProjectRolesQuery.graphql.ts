/**
 * @generated SignedSource<<4e34d61e74c99b32c6d9f84106a1ce0f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
export type useCurrentUserProjectRolesQuery$variables = Record<PropertyKey, never>;
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
    "kind": "Literal",
    "name": "filter",
    "value": {
      "permission": {
        "entityType": {
          "equals": "PROJECT_ADMIN_PAGE"
        }
      }
    }
  },
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeId",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeType",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "useCurrentUserProjectRolesQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
          "alias": "myRolesResult",
          "args": (v0/*: any*/),
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
                    (v1/*: any*/),
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "Role",
                      "kind": "LinkedField",
                      "name": "role",
                      "plural": false,
                      "selections": [
                        (v1/*: any*/),
                        {
                          "alias": null,
                          "args": (v2/*: any*/),
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
                                    (v4/*: any*/)
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
          "storageKey": "myRoles(filter:{\"permission\":{\"entityType\":{\"equals\":\"PROJECT_ADMIN_PAGE\"}}},first:100)"
        },
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useCurrentUserProjectRolesQuery",
    "selections": [
      {
        "alias": "myRolesResult",
        "args": (v0/*: any*/),
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
                  (v1/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Role",
                    "kind": "LinkedField",
                    "name": "role",
                    "plural": false,
                    "selections": [
                      (v1/*: any*/),
                      {
                        "alias": null,
                        "args": (v2/*: any*/),
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
                                  (v4/*: any*/),
                                  (v1/*: any*/)
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
        "storageKey": "myRoles(filter:{\"permission\":{\"entityType\":{\"equals\":\"PROJECT_ADMIN_PAGE\"}}},first:100)"
      }
    ]
  },
  "params": {
    "cacheID": "1c6d5d57296f1b9ee02eaffed0ac43ae",
    "id": null,
    "metadata": {},
    "name": "useCurrentUserProjectRolesQuery",
    "operationKind": "query",
    "text": "query useCurrentUserProjectRolesQuery {\n  myRolesResult: myRoles(first: 100, filter: {permission: {entityType: {equals: PROJECT_ADMIN_PAGE}}}) {\n    edges {\n      node {\n        id\n        role {\n          id\n          scopes(first: 1) {\n            edges {\n              node {\n                scopeId\n                scopeType\n                id\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b6f263cd20582aadd47c4699ff83adf7";

export default node;
