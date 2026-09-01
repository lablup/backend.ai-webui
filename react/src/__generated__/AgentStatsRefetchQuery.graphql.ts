/**
 * @generated SignedSource<<ca0fe5a130171f9b98480845fa9ecca4>>
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
    "cacheID": "b2605aadfb3d6bd4a21f3f7887043e31",
    "id": null,
    "metadata": {},
    "name": "AgentStatsRefetchQuery",
    "operationKind": "query",
    "text": "query AgentStatsRefetchQuery {\n  ...AgentStatsFragment\n}\n\nfragment AgentStatsFragment on Query {\n  agentStats @since(version: \"25.15.0\") {\n    totalResource {\n      free\n      used\n      capacity\n    }\n  }\n}\n"
  }
};

(node as any).hash = "458be767c066ba74fbebc3d9d84638ca";

export default node;
