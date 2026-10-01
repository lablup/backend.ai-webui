/**
 * @generated SignedSource<<2b6613ad5977950f2cf5986abc842af5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type TotalResourceWithinResourceGroupRemainingAgentsQuery$variables = {
  agentNodeFilter: string;
  isSuperAdmin: boolean;
  limit: number;
  offset: number;
  resourceGroup?: string | null | undefined;
};
export type TotalResourceWithinResourceGroupRemainingAgentsQuery$data = {
  readonly agent_nodes?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly available_slots: string | null | undefined;
        readonly id: string;
        readonly occupied_slots: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly agent_summary_list?: {
    readonly items: ReadonlyArray<{
      readonly available_slots: string | null | undefined;
      readonly id: string | null | undefined;
      readonly occupied_slots: string | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type TotalResourceWithinResourceGroupRemainingAgentsQuery = {
  response: TotalResourceWithinResourceGroupRemainingAgentsQuery$data;
  variables: TotalResourceWithinResourceGroupRemainingAgentsQuery$variables;
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
  "name": "limit"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroup"
},
v5 = {
  "kind": "Variable",
  "name": "offset",
  "variableName": "offset"
},
v6 = [
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
    "name": "available_slots",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "occupied_slots",
    "storageKey": null
  }
],
v7 = [
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
            "kind": "Variable",
            "name": "limit",
            "variableName": "limit"
          },
          (v5/*: any*/),
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
            "selections": (v6/*: any*/),
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
            "kind": "Variable",
            "name": "first",
            "variableName": "limit"
          },
          (v5/*: any*/)
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
                "selections": (v6/*: any*/),
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "TotalResourceWithinResourceGroupRemainingAgentsQuery",
    "selections": (v7/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v4/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "TotalResourceWithinResourceGroupRemainingAgentsQuery",
    "selections": (v7/*: any*/)
  },
  "params": {
    "cacheID": "3820a5d66740fde49d460e12914d8fcc",
    "id": null,
    "metadata": {},
    "name": "TotalResourceWithinResourceGroupRemainingAgentsQuery",
    "operationKind": "query",
    "text": "query TotalResourceWithinResourceGroupRemainingAgentsQuery(\n  $resourceGroup: String\n  $isSuperAdmin: Boolean!\n  $agentNodeFilter: String!\n  $limit: Int!\n  $offset: Int!\n) {\n  agent_summary_list(limit: $limit, offset: $offset, status: \"ALIVE\", scaling_group: $resourceGroup, filter: \"schedulable == true\") @skip(if: $isSuperAdmin) {\n    items {\n      id\n      available_slots\n      occupied_slots\n    }\n  }\n  agent_nodes(filter: $agentNodeFilter, first: $limit, offset: $offset) @include(if: $isSuperAdmin) @since(version: \"24.12.0\") {\n    edges {\n      node {\n        id\n        available_slots\n        occupied_slots\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "191312af37b40de0984637eb396a6f87";

export default node;
