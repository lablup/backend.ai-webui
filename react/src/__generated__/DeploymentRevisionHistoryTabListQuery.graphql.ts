/**
 * @generated SignedSource<<002187b23a68c2795e69d63b67e20435>>
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
  clusterSize?: IntFilter | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  deploymentId?: string | null | undefined;
  fieldId?: UUIDFilter | null | undefined;
  imageId?: UUIDFilter | null | undefined;
  modelDefinitionPath?: StringFilter | null | undefined;
  modelMountDestination?: StringFilter | null | undefined;
  modelVfolderId?: UUIDFilter | null | undefined;
  resourceGroup?: StringFilter | null | undefined;
  revisionNumber?: IntFilter | null | undefined;
  revisionPresetId?: UUIDFilter | null | undefined;
  runtimeVariantId?: UUIDFilter | null | undefined;
  vfolderSubpath?: StringFilter | null | undefined;
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
    readonly currentRevision: {
      readonly fieldId: string;
      readonly revisionNumber: number;
      readonly " $fragmentSpreads": FragmentRefs<"DeploymentRevisionCompareDrawer_revision">;
    } | null | undefined;
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
          readonly fieldId: string;
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
          readonly " $fragmentSpreads": FragmentRefs<"DeploymentAddRevisionModal_revisionSource" | "DeploymentRevisionCompareDrawer_revision" | "DeploymentRevisionDetail_revision">;
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
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "fieldId",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "revisionNumber",
  "storageKey": null
},
v10 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "DeploymentRevisionCompareDrawer_revision"
},
v11 = [
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
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
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
v18 = {
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
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "vfolderId",
  "storageKey": null
},
v20 = {
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
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v22 = [
  (v16/*: any*/),
  (v21/*: any*/)
],
v23 = {
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
          "selections": (v22/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v24 = [
  (v16/*: any*/),
  (v13/*: any*/)
],
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "inferenceRuntimeConfig",
  "storageKey": null
},
v26 = {
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
      "selections": (v22/*: any*/),
      "storageKey": null
    }
  ],
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "key",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "concreteType": "RuntimeVariantPresetValue",
  "kind": "LinkedField",
  "name": "runtimeVariantPresetValues",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "presetId",
      "storageKey": null
    },
    (v21/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "RuntimeVariantPreset",
      "kind": "LinkedField",
      "name": "preset",
      "plural": false,
      "selections": [
        (v16/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "displayName",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "PresetTargetSpec",
          "kind": "LinkedField",
          "name": "targetSpec",
          "plural": false,
          "selections": [
            (v27/*: any*/)
          ],
          "storageKey": null
        },
        (v13/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountDestination",
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "definitionPath",
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "subpath",
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "concreteType": "VirtualFolderNode",
  "kind": "LinkedField",
  "name": "vfolder",
  "plural": false,
  "selections": (v24/*: any*/),
  "storageKey": null
},
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountPerm",
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "modelPath",
  "storageKey": null
},
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "command",
  "storageKey": null
},
v36 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "port",
  "storageKey": null
},
v37 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "shell",
  "storageKey": null
},
v38 = [
  (v27/*: any*/),
  (v21/*: any*/)
],
v39 = {
  "alias": null,
  "args": null,
  "concreteType": "VirtualFolderNode",
  "kind": "LinkedField",
  "name": "vfolder",
  "plural": false,
  "selections": [
    (v13/*: any*/),
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
            "args": null,
            "concreteType": "ModelRevision",
            "kind": "LinkedField",
            "name": "currentRevision",
            "plural": false,
            "selections": [
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": (v11/*: any*/),
            "concreteType": "ModelRevisionConnection",
            "kind": "LinkedField",
            "name": "revisionHistory",
            "plural": false,
            "selections": [
              (v12/*: any*/),
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
                      (v13/*: any*/),
                      (v8/*: any*/),
                      (v9/*: any*/),
                      (v14/*: any*/),
                      (v15/*: any*/),
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
                              (v16/*: any*/)
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
                              (v17/*: any*/)
                            ],
                            "storageKey": null
                          }
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
                          (v13/*: any*/),
                          (v18/*: any*/)
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
                          (v19/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "VirtualFolderNode",
                            "kind": "LinkedField",
                            "name": "vfolder",
                            "plural": false,
                            "selections": [
                              (v13/*: any*/),
                              (v16/*: any*/),
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
                      },
                      (v10/*: any*/)
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
            "args": null,
            "concreteType": "ModelRevision",
            "kind": "LinkedField",
            "name": "currentRevision",
            "plural": false,
            "selections": [
              (v8/*: any*/),
              (v9/*: any*/),
              (v15/*: any*/),
              (v20/*: any*/),
              (v23/*: any*/),
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
                    "selections": (v24/*: any*/),
                    "storageKey": null
                  },
                  (v25/*: any*/),
                  (v26/*: any*/),
                  (v28/*: any*/)
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
                  (v19/*: any*/),
                  (v29/*: any*/),
                  (v30/*: any*/),
                  (v31/*: any*/),
                  (v32/*: any*/)
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
                  (v19/*: any*/),
                  (v29/*: any*/),
                  (v33/*: any*/),
                  (v32/*: any*/)
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
                  (v18/*: any*/),
                  (v13/*: any*/)
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
                      (v34/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ModelServiceConfig",
                        "kind": "LinkedField",
                        "name": "service",
                        "plural": false,
                        "selections": [
                          (v35/*: any*/),
                          (v36/*: any*/)
                        ],
                        "storageKey": null
                      }
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
          {
            "alias": null,
            "args": (v11/*: any*/),
            "concreteType": "ModelRevisionConnection",
            "kind": "LinkedField",
            "name": "revisionHistory",
            "plural": false,
            "selections": [
              (v12/*: any*/),
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
                      (v13/*: any*/),
                      (v8/*: any*/),
                      (v9/*: any*/),
                      (v14/*: any*/),
                      (v15/*: any*/),
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
                              (v13/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "readsVfolderConfigFiles",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          (v25/*: any*/),
                          (v26/*: any*/),
                          (v28/*: any*/),
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
                              (v16/*: any*/),
                              (v17/*: any*/),
                              (v34/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "ModelServiceConfig",
                                "kind": "LinkedField",
                                "name": "service",
                                "plural": false,
                                "selections": [
                                  (v35/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "startCommand",
                                    "storageKey": null
                                  },
                                  (v37/*: any*/),
                                  (v36/*: any*/),
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
                                  },
                                  (v37/*: any*/),
                                  (v35/*: any*/)
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
                        "concreteType": "ImageV2",
                        "kind": "LinkedField",
                        "name": "imageV2",
                        "plural": false,
                        "selections": [
                          (v13/*: any*/),
                          (v18/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ImageV2MetadataInfo",
                            "kind": "LinkedField",
                            "name": "metadata",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "ImageV2TagEntry",
                                "kind": "LinkedField",
                                "name": "tags",
                                "plural": true,
                                "selections": (v38/*: any*/),
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "ImageV2LabelEntry",
                                "kind": "LinkedField",
                                "name": "labels",
                                "plural": true,
                                "selections": (v38/*: any*/),
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
                          (v19/*: any*/),
                          (v39/*: any*/),
                          (v29/*: any*/),
                          (v30/*: any*/),
                          (v31/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v20/*: any*/),
                      (v23/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ExtraVFolderMountInfo",
                        "kind": "LinkedField",
                        "name": "extraMounts",
                        "plural": true,
                        "selections": [
                          (v19/*: any*/),
                          (v29/*: any*/),
                          (v33/*: any*/),
                          (v39/*: any*/),
                          (v31/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "revisionPresetId",
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
          (v13/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d5aa5c117dc5d2ca658e95646f408330",
    "id": null,
    "metadata": {},
    "name": "DeploymentRevisionHistoryTabListQuery",
    "operationKind": "query",
    "text": "query DeploymentRevisionHistoryTabListQuery(\n  $deploymentId: ID!\n  $filter: ModelRevisionFilter\n  $orderBy: [ModelRevisionOrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  deployment(id: $deploymentId) {\n    currentRevisionId\n    deployingRevisionId\n    currentRevision {\n      fieldId\n      revisionNumber\n      ...DeploymentRevisionCompareDrawer_revision\n      id\n    }\n    revisionHistory(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n      count\n      edges {\n        node {\n          id\n          fieldId\n          revisionNumber\n          createdAt\n          clusterConfig {\n            mode\n            size\n          }\n          modelRuntimeConfig {\n            runtimeVariant {\n              name\n              id\n            }\n          }\n          modelDefinition {\n            models {\n              name\n              metadata {\n                version\n              }\n            }\n          }\n          imageV2 {\n            id\n            identity {\n              canonicalName\n              architecture\n            }\n          }\n          modelMountConfig {\n            vfolderId\n            vfolder {\n              id\n              name\n              ...FolderLink_vfolderNode\n            }\n          }\n          ...DeploymentRevisionDetail_revision\n          ...DeploymentAddRevisionModal_revisionSource\n          ...DeploymentRevisionCompareDrawer_revision\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment BAIImageNodeSimpleTagV2Fragment on ImageV2 {\n  identity {\n    canonicalName\n    architecture\n  }\n  metadata {\n    tags {\n      key\n      value\n    }\n    labels {\n      key\n      value\n    }\n  }\n}\n\nfragment DeploymentAddRevisionModal_revisionSource on ModelRevision {\n  revisionPresetId\n  clusterConfig {\n    mode\n    size\n  }\n  resourceConfig {\n    resourceOpts {\n      entries {\n        name\n        value\n      }\n    }\n  }\n  resourceSlots {\n    slotName\n    quantity\n  }\n  extraMounts {\n    vfolderId\n    vfolder {\n      name\n      id\n    }\n    mountDestination\n    subpath\n  }\n  modelRuntimeConfig {\n    runtimeVariantId\n    runtimeVariant {\n      name\n      readsVfolderConfigFiles @since(version: \"26.8.0\")\n      id\n    }\n    environ {\n      entries {\n        name\n        value\n      }\n    }\n    runtimeVariantPresetValues {\n      presetId\n      value\n    }\n  }\n  modelMountConfig {\n    vfolderId\n    vfolder {\n      id\n      name\n    }\n    mountDestination\n    definitionPath\n    subpath\n  }\n  modelDefinition {\n    models {\n      name\n      modelPath\n      service {\n        command @since(version: \"26.7.0\")\n        shell @since(version: \"26.7.0\")\n        startCommand\n        port\n        preStartActions {\n          action\n          args\n        }\n        healthCheck {\n          enable\n          path\n          maxRetries\n          initialDelay\n          interval\n          maxWaitTime\n          expectedStatusCode\n        }\n      }\n    }\n  }\n  imageV2 {\n    id\n    identity {\n      canonicalName\n      architecture\n    }\n  }\n}\n\nfragment DeploymentRevisionCompareDrawer_revision on ModelRevision {\n  fieldId\n  revisionNumber\n  clusterConfig {\n    mode\n    size\n  }\n  resourceSlots {\n    slotName\n    quantity\n  }\n  resourceConfig {\n    resourceOpts {\n      entries {\n        name\n        value\n      }\n    }\n  }\n  modelRuntimeConfig {\n    runtimeVariant {\n      name\n      id\n    }\n    inferenceRuntimeConfig\n    environ {\n      entries {\n        name\n        value\n      }\n    }\n    runtimeVariantPresetValues {\n      presetId\n      value\n      preset {\n        name\n        displayName\n        targetSpec {\n          key\n        }\n        id\n      }\n    }\n  }\n  modelMountConfig {\n    vfolderId\n    mountDestination\n    definitionPath\n    subpath\n    vfolder {\n      name\n      id\n    }\n  }\n  extraMounts {\n    vfolderId\n    mountDestination\n    mountPerm\n    vfolder {\n      name\n      id\n    }\n  }\n  imageV2 {\n    identity {\n      canonicalName\n      architecture\n    }\n    id\n  }\n  modelDefinition {\n    models {\n      name\n      modelPath\n      service {\n        command\n        port\n      }\n    }\n  }\n}\n\nfragment DeploymentRevisionDetail_revision on ModelRevision {\n  id\n  fieldId\n  revisionNumber\n  createdAt\n  clusterConfig {\n    mode\n    size\n  }\n  resourceSlots {\n    slotName\n    quantity\n  }\n  resourceConfig {\n    resourceOpts {\n      entries {\n        name\n        value\n      }\n    }\n  }\n  modelRuntimeConfig {\n    runtimeVariant {\n      name\n      id\n    }\n    inferenceRuntimeConfig\n    environ {\n      entries {\n        name\n        value\n      }\n    }\n    runtimeVariantPresetValues {\n      presetId\n      value\n      preset {\n        name\n        displayName\n        targetSpec {\n          key\n        }\n        id\n      }\n    }\n  }\n  modelMountConfig {\n    vfolderId\n    mountDestination\n    definitionPath\n    subpath\n    vfolder {\n      id\n      name\n      ...FolderLink_vfolderNode\n    }\n  }\n  extraMounts {\n    vfolderId\n    mountDestination\n    mountPerm\n    vfolder {\n      id\n      name\n      ...FolderLink_vfolderNode\n    }\n  }\n  imageV2 {\n    id\n    identity {\n      canonicalName\n      architecture\n    }\n    ...BAIImageNodeSimpleTagV2Fragment\n  }\n  modelDefinition {\n    models {\n      name\n      modelPath\n      service {\n        command @since(version: \"26.7.0\")\n        startCommand\n        shell\n        port\n        preStartActions {\n          action\n          args\n        }\n        healthCheck {\n          path\n          initialDelay\n          maxRetries\n          interval\n          maxWaitTime\n          expectedStatusCode\n        }\n      }\n    }\n  }\n}\n\nfragment FolderLink_vfolderNode on VirtualFolderNode {\n  row_id\n  name\n  ...VFolderNodeIdenticonFragment\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n"
  }
};
})();

(node as any).hash = "b9e1a63b21ae6950c4ea13d9ff13441c";

export default node;
