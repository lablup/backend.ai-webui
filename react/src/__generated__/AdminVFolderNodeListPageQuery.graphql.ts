/**
 * @generated SignedSource<<91a4712f74854151135d6bc9041625d0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AdminVFolderNodeListPageQuery$variables = {
  filter?: string | null | undefined;
  filterForActiveCount?: string | null | undefined;
  filterForDeletedCount?: string | null | undefined;
  first?: number | null | undefined;
  offset?: number | null | undefined;
  order?: string | null | undefined;
  permission?: any | null | undefined;
};
export type AdminVFolderNodeListPageQuery$data = {
  readonly active: {
    readonly count: number | null | undefined;
  } | null | undefined;
  readonly deleted: {
    readonly count: number | null | undefined;
  } | null | undefined;
  readonly vfolder_nodes: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly permissions: ReadonlyArray<any | null | undefined> | null | undefined;
        readonly status: string | null | undefined;
        readonly " $fragmentSpreads": FragmentRefs<"BAIVFolderDeleteButtonFragment" | "DeleteVFolderModalFragment" | "EditableVFolderNameFragment" | "RestoreVFolderModalFragment" | "SharedFolderPermissionInfoModalFragment" | "VFolderNodeIdenticonFragment" | "VFolderNodesFragment">;
      };
    } | null | undefined>;
  } | null | undefined;
};
export type AdminVFolderNodeListPageQuery = {
  response: AdminVFolderNodeListPageQuery$data;
  variables: AdminVFolderNodeListPageQuery$variables;
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
  "name": "filterForActiveCount"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filterForDeletedCount"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "order"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "permission"
},
v7 = {
  "kind": "Variable",
  "name": "permission",
  "variableName": "permission"
},
v8 = [
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
  (v7/*: any*/)
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permissions",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v13 = {
  "kind": "Literal",
  "name": "first",
  "value": 0
},
v14 = {
  "kind": "Literal",
  "name": "offset",
  "value": 0
},
v15 = [
  (v12/*: any*/)
],
v16 = {
  "alias": "active",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "filterForActiveCount"
    },
    (v13/*: any*/),
    (v14/*: any*/),
    (v7/*: any*/)
  ],
  "concreteType": "VirtualFolderConnection",
  "kind": "LinkedField",
  "name": "vfolder_nodes",
  "plural": false,
  "selections": (v15/*: any*/),
  "storageKey": null
},
v17 = {
  "alias": "deleted",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "filterForDeletedCount"
    },
    (v13/*: any*/),
    (v14/*: any*/),
    (v7/*: any*/)
  ],
  "concreteType": "VirtualFolderConnection",
  "kind": "LinkedField",
  "name": "vfolder_nodes",
  "plural": false,
  "selections": (v15/*: any*/),
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
  "name": "row_id",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
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
      (v5/*: any*/),
      (v6/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminVFolderNodeListPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v8/*: any*/),
        "concreteType": "VirtualFolderConnection",
        "kind": "LinkedField",
        "name": "vfolder_nodes",
        "plural": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "concreteType": "VirtualFolderEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "kind": "RequiredField",
                  "field": {
                    "alias": null,
                    "args": null,
                    "concreteType": "VirtualFolderNode",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      {
                        "kind": "RequiredField",
                        "field": (v9/*: any*/),
                        "action": "THROW"
                      },
                      (v10/*: any*/),
                      (v11/*: any*/),
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "VFolderNodesFragment"
                      },
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "DeleteVFolderModalFragment"
                      },
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "EditableVFolderNameFragment"
                      },
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "RestoreVFolderModalFragment"
                      },
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "VFolderNodeIdenticonFragment"
                      },
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "SharedFolderPermissionInfoModalFragment"
                      },
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "BAIVFolderDeleteButtonFragment"
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
          (v12/*: any*/)
        ],
        "storageKey": null
      },
      (v16/*: any*/),
      (v17/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v4/*: any*/),
      (v3/*: any*/),
      (v0/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "AdminVFolderNodeListPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v8/*: any*/),
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
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v18/*: any*/),
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
                  (v11/*: any*/),
                  (v19/*: any*/),
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
                          (v20/*: any*/),
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
                                      (v9/*: any*/),
                                      (v19/*: any*/),
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
                                      (v18/*: any*/),
                                      (v9/*: any*/)
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
                          (v20/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "VFolderMetadataInfo",
                            "kind": "LinkedField",
                            "name": "metadata",
                            "plural": false,
                            "selections": [
                              (v18/*: any*/)
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
                          (v20/*: any*/)
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
          },
          (v12/*: any*/)
        ],
        "storageKey": null
      },
      (v16/*: any*/),
      (v17/*: any*/)
    ]
  },
  "params": {
    "cacheID": "d8850204541e90e662e6da1b08462675",
    "id": null,
    "metadata": {},
    "name": "AdminVFolderNodeListPageQuery",
    "operationKind": "query",
    "text": "query AdminVFolderNodeListPageQuery(\n  $offset: Int\n  $first: Int\n  $filter: String\n  $order: String\n  $permission: VFolderPermissionValueField\n  $filterForActiveCount: String\n  $filterForDeletedCount: String\n) {\n  vfolder_nodes(offset: $offset, first: $first, filter: $filter, order: $order, permission: $permission) {\n    edges {\n      node {\n        id\n        status\n        permissions\n        ...VFolderNodesFragment\n        ...DeleteVFolderModalFragment\n        ...EditableVFolderNameFragment\n        ...RestoreVFolderModalFragment\n        ...VFolderNodeIdenticonFragment\n        ...SharedFolderPermissionInfoModalFragment\n        ...BAIVFolderDeleteButtonFragment\n      }\n    }\n    count\n  }\n  active: vfolder_nodes(first: 0, offset: 0, filter: $filterForActiveCount, permission: $permission) {\n    count\n  }\n  deleted: vfolder_nodes(first: 0, offset: 0, filter: $filterForDeletedCount, permission: $permission) {\n    count\n  }\n}\n\nfragment AppLaunchConfirmationModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment AppLauncherModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  service_ports\n  access_key\n  ...useBackendAIAppLauncherFragment\n  ...SFTPConnectionInfoModalFragment\n  ...TensorboardPathModalFragment\n  ...AppLaunchConfirmationModalFragment\n}\n\nfragment BAIComputeSessionNodeNotificationItemFragment on ComputeSessionNode {\n  id\n  name\n  status\n  status_info\n  status_data\n  ...SessionActionButtonsFragment\n  ...SessionStatusTagFragment\n}\n\nfragment BAINodeNotificationItemFragment on Node {\n  __isNode: __typename\n  ... on ComputeSessionNode {\n    __typename\n    status\n    name\n    row_id\n    ...BAIComputeSessionNodeNotificationItemFragment\n  }\n  ... on VFolder {\n    __typename\n    ...BAIVirtualFolderNodeNotificationItemV2Fragment\n  }\n  ... on VirtualFolderNode {\n    __typename\n    status\n    ...BAIVirtualFolderNodeNotificationItemFragment\n  }\n  id\n}\n\nfragment BAIVFolderDeleteButtonFragment on VirtualFolderNode {\n  permissions\n}\n\nfragment BAIVirtualFolderNodeNotificationItemFragment on VirtualFolderNode {\n  row_id\n  id\n  name\n  status\n}\n\nfragment BAIVirtualFolderNodeNotificationItemV2Fragment on VFolder {\n  id\n  metadata {\n    name\n  }\n}\n\nfragment ContainerCommitModalFragment on ComputeSessionNode {\n  id\n  name\n  row_id\n}\n\nfragment ContainerLogModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  status\n  access_key\n  kernel_nodes {\n    edges {\n      node {\n        id\n        row_id\n        container_id\n        cluster_idx\n        cluster_role\n        cluster_hostname\n      }\n    }\n  }\n}\n\nfragment DeleteVFolderModalFragment on VirtualFolderNode {\n  id\n  name\n  permissions\n}\n\nfragment EditableVFolderNameFragment on VirtualFolderNode {\n  id\n  name\n  user\n  group\n  status\n}\n\nfragment RestoreVFolderModalFragment on VirtualFolderNode {\n  id\n  name\n}\n\nfragment SFTPConnectionInfoModalFragment on ComputeSessionNode {\n  row_id\n  vfolder_nodes @since(version: \"25.4.0\") {\n    edges {\n      node {\n        name\n        id\n      }\n    }\n  }\n}\n\nfragment SessionActionButtonsFragment on ComputeSessionNode {\n  id\n  name\n  row_id\n  type\n  status\n  access_key\n  service_ports\n  commit_status\n  user_id\n  ...TerminateSessionModalFragment\n  ...ContainerLogModalFragment\n  ...ContainerCommitModalFragment\n  ...AppLauncherModalFragment\n  ...SFTPConnectionInfoModalFragment\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment SessionStatusTagFragment on ComputeSessionNode {\n  id\n  status\n  status_info\n  status_data\n  queue_position @since(version: \"25.13.0\")\n}\n\nfragment SharedFolderPermissionInfoModalFragment on VirtualFolderNode {\n  id\n  name\n  row_id\n  creator\n  ownership_type\n  user_email\n  permission\n  ...VFolderPermissionCellFragment\n}\n\nfragment TensorboardPathModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment TerminateSessionModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  scaling_group\n  access_key\n  project_id\n  kernel_nodes {\n    edges {\n      node {\n        container_id\n        agent_id\n        id\n      }\n    }\n  }\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n\nfragment VFolderNodesFragment on VirtualFolderNode {\n  id\n  status\n  name\n  host\n  quota_scope_id\n  ownership_type\n  user\n  user_email\n  group\n  group_name\n  usage_mode\n  max_files\n  max_size\n  created_at\n  last_used\n  num_files\n  cur_size\n  cloneable\n  permissions @since(version: \"24.09.0\")\n  ...VFolderPermissionCellFragment\n  ...VFolderNodeIdenticonFragment\n  ...SharedFolderPermissionInfoModalFragment\n  ...BAINodeNotificationItemFragment\n}\n\nfragment VFolderPermissionCellFragment on VirtualFolderNode {\n  permissions\n}\n\nfragment useBackendAIAppLauncherFragment on ComputeSessionNode {\n  name\n  row_id\n  vfolder_mounts\n  scaling_group\n  project_id\n  service_ports\n}\n"
  }
};
})();

(node as any).hash = "61335271ca378f8ff80cff73517798c7";

export default node;
