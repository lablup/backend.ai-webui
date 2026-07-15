/**
 * @generated SignedSource<<a93e1a6494032d03a9087faa6439351b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EntityOrderField = "ENTITY_TYPE" | "REGISTERED_AT" | "%future added value";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type RBACElementType = "AGENT" | "APP_CONFIG" | "APP_CONFIG_ALLOW_LIST" | "APP_CONFIG_DEFINITION" | "APP_CONFIG_FRAGMENT" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
export type EntityFilter = {
  AND?: ReadonlyArray<EntityFilter> | null | undefined;
  NOT?: ReadonlyArray<EntityFilter> | null | undefined;
  OR?: ReadonlyArray<EntityFilter> | null | undefined;
  entityId?: StringFilter | null | undefined;
  entityType?: RBACElementTypeFilter | null | undefined;
  scopeId?: StringFilter | null | undefined;
  scopeType?: RBACElementTypeFilter | null | undefined;
};
export type RBACElementTypeFilter = {
  equals?: RBACElementType | null | undefined;
  in?: ReadonlyArray<RBACElementType> | null | undefined;
  notEquals?: RBACElementType | null | undefined;
  notIn?: ReadonlyArray<RBACElementType> | null | undefined;
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
export type EntityOrderBy = {
  direction?: OrderDirection;
  field: EntityOrderField;
};
export type RoleScopeTabRefetchQuery$variables = {
  filter?: EntityFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<EntityOrderBy> | null | undefined;
  roleId: string;
};
export type RoleScopeTabRefetchQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"RoleScopeTabFragment">;
};
export type RoleScopeTabRefetchQuery = {
  response: RoleScopeTabRefetchQuery$data;
  variables: RoleScopeTabRefetchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "filter"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "offset"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "orderBy"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "roleId"
  }
],
v1 = {
  "kind": "Variable",
  "name": "filter",
  "variableName": "filter"
},
v2 = {
  "kind": "Variable",
  "name": "limit",
  "variableName": "limit"
},
v3 = {
  "kind": "Variable",
  "name": "offset",
  "variableName": "offset"
},
v4 = {
  "kind": "Variable",
  "name": "orderBy",
  "variableName": "orderBy"
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = [
  (v5/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RoleScopeTabRefetchQuery",
    "selections": [
      {
        "args": [
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          {
            "kind": "Variable",
            "name": "roleId",
            "variableName": "roleId"
          }
        ],
        "kind": "FragmentSpread",
        "name": "RoleScopeTabFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RoleScopeTabRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "id",
            "variableName": "roleId"
          }
        ],
        "concreteType": "Role",
        "kind": "LinkedField",
        "name": "adminRole",
        "plural": false,
        "selections": [
          {
            "alias": "paginatedScopes",
            "args": [
              (v1/*: any*/),
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/)
            ],
            "concreteType": "EntityConnection",
            "kind": "LinkedField",
            "name": "scopes",
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
                                  }
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
                                  }
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
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "type": "UserV2",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v6/*: any*/),
                            "type": "Node",
                            "abstractKey": "__isNode"
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v6/*: any*/),
                            "type": "ArtifactRegistry",
                            "abstractKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v5/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v5/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "9c3af99a0b150bf27615db5116da091d",
    "id": null,
    "metadata": {},
    "name": "RoleScopeTabRefetchQuery",
    "operationKind": "query",
    "text": "query RoleScopeTabRefetchQuery(\n  $filter: EntityFilter\n  $limit: Int\n  $offset: Int\n  $orderBy: [EntityOrderBy!]\n  $roleId: UUID!\n) {\n  ...RoleScopeTabFragment_4tqE07\n}\n\nfragment RoleScopeTabFragment_4tqE07 on Query {\n  adminRole(id: $roleId) {\n    paginatedScopes: scopes(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n      count\n      edges {\n        node {\n          scopeType\n          scopeId\n          scope {\n            __typename\n            ... on ProjectV2 {\n              basicInfo {\n                projectName: name\n              }\n            }\n            ... on DomainV2 {\n              basicInfo {\n                domainName: name\n              }\n            }\n            ... on UserV2 {\n              basicInfo {\n                userEmail: email\n              }\n            }\n            ... on Node {\n              __isNode: __typename\n              id\n            }\n            ... on ArtifactRegistry {\n              id\n            }\n          }\n          id\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "0c689c9a4e07bf07266db83c194c85ae";

export default node;
