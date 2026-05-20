/**
 * @generated SignedSource<<ca647247e5ea5d27f732666c80ddf411>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RoleFormModalResourceGroupQuery$variables = Record<PropertyKey, never>;
export type RoleFormModalResourceGroupQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"BAIAdminResourceGroupSelect_resourceGroupsFragment">;
};
export type RoleFormModalResourceGroupQuery = {
  response: RoleFormModalResourceGroupQuery$data;
  variables: RoleFormModalResourceGroupQuery$variables;
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
    "name": "RoleFormModalResourceGroupQuery",
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
    "name": "RoleFormModalResourceGroupQuery",
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
    "cacheID": "7651e21381517ec3783fe48265a90ad0",
    "id": null,
    "metadata": {},
    "name": "RoleFormModalResourceGroupQuery",
    "operationKind": "query",
    "text": "query RoleFormModalResourceGroupQuery {\n  ...BAIAdminResourceGroupSelect_resourceGroupsFragment\n}\n\nfragment BAIAdminResourceGroupSelect_resourceGroupsFragment on Query {\n  resourceGroups(first: 10) @since(version: \"26.1.0\") {\n    count\n    edges {\n      node {\n        id\n        name\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "524e2d7de23d79454b9bba980717fc7b";

export default node;
