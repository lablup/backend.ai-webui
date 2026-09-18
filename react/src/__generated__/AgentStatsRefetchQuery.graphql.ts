/**
 * @generated SignedSource<<cd9d64fa689dc95d6feca78305e89836>>
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

const node: ConcreteRequest = {
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
      }
    ]
  },
  "params": {
    "cacheID": "d4c9110559266288c5a3d0cff1dd3ca2",
    "id": null,
    "metadata": {},
    "name": "AgentStatsRefetchQuery",
    "operationKind": "query",
    "text": "query AgentStatsRefetchQuery {\n  ...AgentStatsFragment\n}\n\nfragment AgentStatsFragment on Query {\n  agentStats {\n    totalResource {\n      free\n      used\n      capacity\n    }\n  }\n}\n"
  }
};

(node as any).hash = "0ba322943313b1a45b5b1f244712d4ac";

export default node;
