/**
 * @generated SignedSource<<f9e6322fe0bf2120691a432430ce3e31>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TotalResourceWithinResourceGroupFragment$data = {
  readonly agent_nodes?: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly available_slots: string | null | undefined;
        readonly id: string;
        readonly occupied_slots: string | null | undefined;
        readonly scaling_group: string | null | undefined;
        readonly status: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly agent_summary_list?: {
    readonly items: ReadonlyArray<{
      readonly available_slots: string | null | undefined;
      readonly id: string | null | undefined;
      readonly occupied_slots: string | null | undefined;
      readonly scaling_group: string | null | undefined;
      readonly status: string | null | undefined;
    } | null | undefined>;
    readonly total_count: number;
  } | null | undefined;
  readonly " $fragmentType": "TotalResourceWithinResourceGroupFragment";
};
export type TotalResourceWithinResourceGroupFragment$key = {
  readonly " $data"?: TotalResourceWithinResourceGroupFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"TotalResourceWithinResourceGroupFragment">;
};

import TotalResourceWithinResourceGroupFragmentRefetchQuery_graphql from './TotalResourceWithinResourceGroupFragmentRefetchQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = [
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
    "name": "available_slots",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "occupied_slots",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "scaling_group",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "agentNodeFilter"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "isSuperAdmin"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "resourceGroup"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [],
      "operation": TotalResourceWithinResourceGroupFragmentRefetchQuery_graphql
    }
  },
  "name": "TotalResourceWithinResourceGroupFragment",
  "selections": [
    {
      "condition": "isSuperAdmin",
      "kind": "Condition",
      "passingValue": false,
      "selections": [
        {
          "alias": null,
          "args": [
            {
              "kind": "Literal",
              "name": "filter",
              "value": "schedulable == true"
            },
            {
              "kind": "Literal",
              "name": "limit",
              "value": 1000
            },
            {
              "kind": "Literal",
              "name": "offset",
              "value": 0
            },
            {
              "kind": "Variable",
              "name": "scaling_group",
              "variableName": "resourceGroup"
            },
            {
              "kind": "Literal",
              "name": "status",
              "value": "ALIVE"
            }
          ],
          "concreteType": "AgentSummaryList",
          "kind": "LinkedField",
          "name": "agent_summary_list",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "AgentSummary",
              "kind": "LinkedField",
              "name": "items",
              "plural": true,
              "selections": (v0/*: any*/),
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "total_count",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    },
    {
      "condition": "isSuperAdmin",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": [
            {
              "kind": "Variable",
              "name": "filter",
              "variableName": "agentNodeFilter"
            },
            {
              "kind": "Literal",
              "name": "first",
              "value": 100
            }
          ],
          "concreteType": "AgentConnection",
          "kind": "LinkedField",
          "name": "agent_nodes",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "AgentEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "AgentNode",
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": (v0/*: any*/),
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "count",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "fc6ddb3f40e58a89fe4433db28848cdf";

export default node;
