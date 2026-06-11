/**
 * @generated SignedSource<<198168865c02218bb66b078d027864f8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ClusterMode = "MULTI_NODE" | "SINGLE_NODE" | "%future added value";
export type ModelRevisionOrderField = "CLUSTER_MODE" | "CREATED_AT" | "RESOURCE_GROUP" | "REVISION_NUMBER" | "RUNTIME_VARIANT_NAME" | "%future added value";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type ModelRevisionFilter = {
  AND?: ReadonlyArray<ModelRevisionFilter> | null | undefined;
  NOT?: ReadonlyArray<ModelRevisionFilter> | null | undefined;
  OR?: ReadonlyArray<ModelRevisionFilter> | null | undefined;
  clusterMode?: StringFilter | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  deploymentId?: string | null | undefined;
  imageId?: UUIDFilter | null | undefined;
  modelVfolderId?: UUIDFilter | null | undefined;
  resourceGroup?: StringFilter | null | undefined;
  revisionNumber?: IntFilter | null | undefined;
};
export type IntFilter = {
  equals?: number | null | undefined;
  greaterThan?: number | null | undefined;
  greaterThanOrEqual?: number | null | undefined;
  lessThan?: number | null | undefined;
  lessThanOrEqual?: number | null | undefined;
  notEquals?: number | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type StringFilter = {
  contains?: string | null | undefined;
  endsWith?: string | null | undefined;
  equals?: string | null | undefined;
  iContains?: string | null | undefined;
  iEndsWith?: string | null | undefined;
  iEquals?: string | null | undefined;
  iIn?: ReadonlyArray<string> | null | undefined;
  iNotContains?: string | null | undefined;
  iNotEndsWith?: string | null | undefined;
  iNotEquals?: string | null | undefined;
  iNotIn?: ReadonlyArray<string> | null | undefined;
  iNotStartsWith?: string | null | undefined;
  iStartsWith?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notContains?: string | null | undefined;
  notEndsWith?: string | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
  notStartsWith?: string | null | undefined;
  startsWith?: string | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type ModelRevisionOrderBy = {
  direction?: OrderDirection;
  field: ModelRevisionOrderField;
};
export type DeploymentRevisionHistoryTabListQuery$variables = {
  deploymentId: string;
  filter?: ModelRevisionFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<ModelRevisionOrderBy> | null | undefined;
};
export type DeploymentRevisionHistoryTabListQuery$data = {
  readonly deployment: {
    readonly currentRevisionId: string | null | undefined;
    readonly deployingRevisionId: string | null | undefined;
    readonly revisionHistory: {
      readonly count: number;
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly clusterConfig: {
            readonly mode: ClusterMode;
            readonly size: number;
          };
          readonly createdAt: string;
          readonly id: string;
          readonly imageV2: {
            readonly id: string;
            readonly identity: {
              readonly architecture: string;
              readonly canonicalName: string;
            };
          } | null | undefined;
          readonly modelDefinition: {
            readonly models: ReadonlyArray<{
              readonly metadata: {
                readonly version: any | null | undefined;
              } | null | undefined;
              readonly name: string;
            }>;
          } | null | undefined;
          readonly modelMountConfig: {
            readonly vfolder: {
              readonly id: string;
              readonly name: string | null | undefined;
              readonly " $fragmentSpreads": FragmentRefs<"FolderLink_vfolderNode">;
            } | null | undefined;
            readonly vfolderId: string;
          } | null | undefined;
          readonly modelRuntimeConfig: {
            readonly runtimeVariant: {
              readonly name: string;
            } | null | undefined;
          };
          readonly revisionNumber: number;
          readonly " $fragmentSpreads": FragmentRefs<"DeploymentAddRevisionModal_revisionSource" | "DeploymentRevisionDetail_revision">;
        };
      }>;
    } | null | undefined;
  } | null | undefined;
};
export type DeploymentRevisionHistoryTabListQuery = {
  response: DeploymentRevisionHistoryTabListQuery$data;
  variables: DeploymentRevisionHistoryTabListQuery$variables;
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
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "currentRevisionId",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "deployingRevisionId",
  "storageKey": null
},
v8 = [
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
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "revisionNumber",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v13 = {
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
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "concreteType": "ModelMetadata",
  "kind": "LinkedField",
  "name": "metadata",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "version",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "concreteType": "ImageV2",
  "kind": "LinkedField",
  "name": "imageV2",
  "plural": false,
  "selections": [
    (v10/*: any*/),
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
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "vfolderId",
  "storageKey": null
},
v18 = [
  (v14/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "value",
    "storageKey": null
  }
],
v19 = {
  "alias": null,
  "args": null,
  "concreteType": "VirtualFolderNode",
  "kind": "LinkedField",
  "name": "vfolder",
  "plural": false,
  "selections": [
    (v10/*: any*/),
    (v14/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "row_id",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountDestination",
  "storageKey": null
},
v21 = {
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
    "name": "DeploymentRevisionHistoryTabListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          (v7/*: any*/),
          {
            "alias": null,
            "args": (v8/*: any*/),
            "concreteType": "ModelRevisionConnection",
            "kind": "LinkedField",
            "name": "revisionHistory",
            "plural": false,
            "selections": [
              (v9/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelRevisionEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModelRevision",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v10/*: any*/),
                      (v11/*: any*/),
                      (v12/*: any*/),
                      (v13/*: any*/),
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
                              (v14/*: any*/)
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
                              (v14/*: any*/),
                              (v15/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v16/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ModelMountConfig",
                        "kind": "LinkedField",
                        "name": "modelMountConfig",
                        "plural": false,
                        "selections": [
                          (v17/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "VirtualFolderNode",
                            "kind": "LinkedField",
                            "name": "vfolder",
                            "plural": false,
                            "selections": [
                              (v10/*: any*/),
                              (v14/*: any*/),
                              {
                                "args": null,
                                "kind": "FragmentSpread",
                                "name": "FolderLink_vfolderNode"
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "DeploymentRevisionDetail_revision"
                      },
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "DeploymentAddRevisionModal_revisionSource"
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
    "name": "DeploymentRevisionHistoryTabListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          (v7/*: any*/),
          {
            "alias": null,
            "args": (v8/*: any*/),
            "concreteType": "ModelRevisionConnection",
            "kind": "LinkedField",
            "name": "revisionHistory",
            "plural": false,
            "selections": [
              (v9/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelRevisionEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModelRevision",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v10/*: any*/),
                      (v11/*: any*/),
                      (v12/*: any*/),
                      (v13/*: any*/),
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
                              (v14/*: any*/),
                              (v10/*: any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "inferenceRuntimeConfig",
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
                                "selections": (v18/*: any*/),
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "runtimeVariantId",
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
                              (v14/*: any*/),
                              (v15/*: any*/),
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
                                    "name": "shell",
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
                                    "concreteType": "PreStartAction",
                                    "kind": "LinkedField",
                                    "name": "preStartActions",
                                    "plural": true,
                                    "selections": [
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "action",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "args",
                                        "storageKey": null
                                      }
                                    ],
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
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "expectedStatusCode",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "enable",
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
                      (v16/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ModelMountConfig",
                        "kind": "LinkedField",
                        "name": "modelMountConfig",
                        "plural": false,
                        "selections": [
                          (v17/*: any*/),
                          (v19/*: any*/),
                          (v20/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "definitionPath",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v21/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ResourceConfig",
                        "kind": "LinkedField",
                        "name": "resourceConfig",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ResourceOpts",
                            "kind": "LinkedField",
                            "name": "resourceOpts",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "ResourceOptsEntry",
                                "kind": "LinkedField",
                                "name": "entries",
                                "plural": true,
                                "selections": (v18/*: any*/),
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
                        "concreteType": "ExtraVFolderMountInfo",
                        "kind": "LinkedField",
                        "name": "extraMounts",
                        "plural": true,
                        "selections": [
                          (v17/*: any*/),
                          (v20/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "mountPerm",
                            "storageKey": null
                          },
                          (v19/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v16/*: any*/),
                      (v21/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v10/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "b68e0d3ddd149cceaca6fac89b5f125f",
    "id": null,
    "metadata": {},
    "name": "DeploymentRevisionHistoryTabListQuery",
    "operationKind": "query",
    "text": "query DeploymentRevisionHistoryTabListQuery(\n  $deploymentId: ID!\n  $filter: ModelRevisionFilter\n  $orderBy: [ModelRevisionOrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  deployment(id: $deploymentId) {\n    currentRevisionId\n    deployingRevisionId\n    revisionHistory(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n      count\n      edges {\n        node {\n          id\n          revisionNumber\n          createdAt\n          clusterConfig {\n            mode\n            size\n          }\n          modelRuntimeConfig {\n            runtimeVariant {\n              name\n              id\n            }\n          }\n          modelDefinition {\n            models {\n              name\n              metadata {\n                version\n              }\n            }\n          }\n          imageV2 {\n            id\n            identity {\n              canonicalName\n              architecture\n            }\n          }\n          modelMountConfig {\n            vfolderId\n            vfolder {\n              id\n              name\n              ...FolderLink_vfolderNode\n            }\n          }\n          ...DeploymentRevisionDetail_revision\n          ...DeploymentAddRevisionModal_revisionSource\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment DeploymentAddRevisionModal_revisionSource on ModelRevision {\n  clusterConfig {\n    mode\n    size\n  }\n  resourceConfig {\n    resourceOpts {\n      entries {\n        name\n        value\n      }\n    }\n  }\n  resourceSlots {\n    slotName\n    quantity\n  }\n  extraMounts {\n    vfolderId\n    mountDestination\n  }\n  modelRuntimeConfig {\n    runtimeVariantId\n    runtimeVariant {\n      name\n      id\n    }\n    environ {\n      entries {\n        name\n        value\n      }\n    }\n  }\n  modelMountConfig {\n    vfolderId\n    mountDestination\n    definitionPath\n  }\n  modelDefinition {\n    models {\n      name\n      modelPath\n      service {\n        startCommand\n        port\n        healthCheck {\n          enable @since(version: \"26.4.4rc7\")\n          path\n          maxRetries\n          initialDelay\n          interval\n          maxWaitTime\n        }\n      }\n    }\n  }\n  imageV2 {\n    id\n    identity {\n      canonicalName\n    }\n  }\n}\n\nfragment DeploymentRevisionDetail_revision on ModelRevision {\n  id\n  revisionNumber\n  createdAt\n  clusterConfig {\n    mode\n    size\n  }\n  resourceSlots @since(version: \"26.4.2\") {\n    slotName\n    quantity\n  }\n  resourceConfig {\n    resourceOpts {\n      entries {\n        name\n        value\n      }\n    }\n  }\n  modelRuntimeConfig {\n    runtimeVariant {\n      name\n      id\n    }\n    inferenceRuntimeConfig\n    environ {\n      entries {\n        name\n        value\n      }\n    }\n  }\n  modelMountConfig {\n    vfolderId\n    mountDestination\n    definitionPath\n    vfolder {\n      id\n      name\n      ...FolderLink_vfolderNode\n    }\n  }\n  extraMounts {\n    vfolderId\n    mountDestination\n    mountPerm\n    vfolder {\n      id\n      name\n      ...FolderLink_vfolderNode\n    }\n  }\n  imageV2 @since(version: \"26.4.3\") {\n    id\n    identity {\n      canonicalName\n      architecture\n    }\n  }\n  modelDefinition {\n    models {\n      name\n      modelPath\n      service {\n        startCommand\n        shell\n        port\n        preStartActions {\n          action\n          args\n        }\n        healthCheck {\n          path\n          initialDelay\n          maxRetries\n          interval\n          maxWaitTime\n          expectedStatusCode\n        }\n      }\n    }\n  }\n}\n\nfragment FolderLink_vfolderNode on VirtualFolderNode {\n  row_id\n  name\n  ...VFolderNodeIdenticonFragment\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n"
  }
};
})();

(node as any).hash = "dc7544cf74c6e7b71663a4998c4d880c";

export default node;
