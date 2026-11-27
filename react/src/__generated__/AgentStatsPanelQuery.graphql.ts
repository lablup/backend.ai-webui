/**
 * @generated SignedSource<<d4fc38ef521aee574fd372b23278f991>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentStatsPanelQuery$variables = Record<PropertyKey, never>;
export type AgentStatsPanelQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"AgentStatsFragment">;
};
export type AgentStatsPanelQuery = {
  response: AgentStatsPanelQuery$data;
  variables: AgentStatsPanelQuery$variables;
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
    "name": "AgentStatsPanelQuery",
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
    "name": "AgentStatsPanelQuery",
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
    "cacheID": "198420e5649579308721010a90f45fbb",
    "id": null,
    "metadata": {},
    "name": "AgentStatsPanelQuery",
    "operationKind": "query",
    "text": "query AgentStatsPanelQuery {\n  ...AgentStatsFragment\n}\n\nfragment AgentStatsFragment on Query {\n  agentStats {\n    totalResource {\n      free\n      used\n      capacity\n    }\n  }\n  aliveAgents: agentsV2(filter: {status: {equals: ALIVE}}, limit: 1) {\n    count\n  }\n  schedulableAgents: agentsV2(filter: {status: {equals: ALIVE}, schedulable: true}, limit: 1) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "34eaf98ee96ce760a2e26c8990b9cf5a";

export default node;
