/**
 * @generated SignedSource<<195ab82b9d2a48d42d9ef0e0c142ab3d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AddImageModalRegistriesQuery$variables = {
  after?: string | null | undefined;
  first?: number | null | undefined;
};
export type AddImageModalRegistriesQuery$data = {
  readonly container_registry_nodes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly project: string | null | undefined;
        readonly registry_name: string;
        readonly type: any;
        readonly url: string;
      } | null | undefined;
    } | null | undefined>;
    readonly pageInfo: {
      readonly endCursor: string | null | undefined;
      readonly hasNextPage: boolean;
    };
  } | null | undefined;
};
export type AddImageModalRegistriesQuery = {
  response: AddImageModalRegistriesQuery$data;
  variables: AddImageModalRegistriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "after",
        "variableName": "after"
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
                "name": "registry_name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "project",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "url",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "type",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "PageInfo",
        "kind": "LinkedField",
        "name": "pageInfo",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "hasNextPage",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "endCursor",
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
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "AddImageModalRegistriesQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "AddImageModalRegistriesQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "595999c864d88a45b52ffa26a7a5c191",
    "id": null,
    "metadata": {},
    "name": "AddImageModalRegistriesQuery",
    "operationKind": "query",
    "text": "query AddImageModalRegistriesQuery(\n  $first: Int\n  $after: String\n) {\n  container_registry_nodes(first: $first, after: $after) @since(version: \"24.09.0\") {\n    edges {\n      node {\n        id\n        registry_name\n        project\n        url\n        type\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "04c71460ccddfa1109043c6b1dc23ef5";

export default node;
