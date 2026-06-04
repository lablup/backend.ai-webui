/**
 * @generated SignedSource<<7f8bc0a0950d85fd506a5bf402a86e8f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ClusterMode = "MULTI_NODE" | "SINGLE_NODE" | "%future added value";
export type DeploymentAddRevisionModalQuery$variables = {
  deploymentId: string;
};
export type DeploymentAddRevisionModalQuery$data = {
  readonly deployment: {
    readonly currentRevision: {
      readonly clusterConfig: {
        readonly mode: ClusterMode;
        readonly size: number;
      };
      readonly extraMounts: ReadonlyArray<{
        readonly mountDestination: string | null | undefined;
        readonly vfolderId: string;
      }>;
      readonly imageV2: {
        readonly id: string;
        readonly identity: {
          readonly canonicalName: string;
        };
      } | null | undefined;
      readonly modelDefinition: {
        readonly models: ReadonlyArray<{
          readonly modelPath: string;
          readonly name: string;
          readonly service: {
            readonly healthCheck: {
              readonly initialDelay: number;
              readonly interval: number;
              readonly maxRetries: number;
              readonly maxWaitTime: number;
              readonly path: string;
            } | null | undefined;
            readonly port: number;
            readonly startCommand: ReadonlyArray<string> | null | undefined;
          } | null | undefined;
        }>;
      } | null | undefined;
      readonly modelMountConfig: {
        readonly definitionPath: string;
        readonly mountDestination: string;
        readonly vfolderId: string;
      } | null | undefined;
      readonly modelRuntimeConfig: {
        readonly environ: {
          readonly entries: ReadonlyArray<{
            readonly name: string;
            readonly value: string;
          }>;
        } | null | undefined;
        readonly runtimeVariant: {
          readonly name: string;
        } | null | undefined;
        readonly runtimeVariantId: string;
      };
      readonly resourceConfig: {
        readonly resourceOpts: {
          readonly entries: ReadonlyArray<{
            readonly name: string;
            readonly value: string;
          }>;
        } | null | undefined;
      };
      readonly resourceSlots: ReadonlyArray<{
        readonly quantity: any;
        readonly slotName: string;
      }> | null | undefined;
    } | null | undefined;
    readonly metadata: {
      readonly resourceGroupName: string;
    };
  } | null | undefined;
};
export type DeploymentAddRevisionModalQuery = {
  response: DeploymentAddRevisionModalQuery$data;
  variables: DeploymentAddRevisionModalQuery$variables;
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
    }
  ],
  "storageKey": null
},
v3 = {
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
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = [
  (v4/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "value",
    "storageKey": null
  }
],
v6 = {
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
          "selections": (v5/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v7 = {
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
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "vfolderId",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountDestination",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "concreteType": "ExtraVFolderMountInfoGQL",
  "kind": "LinkedField",
  "name": "extraMounts",
  "plural": true,
  "selections": [
    (v8/*: any*/),
    (v9/*: any*/)
  ],
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "runtimeVariantId",
  "storageKey": null
},
v12 = {
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
      "selections": (v5/*: any*/),
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
    (v8/*: any*/),
    (v9/*: any*/),
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
v14 = {
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
        (v4/*: any*/),
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
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
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
    (v15/*: any*/),
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
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentAddRevisionModalQuery",
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
            "concreteType": "ModelRevision",
            "kind": "LinkedField",
            "name": "currentRevision",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v10/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelRuntimeConfig",
                "kind": "LinkedField",
                "name": "modelRuntimeConfig",
                "plural": false,
                "selections": [
                  (v11/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "RuntimeVariant",
                    "kind": "LinkedField",
                    "name": "runtimeVariant",
                    "plural": false,
                    "selections": [
                      (v4/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v12/*: any*/)
                ],
                "storageKey": null
              },
              (v13/*: any*/),
              (v14/*: any*/),
              (v16/*: any*/)
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
    "name": "DeploymentAddRevisionModalQuery",
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
            "concreteType": "ModelRevision",
            "kind": "LinkedField",
            "name": "currentRevision",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v10/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelRuntimeConfig",
                "kind": "LinkedField",
                "name": "modelRuntimeConfig",
                "plural": false,
                "selections": [
                  (v11/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "RuntimeVariant",
                    "kind": "LinkedField",
                    "name": "runtimeVariant",
                    "plural": false,
                    "selections": [
                      (v4/*: any*/),
                      (v15/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v12/*: any*/)
                ],
                "storageKey": null
              },
              (v13/*: any*/),
              (v14/*: any*/),
              (v16/*: any*/),
              (v15/*: any*/)
            ],
            "storageKey": null
          },
          (v15/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "497a1085ae38758ea6445199f349af85",
    "id": null,
    "metadata": {},
    "name": "DeploymentAddRevisionModalQuery",
    "operationKind": "query",
    "text": "query DeploymentAddRevisionModalQuery(\n  $deploymentId: ID!\n) {\n  deployment(id: $deploymentId) {\n    metadata {\n      resourceGroupName @since(version: \"26.4.4rc5\")\n    }\n    currentRevision {\n      clusterConfig {\n        mode\n        size\n      }\n      resourceConfig {\n        resourceOpts {\n          entries {\n            name\n            value\n          }\n        }\n      }\n      resourceSlots @since(version: \"26.4.4rc5\") {\n        slotName\n        quantity\n      }\n      extraMounts {\n        vfolderId\n        mountDestination\n      }\n      modelRuntimeConfig {\n        runtimeVariantId @since(version: \"26.4.4rc5\")\n        runtimeVariant @since(version: \"26.4.4rc5\") {\n          name\n          id\n        }\n        environ {\n          entries {\n            name\n            value\n          }\n        }\n      }\n      modelMountConfig {\n        vfolderId\n        mountDestination\n        definitionPath\n      }\n      modelDefinition {\n        models {\n          name\n          modelPath\n          service {\n            startCommand\n            port\n            healthCheck {\n              path\n              maxRetries\n              initialDelay\n              interval\n              maxWaitTime\n            }\n          }\n        }\n      }\n      imageV2 {\n        id\n        identity {\n          canonicalName\n        }\n      }\n      id\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "028cf653855d6e17766df41609c49ebf";

export default node;
