/**
 * @generated SignedSource<<428b06c5afdae2d699cadae664ffe481>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ImportImageModalRegistriesQuery$variables = {
  after?: string | null | undefined;
  domain?: string | null | undefined;
  first?: number | null | undefined;
};
export type ImportImageModalRegistriesQuery$data = {
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
  readonly domain: {
    readonly allowed_docker_registries: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type ImportImageModalRegistriesQuery = {
  response: ImportImageModalRegistriesQuery$data;
  variables: ImportImageModalRegistriesQuery$variables;
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
  "name": "domain"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v3 = [
  {
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
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "allowed_docker_registries",
        "storageKey": null
      }
    ],
    "storageKey": null
  },
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
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ImportImageModalRegistriesQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "ImportImageModalRegistriesQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "fa10b4e07f503629972f5f359f1c370b",
    "id": null,
    "metadata": {},
    "name": "ImportImageModalRegistriesQuery",
    "operationKind": "query",
    "text": "query ImportImageModalRegistriesQuery(\n  $first: Int\n  $after: String\n  $domain: String\n) {\n  domain(name: $domain) {\n    allowed_docker_registries\n  }\n  container_registry_nodes(first: $first, after: $after) @since(version: \"24.09.0\") {\n    edges {\n      node {\n        id\n        registry_name\n        project\n        url\n        type\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7e6b2763b618a4248747cfe7dd38c9c3";

export default node;
