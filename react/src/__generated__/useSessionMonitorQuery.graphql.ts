/**
 * @generated SignedSource<<d14e58c1fed52fdd07c529601384b71c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type useSessionMonitorQuery$variables = {
  errorFilter?: string | null | undefined;
  filter?: string | null | undefined;
  first?: number | null | undefined;
  runningFilter?: string | null | undefined;
  scopeId?: any | null | undefined;
  startingFilter?: string | null | undefined;
  withBreakdown: boolean;
  withEntries: boolean;
  withErrors: boolean;
  withRows: boolean;
  withSlots: boolean;
  withStarting: boolean;
};
export type useSessionMonitorQuery$data = {
  readonly compute_session_nodes?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly created_at: string | null | undefined;
        readonly id: string;
        readonly idle_checks: string | null | undefined;
        readonly name: string | null | undefined;
        readonly occupied_slots?: string | null | undefined;
        readonly row?: {
          readonly " $fragmentSpreads": FragmentRefs<"SessionMonitorItemFragment">;
        } | null | undefined;
        readonly status: string | null | undefined;
        readonly user_id: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly errorCount?: {
    readonly count: number | null | undefined;
  } | null | undefined;
  readonly matching: {
    readonly count: number | null | undefined;
  } | null | undefined;
  readonly runningCount?: {
    readonly count: number | null | undefined;
  } | null | undefined;
  readonly startingCount?: {
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
  "name": "errorFilter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "runningFilter"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeId"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "startingFilter"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "withBreakdown"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "withEntries"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "withErrors"
},
v9 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "withRows"
},
v10 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "withSlots"
},
v11 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "withStarting"
},
v12 = {
  "kind": "Variable",
  "name": "filter",
  "variableName": "filter"
},
v13 = {
  "kind": "Literal",
  "name": "first",
  "value": 0
},
v14 = {
  "kind": "Variable",
  "name": "scope_id",
  "variableName": "scopeId"
},
v15 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v16 = {
  "alias": "matching",
  "args": [
    (v12/*: any*/),
    (v13/*: any*/),
    (v14/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v15/*: any*/),
  "storageKey": null
},
v17 = {
  "condition": "withBreakdown",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "runningCount",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "runningFilter"
        },
        (v13/*: any*/),
        (v14/*: any*/)
      ],
      "concreteType": "ComputeSessionConnection",
      "kind": "LinkedField",
      "name": "compute_session_nodes",
      "plural": false,
      "selections": (v15/*: any*/),
      "storageKey": null
    }
  ]
},
v18 = {
  "condition": "withStarting",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "startingCount",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "startingFilter"
        },
        (v13/*: any*/),
        (v14/*: any*/)
      ],
      "concreteType": "ComputeSessionConnection",
      "kind": "LinkedField",
      "name": "compute_session_nodes",
      "plural": false,
      "selections": (v15/*: any*/),
      "storageKey": null
    }
  ]
},
v19 = {
  "condition": "withErrors",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    {
      "alias": "errorCount",
      "args": [
        {
          "kind": "Variable",
          "name": "filter",
          "variableName": "errorFilter"
        },
        (v13/*: any*/),
        (v14/*: any*/)
      ],
      "concreteType": "ComputeSessionConnection",
      "kind": "LinkedField",
      "name": "compute_session_nodes",
      "plural": false,
      "selections": (v15/*: any*/),
      "storageKey": null
    }
  ]
},
v20 = [
  (v12/*: any*/),
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
  (v14/*: any*/)
],
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "created_at",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "user_id",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "idle_checks",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "occupied_slots",
  "storageKey": null
},
v28 = {
  "condition": "withSlots",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
    (v27/*: any*/)
  ]
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/),
      (v9/*: any*/),
      (v10/*: any*/),
      (v11/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useSessionMonitorQuery",
    "selections": [
      (v16/*: any*/),
      (v17/*: any*/),
      (v18/*: any*/),
      (v19/*: any*/),
      {
        "condition": "withEntries",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v20/*: any*/),
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
                      (v21/*: any*/),
                      (v22/*: any*/),
                      (v23/*: any*/),
                      (v24/*: any*/),
                      (v25/*: any*/),
                      (v26/*: any*/),
                      (v28/*: any*/),
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
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v4/*: any*/),
      (v1/*: any*/),
      (v3/*: any*/),
      (v5/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/),
      (v7/*: any*/),
      (v10/*: any*/),
      (v9/*: any*/),
      (v6/*: any*/),
      (v11/*: any*/),
      (v8/*: any*/)
    ],
    "kind": "Operation",
    "name": "useSessionMonitorQuery",
    "selections": [
      (v16/*: any*/),
      (v17/*: any*/),
      (v18/*: any*/),
      (v19/*: any*/),
      {
        "condition": "withEntries",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v20/*: any*/),
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
                      (v21/*: any*/),
                      (v22/*: any*/),
                      (v23/*: any*/),
                      (v24/*: any*/),
                      (v25/*: any*/),
                      (v26/*: any*/),
                      (v28/*: any*/),
                      {
                        "condition": "withRows",
                        "kind": "Condition",
                        "passingValue": true,
                        "selections": [
                          (v27/*: any*/),
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
                                      (v21/*: any*/),
                                      (v23/*: any*/)
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
      }
    ]
  },
  "params": {
    "cacheID": "278fc76bfb75d0f11ecda2d1e3e7fd66",
    "id": null,
    "metadata": {},
    "name": "useSessionMonitorQuery",
    "operationKind": "query",
    "text": "query useSessionMonitorQuery(\n  $scopeId: ScopeField\n  $filter: String\n  $runningFilter: String\n  $startingFilter: String\n  $errorFilter: String\n  $first: Int\n  $withEntries: Boolean!\n  $withSlots: Boolean!\n  $withRows: Boolean!\n  $withBreakdown: Boolean!\n  $withStarting: Boolean!\n  $withErrors: Boolean!\n) {\n  matching: compute_session_nodes(scope_id: $scopeId, filter: $filter, first: 0) {\n    count\n  }\n  runningCount: compute_session_nodes(scope_id: $scopeId, filter: $runningFilter, first: 0) @include(if: $withBreakdown) {\n    count\n  }\n  startingCount: compute_session_nodes(scope_id: $scopeId, filter: $startingFilter, first: 0) @include(if: $withStarting) {\n    count\n  }\n  errorCount: compute_session_nodes(scope_id: $scopeId, filter: $errorFilter, first: 0) @include(if: $withErrors) {\n    count\n  }\n  compute_session_nodes(scope_id: $scopeId, filter: $filter, order: \"-created_at\", first: $first) @include(if: $withEntries) {\n    edges {\n      node {\n        id\n        name\n        status\n        created_at\n        user_id\n        idle_checks\n        occupied_slots @include(if: $withSlots)\n        ...SessionMonitorItemFragment @include(if: $withRows)\n      }\n    }\n  }\n}\n\nfragment SessionMonitorItemFragment on ComputeSessionNode {\n  id\n  name\n  status\n  created_at\n  occupied_slots\n  requested_slots\n  ...SessionMonitorUtilizationBarsFragment\n  ...SessionStatusBadgeFragment\n}\n\nfragment SessionMonitorUtilizationBarsFragment on ComputeSessionNode {\n  occupied_slots\n  ...useSessionNodeLiveStatSessionFragment\n}\n\nfragment SessionStatusBadgeFragment on ComputeSessionNode {\n  id\n  status\n  status_info\n  queue_position\n  cluster_size\n  kernel_nodes {\n    edges {\n      node {\n        id\n        status\n      }\n    }\n  }\n}\n\nfragment useSessionNodeLiveStatSessionFragment on ComputeSessionNode {\n  id\n  kernel_nodes {\n    edges {\n      node {\n        live_stat\n        cluster_role\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "34cb245866ff6338b418d82efd68f70e";

export default node;
