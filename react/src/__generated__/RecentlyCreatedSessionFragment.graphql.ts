/**
 * @generated SignedSource<<b4dcb7100199af539438cf9eab64154e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RecentlyCreatedSessionFragment$data = {
  readonly compute_session_nodes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"SessionNodesFragment">;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly " $fragmentType": "RecentlyCreatedSessionFragment";
};
export type RecentlyCreatedSessionFragment$key = {
  readonly " $data"?: RecentlyCreatedSessionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RecentlyCreatedSessionFragment">;
};

import RecentlyCreatedSessionRefetchQuery_graphql from './RecentlyCreatedSessionRefetchQuery.graphql';

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "scopeId"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [],
      "operation": RecentlyCreatedSessionRefetchQuery_graphql
    }
  },
  "name": "RecentlyCreatedSessionFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "filter",
          "value": "status == \"running\""
        },
        {
          "kind": "Literal",
          "name": "first",
          "value": 5
        },
        {
          "kind": "Literal",
          "name": "order",
          "value": "-created_at"
        },
        {
          "kind": "Variable",
          "name": "scope_id",
          "variableName": "scopeId"
        }
      ],
      "concreteType": "ComputeSessionConnection",
      "kind": "LinkedField",
      "name": "compute_session_nodes",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ComputeSessionEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "ComputeSessionNode",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "id",
                  "storageKey": null
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "SessionNodesFragment"
                }
              ],
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

(node as any).hash = "aeaa38c05c8fe2c9a07946ed4a3fe214";

export default node;
