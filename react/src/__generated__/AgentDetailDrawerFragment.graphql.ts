/**
 * @generated SignedSource<<4ca0e3d666753d1c1eea89a255390b5b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentDetailDrawerFragment$data = {
  readonly agentNodeFrgmt?: {
    readonly " $fragmentSpreads": FragmentRefs<"AgentDetailDrawerContentFragment">;
  } | null | undefined;
  readonly id: string;
  readonly " $fragmentType": "AgentDetailDrawerFragment";
};
export type AgentDetailDrawerFragment$key = {
  readonly " $data"?: AgentDetailDrawerFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AgentDetailDrawerFragment">;
};

import AgentDetailDrawerRefetchQuery_graphql from './AgentDetailDrawerRefetchQuery.graphql';

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": AgentDetailDrawerRefetchQuery_graphql,
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "AgentDetailDrawerFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "fragment": {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "AgentDetailDrawerContentFragment"
              }
            ],
            "type": "AgentNode",
            "abstractKey": null
          },
          "kind": "AliasedInlineFragmentSpread",
          "name": "agentNodeFrgmt"
        }
      ],
      "type": "AgentNode",
      "abstractKey": null
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node as any).hash = "6bfcaf0b862ffeebe6e42667e683e1a2";

export default node;
