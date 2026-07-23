/**
 * @generated SignedSource<<a0141e6b9f7f827480c652743dbf4807>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RoleDetailDrawerRefetchQuery$variables = {
  id: string;
};
export type RoleDetailDrawerRefetchQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"RoleDetailDrawerFragment">;
  } | null | undefined;
};
export type RoleDetailDrawerRefetchQuery = {
  response: RoleDetailDrawerRefetchQuery$data;
  variables: RoleDetailDrawerRefetchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
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
  "name": "count",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RoleDetailDrawerRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RoleDetailDrawerFragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RoleDetailDrawerRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
          (v2/*: any*/),
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
                "name": "deletedAt",
                "storageKey": null
              },
              {
                "alias": "firstScope",
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
                          (v2/*: any*/)
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
                "concreteType": "RoleAssignmentConnection",
                "kind": "LinkedField",
                "name": "users",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
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
                              (v2/*: any*/),
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
                "storageKey": "users(limit:10,offset:0)"
              },
              {
                "alias": "totalScopes",
                "args": (v3/*: any*/),
                "concreteType": "EntityConnection",
                "kind": "LinkedField",
                "name": "scopes",
                "plural": false,
                "selections": [
                  (v4/*: any*/)
                ],
                "storageKey": "scopes(first:1)"
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
    "cacheID": "bf85e346db99a4d5bd8c6b904bf0369d",
    "id": null,
    "metadata": {},
    "name": "RoleDetailDrawerRefetchQuery",
    "operationKind": "query",
    "text": "query RoleDetailDrawerRefetchQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RoleDetailDrawerFragment\n    id\n  }\n}\n\nfragment RoleAssignmentTabFragment on Role {\n  id\n  firstScope: scopes(first: 1) {\n    edges {\n      node {\n        scopeType\n        scopeId\n        id\n      }\n    }\n  }\n  users(limit: 10, offset: 0) {\n    count\n    edges {\n      node {\n        id\n        userId\n        grantedBy\n        grantedAt\n        user {\n          id\n          basicInfo {\n            email\n            fullName\n          }\n        }\n      }\n    }\n  }\n}\n\nfragment RoleDetailDrawerContentFragment on Role {\n  id\n  name\n  description\n  source\n  status\n  autoAssign @since(version: \"26.4.4\")\n  createdAt\n  updatedAt\n  deletedAt\n  ...RoleAssignmentTabFragment\n  ...RolePermissionDetailTab_roleScopeFragment\n}\n\nfragment RoleDetailDrawerFragment on Role {\n  name\n  source\n  ...RoleDetailDrawerContentFragment\n  ...RoleFormModalFragment\n  id\n}\n\nfragment RoleFormModalFragment on Role {\n  id\n  name\n  description\n  autoAssign @since(version: \"26.4.4\")\n}\n\nfragment RolePermissionDetailTab_roleScopeFragment on Role {\n  totalScopes: scopes(first: 1) {\n    count\n  }\n  ...ScopedRolePermissionCardFragment\n}\n\nfragment RoleScopePermissionEditModalFragment on Role {\n  id\n}\n\nfragment ScopedRolePermissionCardFragment on Role {\n  id\n  ...RoleScopePermissionEditModalFragment\n}\n"
  }
};
})();

(node as any).hash = "addcf9bace31a70dc8beef90a8d376dd";

export default node;
