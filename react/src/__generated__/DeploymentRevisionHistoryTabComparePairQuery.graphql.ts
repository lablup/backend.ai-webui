/**
 * @generated SignedSource<<e32ca23005d090185734f16106d5523c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
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
export type DeploymentRevisionHistoryTabComparePairQuery$variables = {
  deploymentId: string;
  filter?: ModelRevisionFilter | null | undefined;
};
export type DeploymentRevisionHistoryTabComparePairQuery$data = {
  readonly deployment: {
    readonly revisionHistory: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly fieldId: string;
          readonly id: string;
          readonly revisionNumber: number;
          readonly " $fragmentSpreads": FragmentRefs<"DeploymentRevisionCompareDrawer_revision">;
        };
      }>;
    } | null | undefined;
  } | null | undefined;
};
export type DeploymentRevisionHistoryTabComparePairQuery = {
  response: DeploymentRevisionHistoryTabComparePairQuery$data;
  variables: DeploymentRevisionHistoryTabComparePairQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "deploymentId"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "filter"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "deploymentId"
  }
],
v2 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 2
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "fieldId",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "revisionNumber",
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
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v8 = [
  (v6/*: any*/),
  (v7/*: any*/)
],
v9 = [
  (v6/*: any*/),
  (v3/*: any*/)
],
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "vfolderId",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountDestination",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "concreteType": "VirtualFolderNode",
  "kind": "LinkedField",
  "name": "vfolder",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentRevisionHistoryTabComparePairQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*: any*/),
            "concreteType": "ModelRevisionConnection",
            "kind": "LinkedField",
            "name": "revisionHistory",
            "plural": false,
            "selections": [
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
                      (v3/*: any*/),
                      (v4/*: any*/),
                      (v5/*: any*/),
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "DeploymentRevisionCompareDrawer_revision"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentRevisionHistoryTabComparePairQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*: any*/),
            "concreteType": "ModelRevisionConnection",
            "kind": "LinkedField",
            "name": "revisionHistory",
            "plural": false,
            "selections": [
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
                      (v3/*: any*/),
                      (v4/*: any*/),
                      (v5/*: any*/),
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
                                "selections": (v8/*: any*/),
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
                            "selections": (v9/*: any*/),
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
                                "selections": (v8/*: any*/),
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          {
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
                              (v7/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "RuntimeVariantPreset",
                                "kind": "LinkedField",
                                "name": "preset",
                                "plural": false,
                                "selections": [
                                  (v6/*: any*/),
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
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "key",
                                        "storageKey": null
                                      }
                                    ],
                                    "storageKey": null
                                  },
                                  (v3/*: any*/)
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
                          (v10/*: any*/),
                          (v11/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "definitionPath",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "subpath",
                            "storageKey": null
                          },
                          (v12/*: any*/)
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
                          (v10/*: any*/),
                          (v11/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "mountPerm",
                            "storageKey": null
                          },
                          (v12/*: any*/)
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
                          },
                          (v3/*: any*/)
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
                              (v6/*: any*/),
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
                                    "name": "command",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "port",
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
              }
            ],
            "storageKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "b5c87dabcc267a26b92b10d7f5822176",
    "id": null,
    "metadata": {},
    "name": "DeploymentRevisionHistoryTabComparePairQuery",
    "operationKind": "query",
    "text": "query DeploymentRevisionHistoryTabComparePairQuery(\n  $deploymentId: ID!\n  $filter: ModelRevisionFilter\n) {\n  deployment(id: $deploymentId) {\n    revisionHistory(filter: $filter, limit: 2) {\n      edges {\n        node {\n          id\n          fieldId\n          revisionNumber\n          ...DeploymentRevisionCompareDrawer_revision\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment DeploymentRevisionCompareDrawer_revision on ModelRevision {\n  fieldId\n  revisionNumber\n  clusterConfig {\n    mode\n    size\n  }\n  resourceSlots {\n    slotName\n    quantity\n  }\n  resourceConfig {\n    resourceOpts {\n      entries {\n        name\n        value\n      }\n    }\n  }\n  modelRuntimeConfig {\n    runtimeVariant {\n      name\n      id\n    }\n    inferenceRuntimeConfig\n    environ {\n      entries {\n        name\n        value\n      }\n    }\n    runtimeVariantPresetValues {\n      presetId\n      value\n      preset {\n        name\n        displayName\n        targetSpec {\n          key\n        }\n        id\n      }\n    }\n  }\n  modelMountConfig {\n    vfolderId\n    mountDestination\n    definitionPath\n    subpath\n    vfolder {\n      name\n      id\n    }\n  }\n  extraMounts {\n    vfolderId\n    mountDestination\n    mountPerm\n    vfolder {\n      name\n      id\n    }\n  }\n  imageV2 {\n    identity {\n      canonicalName\n      architecture\n    }\n    id\n  }\n  modelDefinition {\n    models {\n      name\n      modelPath\n      service {\n        command\n        port\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6bac5fe908d25812765033f0f6b5d06b";

export default node;
