/**
 * @generated SignedSource<<a5f21acff1330691c41e61b45d986062>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ContainerRegistryListQuery$variables = {
  allowedProjectPreviewCount?: number | null | undefined;
  allowedRegistriesFetchCount?: number | null | undefined;
  domain: string;
  filter?: string | null | undefined;
  first?: number | null | undefined;
  offset?: number | null | undefined;
  order?: string | null | undefined;
};
export type ContainerRegistryListQuery$data = {
  readonly container_registry_nodes: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly allowed_groups_preview: {
          readonly count: number | null | undefined;
          readonly edges: ReadonlyArray<{
            readonly node: {
              readonly id: string;
              readonly name: string | null | undefined;
            } | null | undefined;
          } | null | undefined>;
        } | null | undefined;
        readonly id: string;
        readonly is_global: boolean | null | undefined;
        readonly name: string | null | undefined;
        readonly password: string | null | undefined;
        readonly project: string | null | undefined;
        readonly registry_name: string;
        readonly row_id: string | null | undefined;
        readonly ssl_verify: boolean | null | undefined;
        readonly type: any;
        readonly url: string;
        readonly username: string | null | undefined;
        readonly " $fragmentSpreads": FragmentRefs<"ContainerRegistryEditorModalFragment">;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly domainV2: {
    readonly containerRegistries: {
      readonly count: number;
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly entityId: string;
        };
      }>;
    } | null | undefined;
  } | null | undefined;
};
export type ContainerRegistryListQuery = {
  response: ContainerRegistryListQuery$data;
  variables: ContainerRegistryListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "allowedProjectPreviewCount"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "allowedRegistriesFetchCount"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domain"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "order"
},
v7 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Variable",
    "name": "order",
    "variableName": "order"
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "registry_name",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "project",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "password",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ssl_verify",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "is_global",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v20 = {
  "alias": "allowed_groups_preview",
  "args": [
    {
      "kind": "Variable",
      "name": "first",
      "variableName": "allowedProjectPreviewCount"
    }
  ],
  "concreteType": "GroupConnection",
  "kind": "LinkedField",
  "name": "allowed_groups",
  "plural": false,
  "selections": [
    (v19/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "GroupEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "GroupNode",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v8/*: any*/),
            (v11/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v21 = [
  {
    "kind": "Variable",
    "name": "domainName",
    "variableName": "domain"
  }
],
v22 = [
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "allowedRegistriesFetchCount"
  }
],
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
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
      (v6/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ContainerRegistryListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v7/*: any*/),
        "concreteType": "ContainerRegistryConnection",
        "kind": "LinkedField",
        "name": "container_registry_nodes",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ContainerRegistryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ContainerRegistryNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ContainerRegistryEditorModalFragment"
                  },
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/),
                  (v13/*: any*/),
                  (v14/*: any*/),
                  (v15/*: any*/),
                  (v16/*: any*/),
                  (v17/*: any*/),
                  (v18/*: any*/),
                  (v20/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v19/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v21/*: any*/),
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
        "plural": false,
        "selections": [
          {
            "kind": "CatchField",
            "field": {
              "alias": null,
              "args": (v22/*: any*/),
              "concreteType": "ContainerRegistryV2Connection",
              "kind": "LinkedField",
              "name": "containerRegistries",
              "plural": false,
              "selections": [
                (v19/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "ContainerRegistryV2Edge",
                  "kind": "LinkedField",
                  "name": "edges",
                  "plural": true,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "ContainerRegistryV2",
                      "kind": "LinkedField",
                      "name": "node",
                      "plural": false,
                      "selections": [
                        (v23/*: any*/)
                      ],
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            "to": "NULL"
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
      (v6/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "ContainerRegistryListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v7/*: any*/),
        "concreteType": "ContainerRegistryConnection",
        "kind": "LinkedField",
        "name": "container_registry_nodes",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ContainerRegistryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ContainerRegistryNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v11/*: any*/),
                  (v10/*: any*/),
                  (v12/*: any*/),
                  (v13/*: any*/),
                  (v14/*: any*/),
                  (v15/*: any*/),
                  (v17/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "extra",
                    "storageKey": null
                  },
                  (v18/*: any*/),
                  {
                    "alias": null,
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "first",
                        "value": 100
                      }
                    ],
                    "concreteType": "GroupConnection",
                    "kind": "LinkedField",
                    "name": "allowed_groups",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "GroupEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "GroupNode",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v8/*: any*/),
                              (v9/*: any*/),
                              (v11/*: any*/),
                              (v13/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "is_active",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "domain_name",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "allowed_groups(first:100)"
                  },
                  (v16/*: any*/),
                  (v20/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v19/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v21/*: any*/),
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v22/*: any*/),
            "concreteType": "ContainerRegistryV2Connection",
            "kind": "LinkedField",
            "name": "containerRegistries",
            "plural": false,
            "selections": [
              (v19/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ContainerRegistryV2Edge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ContainerRegistryV2",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v23/*: any*/),
                      (v8/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v8/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4583a3b55a8058db4a711b35ebf10ab3",
    "id": null,
    "metadata": {},
    "name": "ContainerRegistryListQuery",
    "operationKind": "query",
    "text": "query ContainerRegistryListQuery(\n  $domain: String!\n  $filter: String\n  $order: String\n  $first: Int\n  $offset: Int\n  $allowedProjectPreviewCount: Int\n  $allowedRegistriesFetchCount: Int\n) {\n  container_registry_nodes(filter: $filter, order: $order, first: $first, offset: $offset) {\n    edges {\n      node {\n        ...ContainerRegistryEditorModalFragment\n        id\n        row_id\n        registry_name\n        name\n        url\n        type\n        project\n        username\n        password\n        ssl_verify\n        is_global\n        allowed_groups_preview: allowed_groups(first: $allowedProjectPreviewCount) {\n          count\n          edges {\n            node {\n              id\n              name\n            }\n          }\n        }\n      }\n    }\n    count\n  }\n  domainV2(domainName: $domain) {\n    containerRegistries(first: $allowedRegistriesFetchCount) @since(version: \"26.10.0\") {\n      count\n      edges {\n        node {\n          entityId\n          id\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment ContainerRegistryEditorModalFragment on ContainerRegistryNode {\n  id\n  row_id\n  name\n  registry_name\n  url\n  type\n  project\n  username\n  ssl_verify\n  extra\n  is_global\n  allowed_groups(first: 100) {\n    edges {\n      node {\n        id\n        row_id\n        name\n        type\n        is_active\n        domain_name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c01fb1013d8ae249d1e4307e413400f9";

export default node;
