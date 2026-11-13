/**
 * @generated SignedSource<<7f2f82720da52032a0e67cd0f7791e31>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TotalResourceWithinResourceGroupFragment$data = {
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
  readonly agentsV2?: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly resourceInfo: {
          readonly capacity: any;
          readonly used: any;
        };
      };
    }>;
  } | null | undefined;
  readonly " $fragmentType": "TotalResourceWithinResourceGroupFragment";
};
export type TotalResourceWithinResourceGroupFragment$key = {
  readonly " $data"?: TotalResourceWithinResourceGroupFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"TotalResourceWithinResourceGroupFragment">;
};

import TotalResourceWithinResourceGroupFragmentRefetchQuery_graphql from './TotalResourceWithinResourceGroupFragmentRefetchQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = {
  "kind": "Literal",
  "name": "limit",
  "value": 100
},
v1 = {
  "kind": "Literal",
  "name": "offset",
  "value": 0
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [
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
            (v0/*: any*/),
            (v1/*: any*/),
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
              "selections": [
                (v2/*: any*/),
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
              ],
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
              "fields": [
                {
                  "fields": [
                    {
                      "kind": "Variable",
                      "name": "equals",
                      "variableName": "resourceGroup"
                    }
                  ],
                  "kind": "ObjectValue",
                  "name": "scalingGroup"
                },
                {
                  "kind": "Literal",
                  "name": "schedulable",
                  "value": true
                },
                {
                  "kind": "Literal",
                  "name": "status",
                  "value": {
                    "equals": "ALIVE"
                  }
                }
              ],
              "kind": "ObjectValue",
              "name": "filter"
            },
            (v0/*: any*/),
            (v1/*: any*/),
            {
              "kind": "Literal",
              "name": "orderBy",
              "value": [
                {
                  "field": "ID"
                }
              ]
            }
          ],
          "concreteType": "AgentV2Connection",
          "kind": "LinkedField",
          "name": "agentsV2",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "AgentV2Edge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "AgentV2",
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    (v2/*: any*/),
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "AgentResource",
                      "kind": "LinkedField",
                      "name": "resourceInfo",
                      "plural": false,
                      "selections": [
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "capacity",
                          "storageKey": null
                        },
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "used",
                          "storageKey": null
                        }
                      ],
                      "storageKey": null
                    }
                  ],
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

(node as any).hash = "fcbc47f65eb8dd82b6ad1f4622ef49f2";

export default node;
