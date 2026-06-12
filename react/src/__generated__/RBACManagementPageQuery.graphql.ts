/**
 * @generated SignedSource<<d76a9a951d6839b20cc47e6c3e9a04e0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type RoleOrderField = "CREATED_AT" | "NAME" | "UPDATED_AT" | "%future added value";
export type RoleSource = "CUSTOM" | "SYSTEM" | "%future added value";
export type RoleStatus = "ACTIVE" | "DELETED" | "INACTIVE" | "%future added value";
export type RoleFilter = {
  AND?: ReadonlyArray<RoleFilter> | null | undefined;
  NOT?: ReadonlyArray<RoleFilter> | null | undefined;
  OR?: ReadonlyArray<RoleFilter> | null | undefined;
  assignedUser?: RoleUserNestedFilter | null | undefined;
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
        readonly " $fragmentSpreads": FragmentRefs<"RoleNodesFragment">;
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
v7 = [
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
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "first",
                        "value": 3
                      }
                    ],
                    "concreteType": "EntityConnection",
                    "kind": "LinkedField",
                    "name": "scopes",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/),
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
                                    "selections": (v7/*: any*/),
                                    "type": "Node",
                                    "abstractKey": "__isNode"
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": (v7/*: any*/),
                                    "type": "ArtifactRegistry",
                                    "abstractKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              (v6/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "scopes(first:3)"
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
    "cacheID": "ec7cb2c97b4d8d8701de3074d8f72d85",
    "id": null,
    "metadata": {},
    "name": "RBACManagementPageQuery",
    "operationKind": "query",
    "text": "query RBACManagementPageQuery(\n  $filter: RoleFilter\n  $orderBy: [RoleOrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  adminRoles(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        ...RoleNodesFragment\n      }\n    }\n  }\n}\n\nfragment RoleNodesFragment on Role {\n  id\n  name\n  description\n  source\n  status\n  autoAssign @since(version: \"26.4.4rc7\")\n  createdAt\n  updatedAt\n  scopes(first: 3) {\n    count\n    edges {\n      node {\n        scopeType\n        scopeId\n        scope {\n          __typename\n          ... on ProjectV2 {\n            basicInfo {\n              projectName: name\n            }\n          }\n          ... on DomainV2 {\n            basicInfo {\n              domainName: name\n            }\n          }\n          ... on UserV2 {\n            basicInfo {\n              userEmail: email\n            }\n          }\n          ... on Node {\n            __isNode: __typename\n            id\n          }\n          ... on ArtifactRegistry {\n            id\n          }\n        }\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5791c7037782f1c86a8b5ed379480b0c";

export default node;
