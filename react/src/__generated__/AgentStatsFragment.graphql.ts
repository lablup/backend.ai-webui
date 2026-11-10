/**
 * @generated SignedSource<<81985a727d3e2d157c1cd2f8dd0261ec>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs, Result } from "relay-runtime";
export type AgentStatsFragment$data = {
  readonly agentStats: Result<{
    readonly totalResource: {
      readonly capacity: any;
      readonly free: any;
      readonly used: any;
    };
  } | null | undefined, unknown>;
  readonly aliveAgents: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly schedulableAgents: Result<{
    readonly count: number;
  } | null | undefined, unknown>;
  readonly " $fragmentType": "AgentStatsFragment";
};
export type AgentStatsFragment$key = {
  readonly " $data"?: AgentStatsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AgentStatsFragment">;
};

import AgentStatsRefetchQuery_graphql from './AgentStatsRefetchQuery.graphql';

const node: ReaderFragment = (function(){
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
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [],
      "operation": AgentStatsRefetchQuery_graphql
    }
  },
  "name": "AgentStatsFragment",
  "selections": [
    {
      "kind": "CatchField",
      "field": {
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
      "to": "RESULT"
    },
    {
      "kind": "CatchField",
      "field": {
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
      "to": "RESULT"
    },
    {
      "kind": "CatchField",
      "field": {
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
      },
      "to": "RESULT"
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "e217cb656048f87c06a9d79f978a321b";

export default node;
