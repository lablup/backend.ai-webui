/**
 * @generated SignedSource<<f0ced67cd63e56e85785159810933eaf>>
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
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeType",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeId",
  "storageKey": null
},
v7 = [
  (v4/*: any*/)
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "email",
  "storageKey": null
},
v9 = [
  (v3/*: any*/)
],
v10 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "scope",
  "plural": false,
  "selections": [
    (v2/*: any*/),
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
          "selections": (v7/*: any*/),
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
          "concreteType": "ProjectBasicInfo",
          "kind": "LinkedField",
          "name": "basicInfo",
          "plural": false,
          "selections": (v7/*: any*/),
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
          "concreteType": "UserV2BasicInfo",
          "kind": "LinkedField",
          "name": "basicInfo",
          "plural": false,
          "selections": [
            (v8/*: any*/)
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
          "selections": (v7/*: any*/),
          "storageKey": null
        }
      ],
      "type": "ModelDeployment",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v7/*: any*/),
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
      "selections": (v9/*: any*/),
      "type": "Node",
      "abstractKey": "__isNode"
    },
    {
      "kind": "InlineFragment",
      "selections": (v9/*: any*/),
      "type": "ArtifactRegistry",
      "abstractKey": null
    }
  ],
  "storageKey": null
},
v11 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v12 = {
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
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v4/*: any*/),
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
              (v5/*: any*/),
              (v6/*: any*/),
              (v10/*: any*/),
              {
                "alias": "firstScope",
                "args": (v11/*: any*/),
                "concreteType": "EntityConnection",
                "kind": "LinkedField",
                "name": "scopes",
                "plural": false,
                "selections": [
                  (v12/*: any*/),
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
                          (v5/*: any*/),
                          (v6/*: any*/),
                          (v10/*: any*/),
                          (v3/*: any*/)
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
                  (v12/*: any*/),
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
                          (v3/*: any*/),
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
                              (v3/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "UserV2BasicInfo",
                                "kind": "LinkedField",
                                "name": "basicInfo",
                                "plural": false,
                                "selections": [
                                  (v8/*: any*/),
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
                "args": (v11/*: any*/),
                "concreteType": "EntityConnection",
                "kind": "LinkedField",
                "name": "scopes",
                "plural": false,
                "selections": [
                  (v12/*: any*/)
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
    "cacheID": "280dd54059d529cbc5b8e3c09f1a6ea5",
    "id": null,
    "metadata": {},
    "name": "RoleDetailDrawerRefetchQuery",
    "operationKind": "query",
    "text": "query RoleDetailDrawerRefetchQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RoleDetailDrawerFragment\n    id\n  }\n}\n\nfragment RoleAssignmentTabFragment on Role {\n  id\n  name\n  source\n  firstScope: scopes(first: 1) @deprecatedSince(version: \"26.9.0a4\") {\n    edges {\n      node {\n        scopeType\n        scopeId\n        id\n      }\n    }\n  }\n  scopeType @since(version: \"26.9.0a4\")\n  scopeId @since(version: \"26.9.0a4\")\n  users(limit: 10, offset: 0) {\n    count\n    edges {\n      node {\n        id\n        userId\n        grantedBy\n        grantedAt\n        user {\n          id\n          basicInfo {\n            email\n            fullName\n          }\n        }\n      }\n    }\n  }\n}\n\nfragment RoleDetailDrawerContentFragment on Role {\n  id\n  name\n  description\n  source\n  status\n  autoAssign @since(version: \"26.4.4\")\n  createdAt\n  updatedAt\n  deletedAt\n  scopeType @since(version: \"26.9.0a4\")\n  scopeId @since(version: \"26.9.0a4\")\n  scope @since(version: \"26.9.0a4\") {\n    __typename\n    ... on DomainV2 {\n      basicInfo {\n        name\n      }\n    }\n    ... on ProjectV2 {\n      basicInfo {\n        name\n      }\n    }\n    ... on UserV2 {\n      basicInfo {\n        email\n      }\n    }\n    ... on VirtualFolderNode {\n      vfolderName: name\n    }\n    ... on SessionV2 {\n      metadata {\n        sessionName: name\n      }\n    }\n    ... on ModelDeployment {\n      metadata {\n        name\n      }\n    }\n    ... on ResourceGroup {\n      name\n    }\n    ... on ContainerRegistryV2 {\n      registryName\n      project\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n    ... on ArtifactRegistry {\n      id\n    }\n  }\n  firstScope: scopes(first: 1) @deprecatedSince(version: \"26.9.0a4\") {\n    count\n    edges {\n      node {\n        scopeType\n        scopeId\n        scope {\n          __typename\n          ... on DomainV2 {\n            basicInfo {\n              name\n            }\n          }\n          ... on ProjectV2 {\n            basicInfo {\n              name\n            }\n          }\n          ... on UserV2 {\n            basicInfo {\n              email\n            }\n          }\n          ... on VirtualFolderNode {\n            vfolderName: name\n          }\n          ... on SessionV2 {\n            metadata {\n              sessionName: name\n            }\n          }\n          ... on ModelDeployment {\n            metadata {\n              name\n            }\n          }\n          ... on ResourceGroup {\n            name\n          }\n          ... on ContainerRegistryV2 {\n            registryName\n            project\n          }\n          ... on Node {\n            __isNode: __typename\n            id\n          }\n          ... on ArtifactRegistry {\n            id\n          }\n        }\n        id\n      }\n    }\n  }\n  ...RoleAssignmentTabFragment\n  ...RolePermissionDetailTab_roleScopeFragment\n}\n\nfragment RoleDetailDrawerFragment on Role {\n  name\n  source\n  ...RoleDetailDrawerContentFragment\n  ...RoleFormModalFragment\n  id\n}\n\nfragment RoleFormModalFragment on Role {\n  id\n  name\n  description\n  autoAssign @since(version: \"26.4.4\")\n}\n\nfragment RolePermissionDetailTab_roleScopeFragment on Role {\n  totalScopes: scopes(first: 1) @deprecatedSince(version: \"26.9.0a4\") {\n    count\n  }\n  scopeType @since(version: \"26.9.0a4\")\n  scopeId @since(version: \"26.9.0a4\")\n  ...RolePermissionSummaryTableFragment\n  ...ScopedRolePermissionCardFragment\n}\n\nfragment RolePermissionSummaryTableFragment on Role {\n  id\n}\n\nfragment RoleScopePermissionEditModalFragment on Role {\n  id\n}\n\nfragment ScopedRolePermissionCardFragment on Role {\n  id\n  ...RoleScopePermissionEditModalFragment\n}\n"
  }
};
})();

(node as any).hash = "addcf9bace31a70dc8beef90a8d376dd";

export default node;
