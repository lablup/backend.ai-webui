/**
 * @generated SignedSource<<7004ca34ef097f950555d364267859d5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type useSessionMonitorQuery$variables = {
  filter?: string | null | undefined;
  first?: number | null | undefined;
  runningFilter?: string | null | undefined;
  scopeId?: any | null | undefined;
  startingFilter?: string | null | undefined;
  withRows: boolean;
};
export type useSessionMonitorQuery$data = {
  readonly compute_session_nodes: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly created_at: string | null | undefined;
        readonly id: string;
        readonly idle_checks: string | null | undefined;
        readonly name: string | null | undefined;
        readonly row?: {
          readonly " $fragmentSpreads": FragmentRefs<"SessionMonitorItemFragment">;
        } | null | undefined;
        readonly status: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly runningCount: {
    readonly count: number | null | undefined;
  } | null | undefined;
  readonly startingCount: {
    readonly count: number | null | undefined;
  } | null | undefined;
};
export type useSessionMonitorQuery = {
  response: useSessionMonitorQuery$data;
  variables: useSessionMonitorQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "runningFilter"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeId"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "startingFilter"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "withRows"
},
v6 = {
  "kind": "Literal",
  "name": "first",
  "value": 0
},
v7 = {
  "kind": "Variable",
  "name": "scope_id",
  "variableName": "scopeId"
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v9 = [
  (v8/*: any*/)
],
v10 = {
  "alias": "runningCount",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "runningFilter"
    },
    (v6/*: any*/),
    (v7/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v11 = {
  "alias": "startingCount",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "startingFilter"
    },
    (v6/*: any*/),
    (v7/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v12 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  },
  {
    "kind": "Literal",
    "name": "order",
    "value": "-created_at"
  },
  (v7/*: any*/)
],
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "created_at",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "idle_checks",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useSessionMonitorQuery",
    "selections": [
      (v10/*: any*/),
      (v11/*: any*/),
      {
        "alias": null,
        "args": (v12/*: any*/),
        "concreteType": "ComputeSessionConnection",
        "kind": "LinkedField",
        "name": "compute_session_nodes",
        "plural": false,
        "selections": [
          (v8/*: any*/),
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
                  (v13/*: any*/),
                  (v14/*: any*/),
                  (v15/*: any*/),
                  (v16/*: any*/),
                  (v17/*: any*/),
                  {
                    "condition": "withRows",
                    "kind": "Condition",
                    "passingValue": true,
                    "selections": [
                      {
                        "fragment": {
                          "kind": "InlineFragment",
                          "selections": [
                            {
                              "args": null,
                              "kind": "FragmentSpread",
                              "name": "SessionMonitorItemFragment"
                            }
                          ],
                          "type": "ComputeSessionNode",
                          "abstractKey": null
                        },
                        "kind": "AliasedInlineFragmentSpread",
                        "name": "row"
                      }
                    ]
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
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/),
      (v4/*: any*/),
      (v1/*: any*/),
      (v5/*: any*/)
    ],
    "kind": "Operation",
    "name": "useSessionMonitorQuery",
    "selections": [
      (v10/*: any*/),
      (v11/*: any*/),
      {
        "alias": null,
        "args": (v12/*: any*/),
        "concreteType": "ComputeSessionConnection",
        "kind": "LinkedField",
        "name": "compute_session_nodes",
        "plural": false,
        "selections": [
          (v8/*: any*/),
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
                  (v13/*: any*/),
                  (v14/*: any*/),
                  (v15/*: any*/),
                  (v16/*: any*/),
                  (v17/*: any*/),
                  {
                    "condition": "withRows",
                    "kind": "Condition",
                    "passingValue": true,
                    "selections": [
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
                        "name": "requested_slots",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "KernelConnection",
                        "kind": "LinkedField",
                        "name": "kernel_nodes",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "KernelEdge",
                            "kind": "LinkedField",
                            "name": "edges",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "KernelNode",
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "live_stat",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "cluster_role",
                                    "storageKey": null
                                  },
                                  (v13/*: any*/),
                                  (v15/*: any*/)
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
                        "name": "status_info",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "queue_position",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "cluster_size",
                        "storageKey": null
                      }
                    ]
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
  },
  "params": {
    "cacheID": "85c752a69469cf7227cf3f18a6f6d3ba",
    "id": null,
    "metadata": {},
    "name": "useSessionMonitorQuery",
    "operationKind": "query",
    "text": "query useSessionMonitorQuery(\n  $scopeId: ScopeField\n  $filter: String\n  $runningFilter: String\n  $startingFilter: String\n  $first: Int\n  $withRows: Boolean!\n) {\n  runningCount: compute_session_nodes(scope_id: $scopeId, filter: $runningFilter, first: 0) {\n    count\n  }\n  startingCount: compute_session_nodes(scope_id: $scopeId, filter: $startingFilter, first: 0) {\n    count\n  }\n  compute_session_nodes(scope_id: $scopeId, filter: $filter, order: \"-created_at\", first: $first) {\n    count\n    edges {\n      node {\n        id\n        name\n        status\n        created_at\n        idle_checks\n        ...SessionMonitorItemFragment @include(if: $withRows)\n      }\n    }\n  }\n}\n\nfragment SessionMonitorItemFragment on ComputeSessionNode {\n  id\n  name\n  status\n  created_at\n  occupied_slots\n  requested_slots\n  ...SessionMonitorUtilizationBarsFragment\n  ...SessionStatusBadgeFragment\n}\n\nfragment SessionMonitorUtilizationBarsFragment on ComputeSessionNode {\n  occupied_slots\n  ...useSessionNodeLiveStatSessionFragment\n}\n\nfragment SessionStatusBadgeFragment on ComputeSessionNode {\n  id\n  status\n  status_info\n  queue_position\n  cluster_size\n  kernel_nodes {\n    edges {\n      node {\n        id\n        status\n      }\n    }\n  }\n}\n\nfragment useSessionNodeLiveStatSessionFragment on ComputeSessionNode {\n  id\n  kernel_nodes {\n    edges {\n      node {\n        live_stat\n        cluster_role\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0d3d8c46614175d4e2145f5944433748";

export default node;
