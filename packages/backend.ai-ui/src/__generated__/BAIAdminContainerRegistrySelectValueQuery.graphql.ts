/**
 * @generated SignedSource<<4acfff5da945392005ff1c5add90d68f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIAdminContainerRegistrySelectValueQuery$variables = {
  first: number;
  nodeId: string;
  selectedFilter?: string | null | undefined;
  skipLegacy: boolean;
  skipV2: boolean;
};
export type BAIAdminContainerRegistrySelectValueQuery$data = {
  readonly container_registry_nodes?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly project: string | null | undefined;
        readonly registry_name: string;
        readonly row_id: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly node?: {
    readonly entityId?: string;
    readonly id?: string;
    readonly project?: string | null | undefined;
    readonly registryName?: string;
  } | null | undefined;
};
export type BAIAdminContainerRegistrySelectValueQuery = {
  response: BAIAdminContainerRegistrySelectValueQuery$data;
  variables: BAIAdminContainerRegistrySelectValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "nodeId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "selectedFilter"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipLegacy"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipV2"
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "project",
  "storageKey": null
},
v7 = {
  "condition": "skipLegacy",
  "kind": "Condition",
  "passingValue": false,
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "selectedFilter"
        },
        {
          "kind": "Variable",
          "name": "first",
          "variableName": "first"
        }
      ],
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
                (v5/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "row_id",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "registry_name",
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
      "storageKey": null
    }
  ]
},
v8 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "nodeId"
  }
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "registryName",
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
    "name": "BAIAdminContainerRegistrySelectValueQuery",
    "selections": [
      (v7/*: any*/),
      {
        "condition": "skipV2",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v8/*: any*/),
            "concreteType": null,
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  (v5/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v6/*: any*/)
                ],
                "type": "ContainerRegistryV2",
                "abstractKey": null
              }
            ],
            "storageKey": null
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
      (v1/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIAdminContainerRegistrySelectValueQuery",
    "selections": [
      (v7/*: any*/),
      {
        "condition": "skipV2",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v8/*: any*/),
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
              (v5/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v6/*: any*/)
                ],
                "type": "ContainerRegistryV2",
                "abstractKey": null
              }
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "7767067b220b09451f348e2abaaa6934",
    "id": null,
    "metadata": {},
    "name": "BAIAdminContainerRegistrySelectValueQuery",
    "operationKind": "query",
    "text": "query BAIAdminContainerRegistrySelectValueQuery(\n  $selectedFilter: String\n  $first: Int!\n  $nodeId: ID!\n  $skipLegacy: Boolean!\n  $skipV2: Boolean!\n) {\n  container_registry_nodes(filter: $selectedFilter, first: $first) @skip(if: $skipLegacy) {\n    edges {\n      node {\n        id\n        row_id\n        registry_name\n        project\n      }\n    }\n  }\n  node(id: $nodeId) @skip(if: $skipV2) @since(version: \"26.7.0\") {\n    __typename\n    ... on ContainerRegistryV2 {\n      id\n      entityId @since(version: \"26.9.0\")\n      registryName\n      project\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "1743702937c0c263d234f98a1e169043";

export default node;
