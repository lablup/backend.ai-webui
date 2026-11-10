/**
 * @generated SignedSource<<1b779e8fcd5f76874797dc0ea0f74d23>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TotalResourceWithinResourceGroupFragmentRefetchQuery$variables = {
  isSuperAdmin: boolean;
  resourceGroup?: string | null | undefined;
};
export type TotalResourceWithinResourceGroupFragmentRefetchQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"TotalResourceWithinResourceGroupFragment">;
};
export type TotalResourceWithinResourceGroupFragmentRefetchQuery = {
  response: TotalResourceWithinResourceGroupFragmentRefetchQuery$data;
  variables: TotalResourceWithinResourceGroupFragmentRefetchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
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
v1 = {
  "kind": "Literal",
  "name": "limit",
  "value": 100
},
v2 = {
  "kind": "Literal",
  "name": "offset",
  "value": 0
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "TotalResourceWithinResourceGroupFragmentRefetchQuery",
    "selections": [
      {
        "args": [
          {
            "kind": "Variable",
            "name": "isSuperAdmin",
            "variableName": "isSuperAdmin"
          },
          {
            "kind": "Variable",
            "name": "resourceGroup",
            "variableName": "resourceGroup"
          }
        ],
        "kind": "FragmentSpread",
        "name": "TotalResourceWithinResourceGroupFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "TotalResourceWithinResourceGroupFragmentRefetchQuery",
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
              (v1/*: any*/),
              (v2/*: any*/),
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
                  (v3/*: any*/),
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
              (v1/*: any*/),
              (v2/*: any*/),
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
                      (v3/*: any*/),
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
    ]
  },
  "params": {
    "cacheID": "4ebe3be55ca0f38b4c7be70666c58cf8",
    "id": null,
    "metadata": {},
    "name": "TotalResourceWithinResourceGroupFragmentRefetchQuery",
    "operationKind": "query",
    "text": "query TotalResourceWithinResourceGroupFragmentRefetchQuery(\n  $isSuperAdmin: Boolean!\n  $resourceGroup: String\n) {\n  ...TotalResourceWithinResourceGroupFragment_48CZqz\n}\n\nfragment TotalResourceWithinResourceGroupFragment_48CZqz on Query {\n  agent_summary_list(limit: 100, offset: 0, status: \"ALIVE\", scaling_group: $resourceGroup, filter: \"schedulable == true\") @skip(if: $isSuperAdmin) {\n    items {\n      id\n      status\n      available_slots\n      occupied_slots\n      scaling_group\n    }\n    total_count\n  }\n  agentsV2(filter: {status: {equals: ALIVE}, schedulable: true, scalingGroup: {equals: $resourceGroup}}, orderBy: [{field: ID}], limit: 100, offset: 0) @include(if: $isSuperAdmin) {\n    edges {\n      node {\n        id\n        resourceInfo {\n          capacity\n          used\n        }\n      }\n    }\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "fcbc47f65eb8dd82b6ad1f4622ef49f2";

export default node;
