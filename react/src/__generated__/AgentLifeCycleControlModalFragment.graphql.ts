/**
 * @generated SignedSource<<4fd220dd7f3ca14e289b79513de4891a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentLifeCycleControlModalFragment$data = {
  readonly id: string;
  readonly status: string | null | undefined;
  readonly status_changed: string | null | undefined;
  readonly " $fragmentType": "AgentLifeCycleControlModalFragment";
};
export type AgentLifeCycleControlModalFragment$key = {
  readonly " $data"?: AgentLifeCycleControlModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AgentLifeCycleControlModalFragment">;
};

import AgentLifeCycleControlModalRefetchQuery_graphql from './AgentLifeCycleControlModalRefetchQuery.graphql';

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": AgentLifeCycleControlModalRefetchQuery_graphql,
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "AgentLifeCycleControlModalFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status_changed",
      "storageKey": null
    }
  ],
  "type": "AgentNode",
  "abstractKey": null
};

(node as any).hash = "99c5cc9e353444a7bb4d222088b2c063";

export default node;
