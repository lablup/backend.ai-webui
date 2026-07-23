/**
 * @generated SignedSource<<91d82e19a25cdf301716641ca18024b6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIAdminResourceGroupSelectStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIAdminResourceGroupSelectStoriesQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"BAIAdminResourceGroupSelect_resourceGroupsFragment">;
};
export type BAIAdminResourceGroupSelectStoriesQuery = {
  response: BAIAdminResourceGroupSelectStoriesQuery$data;
  variables: BAIAdminResourceGroupSelectStoriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIAdminResourceGroupSelectStoriesQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "BAIAdminResourceGroupSelect_resourceGroupsFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "BAIAdminResourceGroupSelectStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "ResourceGroupConnection",
        "kind": "LinkedField",
        "name": "resourceGroups",
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
            "concreteType": "ResourceGroupEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ResourceGroup",
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
                    "name": "name",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "__typename",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "cursor",
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
                "name": "endCursor",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "hasNextPage",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "resourceGroups(first:10)"
      },
      {
        "alias": null,
        "args": (v0/*: any*/),
        "filters": [
          "filter"
        ],
        "handle": "connection",
        "key": "BAIAdminResourceGroupSelect_resourceGroups",
        "kind": "LinkedHandle",
        "name": "resourceGroups"
      }
    ]
  },
  "params": {
    "cacheID": "826cd63cc78fb8e1b29903ea7cda44bb",
    "id": null,
    "metadata": {},
    "name": "BAIAdminResourceGroupSelectStoriesQuery",
    "operationKind": "query",
    "text": "query BAIAdminResourceGroupSelectStoriesQuery {\n  ...BAIAdminResourceGroupSelect_resourceGroupsFragment\n}\n\nfragment BAIAdminResourceGroupSelect_resourceGroupsFragment on Query {\n  resourceGroups(first: 10) @since(version: \"26.1.0\") {\n    count\n    edges {\n      node {\n        id\n        name\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d28e9b04704fbca4dcc55506635a3241";

export default node;
