/**
 * @generated SignedSource<<2ec4f0d0d4e7470e13f80de2c5547182>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentRevisionDetailTestQuery$variables = Record<PropertyKey, never>;
export type DeploymentRevisionDetailTestQuery$data = {
  readonly revision: {
    readonly " $fragmentSpreads": FragmentRefs<"DeploymentRevisionDetail_revision">;
  } | null | undefined;
};
export type DeploymentRevisionDetailTestQuery = {
  response: DeploymentRevisionDetailTestQuery$data;
  variables: DeploymentRevisionDetailTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "test-revision"
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
  "name": "value",
  "storageKey": null
},
v4 = [
  (v2/*: any*/),
  (v3/*: any*/)
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "key",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "vfolderId",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountDestination",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "VirtualFolderNode",
  "kind": "LinkedField",
  "name": "vfolder",
  "plural": false,
  "selections": [
    (v1/*: any*/),
    (v2/*: any*/),
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
v9 = [
  (v5/*: any*/),
  (v3/*: any*/)
],
v10 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v11 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v12 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "VirtualFolderNode"
},
v13 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v14 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "UUID"
},
v15 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "UUID"
},
v16 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v17 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Float"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentRevisionDetailTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "ModelRevision",
        "kind": "LinkedField",
        "name": "revision",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "DeploymentRevisionDetail_revision"
          }
        ],
        "storageKey": "revision(id:\"test-revision\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "DeploymentRevisionDetailTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "ModelRevision",
        "kind": "LinkedField",
        "name": "revision",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "fieldId",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "revisionNumber",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "createdAt",
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
                    "selections": (v4/*: any*/),
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
                "selections": [
                  (v2/*: any*/),
                  (v1/*: any*/)
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
                    "selections": (v4/*: any*/),
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
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "RuntimeVariantPreset",
                    "kind": "LinkedField",
                    "name": "preset",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
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
                          (v5/*: any*/)
                        ],
                        "storageKey": null
                      },
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
            "concreteType": "ModelMountConfig",
            "kind": "LinkedField",
            "name": "modelMountConfig",
            "plural": false,
            "selections": [
              (v6/*: any*/),
              (v7/*: any*/),
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
              (v8/*: any*/)
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
              (v6/*: any*/),
              (v7/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "mountPerm",
                "storageKey": null
              },
              (v8/*: any*/)
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
              (v1/*: any*/),
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
                    "selections": (v9/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ImageV2LabelEntry",
                    "kind": "LinkedField",
                    "name": "labels",
                    "plural": true,
                    "selections": (v9/*: any*/),
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
                  (v2/*: any*/),
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
        "storageKey": "revision(id:\"test-revision\")"
      }
    ]
  },
  "params": {
    "cacheID": "5c962ecfd901fa1c15a5aa78f5e5e2ce",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "revision": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ModelRevision"
        },
        "revision.clusterConfig": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ClusterConfig"
        },
        "revision.clusterConfig.mode": {
          "enumValues": [
            "SINGLE_NODE",
            "MULTI_NODE"
          ],
          "nullable": false,
          "plural": false,
          "type": "ClusterMode"
        },
        "revision.clusterConfig.size": (v10/*: any*/),
        "revision.createdAt": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "DateTime"
        },
        "revision.extraMounts": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ExtraVFolderMountInfo"
        },
        "revision.extraMounts.mountDestination": (v11/*: any*/),
        "revision.extraMounts.mountPerm": {
          "enumValues": [
            "READ_ONLY",
            "READ_WRITE",
            "RW_DELETE"
          ],
          "nullable": false,
          "plural": false,
          "type": "MountPermission"
        },
        "revision.extraMounts.vfolder": (v12/*: any*/),
        "revision.extraMounts.vfolder.id": (v13/*: any*/),
        "revision.extraMounts.vfolder.name": (v11/*: any*/),
        "revision.extraMounts.vfolder.row_id": (v14/*: any*/),
        "revision.extraMounts.vfolderId": (v13/*: any*/),
        "revision.fieldId": (v15/*: any*/),
        "revision.id": (v13/*: any*/),
        "revision.imageV2": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ImageV2"
        },
        "revision.imageV2.id": (v13/*: any*/),
        "revision.imageV2.identity": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ImageV2IdentityInfo"
        },
        "revision.imageV2.identity.architecture": (v16/*: any*/),
        "revision.imageV2.identity.canonicalName": (v16/*: any*/),
        "revision.imageV2.metadata": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ImageV2MetadataInfo"
        },
        "revision.imageV2.metadata.labels": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ImageV2LabelEntry"
        },
        "revision.imageV2.metadata.labels.key": (v16/*: any*/),
        "revision.imageV2.metadata.labels.value": (v16/*: any*/),
        "revision.imageV2.metadata.tags": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ImageV2TagEntry"
        },
        "revision.imageV2.metadata.tags.key": (v16/*: any*/),
        "revision.imageV2.metadata.tags.value": (v16/*: any*/),
        "revision.modelDefinition": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ModelDefinition"
        },
        "revision.modelDefinition.models": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ModelConfig"
        },
        "revision.modelDefinition.models.modelPath": (v16/*: any*/),
        "revision.modelDefinition.models.name": (v16/*: any*/),
        "revision.modelDefinition.models.service": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ModelServiceConfig"
        },
        "revision.modelDefinition.models.service.command": (v11/*: any*/),
        "revision.modelDefinition.models.service.healthCheck": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ModelHealthCheck"
        },
        "revision.modelDefinition.models.service.healthCheck.expectedStatusCode": (v10/*: any*/),
        "revision.modelDefinition.models.service.healthCheck.initialDelay": (v17/*: any*/),
        "revision.modelDefinition.models.service.healthCheck.interval": (v17/*: any*/),
        "revision.modelDefinition.models.service.healthCheck.maxRetries": (v10/*: any*/),
        "revision.modelDefinition.models.service.healthCheck.maxWaitTime": (v17/*: any*/),
        "revision.modelDefinition.models.service.healthCheck.path": (v16/*: any*/),
        "revision.modelDefinition.models.service.port": (v10/*: any*/),
        "revision.modelDefinition.models.service.preStartActions": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "PreStartAction"
        },
        "revision.modelDefinition.models.service.preStartActions.action": (v16/*: any*/),
        "revision.modelDefinition.models.service.preStartActions.args": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "JSON"
        },
        "revision.modelDefinition.models.service.shell": (v11/*: any*/),
        "revision.modelDefinition.models.service.startCommand": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "String"
        },
        "revision.modelMountConfig": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ModelMountConfig"
        },
        "revision.modelMountConfig.definitionPath": (v16/*: any*/),
        "revision.modelMountConfig.mountDestination": (v16/*: any*/),
        "revision.modelMountConfig.subpath": (v11/*: any*/),
        "revision.modelMountConfig.vfolder": (v12/*: any*/),
        "revision.modelMountConfig.vfolder.id": (v13/*: any*/),
        "revision.modelMountConfig.vfolder.name": (v11/*: any*/),
        "revision.modelMountConfig.vfolder.row_id": (v14/*: any*/),
        "revision.modelMountConfig.vfolderId": (v13/*: any*/),
        "revision.modelRuntimeConfig": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ModelRuntimeConfig"
        },
        "revision.modelRuntimeConfig.environ": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "EnvironmentVariables"
        },
        "revision.modelRuntimeConfig.environ.entries": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "EnvironmentVariableEntry"
        },
        "revision.modelRuntimeConfig.environ.entries.name": (v16/*: any*/),
        "revision.modelRuntimeConfig.environ.entries.value": (v16/*: any*/),
        "revision.modelRuntimeConfig.inferenceRuntimeConfig": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "JSON"
        },
        "revision.modelRuntimeConfig.runtimeVariant": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "RuntimeVariant"
        },
        "revision.modelRuntimeConfig.runtimeVariant.id": (v13/*: any*/),
        "revision.modelRuntimeConfig.runtimeVariant.name": (v16/*: any*/),
        "revision.modelRuntimeConfig.runtimeVariantPresetValues": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "RuntimeVariantPresetValue"
        },
        "revision.modelRuntimeConfig.runtimeVariantPresetValues.preset": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "RuntimeVariantPreset"
        },
        "revision.modelRuntimeConfig.runtimeVariantPresetValues.preset.displayName": (v11/*: any*/),
        "revision.modelRuntimeConfig.runtimeVariantPresetValues.preset.id": (v13/*: any*/),
        "revision.modelRuntimeConfig.runtimeVariantPresetValues.preset.name": (v16/*: any*/),
        "revision.modelRuntimeConfig.runtimeVariantPresetValues.preset.targetSpec": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PresetTargetSpec"
        },
        "revision.modelRuntimeConfig.runtimeVariantPresetValues.preset.targetSpec.key": (v16/*: any*/),
        "revision.modelRuntimeConfig.runtimeVariantPresetValues.presetId": (v15/*: any*/),
        "revision.modelRuntimeConfig.runtimeVariantPresetValues.value": (v16/*: any*/),
        "revision.resourceConfig": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ResourceConfig"
        },
        "revision.resourceConfig.resourceOpts": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ResourceOpts"
        },
        "revision.resourceConfig.resourceOpts.entries": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ResourceOptsEntry"
        },
        "revision.resourceConfig.resourceOpts.entries.name": (v16/*: any*/),
        "revision.resourceConfig.resourceOpts.entries.value": (v16/*: any*/),
        "revision.resourceSlots": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "AllocatedResourceSlot"
        },
        "revision.resourceSlots.quantity": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Decimal"
        },
        "revision.resourceSlots.slotName": (v16/*: any*/),
        "revision.revisionNumber": (v10/*: any*/)
      }
    },
    "name": "DeploymentRevisionDetailTestQuery",
    "operationKind": "query",
    "text": "query DeploymentRevisionDetailTestQuery {\n  revision(id: \"test-revision\") {\n    ...DeploymentRevisionDetail_revision\n    id\n  }\n}\n\nfragment BAIImageNodeSimpleTagV2Fragment on ImageV2 {\n  identity {\n    canonicalName\n    architecture\n  }\n  metadata {\n    tags {\n      key\n      value\n    }\n    labels {\n      key\n      value\n    }\n  }\n}\n\nfragment DeploymentRevisionDetail_revision on ModelRevision {\n  id\n  fieldId\n  revisionNumber\n  createdAt\n  clusterConfig {\n    mode\n    size\n  }\n  resourceSlots {\n    slotName\n    quantity\n  }\n  resourceConfig {\n    resourceOpts {\n      entries {\n        name\n        value\n      }\n    }\n  }\n  modelRuntimeConfig {\n    runtimeVariant {\n      name\n      id\n    }\n    inferenceRuntimeConfig\n    environ {\n      entries {\n        name\n        value\n      }\n    }\n    runtimeVariantPresetValues {\n      presetId\n      value\n      preset {\n        name\n        displayName\n        targetSpec {\n          key\n        }\n        id\n      }\n    }\n  }\n  modelMountConfig {\n    vfolderId\n    mountDestination\n    definitionPath\n    subpath\n    vfolder {\n      id\n      name\n      ...FolderLink_vfolderNode\n    }\n  }\n  extraMounts {\n    vfolderId\n    mountDestination\n    mountPerm\n    vfolder {\n      id\n      name\n      ...FolderLink_vfolderNode\n    }\n  }\n  imageV2 {\n    id\n    identity {\n      canonicalName\n      architecture\n    }\n    ...BAIImageNodeSimpleTagV2Fragment\n  }\n  modelDefinition {\n    models {\n      name\n      modelPath\n      service {\n        command @since(version: \"26.7.0\")\n        startCommand\n        shell\n        port\n        preStartActions {\n          action\n          args\n        }\n        healthCheck {\n          path\n          initialDelay\n          maxRetries\n          interval\n          maxWaitTime\n          expectedStatusCode\n        }\n      }\n    }\n  }\n}\n\nfragment FolderLink_vfolderNode on VirtualFolderNode {\n  row_id\n  name\n  ...VFolderNodeIdenticonFragment\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n"
  }
};
})();

(node as any).hash = "3cdb8df1dfd0a6c7b103885563ef77c2";

export default node;
