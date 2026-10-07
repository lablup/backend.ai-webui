/**
 * @generated SignedSource<<1864745135c163927742a17b2ba2738b>>
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
    readonly registry: {
      readonly allowedDockerRegistries: ReadonlyArray<string>;
    };
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
  "name": "domain"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "order"
},
v6 = [
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
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "registry_name",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "project",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "password",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ssl_verify",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "is_global",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v19 = {
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
    (v18/*: any*/),
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
            (v7/*: any*/),
            (v10/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v20 = [
  {
    "kind": "Variable",
    "name": "domainName",
    "variableName": "domain"
  }
],
v21 = {
  "alias": null,
  "args": null,
  "concreteType": "DomainRegistryInfo",
  "kind": "LinkedField",
  "name": "registry",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "allowedDockerRegistries",
      "storageKey": null
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
    "name": "ContainerRegistryListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v6/*: any*/),
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
                  (v7/*: any*/),
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
                  (v19/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v18/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v20/*: any*/),
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
        "plural": false,
        "selections": [
          (v21/*: any*/)
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
      (v1/*: any*/),
      (v2/*: any*/),
      (v5/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ContainerRegistryListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v6/*: any*/),
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
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v10/*: any*/),
                  (v9/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/),
                  (v13/*: any*/),
                  (v14/*: any*/),
                  (v16/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "extra",
                    "storageKey": null
                  },
                  (v17/*: any*/),
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
                              (v7/*: any*/),
                              (v8/*: any*/),
                              (v10/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "allowed_groups(first:100)"
                  },
                  (v15/*: any*/),
                  (v17/*: any*/),
                  (v19/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v18/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v20/*: any*/),
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
        "plural": false,
        "selections": [
          (v21/*: any*/),
          (v7/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "91c727cf819e93e8d42d26168947776d",
    "id": null,
    "metadata": {},
    "name": "ContainerRegistryListQuery",
    "operationKind": "query",
    "text": "query ContainerRegistryListQuery(\n  $domain: String!\n  $filter: String\n  $order: String\n  $first: Int\n  $offset: Int\n  $allowedProjectPreviewCount: Int\n) {\n  container_registry_nodes(filter: $filter, order: $order, first: $first, offset: $offset) {\n    edges {\n      node {\n        ...ContainerRegistryEditorModalFragment\n        id\n        row_id\n        registry_name\n        name\n        url\n        type\n        project\n        username\n        password\n        ssl_verify\n        is_global\n        allowed_groups_preview: allowed_groups(first: $allowedProjectPreviewCount) {\n          count\n          edges {\n            node {\n              id\n              name\n            }\n          }\n        }\n      }\n    }\n    count\n  }\n  domainV2(domainName: $domain) {\n    registry {\n      allowedDockerRegistries\n    }\n    id\n  }\n}\n\nfragment ContainerRegistryEditorModalFragment on ContainerRegistryNode {\n  id\n  row_id\n  name\n  registry_name\n  url\n  type\n  project\n  username\n  ssl_verify\n  extra @since(version: \"24.09.3\")\n  is_global @since(version: \"24.09.0\")\n  allowed_groups(first: 100) @since(version: \"25.3.0\") {\n    edges {\n      node {\n        id\n        row_id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "fd877341c772bf84599c274bfc48f08f";

export default node;
