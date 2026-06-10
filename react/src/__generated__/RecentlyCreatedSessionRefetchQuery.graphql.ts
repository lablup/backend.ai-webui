/**
 * @generated SignedSource<<23bcd008cd7bb1f0ead1aeef633967ac>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RecentlyCreatedSessionRefetchQuery$variables = {
  scopeId?: any | null | undefined;
};
export type RecentlyCreatedSessionRefetchQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"RecentlyCreatedSessionFragment">;
};
export type RecentlyCreatedSessionRefetchQuery = {
  response: RecentlyCreatedSessionRefetchQuery$data;
  variables: RecentlyCreatedSessionRefetchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scopeId"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status_info",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "tag",
  "storageKey": null
},
v7 = [
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
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v9 = [
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
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  (v8/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RecentlyCreatedSessionRefetchQuery",
    "selections": [
      {
        "args": [
          {
            "kind": "Variable",
            "name": "scopeId",
            "variableName": "scopeId"
          }
        ],
        "kind": "FragmentSpread",
        "name": "RecentlyCreatedSessionFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RecentlyCreatedSessionRefetchQuery",
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
          {
            "kind": "Variable",
            "name": "scope_id",
            "variableName": "scopeId"
          }
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
                  (v1/*: any*/),
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
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
                  (v5/*: any*/),
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
                  (v6/*: any*/),
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
                              (v1/*: any*/),
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
                                  (v3/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "KVPair",
                                    "kind": "LinkedField",
                                    "name": "tags",
                                    "plural": true,
                                    "selections": (v7/*: any*/),
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "KVPair",
                                    "kind": "LinkedField",
                                    "name": "labels",
                                    "plural": true,
                                    "selections": (v7/*: any*/),
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
                                  (v6/*: any*/),
                                  (v1/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v2/*: any*/),
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
                              (v4/*: any*/),
                              (v5/*: any*/),
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
                      (v1/*: any*/)
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
                              (v2/*: any*/),
                              (v3/*: any*/),
                              (v1/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v8/*: any*/)
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
                    "selections": (v9/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ComputeSessionConnection",
                    "kind": "LinkedField",
                    "name": "dependents",
                    "plural": false,
                    "selections": (v9/*: any*/),
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "7fbfb840d55fe31e41ba3cdb9e607ea1",
    "id": null,
    "metadata": {},
    "name": "RecentlyCreatedSessionRefetchQuery",
    "operationKind": "query",
    "text": "query RecentlyCreatedSessionRefetchQuery(\n  $scopeId: ScopeField\n) {\n  ...RecentlyCreatedSessionFragment_3vJUag\n}\n\nfragment AppLaunchConfirmationModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment AppLauncherModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  service_ports\n  access_key\n  ...useBackendAIAppLauncherFragment\n  ...SFTPConnectionInfoModalFragment\n  ...TensorboardPathModalFragment\n  ...AppLaunchConfirmationModalFragment\n}\n\nfragment BAISessionAgentIdsFragment on ComputeSessionNode {\n  agent_ids\n}\n\nfragment BAISessionClusterModeFragment on ComputeSessionNode {\n  cluster_mode\n  cluster_size\n}\n\nfragment BAISessionTypeTagFragment on ComputeSessionNode {\n  type\n}\n\nfragment ConnectedKernelListFragment on KernelNode {\n  id\n  row_id\n  cluster_hostname\n  cluster_idx\n  cluster_role\n  status\n  status_info\n  agent_id\n  container_id\n}\n\nfragment ContainerCommitModalFragment on ComputeSessionNode {\n  id\n  name\n  row_id\n}\n\nfragment ContainerLogModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  status\n  access_key\n  kernel_nodes {\n    edges {\n      node {\n        id\n        row_id\n        container_id\n        cluster_idx\n        cluster_role\n        cluster_hostname\n      }\n    }\n  }\n}\n\nfragment EditableSessionNameFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  priority\n  user_id\n  status\n  project_id\n}\n\nfragment FolderLink_vfolderNode on VirtualFolderNode {\n  row_id\n  name\n  ...VFolderNodeIdenticonFragment\n}\n\nfragment ImageNodeSimpleTagFragment on ImageNode {\n  base_image_name\n  version\n  architecture\n  name\n  tags {\n    key\n    value\n  }\n  labels {\n    key\n    value\n  }\n  registry\n  namespace\n  tag\n}\n\nfragment MountedVFolderLinksFragment on ComputeSessionNode {\n  row_id\n  vfolder_nodes @since(version: \"25.4.0\") {\n    edges {\n      node {\n        ...FolderLink_vfolderNode\n        id\n      }\n    }\n  }\n  ...MountedVFolderLinksLegacyLazyFolderLinkFragment\n}\n\nfragment MountedVFolderLinksLegacyLazyFolderLinkFragment on ComputeSessionNode {\n  row_id\n  vfolder_mounts\n}\n\nfragment RecentlyCreatedSessionFragment_3vJUag on Query {\n  compute_session_nodes(first: 5, order: \"-created_at\", filter: \"status == \\\"running\\\"\", scope_id: $scopeId) {\n    edges {\n      node {\n        id\n        ...SessionNodesFragment\n      }\n    }\n  }\n}\n\nfragment SFTPConnectionInfoModalFragment on ComputeSessionNode {\n  row_id\n  vfolder_nodes @since(version: \"25.4.0\") {\n    edges {\n      node {\n        name\n        id\n      }\n    }\n  }\n}\n\nfragment SessionActionButtonsFragment on ComputeSessionNode {\n  id\n  name\n  row_id\n  type\n  status\n  access_key\n  service_ports\n  commit_status\n  user_id\n  ...TerminateSessionModalFragment\n  ...ContainerLogModalFragment\n  ...ContainerCommitModalFragment\n  ...AppLauncherModalFragment\n  ...SFTPConnectionInfoModalFragment\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment SessionDetailContentFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  project_id\n  user_id\n  owner @since(version: \"25.13.0\") {\n    email\n    id\n  }\n  resource_opts\n  status\n  status_data\n  vfolder_mounts\n  vfolder_nodes @since(version: \"25.4.0\") {\n    edges {\n      node {\n        ...FolderLink_vfolderNode\n        id\n      }\n    }\n    count\n  }\n  created_at\n  terminated_at\n  scaling_group\n  agent_ids\n  requested_slots\n  tag\n  idle_checks @since(version: \"24.12.0\")\n  type\n  startup_command\n  kernel_nodes {\n    edges {\n      node {\n        image {\n          ...ImageNodeSimpleTagFragment\n          id\n        }\n        ...ConnectedKernelListFragment\n        id\n      }\n    }\n  }\n  dependees {\n    edges {\n      node {\n        id\n        row_id\n        name\n        status\n      }\n    }\n    count\n  }\n  dependents {\n    edges {\n      node {\n        id\n        row_id\n        name\n        status\n      }\n    }\n    count\n  }\n  ...SessionStatusTagFragment\n  ...SessionActionButtonsFragment\n  ...BAISessionTypeTagFragment\n  ...EditableSessionNameFragment\n  ...SessionReservationFragment\n  ...ContainerLogModalFragment\n  ...SessionUsageMonitorFragment\n  ...ContainerCommitModalFragment\n  ...SessionIdleChecksNodeFragment\n  ...SessionStatusDetailModalFragment\n  ...AppLauncherModalFragment\n  ...MountedVFolderLinksFragment\n  ...BAISessionAgentIdsFragment\n  ...BAISessionClusterModeFragment\n}\n\nfragment SessionDetailDrawerFragment on ComputeSessionNode {\n  id\n  project_id\n  ...SessionDetailContentFragment\n}\n\nfragment SessionIdleChecksNodeFragment on ComputeSessionNode {\n  id\n  idle_checks @since(version: \"24.12.0\")\n}\n\nfragment SessionNodesFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  status\n  type\n  service_ports\n  user_id\n  agent_ids\n  ...SessionStatusTagFragment\n  ...SessionReservationFragment\n  ...SessionSlotCellFragment\n  ...SessionUsageMonitorFragment\n  ...SessionDetailDrawerFragment\n  ...BAISessionAgentIdsFragment\n  ...BAISessionTypeTagFragment\n  ...BAISessionClusterModeFragment\n  ...AppLauncherModalFragment\n  ...TerminateSessionModalFragment\n  kernel_nodes {\n    edges {\n      node {\n        image {\n          ...ImageNodeSimpleTagFragment\n          id\n        }\n        id\n      }\n    }\n  }\n  created_at\n  scaling_group\n  project_id\n  owner @since(version: \"25.13.0\") {\n    email\n    id\n  }\n  dependees {\n    edges {\n      node {\n        row_id\n        name\n        id\n      }\n    }\n    count\n  }\n  dependents {\n    edges {\n      node {\n        row_id\n        name\n        id\n      }\n    }\n    count\n  }\n}\n\nfragment SessionReservationFragment on ComputeSessionNode {\n  id\n  created_at\n  starts_at\n  terminated_at\n}\n\nfragment SessionSlotCellFragment on ComputeSessionNode {\n  id\n  status\n  occupied_slots\n  requested_slots\n  tag\n  ...useSessionNodeLiveStatSessionFragment\n}\n\nfragment SessionStatusDetailModalFragment on ComputeSessionNode {\n  id\n  name\n  status\n  status_info\n  status_data\n  starts_at\n  ...SessionStatusTagFragment\n}\n\nfragment SessionStatusTagFragment on ComputeSessionNode {\n  id\n  status\n  status_info\n  status_data\n  queue_position @since(version: \"25.13.0\")\n}\n\nfragment SessionUsageMonitorFragment on ComputeSessionNode {\n  occupied_slots\n  ...useSessionNodeLiveStatSessionFragment\n}\n\nfragment TensorboardPathModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment TerminateSessionModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  scaling_group\n  access_key\n  project_id\n  kernel_nodes {\n    edges {\n      node {\n        container_id\n        agent_id\n        id\n      }\n    }\n  }\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n\nfragment useBackendAIAppLauncherFragment on ComputeSessionNode {\n  name\n  row_id\n  vfolder_mounts\n  scaling_group\n  project_id\n  service_ports\n}\n\nfragment useSessionNodeLiveStatSessionFragment on ComputeSessionNode {\n  id\n  kernel_nodes {\n    edges {\n      node {\n        live_stat\n        cluster_role\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "aeaa38c05c8fe2c9a07946ed4a3fe214";

export default node;
