/**
 * @generated SignedSource<<95f8382b01dee6e0ff9a3a00a71c89aa>>
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
        readonly status: string | null | undefined;
        readonly " $fragmentSpreads": FragmentRefs<"SessionMonitorItemFragment">;
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
  "kind": "Literal",
  "name": "first",
  "value": 0
},
v6 = {
  "kind": "Variable",
  "name": "scope_id",
  "variableName": "scopeId"
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v8 = [
  (v7/*: any*/)
],
v9 = {
  "alias": "runningCount",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "runningFilter"
    },
    (v5/*: any*/),
    (v6/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v8/*: any*/),
  "storageKey": null
},
v10 = {
  "alias": "startingCount",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "startingFilter"
    },
    (v5/*: any*/),
    (v6/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v8/*: any*/),
  "storageKey": null
},
v11 = [
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
  (v6/*: any*/)
],
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "created_at",
  "storageKey": null
},
v16 = {
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
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useSessionMonitorQuery",
    "selections": [
      (v9/*: any*/),
      (v10/*: any*/),
      {
        "alias": null,
        "args": (v11/*: any*/),
        "concreteType": "ComputeSessionConnection",
        "kind": "LinkedField",
        "name": "compute_session_nodes",
        "plural": false,
        "selections": [
          (v7/*: any*/),
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
                  (v12/*: any*/),
                  (v13/*: any*/),
                  (v14/*: any*/),
                  (v15/*: any*/),
                  (v16/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "SessionMonitorItemFragment"
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
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "useSessionMonitorQuery",
    "selections": [
      (v9/*: any*/),
      (v10/*: any*/),
      {
        "alias": null,
        "args": (v11/*: any*/),
        "concreteType": "ComputeSessionConnection",
        "kind": "LinkedField",
        "name": "compute_session_nodes",
        "plural": false,
        "selections": [
          (v7/*: any*/),
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
                  (v12/*: any*/),
                  (v13/*: any*/),
                  (v14/*: any*/),
                  (v15/*: any*/),
                  (v16/*: any*/),
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
                              (v12/*: any*/),
                              (v14/*: any*/)
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
    "cacheID": "34b22f023ca18eff7c9a0686bf01a14c",
    "id": null,
    "metadata": {},
    "name": "useSessionMonitorQuery",
    "operationKind": "query",
    "text": "query useSessionMonitorQuery(\n  $scopeId: ScopeField\n  $filter: String\n  $runningFilter: String\n  $startingFilter: String\n  $first: Int\n) {\n  runningCount: compute_session_nodes(scope_id: $scopeId, filter: $runningFilter, first: 0) {\n    count\n  }\n  startingCount: compute_session_nodes(scope_id: $scopeId, filter: $startingFilter, first: 0) {\n    count\n  }\n  compute_session_nodes(scope_id: $scopeId, filter: $filter, order: \"-created_at\", first: $first) {\n    count\n    edges {\n      node {\n        id\n        name\n        status\n        created_at\n        idle_checks\n        ...SessionMonitorItemFragment\n      }\n    }\n  }\n}\n\nfragment SessionMonitorItemFragment on ComputeSessionNode {\n  id\n  name\n  status\n  created_at\n  occupied_slots\n  requested_slots\n  ...SessionMonitorUtilizationBarsFragment\n  ...SessionStatusBadgeFragment\n}\n\nfragment SessionMonitorUtilizationBarsFragment on ComputeSessionNode {\n  occupied_slots\n  ...useSessionNodeLiveStatSessionFragment\n}\n\nfragment SessionStatusBadgeFragment on ComputeSessionNode {\n  id\n  status\n  status_info\n  queue_position\n  cluster_size\n  kernel_nodes {\n    edges {\n      node {\n        id\n        status\n      }\n    }\n  }\n}\n\nfragment useSessionNodeLiveStatSessionFragment on ComputeSessionNode {\n  id\n  kernel_nodes {\n    edges {\n      node {\n        live_stat\n        cluster_role\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "05dd245b87f069f8063643468d796655";

export default node;
