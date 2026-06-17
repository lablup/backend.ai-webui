/**
 * @generated SignedSource<<3570e37bd7eed5551cd1dac0283adae8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs, Result } from "relay-runtime";
export type DeploymentStatus = "DEPLOYING" | "PENDING" | "READY" | "SCALING" | "STOPPED" | "STOPPING" | "%future added value";
export type DeploymentDetailPageQuery$variables = {
  deploymentId: string;
};
export type DeploymentDetailPageQuery$data = {
  readonly deployment: Result<{
    readonly accessTokens: {
      readonly count: number;
    } | null | undefined;
    readonly creator: {
      readonly basicInfo: {
        readonly email: string;
      };
    } | null | undefined;
    readonly currentRevision: {
      readonly id: string;
    } | null | undefined;
    readonly deployingRevision: {
      readonly id: string;
    } | null | undefined;
    readonly id: string;
    readonly metadata: {
      readonly name: string;
      readonly projectId: string;
      readonly status: DeploymentStatus;
    };
    readonly networkAccess: {
      readonly endpointUrl: string | null | undefined;
      readonly openToPublic: boolean;
    };
    readonly " $fragmentSpreads": FragmentRefs<"DeploymentAccessTokensTab_deployment" | "DeploymentAddRevisionModal_deployment" | "DeploymentAutoScalingTab_deployment" | "DeploymentConfigurationSection_deployment" | "DeploymentReplicasTab_deployment">;
  } | null | undefined, unknown>;
};
export type DeploymentDetailPageQuery = {
  response: DeploymentDetailPageQuery$data;
  variables: DeploymentDetailPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "deploymentId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "deploymentId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
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
  "name": "projectId",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "concreteType": "ModelDeploymentNetworkAccess",
  "kind": "LinkedField",
  "name": "networkAccess",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "openToPublic",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endpointUrl",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "concreteType": "AccessTokenConnection",
  "kind": "LinkedField",
  "name": "accessTokens",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "count",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v8 = [
  (v2/*: any*/)
],
v9 = {
  "alias": null,
  "args": null,
  "concreteType": "UserV2BasicInfo",
  "kind": "LinkedField",
  "name": "basicInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "email",
      "storageKey": null
    }
  ],
  "storageKey": null
},
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
  "selections": [
    (v2/*: any*/),
    (v3/*: any*/),
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
v13 = {
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
    (v12/*: any*/)
  ],
  "storageKey": null
},
v14 = {
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
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v16 = [
  (v3/*: any*/),
  (v15/*: any*/)
],
v17 = {
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
          "selections": (v16/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v18 = {
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
v19 = {
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
v20 = {
  "alias": null,
  "args": null,
  "concreteType": "RuntimeVariant",
  "kind": "LinkedField",
  "name": "runtimeVariant",
  "plural": false,
  "selections": [
    (v3/*: any*/),
    (v2/*: any*/)
  ],
  "storageKey": null
},
v21 = {
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
      "selections": (v16/*: any*/),
      "storageKey": null
    }
  ],
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "inferenceRuntimeConfig",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "modelPath",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startCommand",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "port",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "path",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxRetries",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "initialDelay",
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "interval",
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxWaitTime",
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "expectedStatusCode",
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "shell",
  "storageKey": null
},
v33 = {
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
v34 = {
  "alias": null,
  "args": null,
  "concreteType": "ImageV2",
  "kind": "LinkedField",
  "name": "imageV2",
  "plural": false,
  "selections": [
    (v2/*: any*/),
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
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "revisionNumber",
  "storageKey": null
},
v36 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentDetailPageQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
          "alias": null,
          "args": (v1/*: any*/),
          "concreteType": "ModelDeployment",
          "kind": "LinkedField",
          "name": "deployment",
          "plural": false,
          "selections": [
            (v2/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "ModelDeploymentMetadata",
              "kind": "LinkedField",
              "name": "metadata",
              "plural": false,
              "selections": [
                (v3/*: any*/),
                (v4/*: any*/),
                (v5/*: any*/)
              ],
              "storageKey": null
            },
            (v6/*: any*/),
            (v7/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "ModelRevision",
              "kind": "LinkedField",
              "name": "currentRevision",
              "plural": false,
              "selections": (v8/*: any*/),
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "ModelRevision",
              "kind": "LinkedField",
              "name": "deployingRevision",
              "plural": false,
              "selections": (v8/*: any*/),
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "UserV2",
              "kind": "LinkedField",
              "name": "creator",
              "plural": false,
              "selections": [
                (v9/*: any*/)
              ],
              "storageKey": null
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "DeploymentAddRevisionModal_deployment"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "DeploymentConfigurationSection_deployment"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "DeploymentReplicasTab_deployment"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "DeploymentAccessTokensTab_deployment"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "DeploymentAutoScalingTab_deployment"
            }
          ],
          "storageKey": null
        },
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentDetailPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelDeploymentMetadata",
            "kind": "LinkedField",
            "name": "metadata",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "resourceGroupName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "tags",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "domainName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2",
                "kind": "LinkedField",
                "name": "projectV2",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectBasicInfo",
                    "kind": "LinkedField",
                    "name": "basicInfo",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v2/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
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
              (v2/*: any*/),
              (v13/*: any*/),
              (v14/*: any*/),
              (v17/*: any*/),
              (v18/*: any*/),
              (v19/*: any*/),
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
                    "kind": "ScalarField",
                    "name": "runtimeVariantId",
                    "storageKey": null
                  },
                  (v20/*: any*/),
                  (v21/*: any*/),
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
                      (v15/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v22/*: any*/)
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
                      (v3/*: any*/),
                      (v23/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ModelServiceConfig",
                        "kind": "LinkedField",
                        "name": "service",
                        "plural": false,
                        "selections": [
                          (v24/*: any*/),
                          (v25/*: any*/),
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
                                "name": "enable",
                                "storageKey": null
                              },
                              (v26/*: any*/),
                              (v27/*: any*/),
                              (v28/*: any*/),
                              (v29/*: any*/),
                              (v30/*: any*/),
                              (v31/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v32/*: any*/),
                          (v33/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              (v34/*: any*/),
              (v35/*: any*/),
              (v36/*: any*/),
              (v18/*: any*/),
              (v34/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelRevision",
            "kind": "LinkedField",
            "name": "deployingRevision",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v35/*: any*/),
              (v36/*: any*/),
              (v14/*: any*/),
              (v18/*: any*/),
              (v17/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelRuntimeConfig",
                "kind": "LinkedField",
                "name": "modelRuntimeConfig",
                "plural": false,
                "selections": [
                  (v20/*: any*/),
                  (v22/*: any*/),
                  (v21/*: any*/)
                ],
                "storageKey": null
              },
              (v13/*: any*/),
              (v19/*: any*/),
              (v34/*: any*/),
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
                      (v3/*: any*/),
                      (v23/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ModelServiceConfig",
                        "kind": "LinkedField",
                        "name": "service",
                        "plural": false,
                        "selections": [
                          (v24/*: any*/),
                          (v32/*: any*/),
                          (v25/*: any*/),
                          (v33/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ModelHealthCheck",
                            "kind": "LinkedField",
                            "name": "healthCheck",
                            "plural": false,
                            "selections": [
                              (v26/*: any*/),
                              (v28/*: any*/),
                              (v27/*: any*/),
                              (v29/*: any*/),
                              (v30/*: any*/),
                              (v31/*: any*/)
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
          {
            "alias": null,
            "args": null,
            "concreteType": "UserV2",
            "kind": "LinkedField",
            "name": "creator",
            "plural": false,
            "selections": [
              (v9/*: any*/),
              (v2/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ReplicaState",
            "kind": "LinkedField",
            "name": "replicaState",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "desiredReplicaCount",
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
    "cacheID": "ce0fa3996c60977cf4092937814ddcf2",
    "id": null,
    "metadata": {},
    "name": "DeploymentDetailPageQuery",
    "operationKind": "query",
    "text": "query DeploymentDetailPageQuery(\n  $deploymentId: ID!\n) {\n  deployment(id: $deploymentId) {\n    id\n    metadata {\n      name\n      status\n      projectId\n    }\n    networkAccess {\n      openToPublic\n      endpointUrl\n    }\n    accessTokens {\n      count\n    }\n    currentRevision @since(version: \"26.4.3\") {\n      id\n    }\n    deployingRevision @since(version: \"26.4.3\") {\n      id\n    }\n    creator @since(version: \"26.4.3\") {\n      basicInfo {\n        email\n      }\n      id\n    }\n    ...DeploymentAddRevisionModal_deployment\n    ...DeploymentConfigurationSection_deployment\n    ...DeploymentReplicasTab_deployment\n    ...DeploymentAccessTokensTab_deployment\n    ...DeploymentAutoScalingTab_deployment\n  }\n}\n\nfragment BAIDeploymentTagChips_metadata on ModelDeploymentMetadata {\n  tags\n}\n\nfragment DeploymentAccessTokensTab_deployment on ModelDeployment {\n  id\n  networkAccess {\n    endpointUrl\n  }\n}\n\nfragment DeploymentAddRevisionModal_deployment on ModelDeployment {\n  id\n  metadata {\n    resourceGroupName\n  }\n  currentRevision @since(version: \"26.4.3\") {\n    modelMountConfig {\n      vfolderId\n    }\n    ...DeploymentAddRevisionModal_revisionSource\n    id\n  }\n}\n\nfragment DeploymentAddRevisionModal_revisionSource on ModelRevision {\n  clusterConfig {\n    mode\n    size\n  }\n  resourceConfig {\n    resourceOpts {\n      entries {\n        name\n        value\n      }\n    }\n  }\n  resourceSlots {\n    slotName\n    quantity\n  }\n  extraMounts {\n    vfolderId\n    mountDestination\n  }\n  modelRuntimeConfig {\n    runtimeVariantId\n    runtimeVariant {\n      name\n      id\n    }\n    environ {\n      entries {\n        name\n        value\n      }\n    }\n    runtimeVariantPresetValues @since(version: \"26.4.4rc9\") {\n      presetId\n      value\n    }\n  }\n  modelMountConfig {\n    vfolderId\n    mountDestination\n    definitionPath\n  }\n  modelDefinition {\n    models {\n      name\n      modelPath\n      service {\n        startCommand\n        port\n        healthCheck {\n          enable @since(version: \"26.4.4\")\n          path\n          maxRetries\n          initialDelay\n          interval\n          maxWaitTime\n          expectedStatusCode\n        }\n      }\n    }\n  }\n  imageV2 {\n    id\n    identity {\n      canonicalName\n      architecture\n    }\n  }\n}\n\nfragment DeploymentAutoScalingTab_deployment on ModelDeployment {\n  id\n  metadata {\n    status\n  }\n  creator @since(version: \"26.4.3\") {\n    basicInfo {\n      email\n    }\n    id\n  }\n}\n\nfragment DeploymentConfigurationSection_deployment on ModelDeployment {\n  id\n  ...DeploymentSettingModal_deployment\n  metadata {\n    name\n    projectId\n    domainName\n    status\n    resourceGroupName\n    projectV2 @since(version: \"26.4.3\") {\n      basicInfo {\n        name\n      }\n      id\n    }\n    ...BAIDeploymentTagChips_metadata\n  }\n  networkAccess {\n    openToPublic\n    endpointUrl\n  }\n  replicaState {\n    desiredReplicaCount\n  }\n  currentRevision @since(version: \"26.4.3\") {\n    id\n    revisionNumber\n    ...DeploymentRevisionDetail_revision\n  }\n  deployingRevision @since(version: \"26.4.3\") {\n    id\n    revisionNumber\n    ...DeploymentRevisionDetail_revision\n  }\n  ...DeploymentRevisionHistoryTab_deployment\n}\n\nfragment DeploymentReplicasTab_deployment on ModelDeployment {\n  id\n}\n\nfragment DeploymentRevisionDetail_revision on ModelRevision {\n  id\n  revisionNumber\n  createdAt\n  clusterConfig {\n    mode\n    size\n  }\n  resourceSlots @since(version: \"26.4.2\") {\n    slotName\n    quantity\n  }\n  resourceConfig {\n    resourceOpts {\n      entries {\n        name\n        value\n      }\n    }\n  }\n  modelRuntimeConfig {\n    runtimeVariant {\n      name\n      id\n    }\n    inferenceRuntimeConfig\n    environ {\n      entries {\n        name\n        value\n      }\n    }\n  }\n  modelMountConfig {\n    vfolderId\n    mountDestination\n    definitionPath\n    vfolder {\n      id\n      name\n      ...FolderLink_vfolderNode\n    }\n  }\n  extraMounts {\n    vfolderId\n    mountDestination\n    mountPerm\n    vfolder {\n      id\n      name\n      ...FolderLink_vfolderNode\n    }\n  }\n  imageV2 @since(version: \"26.4.3\") {\n    id\n    identity {\n      canonicalName\n      architecture\n    }\n  }\n  modelDefinition {\n    models {\n      name\n      modelPath\n      service {\n        startCommand\n        shell\n        port\n        preStartActions {\n          action\n          args\n        }\n        healthCheck {\n          path\n          initialDelay\n          maxRetries\n          interval\n          maxWaitTime\n          expectedStatusCode\n        }\n      }\n    }\n  }\n}\n\nfragment DeploymentRevisionHistoryTab_deployment on ModelDeployment {\n  id\n  metadata {\n    status\n  }\n  ...DeploymentAddRevisionModal_deployment\n}\n\nfragment DeploymentSettingModal_deployment on ModelDeployment {\n  id\n  metadata {\n    name\n    tags\n    resourceGroupName\n  }\n  networkAccess {\n    openToPublic\n  }\n  replicaState {\n    desiredReplicaCount\n  }\n}\n\nfragment FolderLink_vfolderNode on VirtualFolderNode {\n  row_id\n  name\n  ...VFolderNodeIdenticonFragment\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n"
  }
};
})();

(node as any).hash = "2d2ffabcc8d5601d5443ec9e7163704b";

export default node;
