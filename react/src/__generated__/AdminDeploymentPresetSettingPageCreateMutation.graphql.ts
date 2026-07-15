/**
 * @generated SignedSource<<5fd4151c93dbeed64db2bc9a56772a03>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ClusterMode = "MULTI_NODE" | "SINGLE_NODE" | "%future added value";
export type DeploymentStrategyType = "BLUE_GREEN" | "ROLLING" | "%future added value";
export type CreateDeploymentRevisionPresetInput = {
  bootstrapScript?: string | null | undefined;
  clusterMode: ClusterMode;
  clusterSize: number;
  deploymentStrategy: PresetDeploymentStrategyInput;
  description?: string | null | undefined;
  environ?: ReadonlyArray<EnvironEntryInput> | null | undefined;
  imageId: string;
  modelDefinition?: PresetModelDefinitionInput | null | undefined;
  name: string;
  openToPublic?: boolean | null | undefined;
  presetValues?: ReadonlyArray<RuntimeVariantPresetValueEntryInput> | null | undefined;
  replicaCount: number;
  resourceOpts?: ReadonlyArray<ResourceOptsEntryInput> | null | undefined;
  resourceSlots?: ReadonlyArray<ResourceSlotEntryInput> | null | undefined;
  revisionHistoryLimit?: number | null | undefined;
  runtimeVariantId: string;
  startupCommand?: string | null | undefined;
};
export type PresetDeploymentStrategyInput = {
  blueGreen?: BlueGreenConfigInput | null | undefined;
  rollingUpdate?: RollingUpdateConfigInput | null | undefined;
  type: DeploymentStrategyType;
};
export type RollingUpdateConfigInput = {
  maxSurge?: IntOrPercentInput | null | undefined;
  maxUnavailable?: IntOrPercentInput | null | undefined;
};
export type IntOrPercentInput = {
  count?: number | null | undefined;
  percent?: number | null | undefined;
};
export type BlueGreenConfigInput = {
  autoPromote?: boolean;
  promoteDelaySeconds?: number;
};
export type PresetModelDefinitionInput = {
  models: ReadonlyArray<PresetModelConfigInput>;
};
export type PresetModelConfigInput = {
  metadata?: PresetModelMetadataInput | null | undefined;
  modelPath: string;
  name: string;
  service: PresetModelServiceConfigInput;
};
export type PresetModelServiceConfigInput = {
  command?: string | null | undefined;
  healthCheck?: PresetModelHealthCheckInput | null | undefined;
  port: number;
  preStartActions: ReadonlyArray<PreStartActionInput>;
  shell?: string | null | undefined;
  startCommand?: ReadonlyArray<string> | null | undefined;
};
export type PreStartActionInput = {
  action: string;
  args: any;
};
export type PresetModelHealthCheckInput = {
  enable?: boolean;
  expectedStatusCode?: number;
  initialDelay?: number;
  interval?: number;
  maxRetries?: number;
  maxWaitTime?: number;
  path?: string;
};
export type PresetModelMetadataInput = {
  architecture?: string | null | undefined;
  author?: string | null | undefined;
  category?: string | null | undefined;
  created?: string | null | undefined;
  description?: string | null | undefined;
  framework?: ReadonlyArray<string> | null | undefined;
  label?: ReadonlyArray<string> | null | undefined;
  lastModified?: string | null | undefined;
  license?: string | null | undefined;
  minResource?: any | null | undefined;
  task?: string | null | undefined;
  title?: string | null | undefined;
  version?: string | null | undefined;
};
export type ResourceSlotEntryInput = {
  quantity: string;
  resourceType: string;
};
export type ResourceOptsEntryInput = {
  name: string;
  value: string;
};
export type EnvironEntryInput = {
  key: string;
  value: string;
};
export type RuntimeVariantPresetValueEntryInput = {
  presetId: string;
  value: string;
};
export type AdminDeploymentPresetSettingPageCreateMutation$variables = {
  input: CreateDeploymentRevisionPresetInput;
};
export type AdminDeploymentPresetSettingPageCreateMutation$data = {
  readonly adminCreateDeploymentRevisionPreset: {
    readonly preset: {
      readonly id: string;
      readonly name: string;
      readonly " $fragmentSpreads": FragmentRefs<"AdminDeploymentPresetSettingPageContent_preset">;
    };
  } | null | undefined;
};
export type AdminDeploymentPresetSettingPageCreateMutation = {
  response: AdminDeploymentPresetSettingPageCreateMutation$data;
  variables: AdminDeploymentPresetSettingPageCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
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
  "name": "description",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminDeploymentPresetSettingPageCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateDeploymentRevisionPresetPayload",
        "kind": "LinkedField",
        "name": "adminCreateDeploymentRevisionPreset",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DeploymentRevisionPreset",
            "kind": "LinkedField",
            "name": "preset",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "AdminDeploymentPresetSettingPageContent_preset"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminDeploymentPresetSettingPageCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateDeploymentRevisionPresetPayload",
        "kind": "LinkedField",
        "name": "adminCreateDeploymentRevisionPreset",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DeploymentRevisionPreset",
            "kind": "LinkedField",
            "name": "preset",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
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
                  (v2/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PresetClusterSpec",
                "kind": "LinkedField",
                "name": "cluster",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "clusterMode",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "clusterSize",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PresetExecutionSpec",
                "kind": "LinkedField",
                "name": "execution",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "imageId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "startupCommand",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "bootstrapScript",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "DeploymentRevisionPresetEnvironEntry",
                    "kind": "LinkedField",
                    "name": "environ",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "key",
                        "storageKey": null
                      },
                      (v5/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PresetResourceAllocation",
                "kind": "LinkedField",
                "name": "resource",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ResourceOptsEntry",
                    "kind": "LinkedField",
                    "name": "resourceOpts",
                    "plural": true,
                    "selections": [
                      (v3/*: any*/),
                      (v5/*: any*/)
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
                "concreteType": "PresetDeploymentDefaults",
                "kind": "LinkedField",
                "name": "deploymentDefaults",
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
                    "name": "replicaCount",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "revisionHistoryLimit",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "deploymentStrategy",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "RuntimeVariantPresetValueEntry",
                "kind": "LinkedField",
                "name": "presetValues",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "presetId",
                    "storageKey": null
                  },
                  (v5/*: any*/)
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
                                "name": "interval",
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
                                "name": "initialDelay",
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
                        "concreteType": "ModelMetadata",
                        "kind": "LinkedField",
                        "name": "metadata",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "author",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "title",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "version",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "created",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "lastModified",
                            "storageKey": null
                          },
                          (v4/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "task",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "category",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "architecture",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "framework",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "label",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "license",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "minResource",
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
    ]
  },
  "params": {
    "cacheID": "39908cd22197e970143e7bb293833d4e",
    "id": null,
    "metadata": {},
    "name": "AdminDeploymentPresetSettingPageCreateMutation",
    "operationKind": "mutation",
    "text": "mutation AdminDeploymentPresetSettingPageCreateMutation(\n  $input: CreateDeploymentRevisionPresetInput!\n) {\n  adminCreateDeploymentRevisionPreset(input: $input) {\n    preset {\n      id\n      name\n      ...AdminDeploymentPresetSettingPageContent_preset\n    }\n  }\n}\n\nfragment AdminDeploymentPresetSettingPageContent_preset on DeploymentRevisionPreset {\n  id\n  name\n  description\n  runtimeVariantId\n  runtimeVariant {\n    name\n    id\n  }\n  cluster {\n    clusterMode\n    clusterSize\n  }\n  execution {\n    imageId\n    startupCommand\n    bootstrapScript\n    environ {\n      key\n      value\n    }\n  }\n  resource {\n    resourceOpts {\n      name\n      value\n    }\n  }\n  resourceSlots {\n    slotName\n    quantity\n  }\n  deploymentDefaults {\n    openToPublic\n    replicaCount\n    revisionHistoryLimit\n    deploymentStrategy\n  }\n  presetValues @since(version: \"26.4.4rc9\") {\n    presetId\n    value\n  }\n  modelDefinition {\n    models {\n      name\n      modelPath\n      service {\n        preStartActions {\n          action\n          args\n        }\n        startCommand\n        shell\n        port\n        healthCheck {\n          enable @since(version: \"26.4.4rc7\")\n          interval\n          path\n          maxRetries\n          maxWaitTime\n          expectedStatusCode\n          initialDelay\n        }\n      }\n      metadata {\n        author\n        title\n        version\n        created\n        lastModified\n        description\n        task\n        category\n        architecture\n        framework\n        label\n        license\n        minResource\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "fab415497baadf2f70cc5fa305f5833c";

export default node;
