/**
 * @generated SignedSource<<52df83b37e3b7173f77e5fece7eb2d77>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AdminDashboardPageQuery$variables = {
  aliveAgentFilter: string;
  isSuperAdmin: boolean;
  schedulableAgentFilter: string;
};
export type AdminDashboardPageQuery$data = {
  readonly AgentStatsFragment?: {
    readonly " $fragmentSpreads": FragmentRefs<"AgentStatsFragment">;
  } | null | undefined;
};
export type AdminDashboardPageQuery = {
  response: AdminDashboardPageQuery$data;
  variables: AdminDashboardPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "aliveAgentFilter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isSuperAdmin"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "schedulableAgentFilter"
},
v3 = {
  "kind": "Literal",
  "name": "first",
  "value": 1
},
v4 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
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
    "name": "AdminDashboardPageQuery",
    "selections": [
      {
        "condition": "isSuperAdmin",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "args": [
                    {
                      "kind": "Variable",
                      "name": "aliveAgentFilter",
                      "variableName": "aliveAgentFilter"
                    },
                    {
                      "kind": "Variable",
                      "name": "schedulableAgentFilter",
                      "variableName": "schedulableAgentFilter"
                    }
                  ],
                  "kind": "FragmentSpread",
                  "name": "AgentStatsFragment"
                }
              ],
              "type": "Query",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "AgentStatsFragment"
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
      (v1/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "AdminDashboardPageQuery",
    "selections": [
      {
        "condition": "isSuperAdmin",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "AgentStats",
            "kind": "LinkedField",
            "name": "agentStats",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "AgentResource",
                "kind": "LinkedField",
                "name": "totalResource",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "free",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "used",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "capacity",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": "aliveAgents",
            "args": [
              {
                "kind": "Variable",
                "name": "filter",
                "variableName": "aliveAgentFilter"
              },
              (v3/*: any*/)
            ],
            "concreteType": "AgentConnection",
            "kind": "LinkedField",
            "name": "agent_nodes",
            "plural": false,
            "selections": (v4/*: any*/),
            "storageKey": null
          },
          {
            "alias": "schedulableAgents",
            "args": [
              {
                "kind": "Variable",
                "name": "filter",
                "variableName": "schedulableAgentFilter"
              },
              (v3/*: any*/)
            ],
            "concreteType": "AgentConnection",
            "kind": "LinkedField",
            "name": "agent_nodes",
            "plural": false,
            "selections": (v4/*: any*/),
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "5d3553c3d3dc1ce2cc77bbc2460cb77e",
    "id": null,
    "metadata": {},
    "name": "AdminDashboardPageQuery",
    "operationKind": "query",
    "text": "query AdminDashboardPageQuery(\n  $isSuperAdmin: Boolean!\n  $aliveAgentFilter: String!\n  $schedulableAgentFilter: String!\n) {\n  ...AgentStatsFragment_rQkRq @include(if: $isSuperAdmin)\n}\n\nfragment AgentStatsFragment_rQkRq on Query {\n  agentStats {\n    totalResource {\n      free\n      used\n      capacity\n    }\n  }\n  aliveAgents: agent_nodes(filter: $aliveAgentFilter, first: 1) {\n    count\n  }\n  schedulableAgents: agent_nodes(filter: $schedulableAgentFilter, first: 1) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "2278d52109b3586f63288bd5c28db256";

export default node;
