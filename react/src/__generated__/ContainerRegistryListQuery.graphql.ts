/**
 * @generated SignedSource<<932c8525c83cc9568f3aafc94900516f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ContainerRegistryListQuery$variables = {
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
        readonly id: string;
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
  readonly domain: {
    readonly allowed_docker_registries: ReadonlyArray<string | null | undefined> | null | undefined;
    readonly name: string | null | undefined;
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
  "name": "domain"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "order"
},
v5 = [
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
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "registry_name",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "project",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "password",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ssl_verify",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "name",
      "variableName": "domain"
    }
  ],
  "concreteType": "Domain",
  "kind": "LinkedField",
  "name": "domain",
  "plural": false,
  "selections": [
    (v9/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "allowed_docker_registries",
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
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ContainerRegistryListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
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
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/),
                  (v13/*: any*/),
                  (v14/*: any*/),
                  (v15/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v16/*: any*/)
        ],
        "storageKey": null
      },
      (v17/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v4/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "ContainerRegistryListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
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
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v9/*: any*/),
                  (v8/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/),
                  (v13/*: any*/),
                  (v15/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "extra",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "is_global",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
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
                              (v6/*: any*/),
                              (v7/*: any*/),
                              (v9/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  (v14/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v16/*: any*/)
        ],
        "storageKey": null
      },
      (v17/*: any*/)
    ]
  },
  "params": {
    "cacheID": "2c290294552cc0caa3dd687d9720335e",
    "id": null,
    "metadata": {},
    "name": "ContainerRegistryListQuery",
    "operationKind": "query",
    "text": "query ContainerRegistryListQuery(\n  $domain: String!\n  $filter: String\n  $order: String\n  $first: Int\n  $offset: Int\n) {\n  container_registry_nodes(filter: $filter, order: $order, first: $first, offset: $offset) @since(version: \"24.09.0\") {\n    edges {\n      node {\n        ...ContainerRegistryEditorModalFragment\n        id\n        row_id\n        registry_name\n        name\n        url\n        type\n        project\n        username\n        password\n        ssl_verify\n      }\n    }\n    count\n  }\n  domain(name: $domain) {\n    name\n    allowed_docker_registries\n  }\n}\n\nfragment ContainerRegistryEditorModalFragment on ContainerRegistryNode {\n  id\n  row_id\n  name\n  registry_name\n  url\n  type\n  project\n  username\n  ssl_verify\n  extra @since(version: \"24.09.3\")\n  is_global @since(version: \"24.09.0\")\n  allowed_groups @since(version: \"25.3.0\") {\n    edges {\n      node {\n        id\n        row_id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "83d2445a2d783eb91f99f02f22559918";

export default node;
