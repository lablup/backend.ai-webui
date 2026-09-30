/**
 * @generated SignedSource<<a4e6f8cb6996f2e674e38fc61f207fe4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DashboardPageQuery$variables = {
  agentNodeFilter: string;
  aliveAgentFilter: string;
  batchFilter?: string | null | undefined;
  inferenceFilter?: string | null | undefined;
  interactiveFilter?: string | null | undefined;
  isSuperAdmin: boolean;
  resourceGroup?: string | null | undefined;
  schedulableAgentFilter: string;
  scopeId?: any | null | undefined;
  skipTotalResourceWithinResourceGroup: boolean;
  systemFilter?: string | null | undefined;
};
export type DashboardPageQuery$data = {
  readonly AgentStatsFragment?: {
    readonly " $fragmentSpreads": FragmentRefs<"AgentStatsFragment">;
  } | null | undefined;
  readonly TotalResourceWithinResourceGroupFragment?: {
    readonly " $fragmentSpreads": FragmentRefs<"TotalResourceWithinResourceGroupFragment">;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"RecentlyCreatedSessionFragment" | "SessionCountDashboardItemFragment">;
};
export type DashboardPageQuery = {
  response: DashboardPageQuery$data;
  variables: DashboardPageQuery$variables;
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
  "name": "aliveAgentFilter"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "batchFilter"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "inferenceFilter"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "interactiveFilter"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isSuperAdmin"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroup"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "schedulableAgentFilter"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeId"
},
v9 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipTotalResourceWithinResourceGroup"
},
v10 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "systemFilter"
},
v11 = {
  "kind": "Variable",
  "name": "scopeId",
  "variableName": "scopeId"
},
v12 = {
  "kind": "Literal",
  "name": "first",
  "value": 0
},
v13 = {
  "kind": "Variable",
  "name": "scope_id",
  "variableName": "scopeId"
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v15 = [
  (v14/*: any*/)
],
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "priority",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status_info",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "occupied_slots",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "tag",
  "storageKey": null
},
v24 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "key",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "value",
    "storageKey": null
  }
],
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "idle_checks",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scaling_group",
  "storageKey": null
},
v27 = [
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
          (v16/*: any*/),
          (v17/*: any*/),
          (v18/*: any*/),
          (v19/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  (v14/*: any*/)
],
v28 = [
  (v16/*: any*/),
  (v19/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "available_slots",
    "storageKey": null
  },
  (v22/*: any*/),
  (v26/*: any*/)
],
v29 = {
  "kind": "Literal",
  "name": "first",
  "value": 1
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
      (v10/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "DashboardPageQuery",
    "selections": [
      {
        "args": [
          {
            "kind": "Variable",
            "name": "batchFilter",
            "variableName": "batchFilter"
          },
          {
            "kind": "Variable",
            "name": "inferenceFilter",
            "variableName": "inferenceFilter"
          },
          {
            "kind": "Variable",
            "name": "interactiveFilter",
            "variableName": "interactiveFilter"
          },
          (v11/*: any*/),
          {
            "kind": "Variable",
            "name": "systemFilter",
            "variableName": "systemFilter"
          }
        ],
        "kind": "FragmentSpread",
        "name": "SessionCountDashboardItemFragment"
      },
      {
        "args": [
          (v11/*: any*/)
        ],
        "kind": "FragmentSpread",
        "name": "RecentlyCreatedSessionFragment"
      },
      {
        "condition": "skipTotalResourceWithinResourceGroup",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "fragment": {
              "kind": "InlineFragment",
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
            "kind": "AliasedInlineFragmentSpread",
            "name": "TotalResourceWithinResourceGroupFragment"
          }
        ]
      },
      {
        "condition": "isSuperAdmin",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "args": [
                    {
                      "kind": "Variable",
                      "name": "aliveAgentFilter",
                      "variableName": "aliveAgentFilter"
                    },
                    {
                      "kind": "Variable",
                      "name": "schedulableAgentFilter",
                      "variableName": "schedulableAgentFilter"
                    }
                  ],
                  "kind": "FragmentSpread",
                  "name": "AgentStatsFragment"
                }
              ],
              "type": "Query",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "AgentStatsFragment"
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
      (v8/*: any*/),
      (v6/*: any*/),
      (v9/*: any*/),
      (v5/*: any*/),
      (v0/*: any*/),
      (v4/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v10/*: any*/),
      (v1/*: any*/),
      (v7/*: any*/)
    ],
    "kind": "Operation",
    "name": "DashboardPageQuery",
    "selections": [
      {
        "alias": "myInteractive",
        "args": [
          {
            "kind": "Variable",
            "name": "filter",
            "variableName": "interactiveFilter"
          },
          (v12/*: any*/),
          (v13/*: any*/)
        ],
        "concreteType": "ComputeSessionConnection",
        "kind": "LinkedField",
        "name": "compute_session_nodes",
        "plural": false,
        "selections": (v15/*: any*/),
        "storageKey": null
      },
      {
        "alias": "myBatch",
        "args": [
          {
            "kind": "Variable",
            "name": "filter",
            "variableName": "batchFilter"
          },
          (v12/*: any*/),
          (v13/*: any*/)
        ],
        "concreteType": "ComputeSessionConnection",
        "kind": "LinkedField",
        "name": "compute_session_nodes",
        "plural": false,
        "selections": (v15/*: any*/),
        "storageKey": null
      },
      {
        "alias": "myInference",
        "args": [
          {
            "kind": "Variable",
            "name": "filter",
            "variableName": "inferenceFilter"
          },
          (v12/*: any*/),
          (v13/*: any*/)
        ],
        "concreteType": "ComputeSessionConnection",
        "kind": "LinkedField",
        "name": "compute_session_nodes",
        "plural": false,
        "selections": (v15/*: any*/),
        "storageKey": null
      },
      {
        "alias": "myUpload",
        "args": [
          {
            "kind": "Variable",
            "name": "filter",
            "variableName": "systemFilter"
          },
          (v12/*: any*/),
          (v13/*: any*/)
        ],
        "concreteType": "ComputeSessionConnection",
        "kind": "LinkedField",
        "name": "compute_session_nodes",
        "plural": false,
        "selections": (v15/*: any*/),
        "storageKey": null
      },
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
          (v13/*: any*/)
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
                  (v16/*: any*/),
                  (v17/*: any*/),
                  (v18/*: any*/),
                  (v19/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "type",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "service_ports",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "user_id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "agent_ids",
                    "storageKey": null
                  },
                  (v20/*: any*/),
                  (v21/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "status_data",
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
                    "name": "created_at",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "starts_at",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "terminated_at",
                    "storageKey": null
                  },
                  (v22/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "requested_slots",
                    "storageKey": null
                  },
                  (v23/*: any*/),
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
                              (v16/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "ImageNode",
                                "kind": "LinkedField",
                                "name": "image",
                                "plural": false,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "base_image_name",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "version",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "architecture",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "KVPair",
                                    "kind": "LinkedField",
                                    "name": "tags",
                                    "plural": true,
                                    "selections": (v24/*: any*/),
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "KVPair",
                                    "kind": "LinkedField",
                                    "name": "labels",
                                    "plural": true,
                                    "selections": (v24/*: any*/),
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "registry",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "namespace",
                                    "storageKey": null
                                  },
                                  (v23/*: any*/),
                                  (v16/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v17/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "cluster_hostname",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "cluster_idx",
                                "storageKey": null
                              },
                              (v19/*: any*/),
                              (v21/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "agent_id",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "container_id",
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
                  (v25/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "project_id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserNode",
                    "kind": "LinkedField",
                    "name": "owner",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "email",
                        "storageKey": null
                      },
                      (v16/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "resource_opts",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "vfolder_mounts",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "VirtualFolderConnection",
                    "kind": "LinkedField",
                    "name": "vfolder_nodes",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "VirtualFolderEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "VirtualFolderNode",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v17/*: any*/),
                              (v18/*: any*/),
                              (v16/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v14/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v26/*: any*/),
                  (v25/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "startup_command",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ComputeSessionConnection",
                    "kind": "LinkedField",
                    "name": "dependees",
                    "plural": false,
                    "selections": (v27/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ComputeSessionConnection",
                    "kind": "LinkedField",
                    "name": "dependents",
                    "plural": false,
                    "selections": (v27/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "access_key",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "commit_status",
                    "storageKey": null
                  },
                  (v20/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "cluster_mode",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "cluster_size",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "result",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "domain_name",
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
        "condition": "skipTotalResourceWithinResourceGroup",
        "kind": "Condition",
        "passingValue": false,
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
                    "selections": (v28/*: any*/),
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
                        "selections": (v28/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  (v14/*: any*/)
                ],
                "storageKey": null
              }
            ]
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
            "args": null,
            "concreteType": "AgentStats",
            "kind": "LinkedField",
            "name": "agentStats",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "AgentResource",
                "kind": "LinkedField",
                "name": "totalResource",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "free",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "used",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "capacity",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": "aliveAgents",
            "args": [
              {
                "kind": "Variable",
                "name": "filter",
                "variableName": "aliveAgentFilter"
              },
              (v29/*: any*/)
            ],
            "concreteType": "AgentConnection",
            "kind": "LinkedField",
            "name": "agent_nodes",
            "plural": false,
            "selections": (v15/*: any*/),
            "storageKey": null
          },
          {
            "alias": "schedulableAgents",
            "args": [
              {
                "kind": "Variable",
                "name": "filter",
                "variableName": "schedulableAgentFilter"
              },
              (v29/*: any*/)
            ],
            "concreteType": "AgentConnection",
            "kind": "LinkedField",
            "name": "agent_nodes",
            "plural": false,
            "selections": (v15/*: any*/),
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "a087ef267b7ebcb55d0cb7c6376010af",
    "id": null,
    "metadata": {},
    "name": "DashboardPageQuery",
    "operationKind": "query",
    "text": "query DashboardPageQuery(\n  $scopeId: ScopeField\n  $resourceGroup: String\n  $skipTotalResourceWithinResourceGroup: Boolean!\n  $isSuperAdmin: Boolean!\n  $agentNodeFilter: String!\n  $interactiveFilter: String\n  $batchFilter: String\n  $inferenceFilter: String\n  $systemFilter: String\n  $aliveAgentFilter: String!\n  $schedulableAgentFilter: String!\n) {\n  ...SessionCountDashboardItemFragment_3INTnW\n  ...RecentlyCreatedSessionFragment_3vJUag\n  ...TotalResourceWithinResourceGroupFragment_2otDCj @skip(if: $skipTotalResourceWithinResourceGroup)\n  ...AgentStatsFragment_rQkRq @include(if: $isSuperAdmin)\n}\n\nfragment AgentStatsFragment_rQkRq on Query {\n  agentStats @since(version: \"25.15.0\") {\n    totalResource {\n      free\n      used\n      capacity\n    }\n  }\n  aliveAgents: agent_nodes(filter: $aliveAgentFilter, first: 1) @since(version: \"24.12.0\") {\n    count\n  }\n  schedulableAgents: agent_nodes(filter: $schedulableAgentFilter, first: 1) @since(version: \"24.12.0\") {\n    count\n  }\n}\n\nfragment AppLaunchConfirmationModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment AppLauncherModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  service_ports\n  access_key\n  ...useBackendAIAppLauncherFragment\n  ...SFTPConnectionInfoModalFragment\n  ...TensorboardPathModalFragment\n  ...AppLaunchConfirmationModalFragment\n}\n\nfragment BAIImageNodeSimpleTagFragment on ImageNode {\n  base_image_name\n  version\n  architecture\n  tags {\n    key\n    value\n  }\n  labels {\n    key\n    value\n  }\n  registry\n  namespace\n  tag\n}\n\nfragment BAISessionAgentIdsFragment on ComputeSessionNode {\n  agent_ids\n}\n\nfragment BAISessionClusterModeFragment on ComputeSessionNode {\n  cluster_mode\n  cluster_size\n}\n\nfragment BAISessionTypeTokenFragment on ComputeSessionNode {\n  type\n}\n\nfragment ConnectedKernelListFragment on KernelNode {\n  id\n  row_id\n  cluster_hostname\n  cluster_idx\n  cluster_role\n  status\n  status_info\n  agent_id\n  container_id\n}\n\nfragment ContainerCommitModalFragment on ComputeSessionNode {\n  id\n  name\n  row_id\n}\n\nfragment ContainerLogModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  status\n  access_key\n  kernel_nodes {\n    edges {\n      node {\n        id\n        row_id\n        container_id\n        cluster_idx\n        cluster_role\n        cluster_hostname\n      }\n    }\n  }\n}\n\nfragment EditSessionPriorityModalFragment on ComputeSessionNode {\n  id\n  name\n  priority @since(version: \"24.09.0\")\n}\n\nfragment EditableSessionNameFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  priority\n  user_id\n  status\n  project_id\n}\n\nfragment FolderLink_vfolderNode on VirtualFolderNode {\n  row_id\n  name\n  ...VFolderNodeIdenticonFragment\n}\n\nfragment MountedVFolderLinksFragment on ComputeSessionNode {\n  row_id\n  vfolder_nodes @since(version: \"25.4.0\") {\n    edges {\n      node {\n        ...FolderLink_vfolderNode\n        id\n      }\n    }\n  }\n  ...MountedVFolderLinksLegacyLazyFolderLinkFragment\n}\n\nfragment MountedVFolderLinksLegacyLazyFolderLinkFragment on ComputeSessionNode {\n  row_id\n  vfolder_mounts\n}\n\nfragment RecentlyCreatedSessionFragment_3vJUag on Query {\n  compute_session_nodes(first: 5, order: \"-created_at\", filter: \"status == \\\"running\\\"\", scope_id: $scopeId) {\n    edges {\n      node {\n        id\n        ...SessionNodesFragment\n      }\n    }\n  }\n}\n\nfragment SFTPConnectionInfoModalFragment on ComputeSessionNode {\n  row_id\n  vfolder_nodes @since(version: \"25.4.0\") {\n    edges {\n      node {\n        name\n        id\n      }\n    }\n  }\n}\n\nfragment SessionAccessKeyFragment on ComputeSessionNode {\n  access_key\n  user_id\n}\n\nfragment SessionActionButtonsFragment on ComputeSessionNode {\n  id\n  name\n  row_id\n  type\n  status\n  access_key\n  service_ports\n  commit_status\n  user_id\n  ...TerminateSessionModalFragment\n  ...ContainerLogModalFragment\n  ...ContainerCommitModalFragment\n  ...AppLauncherModalFragment\n  ...SFTPConnectionInfoModalFragment\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment SessionCountDashboardItemFragment_3INTnW on Query {\n  myInteractive: compute_session_nodes(first: 0, filter: $interactiveFilter, scope_id: $scopeId) {\n    count\n  }\n  myBatch: compute_session_nodes(first: 0, filter: $batchFilter, scope_id: $scopeId) {\n    count\n  }\n  myInference: compute_session_nodes(first: 0, filter: $inferenceFilter, scope_id: $scopeId) {\n    count\n  }\n  myUpload: compute_session_nodes(first: 0, filter: $systemFilter, scope_id: $scopeId) {\n    count\n  }\n}\n\nfragment SessionDetailContentFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  project_id\n  user_id\n  owner @since(version: \"25.13.0\") {\n    email\n    id\n  }\n  resource_opts\n  status\n  status_data\n  vfolder_mounts\n  vfolder_nodes @since(version: \"25.4.0\") {\n    edges {\n      node {\n        ...FolderLink_vfolderNode\n        id\n      }\n    }\n    count\n  }\n  created_at\n  terminated_at\n  scaling_group\n  agent_ids\n  requested_slots\n  occupied_slots\n  tag\n  idle_checks @since(version: \"24.12.0\")\n  type\n  startup_command\n  kernel_nodes {\n    edges {\n      node {\n        image {\n          ...BAIImageNodeSimpleTagFragment\n          id\n        }\n        ...ConnectedKernelListFragment\n        id\n      }\n    }\n  }\n  dependees {\n    edges {\n      node {\n        id\n        row_id\n        name\n        status\n      }\n    }\n    count\n  }\n  dependents {\n    edges {\n      node {\n        id\n        row_id\n        name\n        status\n      }\n    }\n    count\n  }\n  ...SessionStatusBadgeFragment\n  ...SessionActionButtonsFragment\n  ...BAISessionTypeTokenFragment\n  ...EditableSessionNameFragment\n  ...SessionReservationFragment\n  ...ContainerLogModalFragment\n  ...SessionUsageMonitorFragment\n  ...ContainerCommitModalFragment\n  ...SessionIdleChecksNodeFragment\n  ...SessionStatusDetailModalFragment\n  ...AppLauncherModalFragment\n  ...MountedVFolderLinksFragment\n  ...BAISessionAgentIdsFragment\n  ...BAISessionClusterModeFragment\n  ...SessionAccessKeyFragment\n}\n\nfragment SessionDetailDrawerFragment on ComputeSessionNode {\n  id\n  project_id\n  ...SessionDetailContentFragment\n}\n\nfragment SessionIdleChecksNodeFragment on ComputeSessionNode {\n  id\n  idle_checks\n  ...SessionReclamationStatusCellFragment\n}\n\nfragment SessionNodesFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  status\n  type\n  service_ports\n  user_id\n  agent_ids\n  priority @since(version: \"24.09.0\")\n  ...SessionStatusBadgeFragment\n  ...SessionReservationFragment\n  ...SessionSlotCellFragment\n  ...SessionReclamationStatusCellFragment\n  ...SessionUsageMonitorFragment\n  ...SessionDetailDrawerFragment\n  ...BAISessionAgentIdsFragment\n  ...BAISessionTypeTokenFragment\n  ...BAISessionClusterModeFragment\n  ...AppLauncherModalFragment\n  ...TerminateSessionModalFragment\n  ...EditSessionPriorityModalFragment\n  ...SessionAccessKeyFragment\n  kernel_nodes {\n    edges {\n      node {\n        image {\n          ...BAIImageNodeSimpleTagFragment\n          id\n        }\n        id\n      }\n    }\n  }\n  created_at\n  terminated_at\n  status_info\n  result\n  domain_name\n  scaling_group\n  project_id\n  owner @since(version: \"25.13.0\") {\n    email\n    id\n  }\n  dependees {\n    edges {\n      node {\n        row_id\n        name\n        id\n      }\n    }\n    count\n  }\n  dependents {\n    edges {\n      node {\n        row_id\n        name\n        id\n      }\n    }\n    count\n  }\n}\n\nfragment SessionReclamationStatusCellFragment on ComputeSessionNode {\n  id\n  idle_checks\n  ...SessionReclamationStatusPopoverFragment\n}\n\nfragment SessionReclamationStatusPopoverFragment on ComputeSessionNode {\n  id\n  idle_checks\n}\n\nfragment SessionReservationFragment on ComputeSessionNode {\n  id\n  created_at\n  starts_at\n  terminated_at\n}\n\nfragment SessionSlotCellFragment on ComputeSessionNode {\n  id\n  status\n  occupied_slots\n  requested_slots\n  tag\n  ...useSessionNodeLiveStatSessionFragment\n}\n\nfragment SessionStatusBadgeFragment on ComputeSessionNode {\n  id\n  status\n  status_info\n  status_data\n  queue_position @since(version: \"25.13.0\")\n}\n\nfragment SessionStatusDetailModalFragment on ComputeSessionNode {\n  id\n  name\n  status\n  status_info\n  status_data\n  starts_at\n  ...SessionStatusBadgeFragment\n}\n\nfragment SessionUsageMonitorFragment on ComputeSessionNode {\n  occupied_slots\n  ...useSessionNodeLiveStatSessionFragment\n}\n\nfragment TensorboardPathModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment TerminateSessionModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  scaling_group\n  access_key\n  project_id\n  kernel_nodes {\n    edges {\n      node {\n        container_id\n        agent_id\n        id\n      }\n    }\n  }\n}\n\nfragment TotalResourceWithinResourceGroupFragment_2otDCj on Query {\n  agent_summary_list(limit: 1000, offset: 0, status: \"ALIVE\", scaling_group: $resourceGroup, filter: \"schedulable == true\") @skip(if: $isSuperAdmin) {\n    items {\n      id\n      status\n      available_slots\n      occupied_slots\n      scaling_group\n    }\n    total_count\n  }\n  agent_nodes(filter: $agentNodeFilter, first: 100) @include(if: $isSuperAdmin) @since(version: \"24.12.0\") {\n    edges {\n      node {\n        id\n        status\n        available_slots\n        occupied_slots\n        scaling_group\n      }\n    }\n    count\n  }\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n\nfragment useBackendAIAppLauncherFragment on ComputeSessionNode {\n  name\n  row_id\n  vfolder_mounts\n  scaling_group\n  project_id\n  service_ports\n}\n\nfragment useSessionNodeLiveStatSessionFragment on ComputeSessionNode {\n  id\n  kernel_nodes {\n    edges {\n      node {\n        live_stat\n        cluster_role\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "da17888a1da955602d3144ba03c312ea";

export default node;
