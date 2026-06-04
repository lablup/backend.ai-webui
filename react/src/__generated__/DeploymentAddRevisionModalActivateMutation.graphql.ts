/**
 * @generated SignedSource<<3d5bc49028c9a3798ae283e964144431>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ActivateRevisionInput = {
  deploymentId: string;
  revisionId: string;
};
export type DeploymentAddRevisionModalActivateMutation$variables = {
  input: ActivateRevisionInput;
};
export type DeploymentAddRevisionModalActivateMutation$data = {
  readonly activateDeploymentRevision: {
    readonly activatedRevisionId: string;
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
    };
    readonly previousRevisionId: string | null | undefined;
  } | null | undefined;
};
export type DeploymentAddRevisionModalActivateMutation = {
  response: DeploymentAddRevisionModalActivateMutation$data;
  variables: DeploymentAddRevisionModalActivateMutation$variables;
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
  "name": "currentRevisionId",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "deployingRevisionId",
  "storageKey": null
},
v5 = [
  (v2/*: any*/),
  {
    "args": null,
    "kind": "FragmentSpread",
    "name": "DeploymentRevisionDetail_revision"
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "previousRevisionId",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "activatedRevisionId",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "vfolderId",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountDestination",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "concreteType": "VirtualFolderNode",
  "kind": "LinkedField",
  "name": "vfolder",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    (v8/*: any*/),
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
v12 = [
  (v2/*: any*/),
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
          (v8/*: any*/),
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
              (v8/*: any*/),
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
      (v9/*: any*/),
      (v10/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "definitionPath",
        "storageKey": null
      },
      (v11/*: any*/)
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
      (v9/*: any*/),
      (v10/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "mountPerm",
        "storageKey": null
      },
      (v11/*: any*/)
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
          (v8/*: any*/),
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentAddRevisionModalActivateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ActivateRevisionPayload",
        "kind": "LinkedField",
        "name": "activateDeploymentRevision",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelDeployment",
            "kind": "LinkedField",
            "name": "deployment",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelRevision",
                "kind": "LinkedField",
                "name": "currentRevision",
                "plural": false,
                "selections": (v5/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelRevision",
                "kind": "LinkedField",
                "name": "deployingRevision",
                "plural": false,
                "selections": (v5/*: any*/),
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v6/*: any*/),
          (v7/*: any*/)
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
    "name": "DeploymentAddRevisionModalActivateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ActivateRevisionPayload",
        "kind": "LinkedField",
        "name": "activateDeploymentRevision",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelDeployment",
            "kind": "LinkedField",
            "name": "deployment",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelRevision",
                "kind": "LinkedField",
                "name": "currentRevision",
                "plural": false,
                "selections": (v12/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelRevision",
                "kind": "LinkedField",
                "name": "deployingRevision",
                "plural": false,
                "selections": (v12/*: any*/),
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v6/*: any*/),
          (v7/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "3cc270593faa4f93f8727a3671bd134a",
    "id": null,
    "metadata": {},
    "name": "DeploymentAddRevisionModalActivateMutation",
    "operationKind": "mutation",
    "text": "mutation DeploymentAddRevisionModalActivateMutation(\n  $input: ActivateRevisionInput!\n) {\n  activateDeploymentRevision(input: $input) {\n    deployment {\n      id\n      currentRevisionId\n      deployingRevisionId\n      currentRevision @since(version: \"26.4.3\") {\n        id\n        ...DeploymentRevisionDetail_revision\n      }\n      deployingRevision @since(version: \"26.4.3\") {\n        id\n        ...DeploymentRevisionDetail_revision\n      }\n    }\n    previousRevisionId\n    activatedRevisionId\n  }\n}\n\nfragment DeploymentRevisionDetail_revision on ModelRevision {\n  id\n  revisionNumber @since(version: \"26.4.4\")\n  createdAt\n  clusterConfig {\n    mode\n    size\n  }\n  resourceSlots @since(version: \"26.4.4\") {\n    slotName\n    quantity\n  }\n  modelRuntimeConfig {\n    runtimeVariant @since(version: \"26.4.4\") {\n      name\n      id\n    }\n    environ {\n      entries {\n        name\n        value\n      }\n    }\n  }\n  modelMountConfig {\n    vfolderId\n    mountDestination\n    definitionPath\n    vfolder {\n      id\n      name\n      ...FolderLink_vfolderNode\n    }\n  }\n  extraMounts {\n    vfolderId\n    mountDestination\n    mountPerm @since(version: \"26.4.4\")\n    vfolder {\n      id\n      name\n      ...FolderLink_vfolderNode\n    }\n  }\n  imageV2 @since(version: \"26.4.3\") {\n    id\n    identity {\n      canonicalName\n      architecture\n    }\n  }\n  modelDefinition {\n    models {\n      name\n      modelPath\n      service {\n        startCommand\n        port\n        healthCheck {\n          path\n          initialDelay\n          maxRetries\n          interval\n          maxWaitTime\n        }\n      }\n    }\n  }\n}\n\nfragment FolderLink_vfolderNode on VirtualFolderNode {\n  row_id\n  name\n  ...VFolderNodeIdenticonFragment\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n"
  }
};
})();

(node as any).hash = "62c983f2bae48a0d6cf7b2230fd4397f";

export default node;
