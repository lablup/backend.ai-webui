/**
 * @generated SignedSource<<77e9c8f85265617ab7389b222a77f3bb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AdminDashboardPageQuery$variables = {
  agentNodeFilter: string;
  aliveAgentFilter: string;
  isSuperAdmin: boolean;
  resourceGroup?: string | null | undefined;
  schedulableAgentFilter: string;
  scopeId?: any | null | undefined;
  skipTotalResourceWithinResourceGroup: boolean;
  withAgentStats: boolean;
  withRecentSessions: boolean;
  withSessionCount: boolean;
};
export type AdminDashboardPageQuery$data = {
  readonly AgentStatsFragment?: {
    readonly " $fragmentSpreads": FragmentRefs<"AgentStatsFragment">;
  } | null | undefined;
  readonly RecentlyCreatedSessionFragment?: {
    readonly " $fragmentSpreads": FragmentRefs<"RecentlyCreatedSessionFragment">;
  } | null | undefined;
  readonly SessionCountDashboardItemFragment?: {
    readonly " $fragmentSpreads": FragmentRefs<"SessionCountDashboardItemFragment">;
  } | null | undefined;
  readonly TotalResourceWithinResourceGroupFragment?: {
    readonly " $fragmentSpreads": FragmentRefs<"TotalResourceWithinResourceGroupFragment">;
  } | null | undefined;
};
export type AdminDashboardPageQuery = {
  response: AdminDashboardPageQuery$data;
  variables: AdminDashboardPageQuery$variables;
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
  "name": "isSuperAdmin"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroup"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "schedulableAgentFilter"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeId"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipTotalResourceWithinResourceGroup"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "withAgentStats"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "withRecentSessions"
},
v9 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "withSessionCount"
},
v10 = [
  {
    "kind": "Variable",
    "name": "scopeId",
    "variableName": "scopeId"
  }
],
v11 = {
  "kind": "Literal",
  "name": "first",
  "value": 0
},
v12 = {
  "kind": "Variable",
  "name": "scope_id",
  "variableName": "scopeId"
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v14 = [
  (v13/*: any*/)
],
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status_info",
  "storageKey": null
},
v20 = [
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
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "tag",
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
  "name": "scaling_group",
  "storageKey": null
},
v24 = [
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
          (v15/*: any*/),
          (v16/*: any*/),
          (v17/*: any*/),
          (v18/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  (v13/*: any*/)
],
v25 = [
  (v15/*: any*/),
  (v18/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "available_slots",
    "storageKey": null
  },
  (v22/*: any*/),
  (v23/*: any*/)
],
v26 = {
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
      (v9/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminDashboardPageQuery",
    "selections": [
      {
        "condition": "withSessionCount",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "args": (v10/*: any*/),
                  "kind": "FragmentSpread",
                  "name": "SessionCountDashboardItemFragment"
                }
              ],
              "type": "Query",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "SessionCountDashboardItemFragment"
          }
        ]
      },
      {
        "condition": "withRecentSessions",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "args": (v10/*: any*/),
                  "kind": "FragmentSpread",
                  "name": "RecentlyCreatedSessionFragment"
                }
              ],
              "type": "Query",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "RecentlyCreatedSessionFragment"
          }
        ]
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
        "condition": "withAgentStats",
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
      (v5/*: any*/),
      (v3/*: any*/),
      (v6/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v4/*: any*/),
      (v9/*: any*/),
      (v8/*: any*/),
      (v7/*: any*/)
    ],
    "kind": "Operation",
    "name": "AdminDashboardPageQuery",
    "selections": [
      {
        "condition": "withSessionCount",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": "myInteractive",
            "args": [
              {
                "kind": "Literal",
                "name": "filter",
                "value": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"interactive\""
              },
              (v11/*: any*/),
              (v12/*: any*/)
            ],
            "concreteType": "ComputeSessionConnection",
            "kind": "LinkedField",
            "name": "compute_session_nodes",
            "plural": false,
            "selections": (v14/*: any*/),
            "storageKey": null
          },
          {
            "alias": "myBatch",
            "args": [
              {
                "kind": "Literal",
                "name": "filter",
                "value": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"batch\""
              },
              (v11/*: any*/),
              (v12/*: any*/)
            ],
            "concreteType": "ComputeSessionConnection",
            "kind": "LinkedField",
            "name": "compute_session_nodes",
            "plural": false,
            "selections": (v14/*: any*/),
            "storageKey": null
          },
          {
            "alias": "myInference",
            "args": [
              {
                "kind": "Literal",
                "name": "filter",
                "value": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"inference\""
              },
              (v11/*: any*/),
              (v12/*: any*/)
            ],
            "concreteType": "ComputeSessionConnection",
            "kind": "LinkedField",
            "name": "compute_session_nodes",
            "plural": false,
            "selections": (v14/*: any*/),
            "storageKey": null
          },
          {
            "alias": "myUpload",
            "args": [
              {
                "kind": "Literal",
                "name": "filter",
                "value": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"system\""
              },
              (v11/*: any*/),
              (v12/*: any*/)
            ],
            "concreteType": "ComputeSessionConnection",
            "kind": "LinkedField",
            "name": "compute_session_nodes",
            "plural": false,
            "selections": (v14/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "condition": "withRecentSessions",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
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
              (v12/*: any*/)
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
                      (v15/*: any*/),
                      (v16/*: any*/),
                      (v17/*: any*/),
                      (v18/*: any*/),
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
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "priority",
                        "storageKey": null
                      },
                      (v19/*: any*/),
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
                                  (v15/*: any*/),
                                  (v18/*: any*/),
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
                                        "selections": (v20/*: any*/),
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "KVPair",
                                        "kind": "LinkedField",
                                        "name": "labels",
                                        "plural": true,
                                        "selections": (v20/*: any*/),
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
                                      (v21/*: any*/),
                                      (v15/*: any*/)
                                    ],
                                    "storageKey": null
                                  },
                                  (v16/*: any*/),
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
                      (v21/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "idle_checks",
                        "storageKey": null
                      },
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
                          (v15/*: any*/)
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
                                  (v16/*: any*/),
                                  (v17/*: any*/),
                                  (v15/*: any*/)
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          (v13/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v23/*: any*/),
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
                        "selections": (v24/*: any*/),
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ComputeSessionConnection",
                        "kind": "LinkedField",
                        "name": "dependents",
                        "plural": false,
                        "selections": (v24/*: any*/),
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
          }
        ]
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
                    "value": 100
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
                    "selections": (v25/*: any*/),
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
                        "selections": (v25/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  (v13/*: any*/)
                ],
                "storageKey": null
              }
            ]
          }
        ]
      },
      {
        "condition": "withAgentStats",
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
              (v26/*: any*/)
            ],
            "concreteType": "AgentConnection",
            "kind": "LinkedField",
            "name": "agent_nodes",
            "plural": false,
            "selections": (v14/*: any*/),
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
              (v26/*: any*/)
            ],
            "concreteType": "AgentConnection",
            "kind": "LinkedField",
            "name": "agent_nodes",
            "plural": false,
            "selections": (v14/*: any*/),
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "ad0f8c49fc1a62588097fd6f1828612e",
    "id": null,
    "metadata": {},
    "name": "AdminDashboardPageQuery",
    "operationKind": "query",
    "text": "query AdminDashboardPageQuery(\n  $scopeId: ScopeField\n  $resourceGroup: String\n  $skipTotalResourceWithinResourceGroup: Boolean!\n  $isSuperAdmin: Boolean!\n  $agentNodeFilter: String!\n  $aliveAgentFilter: String!\n  $schedulableAgentFilter: String!\n  $withSessionCount: Boolean!\n  $withRecentSessions: Boolean!\n  $withAgentStats: Boolean!\n) {\n  ...SessionCountDashboardItemFragment_3vJUag @include(if: $withSessionCount)\n  ...RecentlyCreatedSessionFragment_3vJUag @include(if: $withRecentSessions)\n  ...TotalResourceWithinResourceGroupFragment_2otDCj @skip(if: $skipTotalResourceWithinResourceGroup)\n  ...AgentStatsFragment_rQkRq @include(if: $withAgentStats)\n}\n\nfragment AgentStatsFragment_rQkRq on Query {\n  agentStats {\n    totalResource {\n      free\n      used\n      capacity\n    }\n  }\n  aliveAgents: agent_nodes(filter: $aliveAgentFilter, first: 1) {\n    count\n  }\n  schedulableAgents: agent_nodes(filter: $schedulableAgentFilter, first: 1) {\n    count\n  }\n}\n\nfragment AppLaunchConfirmationModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment AppLauncherModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  service_ports\n  access_key\n  ...useBackendAIAppLauncherFragment\n  ...SFTPConnectionInfoModalFragment\n  ...TensorboardPathModalFragment\n  ...AppLaunchConfirmationModalFragment\n}\n\nfragment BAIImageNodeSimpleTagFragment on ImageNode {\n  base_image_name\n  version\n  architecture\n  tags {\n    key\n    value\n  }\n  labels {\n    key\n    value\n  }\n  registry\n  namespace\n  tag\n}\n\nfragment BAISessionAgentIdsFragment on ComputeSessionNode {\n  agent_ids\n}\n\nfragment BAISessionClusterModeFragment on ComputeSessionNode {\n  cluster_mode\n  cluster_size\n}\n\nfragment BAISessionTypeTokenFragment on ComputeSessionNode {\n  type\n}\n\nfragment ConnectedKernelListFragment on KernelNode {\n  id\n  row_id\n  cluster_hostname\n  cluster_idx\n  cluster_role\n  status\n  status_info\n  agent_id\n  container_id\n}\n\nfragment ContainerCommitModalFragment on ComputeSessionNode {\n  id\n  name\n  row_id\n}\n\nfragment ContainerLogModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  status\n  access_key\n  kernel_nodes {\n    edges {\n      node {\n        id\n        row_id\n        container_id\n        cluster_idx\n        cluster_role\n        cluster_hostname\n      }\n    }\n  }\n}\n\nfragment EditSessionPriorityModalFragment on ComputeSessionNode {\n  id\n  name\n  priority\n}\n\nfragment EditableSessionNameFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  priority\n  user_id\n  status\n  project_id\n}\n\nfragment FolderLink_vfolderNode on VirtualFolderNode {\n  row_id\n  name\n  ...VFolderNodeIdenticonFragment\n}\n\nfragment MountedVFolderLinksFragment on ComputeSessionNode {\n  vfolder_nodes {\n    edges {\n      node {\n        ...FolderLink_vfolderNode\n        id\n      }\n    }\n  }\n}\n\nfragment RecentlyCreatedSessionFragment_3vJUag on Query {\n  compute_session_nodes(first: 5, order: \"-created_at\", filter: \"status == \\\"running\\\"\", scope_id: $scopeId) {\n    edges {\n      node {\n        id\n        ...SessionNodesFragment\n      }\n    }\n  }\n}\n\nfragment SFTPConnectionInfoModalFragment on ComputeSessionNode {\n  row_id\n  vfolder_nodes {\n    edges {\n      node {\n        name\n        id\n      }\n    }\n  }\n}\n\nfragment SessionAccessKeyFragment on ComputeSessionNode {\n  access_key\n  user_id\n}\n\nfragment SessionActionButtonsFragment on ComputeSessionNode {\n  id\n  name\n  row_id\n  type\n  status\n  access_key\n  service_ports\n  commit_status\n  user_id\n  ...TerminateSessionModalFragment\n  ...ContainerLogModalFragment\n  ...ContainerCommitModalFragment\n  ...AppLauncherModalFragment\n  ...SFTPConnectionInfoModalFragment\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment SessionCountDashboardItemFragment_3vJUag on Query {\n  myInteractive: compute_session_nodes(first: 0, filter: \"status != \\\"TERMINATED\\\" & status != \\\"CANCELLED\\\" & type == \\\"interactive\\\"\", scope_id: $scopeId) {\n    count\n  }\n  myBatch: compute_session_nodes(first: 0, filter: \"status != \\\"TERMINATED\\\" & status != \\\"CANCELLED\\\" & type == \\\"batch\\\"\", scope_id: $scopeId) {\n    count\n  }\n  myInference: compute_session_nodes(first: 0, filter: \"status != \\\"TERMINATED\\\" & status != \\\"CANCELLED\\\" & type == \\\"inference\\\"\", scope_id: $scopeId) {\n    count\n  }\n  myUpload: compute_session_nodes(first: 0, filter: \"status != \\\"TERMINATED\\\" & status != \\\"CANCELLED\\\" & type == \\\"system\\\"\", scope_id: $scopeId) {\n    count\n  }\n}\n\nfragment SessionDetailContentFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  project_id\n  user_id\n  owner {\n    email\n    id\n  }\n  resource_opts\n  status\n  vfolder_mounts\n  vfolder_nodes {\n    edges {\n      node {\n        ...FolderLink_vfolderNode\n        id\n      }\n    }\n    count\n  }\n  created_at\n  terminated_at\n  scaling_group\n  agent_ids\n  requested_slots\n  occupied_slots\n  tag\n  idle_checks\n  type\n  startup_command\n  kernel_nodes {\n    edges {\n      node {\n        image {\n          ...BAIImageNodeSimpleTagFragment\n          id\n        }\n        ...ConnectedKernelListFragment\n        id\n      }\n    }\n  }\n  dependees {\n    edges {\n      node {\n        id\n        row_id\n        name\n        status\n      }\n    }\n    count\n  }\n  dependents {\n    edges {\n      node {\n        id\n        row_id\n        name\n        status\n      }\n    }\n    count\n  }\n  ...SessionStatusBadgeFragment\n  ...SessionActionButtonsFragment\n  ...BAISessionTypeTokenFragment\n  ...EditableSessionNameFragment\n  ...SessionReservationFragment\n  ...ContainerLogModalFragment\n  ...SessionUsageMonitorFragment\n  ...ContainerCommitModalFragment\n  ...SessionIdleChecksNodeFragment\n  ...AppLauncherModalFragment\n  ...MountedVFolderLinksFragment\n  ...BAISessionAgentIdsFragment\n  ...BAISessionClusterModeFragment\n  ...SessionAccessKeyFragment\n}\n\nfragment SessionDetailDrawerFragment on ComputeSessionNode {\n  id\n  project_id\n  ...SessionDetailContentFragment\n}\n\nfragment SessionIdleChecksNodeFragment on ComputeSessionNode {\n  id\n  idle_checks\n  ...SessionReclamationStatusCellFragment\n}\n\nfragment SessionNodesFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  status\n  type\n  service_ports\n  user_id\n  agent_ids\n  priority\n  ...SessionStatusBadgeFragment\n  ...SessionReservationFragment\n  ...SessionSlotCellFragment\n  ...SessionReclamationStatusCellFragment\n  ...SessionUsageMonitorFragment\n  ...SessionDetailDrawerFragment\n  ...BAISessionAgentIdsFragment\n  ...BAISessionTypeTokenFragment\n  ...BAISessionClusterModeFragment\n  ...AppLauncherModalFragment\n  ...TerminateSessionModalFragment\n  ...EditSessionPriorityModalFragment\n  ...SessionAccessKeyFragment\n  kernel_nodes {\n    edges {\n      node {\n        image {\n          ...BAIImageNodeSimpleTagFragment\n          id\n        }\n        id\n      }\n    }\n  }\n  created_at\n  terminated_at\n  status_info\n  result\n  domain_name\n  scaling_group\n  project_id\n  owner {\n    email\n    id\n  }\n  dependees {\n    edges {\n      node {\n        row_id\n        name\n        id\n      }\n    }\n    count\n  }\n  dependents {\n    edges {\n      node {\n        row_id\n        name\n        id\n      }\n    }\n    count\n  }\n}\n\nfragment SessionReclamationStatusCellFragment on ComputeSessionNode {\n  id\n  idle_checks\n  ...SessionReclamationStatusPopoverFragment\n}\n\nfragment SessionReclamationStatusPopoverFragment on ComputeSessionNode {\n  id\n  idle_checks\n}\n\nfragment SessionReservationFragment on ComputeSessionNode {\n  id\n  created_at\n  starts_at\n  terminated_at\n}\n\nfragment SessionSlotCellFragment on ComputeSessionNode {\n  id\n  status\n  occupied_slots\n  requested_slots\n  tag\n  ...useSessionNodeLiveStatSessionFragment\n}\n\nfragment SessionStatusBadgeFragment on ComputeSessionNode {\n  id\n  status\n  status_info\n  queue_position\n  cluster_size\n  kernel_nodes {\n    edges {\n      node {\n        id\n        status\n      }\n    }\n  }\n}\n\nfragment SessionUsageMonitorFragment on ComputeSessionNode {\n  occupied_slots\n  ...useSessionNodeLiveStatSessionFragment\n}\n\nfragment TensorboardPathModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment TerminateSessionModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  scaling_group\n  access_key\n  project_id\n  kernel_nodes {\n    edges {\n      node {\n        container_id\n        agent_id\n        id\n      }\n    }\n  }\n}\n\nfragment TotalResourceWithinResourceGroupFragment_2otDCj on Query {\n  agent_summary_list(limit: 100, offset: 0, status: \"ALIVE\", scaling_group: $resourceGroup, filter: \"schedulable == true\") @skip(if: $isSuperAdmin) {\n    items {\n      id\n      status\n      available_slots\n      occupied_slots\n      scaling_group\n    }\n    total_count\n  }\n  agent_nodes(filter: $agentNodeFilter, first: 100) @include(if: $isSuperAdmin) {\n    edges {\n      node {\n        id\n        status\n        available_slots\n        occupied_slots\n        scaling_group\n      }\n    }\n    count\n  }\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n\nfragment useBackendAIAppLauncherFragment on ComputeSessionNode {\n  name\n  row_id\n  vfolder_mounts\n  scaling_group\n  project_id\n  service_ports\n}\n\nfragment useSessionNodeLiveStatSessionFragment on ComputeSessionNode {\n  id\n  kernel_nodes {\n    edges {\n      node {\n        live_stat\n        cluster_role\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d6a51ae3fe444f6f6546e339c809e757";

export default node;
