/**
 * @generated SignedSource<<57a4fd9c50b4c286d500c7f7b355f766>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ConfigurableResourceCardQuery$variables = {
  agentNodeFilter: string;
  isSuperAdmin: boolean;
  resourceGroup?: string | null | undefined;
};
export type ConfigurableResourceCardQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"TotalResourceWithinResourceGroupFragment">;
};
export type ConfigurableResourceCardQuery = {
  response: ConfigurableResourceCardQuery$data;
  variables: ConfigurableResourceCardQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "agentNodeFilter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isSuperAdmin"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroup"
},
v3 = [
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
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ConfigurableResourceCardQuery",
    "selections": [
      {
        "args": [
          {
            "kind": "Variable",
            "name": "agentNodeFilter",
            "variableName": "agentNodeFilter"
          },
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
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ConfigurableResourceCardQuery",
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
                "selections": (v3/*: any*/),
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
                    "selections": (v3/*: any*/),
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
    "cacheID": "07c735be2c9dec050f86facb12766981",
    "id": null,
    "metadata": {},
    "name": "ConfigurableResourceCardQuery",
    "operationKind": "query",
    "text": "query ConfigurableResourceCardQuery(\n  $resourceGroup: String\n  $isSuperAdmin: Boolean!\n  $agentNodeFilter: String!\n) {\n  ...TotalResourceWithinResourceGroupFragment_2otDCj\n}\n\nfragment TotalResourceWithinResourceGroupFragment_2otDCj on Query {\n  agent_summary_list(limit: 1000, offset: 0, status: \"ALIVE\", scaling_group: $resourceGroup, filter: \"schedulable == true\") @skip(if: $isSuperAdmin) {\n    items {\n      id\n      status\n      available_slots\n      occupied_slots\n      scaling_group\n    }\n    total_count\n  }\n  agent_nodes(filter: $agentNodeFilter, first: 100) @include(if: $isSuperAdmin) @since(version: \"24.12.0\") {\n    edges {\n      node {\n        id\n        status\n        available_slots\n        occupied_slots\n        scaling_group\n      }\n    }\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "736bb68d25f4a62e7201f3608ea80b37";

export default node;
