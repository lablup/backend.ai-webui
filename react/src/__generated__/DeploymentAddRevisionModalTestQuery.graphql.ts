/**
 * @generated SignedSource<<12b46d578adee9f29caf5e1857818545>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentAddRevisionModalTestQuery$variables = {
  id: string;
};
export type DeploymentAddRevisionModalTestQuery$data = {
  readonly deployment: {
    readonly " $fragmentSpreads": FragmentRefs<"DeploymentAddRevisionModal_deployment">;
  } | null | undefined;
};
export type DeploymentAddRevisionModalTestQuery = {
  response: DeploymentAddRevisionModalTestQuery$data;
  variables: DeploymentAddRevisionModalTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
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
  "name": "vfolderId",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountDestination",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v7 = [
  (v3/*: any*/),
  (v6/*: any*/)
],
v8 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v9 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v10 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v11 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v12 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v13 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Float"
},
v14 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "UUID"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentAddRevisionModalTestQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "DeploymentAddRevisionModal_deployment"
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
    "name": "DeploymentAddRevisionModalTestQuery",
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
                "name": "projectId",
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
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelRevision",
            "kind": "LinkedField",
            "name": "currentRevision",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelMountConfig",
                "kind": "LinkedField",
                "name": "modelMountConfig",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  (v5/*: any*/),
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
                  }
                ],
                "storageKey": null
              },
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
                        "selections": (v7/*: any*/),
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
                "concreteType": "ExtraVFolderMountInfo",
                "kind": "LinkedField",
                "name": "extraMounts",
                "plural": true,
                "selections": [
                  (v4/*: any*/),
                  (v5/*: any*/)
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
                    "kind": "ScalarField",
                    "name": "runtimeVariantId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "RuntimeVariant",
                    "kind": "LinkedField",
                    "name": "runtimeVariant",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "readsVfolderConfigFiles",
                        "storageKey": null
                      },
                      (v2/*: any*/)
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
                        "selections": (v7/*: any*/),
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
                      (v6/*: any*/)
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
                      (v3/*: any*/),
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
                            "name": "shell",
                            "storageKey": null
                          },
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
                                "name": "enable",
                                "storageKey": null
                              },
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
                                "name": "maxRetries",
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
              (v2/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a8b14c2c5e1167bc0f7fe2ca1782e211",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "deployment": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ModelDeployment"
        },
        "deployment.currentRevision": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ModelRevision"
        },
        "deployment.currentRevision.clusterConfig": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ClusterConfig"
        },
        "deployment.currentRevision.clusterConfig.mode": {
          "enumValues": [
            "SINGLE_NODE",
            "MULTI_NODE"
          ],
          "nullable": false,
          "plural": false,
          "type": "ClusterMode"
        },
        "deployment.currentRevision.clusterConfig.size": (v8/*: any*/),
        "deployment.currentRevision.extraMounts": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ExtraVFolderMountInfo"
        },
        "deployment.currentRevision.extraMounts.mountDestination": (v9/*: any*/),
        "deployment.currentRevision.extraMounts.vfolderId": (v10/*: any*/),
        "deployment.currentRevision.id": (v10/*: any*/),
        "deployment.currentRevision.imageV2": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ImageV2"
        },
        "deployment.currentRevision.imageV2.id": (v10/*: any*/),
        "deployment.currentRevision.imageV2.identity": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ImageV2IdentityInfo"
        },
        "deployment.currentRevision.imageV2.identity.architecture": (v11/*: any*/),
        "deployment.currentRevision.imageV2.identity.canonicalName": (v11/*: any*/),
        "deployment.currentRevision.modelDefinition": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ModelDefinition"
        },
        "deployment.currentRevision.modelDefinition.models": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ModelConfig"
        },
        "deployment.currentRevision.modelDefinition.models.modelPath": (v11/*: any*/),
        "deployment.currentRevision.modelDefinition.models.name": (v11/*: any*/),
        "deployment.currentRevision.modelDefinition.models.service": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ModelServiceConfig"
        },
        "deployment.currentRevision.modelDefinition.models.service.command": (v9/*: any*/),
        "deployment.currentRevision.modelDefinition.models.service.healthCheck": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ModelHealthCheck"
        },
        "deployment.currentRevision.modelDefinition.models.service.healthCheck.enable": (v12/*: any*/),
        "deployment.currentRevision.modelDefinition.models.service.healthCheck.expectedStatusCode": (v8/*: any*/),
        "deployment.currentRevision.modelDefinition.models.service.healthCheck.initialDelay": (v13/*: any*/),
        "deployment.currentRevision.modelDefinition.models.service.healthCheck.interval": (v13/*: any*/),
        "deployment.currentRevision.modelDefinition.models.service.healthCheck.maxRetries": (v8/*: any*/),
        "deployment.currentRevision.modelDefinition.models.service.healthCheck.maxWaitTime": (v13/*: any*/),
        "deployment.currentRevision.modelDefinition.models.service.healthCheck.path": (v11/*: any*/),
        "deployment.currentRevision.modelDefinition.models.service.port": (v8/*: any*/),
        "deployment.currentRevision.modelDefinition.models.service.preStartActions": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "PreStartAction"
        },
        "deployment.currentRevision.modelDefinition.models.service.preStartActions.action": (v11/*: any*/),
        "deployment.currentRevision.modelDefinition.models.service.preStartActions.args": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "JSON"
        },
        "deployment.currentRevision.modelDefinition.models.service.shell": (v9/*: any*/),
        "deployment.currentRevision.modelDefinition.models.service.startCommand": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "String"
        },
        "deployment.currentRevision.modelMountConfig": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ModelMountConfig"
        },
        "deployment.currentRevision.modelMountConfig.definitionPath": (v11/*: any*/),
        "deployment.currentRevision.modelMountConfig.mountDestination": (v11/*: any*/),
        "deployment.currentRevision.modelMountConfig.subpath": (v9/*: any*/),
        "deployment.currentRevision.modelMountConfig.vfolderId": (v10/*: any*/),
        "deployment.currentRevision.modelRuntimeConfig": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ModelRuntimeConfig"
        },
        "deployment.currentRevision.modelRuntimeConfig.environ": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "EnvironmentVariables"
        },
        "deployment.currentRevision.modelRuntimeConfig.environ.entries": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "EnvironmentVariableEntry"
        },
        "deployment.currentRevision.modelRuntimeConfig.environ.entries.name": (v11/*: any*/),
        "deployment.currentRevision.modelRuntimeConfig.environ.entries.value": (v11/*: any*/),
        "deployment.currentRevision.modelRuntimeConfig.runtimeVariant": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "RuntimeVariant"
        },
        "deployment.currentRevision.modelRuntimeConfig.runtimeVariant.id": (v10/*: any*/),
        "deployment.currentRevision.modelRuntimeConfig.runtimeVariant.name": (v11/*: any*/),
        "deployment.currentRevision.modelRuntimeConfig.runtimeVariant.readsVfolderConfigFiles": (v12/*: any*/),
        "deployment.currentRevision.modelRuntimeConfig.runtimeVariantId": (v14/*: any*/),
        "deployment.currentRevision.modelRuntimeConfig.runtimeVariantPresetValues": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "RuntimeVariantPresetValue"
        },
        "deployment.currentRevision.modelRuntimeConfig.runtimeVariantPresetValues.presetId": (v14/*: any*/),
        "deployment.currentRevision.modelRuntimeConfig.runtimeVariantPresetValues.value": (v11/*: any*/),
        "deployment.currentRevision.resourceConfig": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ResourceConfig"
        },
        "deployment.currentRevision.resourceConfig.resourceOpts": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ResourceOpts"
        },
        "deployment.currentRevision.resourceConfig.resourceOpts.entries": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ResourceOptsEntry"
        },
        "deployment.currentRevision.resourceConfig.resourceOpts.entries.name": (v11/*: any*/),
        "deployment.currentRevision.resourceConfig.resourceOpts.entries.value": (v11/*: any*/),
        "deployment.currentRevision.resourceSlots": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "AllocatedResourceSlot"
        },
        "deployment.currentRevision.resourceSlots.quantity": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Decimal"
        },
        "deployment.currentRevision.resourceSlots.slotName": (v11/*: any*/),
        "deployment.id": (v10/*: any*/),
        "deployment.metadata": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ModelDeploymentMetadata"
        },
        "deployment.metadata.projectId": (v10/*: any*/),
        "deployment.metadata.projectV2": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2"
        },
        "deployment.metadata.projectV2.basicInfo": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectBasicInfo"
        },
        "deployment.metadata.projectV2.basicInfo.name": (v11/*: any*/),
        "deployment.metadata.projectV2.id": (v10/*: any*/),
        "deployment.metadata.resourceGroupName": (v11/*: any*/)
      }
    },
    "name": "DeploymentAddRevisionModalTestQuery",
    "operationKind": "query",
    "text": "query DeploymentAddRevisionModalTestQuery(\n  $id: ID!\n) {\n  deployment(id: $id) {\n    ...DeploymentAddRevisionModal_deployment\n    id\n  }\n}\n\nfragment DeploymentAddRevisionModal_deployment on ModelDeployment {\n  id\n  metadata {\n    resourceGroupName\n    projectId\n    projectV2 @since(version: \"26.4.3\") {\n      basicInfo {\n        name\n      }\n      id\n    }\n  }\n  currentRevision @since(version: \"26.4.3\") {\n    modelMountConfig {\n      vfolderId\n    }\n    ...DeploymentAddRevisionModal_revisionSource\n    id\n  }\n}\n\nfragment DeploymentAddRevisionModal_revisionSource on ModelRevision {\n  clusterConfig {\n    mode\n    size\n  }\n  resourceConfig {\n    resourceOpts {\n      entries {\n        name\n        value\n      }\n    }\n  }\n  resourceSlots {\n    slotName\n    quantity\n  }\n  extraMounts {\n    vfolderId\n    mountDestination\n  }\n  modelRuntimeConfig {\n    runtimeVariantId\n    runtimeVariant {\n      name\n      readsVfolderConfigFiles @since(version: \"26.8.0\")\n      id\n    }\n    environ {\n      entries {\n        name\n        value\n      }\n    }\n    runtimeVariantPresetValues @since(version: \"26.4.4rc9\") {\n      presetId\n      value\n    }\n  }\n  modelMountConfig {\n    vfolderId\n    mountDestination\n    definitionPath\n    subpath @since(version: \"26.4.4\")\n  }\n  modelDefinition {\n    models {\n      name\n      modelPath\n      service {\n        command @since(version: \"26.7.0\")\n        shell @since(version: \"26.7.0\")\n        startCommand\n        port\n        preStartActions {\n          action\n          args\n        }\n        healthCheck {\n          enable @since(version: \"26.4.4\")\n          path\n          maxRetries\n          initialDelay\n          interval\n          maxWaitTime\n          expectedStatusCode\n        }\n      }\n    }\n  }\n  imageV2 {\n    id\n    identity {\n      canonicalName\n      architecture\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "712963e8e77c3b16000f97fb1b37a55c";

export default node;
