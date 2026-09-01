/**
 * @generated SignedSource<<e20175d60b150669c84f719c54c8574a>>
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
  readonly " $fragmentType": "AgentStatsFragment";
};
export type AgentStatsFragment$key = {
  readonly " $data"?: AgentStatsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AgentStatsFragment">;
};

import AgentStatsRefetchQuery_graphql from './AgentStatsRefetchQuery.graphql';

const node: ReaderFragment = {
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
  ],
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "458be767c066ba74fbebc3d9d84638ca";

export default node;
