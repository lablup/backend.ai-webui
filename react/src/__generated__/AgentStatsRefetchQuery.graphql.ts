/**
 * @generated SignedSource<<8a8f18a1ec9c4d5df53d2d53a6080a52>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentStatsRefetchQuery$variables = {
  aliveAgentFilter: string;
  schedulableAgentFilter: string;
};
export type AgentStatsRefetchQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"AgentStatsFragment">;
};
export type AgentStatsRefetchQuery = {
  response: AgentStatsRefetchQuery$data;
  variables: AgentStatsRefetchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "aliveAgentFilter"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "schedulableAgentFilter"
  }
],
v1 = {
  "kind": "Literal",
  "name": "first",
  "value": 1
},
v2 = [
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AgentStatsRefetchQuery",
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
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AgentStatsRefetchQuery",
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
          (v1/*: any*/)
        ],
        "concreteType": "AgentConnection",
        "kind": "LinkedField",
        "name": "agent_nodes",
        "plural": false,
        "selections": (v2/*: any*/),
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
          (v1/*: any*/)
        ],
        "concreteType": "AgentConnection",
        "kind": "LinkedField",
        "name": "agent_nodes",
        "plural": false,
        "selections": (v2/*: any*/),
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "94723c46599cac0fa017d69548d9db15",
    "id": null,
    "metadata": {},
    "name": "AgentStatsRefetchQuery",
    "operationKind": "query",
    "text": "query AgentStatsRefetchQuery(\n  $aliveAgentFilter: String!\n  $schedulableAgentFilter: String!\n) {\n  ...AgentStatsFragment_rQkRq\n}\n\nfragment AgentStatsFragment_rQkRq on Query {\n  agentStats {\n    totalResource {\n      free\n      used\n      capacity\n    }\n  }\n  aliveAgents: agent_nodes(filter: $aliveAgentFilter, first: 1) {\n    count\n  }\n  schedulableAgents: agent_nodes(filter: $schedulableAgentFilter, first: 1) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "184fa590bf7419b2316880010ceb48ed";

export default node;
