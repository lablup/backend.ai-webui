/**
 * @generated SignedSource<<d3eca38e6f19c17dd4e94df4bc9b9e33>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs, Result } from "relay-runtime";
export type ComputeSessionListPageQuery$variables = {
  allFilter?: string | null | undefined;
  batchFilter?: string | null | undefined;
  filter?: string | null | undefined;
  first?: number | null | undefined;
  inferenceFilter?: string | null | undefined;
  interactiveFilter?: string | null | undefined;
  offset?: number | null | undefined;
  order?: string | null | undefined;
  scopeId?: any | null | undefined;
  systemFilter?: string | null | undefined;
};
export type ComputeSessionListPageQuery$data = {
  readonly all: {
    readonly count: number | null | undefined;
  } | null | undefined;
  readonly batch: {
    readonly count: number | null | undefined;
  } | null | undefined;
  readonly computeSessionNodeResult: Result<{
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string;
        readonly " $fragmentSpreads": FragmentRefs<"SessionNodesFragment" | "TerminateSessionModalFragment">;
      };
    } | null | undefined>;
  } | null | undefined, unknown>;
  readonly inference: {
    readonly count: number | null | undefined;
  } | null | undefined;
  readonly interactive: {
    readonly count: number | null | undefined;
  } | null | undefined;
  readonly system: {
    readonly count: number | null | undefined;
  } | null | undefined;
};
export type ComputeSessionListPageQuery = {
  response: ComputeSessionListPageQuery$data;
  variables: ComputeSessionListPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "allFilter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "batchFilter"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v3 = {
  "defaultValue": 20,
  "kind": "LocalArgument",
  "name": "first"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "inferenceFilter"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "interactiveFilter"
},
v6 = {
  "defaultValue": 0,
  "kind": "LocalArgument",
  "name": "offset"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "order"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeId"
},
v9 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "systemFilter"
},
v10 = {
  "kind": "Variable",
  "name": "scope_id",
  "variableName": "scopeId"
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
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Variable",
    "name": "order",
    "variableName": "order"
  },
  (v10/*: any*/)
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
  "name": "count",
  "storageKey": null
},
v15 = {
  "kind": "Literal",
  "name": "first",
  "value": 0
},
v16 = {
  "kind": "Literal",
  "name": "offset",
  "value": 0
},
v17 = [
  (v14/*: any*/)
],
v18 = {
  "alias": "all",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "allFilter"
    },
    (v15/*: any*/),
    (v16/*: any*/),
    (v10/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v17/*: any*/),
  "storageKey": null
},
v19 = {
  "alias": "interactive",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "interactiveFilter"
    },
    (v15/*: any*/),
    (v16/*: any*/),
    (v10/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v17/*: any*/),
  "storageKey": null
},
v20 = {
  "alias": "inference",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "inferenceFilter"
    },
    (v15/*: any*/),
    (v16/*: any*/),
    (v10/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v17/*: any*/),
  "storageKey": null
},
v21 = {
  "alias": "batch",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "batchFilter"
    },
    (v15/*: any*/),
    (v16/*: any*/),
    (v10/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v17/*: any*/),
  "storageKey": null
},
v22 = {
  "alias": "system",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "systemFilter"
    },
    (v15/*: any*/),
    (v16/*: any*/),
    (v10/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v17/*: any*/),
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status_info",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "tag",
  "storageKey": null
},
v27 = [
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
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "idle_checks",
  "storageKey": null
},
v29 = [
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
          (v23/*: any*/),
          (v13/*: any*/),
          (v24/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  (v14/*: any*/)
];
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
    "name": "ComputeSessionListPageQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
          "alias": "computeSessionNodeResult",
          "args": (v11/*: any*/),
          "concreteType": "ComputeSessionConnection",
          "kind": "LinkedField",
          "name": "compute_session_nodes",
          "plural": false,
          "selections": [
            {
              "kind": "RequiredField",
              "field": {
                "alias": null,
                "args": null,
                "concreteType": "ComputeSessionEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "kind": "RequiredField",
                    "field": {
                      "alias": null,
                      "args": null,
                      "concreteType": "ComputeSessionNode",
                      "kind": "LinkedField",
                      "name": "node",
                      "plural": false,
                      "selections": [
                        {
                          "kind": "RequiredField",
                          "field": (v12/*: any*/),
                          "action": "THROW"
                        },
                        {
                          "kind": "RequiredField",
                          "field": (v13/*: any*/),
                          "action": "THROW"
                        },
                        {
                          "args": null,
                          "kind": "FragmentSpread",
                          "name": "SessionNodesFragment"
                        },
                        {
                          "args": null,
                          "kind": "FragmentSpread",
                          "name": "TerminateSessionModalFragment"
                        }
                      ],
                      "storageKey": null
                    },
                    "action": "THROW"
                  }
                ],
                "storageKey": null
              },
              "action": "THROW"
            },
            (v14/*: any*/)
          ],
          "storageKey": null
        },
        "to": "RESULT"
      },
      (v18/*: any*/),
      (v19/*: any*/),
      (v20/*: any*/),
      (v21/*: any*/),
      (v22/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v8/*: any*/),
      (v3/*: any*/),
      (v6/*: any*/),
      (v2/*: any*/),
      (v7/*: any*/),
      (v0/*: any*/),
      (v5/*: any*/),
      (v4/*: any*/),
      (v1/*: any*/),
      (v9/*: any*/)
    ],
    "kind": "Operation",
    "name": "ComputeSessionListPageQuery",
    "selections": [
      {
        "alias": "computeSessionNodeResult",
        "args": (v11/*: any*/),
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
                  (v12/*: any*/),
                  (v13/*: any*/),
                  (v23/*: any*/),
                  (v24/*: any*/),
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
                  (v25/*: any*/),
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
                  (v26/*: any*/),
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
                                  (v13/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "KVPair",
                                    "kind": "LinkedField",
                                    "name": "tags",
                                    "plural": true,
                                    "selections": (v27/*: any*/),
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "KVPair",
                                    "kind": "LinkedField",
                                    "name": "labels",
                                    "plural": true,
                                    "selections": (v27/*: any*/),
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
                                  (v26/*: any*/),
                                  (v12/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v23/*: any*/),
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
                              (v24/*: any*/),
                              (v25/*: any*/),
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
                  (v28/*: any*/),
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
                      (v12/*: any*/)
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
                              (v23/*: any*/),
                              (v13/*: any*/),
                              (v12/*: any*/)
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
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "scaling_group",
                    "storageKey": null
                  },
                  (v28/*: any*/),
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
                    "selections": (v29/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ComputeSessionConnection",
                    "kind": "LinkedField",
                    "name": "dependents",
                    "plural": false,
                    "selections": (v29/*: any*/),
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
                    "name": "priority",
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
                    "name": "cluster_size",
                    "storageKey": null
                  }
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
      (v18/*: any*/),
      (v19/*: any*/),
      (v20/*: any*/),
      (v21/*: any*/),
      (v22/*: any*/)
    ]
  },
  "params": {
    "cacheID": "3d6b5b097edd63bc304927dff6f61538",
    "id": null,
    "metadata": {},
    "name": "ComputeSessionListPageQuery",
    "operationKind": "query",
    "text": "query ComputeSessionListPageQuery(\n  $scopeId: ScopeField\n  $first: Int = 20\n  $offset: Int = 0\n  $filter: String\n  $order: String\n  $allFilter: String\n  $interactiveFilter: String\n  $inferenceFilter: String\n  $batchFilter: String\n  $systemFilter: String\n) {\n  computeSessionNodeResult: compute_session_nodes(scope_id: $scopeId, first: $first, offset: $offset, filter: $filter, order: $order) {\n    edges {\n      node {\n        id\n        name\n        ...SessionNodesFragment\n        ...TerminateSessionModalFragment\n      }\n    }\n    count\n  }\n  all: compute_session_nodes(scope_id: $scopeId, first: 0, offset: 0, filter: $allFilter) {\n    count\n  }\n  interactive: compute_session_nodes(scope_id: $scopeId, first: 0, offset: 0, filter: $interactiveFilter) {\n    count\n  }\n  inference: compute_session_nodes(scope_id: $scopeId, first: 0, offset: 0, filter: $inferenceFilter) {\n    count\n  }\n  batch: compute_session_nodes(scope_id: $scopeId, first: 0, offset: 0, filter: $batchFilter) {\n    count\n  }\n  system: compute_session_nodes(scope_id: $scopeId, first: 0, offset: 0, filter: $systemFilter) {\n    count\n  }\n}\n\nfragment AppLaunchConfirmationModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment AppLauncherModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  service_ports\n  access_key\n  ...useBackendAIAppLauncherFragment\n  ...SFTPConnectionInfoModalFragment\n  ...TensorboardPathModalFragment\n  ...AppLaunchConfirmationModalFragment\n}\n\nfragment BAISessionAgentIdsFragment on ComputeSessionNode {\n  agent_ids\n}\n\nfragment BAISessionClusterModeFragment on ComputeSessionNode {\n  cluster_mode\n  cluster_size\n}\n\nfragment BAISessionTypeTagFragment on ComputeSessionNode {\n  type\n}\n\nfragment ConnectedKernelListFragment on KernelNode {\n  id\n  row_id\n  cluster_hostname\n  cluster_idx\n  cluster_role\n  status\n  status_info\n  agent_id\n  container_id\n}\n\nfragment ContainerCommitModalFragment on ComputeSessionNode {\n  id\n  name\n  row_id\n}\n\nfragment ContainerLogModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  status\n  access_key\n  kernel_nodes {\n    edges {\n      node {\n        id\n        row_id\n        container_id\n        cluster_idx\n        cluster_role\n        cluster_hostname\n      }\n    }\n  }\n}\n\nfragment EditableSessionNameFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  priority\n  user_id\n  status\n  project_id\n}\n\nfragment FolderLink_vfolderNode on VirtualFolderNode {\n  row_id\n  name\n  ...VFolderNodeIdenticonFragment\n}\n\nfragment ImageNodeSimpleTagFragment on ImageNode {\n  base_image_name\n  version\n  architecture\n  name\n  tags {\n    key\n    value\n  }\n  labels {\n    key\n    value\n  }\n  registry\n  namespace\n  tag\n}\n\nfragment MountedVFolderLinksFragment on ComputeSessionNode {\n  row_id\n  vfolder_nodes @since(version: \"25.4.0\") {\n    edges {\n      node {\n        ...FolderLink_vfolderNode\n        id\n      }\n    }\n  }\n  ...MountedVFolderLinksLegacyLazyFolderLinkFragment\n}\n\nfragment MountedVFolderLinksLegacyLazyFolderLinkFragment on ComputeSessionNode {\n  row_id\n  vfolder_mounts\n}\n\nfragment SFTPConnectionInfoModalFragment on ComputeSessionNode {\n  row_id\n  vfolder_nodes @since(version: \"25.4.0\") {\n    edges {\n      node {\n        name\n        id\n      }\n    }\n  }\n}\n\nfragment SessionActionButtonsFragment on ComputeSessionNode {\n  id\n  name\n  row_id\n  type\n  status\n  access_key\n  service_ports\n  commit_status\n  user_id\n  ...TerminateSessionModalFragment\n  ...ContainerLogModalFragment\n  ...ContainerCommitModalFragment\n  ...AppLauncherModalFragment\n  ...SFTPConnectionInfoModalFragment\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment SessionDetailContentFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  project_id\n  user_id\n  owner @since(version: \"25.13.0\") {\n    email\n    id\n  }\n  resource_opts\n  status\n  status_data\n  vfolder_mounts\n  vfolder_nodes @since(version: \"25.4.0\") {\n    edges {\n      node {\n        ...FolderLink_vfolderNode\n        id\n      }\n    }\n    count\n  }\n  created_at\n  terminated_at\n  scaling_group\n  agent_ids\n  requested_slots\n  occupied_slots\n  tag\n  idle_checks @since(version: \"24.12.0\")\n  type\n  startup_command\n  kernel_nodes {\n    edges {\n      node {\n        image {\n          ...ImageNodeSimpleTagFragment\n          id\n        }\n        ...ConnectedKernelListFragment\n        id\n      }\n    }\n  }\n  dependees {\n    edges {\n      node {\n        id\n        row_id\n        name\n        status\n      }\n    }\n    count\n  }\n  dependents {\n    edges {\n      node {\n        id\n        row_id\n        name\n        status\n      }\n    }\n    count\n  }\n  ...SessionStatusTagFragment\n  ...SessionActionButtonsFragment\n  ...BAISessionTypeTagFragment\n  ...EditableSessionNameFragment\n  ...SessionReservationFragment\n  ...ContainerLogModalFragment\n  ...SessionUsageMonitorFragment\n  ...ContainerCommitModalFragment\n  ...SessionIdleChecksNodeFragment\n  ...SessionStatusDetailModalFragment\n  ...AppLauncherModalFragment\n  ...MountedVFolderLinksFragment\n  ...BAISessionAgentIdsFragment\n  ...BAISessionClusterModeFragment\n}\n\nfragment SessionDetailDrawerFragment on ComputeSessionNode {\n  id\n  project_id\n  ...SessionDetailContentFragment\n}\n\nfragment SessionIdleChecksNodeFragment on ComputeSessionNode {\n  id\n  idle_checks\n  ...SessionReclamationStatusCellFragment\n}\n\nfragment SessionNodesFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  status\n  type\n  service_ports\n  user_id\n  agent_ids\n  ...SessionStatusTagFragment\n  ...SessionReservationFragment\n  ...SessionSlotCellFragment\n  ...SessionReclamationStatusCellFragment\n  ...SessionUsageMonitorFragment\n  ...SessionDetailDrawerFragment\n  ...BAISessionAgentIdsFragment\n  ...BAISessionTypeTagFragment\n  ...BAISessionClusterModeFragment\n  ...AppLauncherModalFragment\n  ...TerminateSessionModalFragment\n  kernel_nodes {\n    edges {\n      node {\n        image {\n          ...ImageNodeSimpleTagFragment\n          id\n        }\n        id\n      }\n    }\n  }\n  created_at\n  scaling_group\n  project_id\n  owner @since(version: \"25.13.0\") {\n    email\n    id\n  }\n  dependees {\n    edges {\n      node {\n        row_id\n        name\n        id\n      }\n    }\n    count\n  }\n  dependents {\n    edges {\n      node {\n        row_id\n        name\n        id\n      }\n    }\n    count\n  }\n}\n\nfragment SessionReclamationStatusCellFragment on ComputeSessionNode {\n  id\n  idle_checks\n  ...SessionReclamationStatusPopoverFragment\n}\n\nfragment SessionReclamationStatusPopoverFragment on ComputeSessionNode {\n  id\n  idle_checks\n}\n\nfragment SessionReservationFragment on ComputeSessionNode {\n  id\n  created_at\n  starts_at\n  terminated_at\n}\n\nfragment SessionSlotCellFragment on ComputeSessionNode {\n  id\n  status\n  occupied_slots\n  requested_slots\n  tag\n  ...useSessionNodeLiveStatSessionFragment\n}\n\nfragment SessionStatusDetailModalFragment on ComputeSessionNode {\n  id\n  name\n  status\n  status_info\n  status_data\n  starts_at\n  ...SessionStatusTagFragment\n}\n\nfragment SessionStatusTagFragment on ComputeSessionNode {\n  id\n  status\n  status_info\n  status_data\n  queue_position @since(version: \"25.13.0\")\n}\n\nfragment SessionUsageMonitorFragment on ComputeSessionNode {\n  occupied_slots\n  ...useSessionNodeLiveStatSessionFragment\n}\n\nfragment TensorboardPathModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment TerminateSessionModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  scaling_group\n  access_key\n  project_id\n  kernel_nodes {\n    edges {\n      node {\n        container_id\n        agent_id\n        id\n      }\n    }\n  }\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n\nfragment useBackendAIAppLauncherFragment on ComputeSessionNode {\n  name\n  row_id\n  vfolder_mounts\n  scaling_group\n  project_id\n  service_ports\n}\n\nfragment useSessionNodeLiveStatSessionFragment on ComputeSessionNode {\n  id\n  kernel_nodes {\n    edges {\n      node {\n        live_stat\n        cluster_role\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "fd1971a2bd6b899a56cda390c054ddd3";

export default node;
