/**
 * @generated SignedSource<<322989c29a5535d93dac14253f1d3e9c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type TotalResourceWithinResourceGroupRemainingAgentsQuery$variables = {
  isSuperAdmin: boolean;
  limit: number;
  offset: number;
  resourceGroup?: string | null | undefined;
};
export type TotalResourceWithinResourceGroupRemainingAgentsQuery$data = {
  readonly agent_summary_list?: {
    readonly items: ReadonlyArray<{
      readonly available_slots: string | null | undefined;
      readonly id: string | null | undefined;
      readonly occupied_slots: string | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly agentsV2?: {
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
};
export type TotalResourceWithinResourceGroupRemainingAgentsQuery = {
  response: TotalResourceWithinResourceGroupRemainingAgentsQuery$data;
  variables: TotalResourceWithinResourceGroupRemainingAgentsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isSuperAdmin"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroup"
},
v4 = {
  "kind": "Variable",
  "name": "limit",
  "variableName": "limit"
},
v5 = {
  "kind": "Variable",
  "name": "offset",
  "variableName": "offset"
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
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
          (v4/*: any*/),
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
            "selections": [
              (v6/*: any*/),
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
          (v4/*: any*/),
          (v5/*: any*/),
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
                  (v6/*: any*/),
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
      (v3/*: any*/)
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
      (v3/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "TotalResourceWithinResourceGroupRemainingAgentsQuery",
    "selections": (v7/*: any*/)
  },
  "params": {
    "cacheID": "755aa29f61c0343328661dae63d3d47a",
    "id": null,
    "metadata": {},
    "name": "TotalResourceWithinResourceGroupRemainingAgentsQuery",
    "operationKind": "query",
    "text": "query TotalResourceWithinResourceGroupRemainingAgentsQuery(\n  $resourceGroup: String\n  $isSuperAdmin: Boolean!\n  $limit: Int!\n  $offset: Int!\n) {\n  agent_summary_list(limit: $limit, offset: $offset, status: \"ALIVE\", scaling_group: $resourceGroup, filter: \"schedulable == true\") @skip(if: $isSuperAdmin) {\n    items {\n      id\n      available_slots\n      occupied_slots\n    }\n  }\n  agentsV2(filter: {status: {equals: ALIVE}, schedulable: true, scalingGroup: {equals: $resourceGroup}}, orderBy: [{field: ID}], limit: $limit, offset: $offset) @include(if: $isSuperAdmin) {\n    edges {\n      node {\n        id\n        resourceInfo {\n          capacity\n          used\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f4f4f4c6082904fed1d43d7a33f8fbb3";

export default node;
