/**
 * @generated SignedSource<<f895c19517bcd86b52cd9d60af5588b3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIAdminContainerRegistrySelectAstryxPaginatedQuery$variables = {
  filter?: string | null | undefined;
  limit: number;
  offset: number;
};
export type BAIAdminContainerRegistrySelectAstryxPaginatedQuery$data = {
  readonly container_registry_nodes: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly project: string | null | undefined;
        readonly registry_name: string;
        readonly row_id: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type BAIAdminContainerRegistrySelectAstryxPaginatedQuery = {
  response: BAIAdminContainerRegistrySelectAstryxPaginatedQuery$data;
  variables: BAIAdminContainerRegistrySelectAstryxPaginatedQuery$variables;
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
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "filter"
      },
      {
        "kind": "Variable",
        "name": "first",
        "variableName": "limit"
      },
      {
        "kind": "Variable",
        "name": "offset",
        "variableName": "offset"
      },
      {
        "kind": "Literal",
        "name": "order",
        "value": "registry_name"
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
        "kind": "ScalarField",
        "name": "count",
        "storageKey": null
      },
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
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              },
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
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "project",
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
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIAdminContainerRegistrySelectAstryxPaginatedQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIAdminContainerRegistrySelectAstryxPaginatedQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "8f59e6dcc7a44dd72a0c60ae07b2767c",
    "id": null,
    "metadata": {},
    "name": "BAIAdminContainerRegistrySelectAstryxPaginatedQuery",
    "operationKind": "query",
    "text": "query BAIAdminContainerRegistrySelectAstryxPaginatedQuery(\n  $offset: Int!\n  $limit: Int!\n  $filter: String\n) {\n  container_registry_nodes(offset: $offset, first: $limit, filter: $filter, order: \"registry_name\") {\n    count\n    edges {\n      node {\n        id\n        row_id\n        registry_name\n        project\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9de8928f27934769b9d4e8c386070e72";

export default node;
