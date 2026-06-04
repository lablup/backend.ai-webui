/**
 * @generated SignedSource<<7a56f5b07728106c54941710d1658ff8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type ReplicaHealthStatus = "DEGRADED" | "HEALTHY" | "NOT_CHECKED" | "UNHEALTHY" | "%future added value";
export type ReplicaOrderField = "CREATED_AT" | "ID" | "%future added value";
export type ReplicaStatus = "FAILED_TO_START" | "PROVISIONING" | "RUNNING" | "TERMINATED" | "TERMINATING" | "%future added value";
export type TrafficStatus = "ACTIVE" | "INACTIVE" | "%future added value";
export type ReplicaFilter = {
  AND?: ReadonlyArray<ReplicaFilter> | null | undefined;
  NOT?: ReadonlyArray<ReplicaFilter> | null | undefined;
  OR?: ReadonlyArray<ReplicaFilter> | null | undefined;
  status?: ReplicaStatusFilter | null | undefined;
  trafficStatus?: TrafficStatusFilter | null | undefined;
};
export type ReplicaStatusFilter = {
  equals?: ReplicaStatus | null | undefined;
  in?: ReadonlyArray<ReplicaStatus> | null | undefined;
  notEquals?: ReplicaStatus | null | undefined;
  notIn?: ReadonlyArray<ReplicaStatus> | null | undefined;
};
export type TrafficStatusFilter = {
  equals?: TrafficStatus | null | undefined;
  in?: ReadonlyArray<TrafficStatus> | null | undefined;
  notEquals?: TrafficStatus | null | undefined;
  notIn?: ReadonlyArray<TrafficStatus> | null | undefined;
};
export type ReplicaOrderBy = {
  direction?: OrderDirection;
  field: ReplicaOrderField;
};
export type DeploymentReplicasTabListQuery$variables = {
  deploymentId: string;
  filter?: ReplicaFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<ReplicaOrderBy> | null | undefined;
};
export type DeploymentReplicasTabListQuery$data = {
  readonly deployment: {
    readonly replicas: {
      readonly count: number;
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly createdAt: string;
          readonly healthStatus: ReplicaHealthStatus;
          readonly id: string;
          readonly revision: {
            readonly id: string;
            readonly revisionNumber: number;
            readonly " $fragmentSpreads": FragmentRefs<"DeploymentRevisionDetail_revision">;
          } | null | undefined;
          readonly revisionId: string;
          readonly sessionId: string | null | undefined;
          readonly sessionV2: {
            readonly id: string;
            readonly metadata: {
              readonly name: string;
            };
          } | null | undefined;
          readonly status: ReplicaStatus;
          readonly trafficStatus: TrafficStatus;
        };
      }>;
    } | null | undefined;
  } | null | undefined;
};
export type DeploymentReplicasTabListQuery = {
  response: DeploymentReplicasTabListQuery$data;
  variables: DeploymentReplicasTabListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "deploymentId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "orderBy"
},
v5 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "deploymentId"
  }
],
v6 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "orderBy"
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "sessionId",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "revisionId",
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
  "name": "trafficStatus",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "healthStatus",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "revisionNumber",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "concreteType": "SessionV2",
  "kind": "LinkedField",
  "name": "sessionV2",
  "plural": false,
  "selections": [
    (v8/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "SessionV2MetadataInfo",
      "kind": "LinkedField",
      "name": "metadata",
      "plural": false,
      "selections": [
        (v16/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "vfolderId",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountDestination",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "concreteType": "VirtualFolderNode",
  "kind": "LinkedField",
  "name": "vfolder",
  "plural": false,
  "selections": [
    (v8/*: any*/),
    (v16/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "row_id",
      "storageKey": null
    }
  ],
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
    "name": "DeploymentReplicasTabListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v6/*: any*/),
            "concreteType": "ModelReplicaConnection",
            "kind": "LinkedField",
            "name": "replicas",
            "plural": false,
            "selections": [
              (v7/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelReplicaEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModelReplica",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v8/*: any*/),
                      (v9/*: any*/),
                      (v10/*: any*/),
                      (v11/*: any*/),
                      (v12/*: any*/),
                      (v13/*: any*/),
                      (v14/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ModelRevision",
                        "kind": "LinkedField",
                        "name": "revision",
                        "plural": false,
                        "selections": [
                          (v8/*: any*/),
                          (v15/*: any*/),
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "DeploymentRevisionDetail_revision"
                          }
                        ],
                        "storageKey": null
                      },
                      (v17/*: any*/)
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
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v4/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "DeploymentReplicasTabListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v6/*: any*/),
            "concreteType": "ModelReplicaConnection",
            "kind": "LinkedField",
            "name": "replicas",
            "plural": false,
            "selections": [
              (v7/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelReplicaEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModelReplica",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v8/*: any*/),
                      (v9/*: any*/),
                      (v10/*: any*/),
                      (v11/*: any*/),
                      (v12/*: any*/),
                      (v13/*: any*/),
                      (v14/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ModelRevision",
                        "kind": "LinkedField",
                        "name": "revision",
                        "plural": false,
                        "selections": [
                          (v8/*: any*/),
                          (v15/*: any*/),
                          (v14/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ClusterConfig",
                            "kind": "LinkedField",
                            "name": "clusterConfig",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "mode",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "size",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "AllocatedResourceSlot",
                            "kind": "LinkedField",
                            "name": "resourceSlots",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "slotName",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "quantity",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ModelRuntimeConfig",
                            "kind": "LinkedField",
                            "name": "modelRuntimeConfig",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "RuntimeVariant",
                                "kind": "LinkedField",
                                "name": "runtimeVariant",
                                "plural": false,
                                "selections": [
                                  (v16/*: any*/),
                                  (v8/*: any*/)
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "EnvironmentVariables",
                                "kind": "LinkedField",
                                "name": "environ",
                                "plural": false,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "EnvironmentVariableEntry",
                                    "kind": "LinkedField",
                                    "name": "entries",
                                    "plural": true,
                                    "selections": [
                                      (v16/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "value",
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
                            "concreteType": "ModelMountConfig",
                            "kind": "LinkedField",
                            "name": "modelMountConfig",
                            "plural": false,
                            "selections": [
                              (v18/*: any*/),
                              (v19/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "definitionPath",
                                "storageKey": null
                              },
                              (v20/*: any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ExtraVFolderMountInfoGQL",
                            "kind": "LinkedField",
                            "name": "extraMounts",
                            "plural": true,
                            "selections": [
                              (v18/*: any*/),
                              (v19/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "mountPerm",
                                "storageKey": null
                              },
                              (v20/*: any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ImageV2",
                            "kind": "LinkedField",
                            "name": "imageV2",
                            "plural": false,
                            "selections": [
                              (v8/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "ImageV2IdentityInfo",
                                "kind": "LinkedField",
                                "name": "identity",
                                "plural": false,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "canonicalName",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "architecture",
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
                            "concreteType": "ModelDefinition",
                            "kind": "LinkedField",
                            "name": "modelDefinition",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "ModelConfig",
                                "kind": "LinkedField",
                                "name": "models",
                                "plural": true,
                                "selections": [
                                  (v16/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "modelPath",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "ModelServiceConfig",
                                    "kind": "LinkedField",
                                    "name": "service",
                                    "plural": false,
                                    "selections": [
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "startCommand",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "port",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "ModelHealthCheck",
                                        "kind": "LinkedField",
                                        "name": "healthCheck",
                                        "plural": false,
                                        "selections": [
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "path",
                                            "storageKey": null
                                          },
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "initialDelay",
                                            "storageKey": null
                                          },
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "maxRetries",
                                            "storageKey": null
                                          },
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "interval",
                                            "storageKey": null
                                          },
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "maxWaitTime",
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
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v17/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v8/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a18b12c1fbbc2ef54e471aaf3dc22c3f",
    "id": null,
    "metadata": {},
    "name": "DeploymentReplicasTabListQuery",
    "operationKind": "query",
    "text": "query DeploymentReplicasTabListQuery(\n  $deploymentId: ID!\n  $filter: ReplicaFilter\n  $orderBy: [ReplicaOrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  deployment(id: $deploymentId) {\n    replicas(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n      count\n      edges {\n        node {\n          id\n          sessionId\n          revisionId\n          status @since(version: \"26.4.4rc5\")\n          trafficStatus @since(version: \"26.4.4rc5\")\n          healthStatus @since(version: \"26.4.4rc5\")\n          createdAt\n          revision {\n            id\n            revisionNumber @since(version: \"26.4.4rc5\")\n            ...DeploymentRevisionDetail_revision\n          }\n          sessionV2 @since(version: \"26.4.3\") {\n            id\n            metadata {\n              name\n            }\n          }\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment DeploymentRevisionDetail_revision on ModelRevision {\n  id\n  revisionNumber @since(version: \"26.4.4rc5\")\n  createdAt\n  clusterConfig {\n    mode\n    size\n  }\n  resourceSlots @since(version: \"26.4.4rc5\") {\n    slotName\n    quantity\n  }\n  modelRuntimeConfig {\n    runtimeVariant @since(version: \"26.4.4rc5\") {\n      name\n      id\n    }\n    environ {\n      entries {\n        name\n        value\n      }\n    }\n  }\n  modelMountConfig {\n    vfolderId\n    mountDestination\n    definitionPath\n    vfolder {\n      id\n      name\n      ...FolderLink_vfolderNode\n    }\n  }\n  extraMounts {\n    vfolderId\n    mountDestination\n    mountPerm @since(version: \"26.4.4rc5\")\n    vfolder {\n      id\n      name\n      ...FolderLink_vfolderNode\n    }\n  }\n  imageV2 @since(version: \"26.4.3\") {\n    id\n    identity {\n      canonicalName\n      architecture\n    }\n  }\n  modelDefinition {\n    models {\n      name\n      modelPath\n      service {\n        startCommand\n        port\n        healthCheck {\n          path\n          initialDelay\n          maxRetries\n          interval\n          maxWaitTime\n        }\n      }\n    }\n  }\n}\n\nfragment FolderLink_vfolderNode on VirtualFolderNode {\n  row_id\n  name\n  ...VFolderNodeIdenticonFragment\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n"
  }
};
})();

(node as any).hash = "7de006063420836e935502bff311185f";

export default node;
