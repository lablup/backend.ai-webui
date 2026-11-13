/**
 * @generated SignedSource<<03bf09f9dd6cbd1b58eca4e2df56214c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentStatsRefetchQuery$variables = Record<PropertyKey, never>;
export type AgentStatsRefetchQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"AgentStatsFragment">;
};
export type AgentStatsRefetchQuery = {
  response: AgentStatsRefetchQuery$data;
  variables: AgentStatsRefetchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "equals": "ALIVE"
},
v1 = {
  "kind": "Literal",
  "name": "limit",
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
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "AgentStatsRefetchQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "AgentStatsFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
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
            "kind": "Literal",
            "name": "filter",
            "value": {
              "status": (v0/*: any*/)
            }
          },
          (v1/*: any*/)
        ],
        "concreteType": "AgentV2Connection",
        "kind": "LinkedField",
        "name": "agentsV2",
        "plural": false,
        "selections": (v2/*: any*/),
        "storageKey": "agentsV2(filter:{\"status\":{\"equals\":\"ALIVE\"}},limit:1)"
      },
      {
        "alias": "schedulableAgents",
        "args": [
          {
            "kind": "Literal",
            "name": "filter",
            "value": {
              "schedulable": true,
              "status": (v0/*: any*/)
            }
          },
          (v1/*: any*/)
        ],
        "concreteType": "AgentV2Connection",
        "kind": "LinkedField",
        "name": "agentsV2",
        "plural": false,
        "selections": (v2/*: any*/),
        "storageKey": "agentsV2(filter:{\"schedulable\":true,\"status\":{\"equals\":\"ALIVE\"}},limit:1)"
      }
    ]
  },
  "params": {
    "cacheID": "d855dbce20f7b0c70d997e3d7c80d024",
    "id": null,
    "metadata": {},
    "name": "AgentStatsRefetchQuery",
    "operationKind": "query",
    "text": "query AgentStatsRefetchQuery {\n  ...AgentStatsFragment\n}\n\nfragment AgentStatsFragment on Query {\n  agentStats {\n    totalResource {\n      free\n      used\n      capacity\n    }\n  }\n  aliveAgents: agentsV2(filter: {status: {equals: ALIVE}}, limit: 1) {\n    count\n  }\n  schedulableAgents: agentsV2(filter: {status: {equals: ALIVE}, schedulable: true}, limit: 1) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "e217cb656048f87c06a9d79f978a321b";

export default node;
