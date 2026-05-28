/**
 * @generated SignedSource<<c441ec51b572d441d2923f3c3be1fdad>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ClusterMode = "MULTI_NODE" | "SINGLE_NODE" | "%future added value";
export type AddRevisionInput = {
  clusterConfig?: ClusterConfigInput | null | undefined;
  deploymentId: string;
  extraMounts?: ReadonlyArray<ExtraVFolderMountInput> | null | undefined;
  image?: ImageInput | null | undefined;
  modelDefinition?: ModelDefinitionInput | null | undefined;
  modelMountConfig: ModelMountConfigInput;
  modelRuntimeConfig?: ModelRuntimeConfigInput | null | undefined;
  options?: AddRevisionOptions | null | undefined;
  resourceConfig?: ResourceConfigInput | null | undefined;
  revisionPresetId?: string | null | undefined;
};
export type ClusterConfigInput = {
  mode: ClusterMode;
  size: number;
};
export type ResourceConfigInput = {
  resourceOpts?: ResourceOptsInput | null | undefined;
  resourceSlots: ResourceSlotInput;
};
export type ResourceSlotInput = {
  entries: ReadonlyArray<ResourceSlotEntryInput>;
};
export type ResourceSlotEntryInput = {
  quantity: string;
  resourceType: string;
};
export type ResourceOptsInput = {
  entries: ReadonlyArray<ResourceOptsEntryInput>;
};
export type ResourceOptsEntryInput = {
  name: string;
  value: string;
};
export type ImageInput = {
  id: string;
};
export type ModelRuntimeConfigInput = {
  environ?: EnvironmentVariablesInput | null | undefined;
  runtimeVariantId: string;
};
export type EnvironmentVariablesInput = {
  entries: ReadonlyArray<EnvironmentVariableEntryInput>;
};
export type EnvironmentVariableEntryInput = {
  name: string;
  value: string;
};
export type ModelMountConfigInput = {
  definitionPath?: string | null | undefined;
  mountDestination: string;
  subpath?: string | null | undefined;
  vfolderId: string;
};
export type ModelDefinitionInput = {
  models?: ReadonlyArray<ModelConfigInput> | null | undefined;
};
export type ModelConfigInput = {
  metadata?: ModelMetadataInput | null | undefined;
  modelPath?: string | null | undefined;
  name?: string | null | undefined;
  service?: ModelServiceConfigInput | null | undefined;
};
export type ModelServiceConfigInput = {
  healthCheck?: ModelHealthCheckInput | null | undefined;
  port?: number | null | undefined;
  preStartActions?: ReadonlyArray<PreStartActionInput> | null | undefined;
  shell?: string | null | undefined;
  startCommand?: ReadonlyArray<string> | null | undefined;
};
export type PreStartActionInput = {
  action: string;
  args: any;
};
export type ModelHealthCheckInput = {
  expectedStatusCode?: number | null | undefined;
  initialDelay?: number | null | undefined;
  interval?: number | null | undefined;
  maxRetries?: number | null | undefined;
  maxWaitTime?: number | null | undefined;
  path?: string | null | undefined;
};
export type ModelMetadataInput = {
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
export type ExtraVFolderMountInput = {
  mountDestination?: string | null | undefined;
  subpath?: string | null | undefined;
  vfolderId: string;
};
export type AddRevisionOptions = {
  autoActivate?: boolean;
};
export type DeploymentAddRevisionModalAddMutation$variables = {
  input: AddRevisionInput;
};
export type DeploymentAddRevisionModalAddMutation$data = {
  readonly addModelRevision: {
    readonly revision: {
      readonly deployment: {
        readonly currentRevision: {
          readonly id: string;
          readonly " $fragmentSpreads": FragmentRefs<"DeploymentRevisionDetail_revision">;
        } | null | undefined;
        readonly currentRevisionId: string | null | undefined;
        readonly deployingRevision: {
          readonly id: string;
          readonly " $fragmentSpreads": FragmentRefs<"DeploymentRevisionDetail_revision">;
        } | null | undefined;
        readonly deployingRevisionId: string | null | undefined;
        readonly id: string;
      } | null | undefined;
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"DeploymentRevisionDetail_revision">;
    };
  } | null | undefined;
};
export type DeploymentAddRevisionModalAddMutation = {
  response: DeploymentAddRevisionModalAddMutation$data;
  variables: DeploymentAddRevisionModalAddMutation$variables;
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
  "args": null,
  "kind": "FragmentSpread",
  "name": "DeploymentRevisionDetail_revision"
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "currentRevisionId",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "deployingRevisionId",
  "storageKey": null
},
v6 = [
  (v2/*: any*/),
  (v3/*: any*/)
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "revisionNumber",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v9 = {
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
v10 = {
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
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v12 = {
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
        (v11/*: any*/),
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
          "selections": [
            (v11/*: any*/),
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
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "vfolderId",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountDestination",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "concreteType": "VirtualFolderNode",
  "kind": "LinkedField",
  "name": "vfolder",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    (v11/*: any*/),
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
v16 = {
  "alias": null,
  "args": null,
  "concreteType": "ModelMountConfig",
  "kind": "LinkedField",
  "name": "modelMountConfig",
  "plural": false,
  "selections": [
    (v13/*: any*/),
    (v14/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "definitionPath",
      "storageKey": null
    },
    (v15/*: any*/)
  ],
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "concreteType": "ExtraVFolderMountInfoGQL",
  "kind": "LinkedField",
  "name": "extraMounts",
  "plural": true,
  "selections": [
    (v13/*: any*/),
    (v14/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "mountPerm",
      "storageKey": null
    },
    (v15/*: any*/)
  ],
  "storageKey": null
},
v18 = {
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
v19 = {
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
        (v11/*: any*/),
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
},
v20 = [
  (v2/*: any*/),
  (v7/*: any*/),
  (v8/*: any*/),
  (v9/*: any*/),
  (v10/*: any*/),
  (v12/*: any*/),
  (v16/*: any*/),
  (v17/*: any*/),
  (v18/*: any*/),
  (v19/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentAddRevisionModalAddMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "AddRevisionPayload",
        "kind": "LinkedField",
        "name": "addModelRevision",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelRevision",
            "kind": "LinkedField",
            "name": "revision",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelDeployment",
                "kind": "LinkedField",
                "name": "deployment",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModelRevision",
                    "kind": "LinkedField",
                    "name": "currentRevision",
                    "plural": false,
                    "selections": (v6/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModelRevision",
                    "kind": "LinkedField",
                    "name": "deployingRevision",
                    "plural": false,
                    "selections": (v6/*: any*/),
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
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentAddRevisionModalAddMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "AddRevisionPayload",
        "kind": "LinkedField",
        "name": "addModelRevision",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelRevision",
            "kind": "LinkedField",
            "name": "revision",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              (v12/*: any*/),
              (v16/*: any*/),
              (v17/*: any*/),
              (v18/*: any*/),
              (v19/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelDeployment",
                "kind": "LinkedField",
                "name": "deployment",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModelRevision",
                    "kind": "LinkedField",
                    "name": "currentRevision",
                    "plural": false,
                    "selections": (v20/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModelRevision",
                    "kind": "LinkedField",
                    "name": "deployingRevision",
                    "plural": false,
                    "selections": (v20/*: any*/),
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
    "cacheID": "c41c4fbca087bff66b8fc129607c8344",
    "id": null,
    "metadata": {},
    "name": "DeploymentAddRevisionModalAddMutation",
    "operationKind": "mutation",
    "text": "mutation DeploymentAddRevisionModalAddMutation(\n  $input: AddRevisionInput!\n) {\n  addModelRevision(input: $input) {\n    revision {\n      id\n      ...DeploymentRevisionDetail_revision\n      deployment @since(version: \"26.4.4\") {\n        id\n        currentRevisionId\n        deployingRevisionId\n        currentRevision @since(version: \"26.4.3\") {\n          id\n          ...DeploymentRevisionDetail_revision\n        }\n        deployingRevision @since(version: \"26.4.3\") {\n          id\n          ...DeploymentRevisionDetail_revision\n        }\n      }\n    }\n  }\n}\n\nfragment DeploymentRevisionDetail_revision on ModelRevision {\n  id\n  revisionNumber\n  createdAt\n  clusterConfig {\n    mode\n    size\n  }\n  resourceSlots @since(version: \"26.4.2\") {\n    slotName\n    quantity\n  }\n  modelRuntimeConfig {\n    runtimeVariant {\n      name\n      id\n    }\n    environ {\n      entries {\n        name\n        value\n      }\n    }\n  }\n  modelMountConfig {\n    vfolderId\n    mountDestination\n    definitionPath\n    vfolder {\n      id\n      name\n      ...FolderLink_vfolderNode\n    }\n  }\n  extraMounts {\n    vfolderId\n    mountDestination\n    mountPerm\n    vfolder {\n      id\n      name\n      ...FolderLink_vfolderNode\n    }\n  }\n  imageV2 @since(version: \"26.4.3\") {\n    id\n    identity {\n      canonicalName\n      architecture\n    }\n  }\n  modelDefinition {\n    models {\n      name\n      modelPath\n      service {\n        startCommand\n        port\n        healthCheck {\n          path\n          initialDelay\n          maxRetries\n          interval\n          maxWaitTime\n        }\n      }\n    }\n  }\n}\n\nfragment FolderLink_vfolderNode on VirtualFolderNode {\n  row_id\n  name\n  ...VFolderNodeIdenticonFragment\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n"
  }
};
})();

(node as any).hash = "889773e313c63748043b8294cd2bb0b0";

export default node;
