/**
 * @generated SignedSource<<459e04fff5fbfec6b18fadf15d6b0a5c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VFolderNodesTestQuery$variables = Record<PropertyKey, never>;
export type VFolderNodesTestQuery$data = {
  readonly vfolder_nodes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"VFolderNodesFragment">;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type VFolderNodesTestQuery = {
  response: VFolderNodesTestQuery$data;
  variables: VFolderNodesTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
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
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permissions",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v6 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "VirtualFolderConnection"
},
v7 = {
  "enumValues": null,
  "nullable": false,
  "plural": true,
  "type": "VirtualFolderEdge"
},
v8 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "VirtualFolderNode"
},
v9 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v10 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v11 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "DateTime"
},
v12 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "BigInt"
},
v13 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "UUID"
},
v14 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v15 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
},
v16 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "JSONString"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "VFolderNodesTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
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
                  (v1/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "VFolderNodesFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "vfolder_nodes(first:10)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "VFolderNodesTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
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
                  (v1/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "status",
                    "storageKey": null
                  },
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "host",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "quota_scope_id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "ownership_type",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "user",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "user_email",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "group",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "group_name",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "usage_mode",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "max_files",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "max_size",
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
                    "name": "last_used",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "num_files",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "cur_size",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "cloneable",
                    "storageKey": null
                  },
                  (v3/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "creator",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "permission",
                    "storageKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v5/*: any*/),
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
                            "name": "status_data",
                            "storageKey": null
                          },
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
                            "name": "access_key",
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
                            "name": "commit_status",
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
                            "name": "scaling_group",
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
                                        "name": "container_id",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "agent_id",
                                        "storageKey": null
                                      },
                                      (v1/*: any*/),
                                      (v4/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "cluster_idx",
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
                                        "kind": "ScalarField",
                                        "name": "cluster_hostname",
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
                                      (v1/*: any*/)
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
                            "name": "queue_position",
                            "storageKey": null
                          }
                        ],
                        "type": "ComputeSessionNode",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v5/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "VFolderMetadataInfo",
                            "kind": "LinkedField",
                            "name": "metadata",
                            "plural": false,
                            "selections": [
                              (v2/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "type": "VFolder",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v5/*: any*/)
                        ],
                        "type": "VirtualFolderNode",
                        "abstractKey": null
                      }
                    ],
                    "type": "Node",
                    "abstractKey": "__isNode"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "vfolder_nodes(first:10)"
      }
    ]
  },
  "params": {
    "cacheID": "fb50ec69874ddd1616433d8eefc80e57",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "vfolder_nodes": (v6/*: any*/),
        "vfolder_nodes.edges": (v7/*: any*/),
        "vfolder_nodes.edges.node": (v8/*: any*/),
        "vfolder_nodes.edges.node.__isNode": (v9/*: any*/),
        "vfolder_nodes.edges.node.__typename": (v9/*: any*/),
        "vfolder_nodes.edges.node.access_key": (v10/*: any*/),
        "vfolder_nodes.edges.node.cloneable": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Boolean"
        },
        "vfolder_nodes.edges.node.commit_status": (v10/*: any*/),
        "vfolder_nodes.edges.node.created_at": (v11/*: any*/),
        "vfolder_nodes.edges.node.creator": (v10/*: any*/),
        "vfolder_nodes.edges.node.cur_size": (v12/*: any*/),
        "vfolder_nodes.edges.node.group": (v13/*: any*/),
        "vfolder_nodes.edges.node.group_name": (v10/*: any*/),
        "vfolder_nodes.edges.node.host": (v10/*: any*/),
        "vfolder_nodes.edges.node.id": (v14/*: any*/),
        "vfolder_nodes.edges.node.kernel_nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "KernelConnection"
        },
        "vfolder_nodes.edges.node.kernel_nodes.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "KernelEdge"
        },
        "vfolder_nodes.edges.node.kernel_nodes.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "KernelNode"
        },
        "vfolder_nodes.edges.node.kernel_nodes.edges.node.agent_id": (v10/*: any*/),
        "vfolder_nodes.edges.node.kernel_nodes.edges.node.cluster_hostname": (v10/*: any*/),
        "vfolder_nodes.edges.node.kernel_nodes.edges.node.cluster_idx": (v15/*: any*/),
        "vfolder_nodes.edges.node.kernel_nodes.edges.node.cluster_role": (v10/*: any*/),
        "vfolder_nodes.edges.node.kernel_nodes.edges.node.container_id": (v10/*: any*/),
        "vfolder_nodes.edges.node.kernel_nodes.edges.node.id": (v14/*: any*/),
        "vfolder_nodes.edges.node.kernel_nodes.edges.node.row_id": (v13/*: any*/),
        "vfolder_nodes.edges.node.last_used": (v11/*: any*/),
        "vfolder_nodes.edges.node.max_files": (v15/*: any*/),
        "vfolder_nodes.edges.node.max_size": (v12/*: any*/),
        "vfolder_nodes.edges.node.metadata": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "VFolderMetadataInfo"
        },
        "vfolder_nodes.edges.node.metadata.name": (v9/*: any*/),
        "vfolder_nodes.edges.node.name": (v10/*: any*/),
        "vfolder_nodes.edges.node.num_files": (v15/*: any*/),
        "vfolder_nodes.edges.node.ownership_type": (v10/*: any*/),
        "vfolder_nodes.edges.node.permission": (v10/*: any*/),
        "vfolder_nodes.edges.node.permissions": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "VFolderPermissionValueField"
        },
        "vfolder_nodes.edges.node.project_id": (v13/*: any*/),
        "vfolder_nodes.edges.node.queue_position": (v15/*: any*/),
        "vfolder_nodes.edges.node.quota_scope_id": (v10/*: any*/),
        "vfolder_nodes.edges.node.row_id": (v13/*: any*/),
        "vfolder_nodes.edges.node.scaling_group": (v10/*: any*/),
        "vfolder_nodes.edges.node.service_ports": (v16/*: any*/),
        "vfolder_nodes.edges.node.status": (v10/*: any*/),
        "vfolder_nodes.edges.node.status_data": (v16/*: any*/),
        "vfolder_nodes.edges.node.status_info": (v10/*: any*/),
        "vfolder_nodes.edges.node.type": (v10/*: any*/),
        "vfolder_nodes.edges.node.usage_mode": (v10/*: any*/),
        "vfolder_nodes.edges.node.user": (v13/*: any*/),
        "vfolder_nodes.edges.node.user_email": (v10/*: any*/),
        "vfolder_nodes.edges.node.user_id": (v13/*: any*/),
        "vfolder_nodes.edges.node.vfolder_mounts": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "String"
        },
        "vfolder_nodes.edges.node.vfolder_nodes": (v6/*: any*/),
        "vfolder_nodes.edges.node.vfolder_nodes.edges": (v7/*: any*/),
        "vfolder_nodes.edges.node.vfolder_nodes.edges.node": (v8/*: any*/),
        "vfolder_nodes.edges.node.vfolder_nodes.edges.node.id": (v14/*: any*/),
        "vfolder_nodes.edges.node.vfolder_nodes.edges.node.name": (v10/*: any*/)
      }
    },
    "name": "VFolderNodesTestQuery",
    "operationKind": "query",
    "text": "query VFolderNodesTestQuery {\n  vfolder_nodes(first: 10) {\n    edges {\n      node {\n        id\n        ...VFolderNodesFragment\n      }\n    }\n  }\n}\n\nfragment AppLaunchConfirmationModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment AppLauncherModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  service_ports\n  access_key\n  ...useBackendAIAppLauncherFragment\n  ...SFTPConnectionInfoModalFragment\n  ...TensorboardPathModalFragment\n  ...AppLaunchConfirmationModalFragment\n}\n\nfragment BAIComputeSessionNodeNotificationItemFragment on ComputeSessionNode {\n  id\n  name\n  status\n  status_info\n  status_data\n  ...SessionActionButtonsFragment\n  ...SessionStatusTagFragment\n}\n\nfragment BAINodeNotificationItemFragment on Node {\n  __isNode: __typename\n  ... on ComputeSessionNode {\n    __typename\n    status\n    name\n    row_id\n    ...BAIComputeSessionNodeNotificationItemFragment\n  }\n  ... on VFolder {\n    __typename\n    ...BAIVirtualFolderNodeNotificationItemV2Fragment\n  }\n  ... on VirtualFolderNode {\n    __typename\n    status\n    ...BAIVirtualFolderNodeNotificationItemFragment\n  }\n  id\n}\n\nfragment BAIVirtualFolderNodeNotificationItemFragment on VirtualFolderNode {\n  row_id\n  id\n  name\n  status\n}\n\nfragment BAIVirtualFolderNodeNotificationItemV2Fragment on VFolder {\n  id\n  metadata {\n    name\n  }\n}\n\nfragment ContainerCommitModalFragment on ComputeSessionNode {\n  id\n  name\n  row_id\n}\n\nfragment ContainerLogModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  status\n  access_key\n  kernel_nodes {\n    edges {\n      node {\n        id\n        row_id\n        container_id\n        cluster_idx\n        cluster_role\n        cluster_hostname\n      }\n    }\n  }\n}\n\nfragment SFTPConnectionInfoModalFragment on ComputeSessionNode {\n  row_id\n  vfolder_nodes @since(version: \"25.4.0\") {\n    edges {\n      node {\n        name\n        id\n      }\n    }\n  }\n}\n\nfragment SessionActionButtonsFragment on ComputeSessionNode {\n  id\n  name\n  row_id\n  type\n  status\n  access_key\n  service_ports\n  commit_status\n  user_id\n  ...TerminateSessionModalFragment\n  ...ContainerLogModalFragment\n  ...ContainerCommitModalFragment\n  ...AppLauncherModalFragment\n  ...SFTPConnectionInfoModalFragment\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment SessionStatusTagFragment on ComputeSessionNode {\n  id\n  status\n  status_info\n  status_data\n  queue_position @since(version: \"25.13.0\")\n}\n\nfragment SharedFolderPermissionInfoModalFragment on VirtualFolderNode {\n  id\n  name\n  row_id\n  creator\n  ownership_type\n  user_email\n  permission\n  ...VFolderPermissionCellFragment\n}\n\nfragment TensorboardPathModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment TerminateSessionModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  scaling_group\n  access_key\n  project_id\n  kernel_nodes {\n    edges {\n      node {\n        container_id\n        agent_id\n        id\n      }\n    }\n  }\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n\nfragment VFolderNodesFragment on VirtualFolderNode {\n  id\n  status\n  name\n  host\n  quota_scope_id\n  ownership_type\n  user\n  user_email\n  group\n  group_name\n  usage_mode\n  max_files\n  max_size\n  created_at\n  last_used\n  num_files\n  cur_size\n  cloneable\n  permissions @since(version: \"24.09.0\")\n  ...VFolderPermissionCellFragment\n  ...VFolderNodeIdenticonFragment\n  ...SharedFolderPermissionInfoModalFragment\n  ...BAINodeNotificationItemFragment\n}\n\nfragment VFolderPermissionCellFragment on VirtualFolderNode {\n  permissions\n}\n\nfragment useBackendAIAppLauncherFragment on ComputeSessionNode {\n  name\n  row_id\n  vfolder_mounts\n  scaling_group\n  project_id\n  service_ports\n}\n"
  }
};
})();

(node as any).hash = "f970e31b3d2bb834321bb76306aeb93f";

export default node;
