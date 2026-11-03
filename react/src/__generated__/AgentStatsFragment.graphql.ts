/**
 * @generated SignedSource<<6abda0dca0ed4848b70b3c3639eaf34c>>
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
    readonly count: number | null | undefined;
  } | null | undefined, unknown>;
  readonly schedulableAgents: Result<{
    readonly count: number | null | undefined;
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
      "to": "RESULT"
    },
    {
      "kind": "CatchField",
      "field": {
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
      },
      "to": "RESULT"
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "da7ac79d9a8210f4be08f760587adfdb";

export default node;
