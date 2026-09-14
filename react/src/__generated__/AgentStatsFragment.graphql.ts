/**
 * @generated SignedSource<<d2a5fe4c9c1c7ef8811e3c0e1ba077e3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentStatsFragment$data = {
  readonly agentStats: {
    readonly totalResource: {
      readonly capacity: any;
      readonly free: any;
      readonly used: any;
    };
  } | null | undefined;
  readonly aliveAgents: {
    readonly count: number | null | undefined;
  } | null | undefined;
  readonly schedulableAgents: {
    readonly count: number | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "AgentStatsFragment";
};
export type AgentStatsFragment$key = {
  readonly " $data"?: AgentStatsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AgentStatsFragment">;
};

import AgentStatsRefetchQuery_graphql from './AgentStatsRefetchQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = {
  "kind": "Literal",
  "name": "first",
  "value": 1
},
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [
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
        (v0/*: any*/)
      ],
      "concreteType": "AgentConnection",
      "kind": "LinkedField",
      "name": "agent_nodes",
      "plural": false,
      "selections": (v1/*: any*/),
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
        (v0/*: any*/)
      ],
      "concreteType": "AgentConnection",
      "kind": "LinkedField",
      "name": "agent_nodes",
      "plural": false,
      "selections": (v1/*: any*/),
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "5a26ac154e8e8dd31245ff662479f976";

export default node;
