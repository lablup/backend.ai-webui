/**
 * @generated SignedSource<<85acc6198648fc05a01890b02abf090c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentSettingModalQuery$variables = Record<PropertyKey, never>;
export type AgentSettingModalQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"BAIAdminResourceGroupSelect_resourceGroupsFragment">;
};
export type AgentSettingModalQuery = {
  response: AgentSettingModalQuery$data;
  variables: AgentSettingModalQuery$variables;
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
    "name": "AgentSettingModalQuery",
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
    "name": "AgentSettingModalQuery",
    "selections": [
      {
        "alias": "resourceGroups",
        "args": (v0/*: any*/),
        "concreteType": "ResourceGroupConnection",
        "kind": "LinkedField",
        "name": "adminResourceGroups",
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
        "storageKey": "adminResourceGroups(first:10)"
      },
      {
        "alias": "resourceGroups",
        "args": (v0/*: any*/),
        "filters": [
          "filter"
        ],
        "handle": "connection",
        "key": "BAIAdminResourceGroupSelect_resourceGroups",
        "kind": "LinkedHandle",
        "name": "adminResourceGroups"
      }
    ]
  },
  "params": {
    "cacheID": "c402f205f655f900f2fdfed6924d9f5f",
    "id": null,
    "metadata": {},
    "name": "AgentSettingModalQuery",
    "operationKind": "query",
    "text": "query AgentSettingModalQuery {\n  ...BAIAdminResourceGroupSelect_resourceGroupsFragment\n}\n\nfragment BAIAdminResourceGroupSelect_resourceGroupsFragment on Query {\n  resourceGroups: adminResourceGroups(first: 10) @since(version: \"26.2.0\") {\n    count\n    edges {\n      node {\n        id\n        name\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e12febf36d56aa90e33f3478ec22cf80";

export default node;
