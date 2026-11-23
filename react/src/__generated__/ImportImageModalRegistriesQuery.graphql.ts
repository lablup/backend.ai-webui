/**
 * @generated SignedSource<<78e48e80193fa4022a45b956d29918d0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ImportImageModalRegistriesQuery$variables = {
  after?: string | null | undefined;
  domainName: string;
  first?: number | null | undefined;
};
export type ImportImageModalRegistriesQuery$data = {
  readonly container_registry_nodes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly project: string | null | undefined;
        readonly registry_name: string;
        readonly row_id: string | null | undefined;
        readonly type: any;
        readonly url: string;
      } | null | undefined;
    } | null | undefined>;
    readonly pageInfo: {
      readonly endCursor: string | null | undefined;
      readonly hasNextPage: boolean;
    };
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
  "name": "domainName"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v3 = [
  {
    "kind": "Variable",
    "name": "domainName",
    "variableName": "domainName"
  }
],
v4 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1000
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
  "name": "entityId",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = {
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
            (v7/*: any*/),
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
};
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
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
        "plural": false,
        "selections": [
          {
            "kind": "CatchField",
            "field": {
              "alias": null,
              "args": (v4/*: any*/),
              "concreteType": "ContainerRegistryV2Connection",
              "kind": "LinkedField",
              "name": "containerRegistries",
              "plural": false,
              "selections": [
                (v5/*: any*/),
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
                        (v6/*: any*/)
                      ],
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": "containerRegistries(first:1000)"
            },
            "to": "NULL"
          }
        ],
        "storageKey": null
      },
      (v8/*: any*/)
    ],
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
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "ContainerRegistryV2Connection",
            "kind": "LinkedField",
            "name": "containerRegistries",
            "plural": false,
            "selections": [
              (v5/*: any*/),
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
                      (v6/*: any*/),
                      (v7/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "containerRegistries(first:1000)"
          },
          (v7/*: any*/)
        ],
        "storageKey": null
      },
      (v8/*: any*/)
    ]
  },
  "params": {
    "cacheID": "4ad7e12ce355c518af0a615178049412",
    "id": null,
    "metadata": {},
    "name": "ImportImageModalRegistriesQuery",
    "operationKind": "query",
    "text": "query ImportImageModalRegistriesQuery(\n  $first: Int\n  $after: String\n  $domainName: String!\n) {\n  domainV2(domainName: $domainName) {\n    containerRegistries(first: 1000) @since(version: \"26.10.0\") {\n      count\n      edges {\n        node {\n          entityId\n          id\n        }\n      }\n    }\n    id\n  }\n  container_registry_nodes(first: $first, after: $after) @since(version: \"24.09.0\") {\n    edges {\n      node {\n        id\n        row_id\n        registry_name\n        project\n        url\n        type\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e1527d446b2296748b1bade66d1a6493";

export default node;
