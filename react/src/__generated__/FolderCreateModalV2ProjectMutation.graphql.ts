/**
 * @generated SignedSource<<f6da7268759ca85d7e5d77bca21ca2f2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VFolderMountPermission = "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type VFolderOperationStatus = "CLONING" | "DELETE_COMPLETE" | "DELETE_ERROR" | "DELETE_ONGOING" | "DELETE_PENDING" | "READY" | "%future added value";
export type VFolderOwnershipType = "GROUP" | "USER" | "%future added value";
export type VFolderUsageMode = "DATA" | "GENERAL" | "MODEL" | "%future added value";
export type CreateVFolderInScopeInput = {
  cloneable?: boolean;
  host?: string | null | undefined;
  name: string;
  permission?: VFolderMountPermission;
  usageMode?: VFolderUsageMode;
};
export type FolderCreateModalV2ProjectMutation$variables = {
  input: CreateVFolderInScopeInput;
  projectId: string;
};
export type FolderCreateModalV2ProjectMutation$data = {
  readonly createVFolderInProject: {
    readonly vfolder: {
      readonly accessControl: {
        readonly ownershipType: VFolderOwnershipType;
        readonly permission: VFolderMountPermission;
      };
      readonly host: string;
      readonly id: string;
      readonly metadata: {
        readonly cloneable: boolean;
        readonly name: string;
        readonly quotaScopeId: string | null | undefined;
        readonly usageMode: VFolderUsageMode;
      };
      readonly notificationFrgmt: {
        readonly " $fragmentSpreads": FragmentRefs<"BAINodeNotificationItemFragment">;
      };
      readonly ownership: {
        readonly creatorEmail: string | null | undefined;
        readonly projectId: string | null | undefined;
        readonly userId: string | null | undefined;
      };
      readonly vfolderStatus: VFolderOperationStatus;
    };
  } | null | undefined;
};
export type FolderCreateModalV2ProjectMutation = {
  response: FolderCreateModalV2ProjectMutation$data;
  variables: FolderCreateModalV2ProjectMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectId"
},
v2 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  },
  {
    "kind": "Variable",
    "name": "projectId",
    "variableName": "projectId"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": "vfolderStatus",
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "host",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "concreteType": "VFolderMetadataInfo",
  "kind": "LinkedField",
  "name": "metadata",
  "plural": false,
  "selections": [
    (v6/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "usageMode",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "quotaScopeId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "cloneable",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "VFolderAccessControlInfo",
  "kind": "LinkedField",
  "name": "accessControl",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "permission",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "ownershipType",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "concreteType": "VFolderOwnershipInfo",
  "kind": "LinkedField",
  "name": "ownership",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "userId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "projectId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "creatorEmail",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "FolderCreateModalV2ProjectMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "CreateVFolderV2Payload",
        "kind": "LinkedField",
        "name": "createVFolderInProject",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "VFolder",
            "kind": "LinkedField",
            "name": "vfolder",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              {
                "fragment": {
                  "kind": "InlineFragment",
                  "selections": [
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "BAINodeNotificationItemFragment"
                    }
                  ],
                  "type": "Node",
                  "abstractKey": "__isNode"
                },
                "kind": "AliasedInlineFragmentSpread",
                "name": "notificationFrgmt"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "FolderCreateModalV2ProjectMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "CreateVFolderV2Payload",
        "kind": "LinkedField",
        "name": "createVFolderInProject",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "VFolder",
            "kind": "LinkedField",
            "name": "vfolder",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v10/*: any*/),
                      (v11/*: any*/),
                      (v6/*: any*/),
                      (v12/*: any*/),
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
                                  (v3/*: any*/),
                                  (v12/*: any*/),
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
                      (v10/*: any*/)
                    ],
                    "type": "VFolder",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v10/*: any*/),
                      (v11/*: any*/),
                      (v12/*: any*/),
                      (v6/*: any*/)
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
    ]
  },
  "params": {
    "cacheID": "910f19bbcb870e2da13b469edf4e8573",
    "id": null,
    "metadata": {},
    "name": "FolderCreateModalV2ProjectMutation",
    "operationKind": "mutation",
    "text": "mutation FolderCreateModalV2ProjectMutation(\n  $projectId: UUID!\n  $input: CreateVFolderInScopeInput!\n) {\n  createVFolderInProject(projectId: $projectId, input: $input) {\n    vfolder {\n      id\n      vfolderStatus: status\n      host\n      metadata {\n        name\n        usageMode\n        quotaScopeId\n        cloneable\n      }\n      accessControl {\n        permission\n        ownershipType\n      }\n      ownership {\n        userId\n        projectId\n        creatorEmail\n      }\n      ...BAINodeNotificationItemFragment\n    }\n  }\n}\n\nfragment AppLaunchConfirmationModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment AppLauncherModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  service_ports\n  access_key\n  ...useBackendAIAppLauncherFragment\n  ...SFTPConnectionInfoModalFragment\n  ...TensorboardPathModalFragment\n  ...AppLaunchConfirmationModalFragment\n}\n\nfragment BAIComputeSessionNodeNotificationItemFragment on ComputeSessionNode {\n  row_id\n  id\n  name\n  status\n  ...SessionActionButtonsFragment\n  ...SessionStatusTagFragment\n}\n\nfragment BAINodeNotificationItemFragment on Node {\n  __isNode: __typename\n  ... on ComputeSessionNode {\n    __typename\n    status\n    name\n    row_id\n    ...BAIComputeSessionNodeNotificationItemFragment\n  }\n  ... on VFolder {\n    __typename\n    ...BAIVirtualFolderNodeNotificationItemV2Fragment\n  }\n  ... on VirtualFolderNode {\n    __typename\n    status\n    ...BAIVirtualFolderNodeNotificationItemFragment\n  }\n  id\n}\n\nfragment BAIVirtualFolderNodeNotificationItemFragment on VirtualFolderNode {\n  row_id\n  id\n  name\n  status\n}\n\nfragment BAIVirtualFolderNodeNotificationItemV2Fragment on VFolder {\n  id\n  metadata {\n    name\n  }\n}\n\nfragment ContainerCommitModalFragment on ComputeSessionNode {\n  id\n  name\n  row_id\n}\n\nfragment ContainerLogModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  status\n  access_key\n  kernel_nodes {\n    edges {\n      node {\n        id\n        row_id\n        container_id\n        cluster_idx\n        cluster_role\n        cluster_hostname\n      }\n    }\n  }\n}\n\nfragment SFTPConnectionInfoModalFragment on ComputeSessionNode {\n  row_id\n  vfolder_mounts\n}\n\nfragment SessionActionButtonsFragment on ComputeSessionNode {\n  id\n  name\n  row_id\n  type\n  status\n  access_key\n  service_ports\n  commit_status\n  user_id\n  ...TerminateSessionModalFragment\n  ...ContainerLogModalFragment\n  ...ContainerCommitModalFragment\n  ...AppLauncherModalFragment\n  ...SFTPConnectionInfoModalFragment\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment SessionStatusTagFragment on ComputeSessionNode {\n  id\n  status\n  status_info\n  status_data\n  queue_position @since(version: \"25.13.0\")\n}\n\nfragment TensorboardPathModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  ...useBackendAIAppLauncherFragment\n}\n\nfragment TerminateSessionModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  scaling_group\n  access_key\n  project_id\n  kernel_nodes {\n    edges {\n      node {\n        container_id\n        agent_id\n        id\n      }\n    }\n  }\n}\n\nfragment useBackendAIAppLauncherFragment on ComputeSessionNode {\n  name\n  row_id\n  vfolder_mounts\n  scaling_group\n  project_id\n  service_ports\n}\n"
  }
};
})();

(node as any).hash = "155dde0fbe5be8d199c3f342cacf5864";

export default node;
