/**
 * @generated SignedSource<<ffcf46f4839958aca53e7833413006a8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentStatus = "DEPLOYING" | "PENDING" | "READY" | "SCALING" | "STOPPED" | "STOPPING" | "%future added value";
export type DeploymentDetailPageQuery$variables = {
  deploymentId: string;
};
export type DeploymentDetailPageQuery$data = {
  readonly deployment: {
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
      readonly openToPublic: boolean;
    };
    readonly " $fragmentSpreads": FragmentRefs<"DeploymentAccessTokensTab_deployment" | "DeploymentAutoScalingTab_deployment" | "DeploymentConfigurationSection_deployment" | "DeploymentReplicasTab_deployment">;
  } | null | undefined;
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
  "kind": "ScalarField",
  "name": "openToPublic",
  "storageKey": null
},
v7 = [
  (v2/*: any*/)
],
v8 = {
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
v11 = [
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
          (v3/*: any*/),
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
              (v3/*: any*/),
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
      {
        "alias": null,
        "args": null,
        "concreteType": "VirtualFolderNode",
        "kind": "LinkedField",
        "name": "vfolder",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      }
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
      {
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
              (v5/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelDeploymentNetworkAccess",
            "kind": "LinkedField",
            "name": "networkAccess",
            "plural": false,
            "selections": [
              (v6/*: any*/)
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
            "selections": (v7/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelRevision",
            "kind": "LinkedField",
            "name": "deployingRevision",
            "plural": false,
            "selections": (v7/*: any*/),
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
              (v8/*: any*/)
            ],
            "storageKey": null
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
                "name": "tags",
                "storageKey": null
              },
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
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelDeploymentNetworkAccess",
            "kind": "LinkedField",
            "name": "networkAccess",
            "plural": false,
            "selections": [
              (v6/*: any*/),
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
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelRevision",
            "kind": "LinkedField",
            "name": "currentRevision",
            "plural": false,
            "selections": (v11/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelRevision",
            "kind": "LinkedField",
            "name": "deployingRevision",
            "plural": false,
            "selections": (v11/*: any*/),
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
              (v8/*: any*/),
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
    "cacheID": "2148ac335e3326b1eee8b62f1a42475f",
    "id": null,
    "metadata": {},
    "name": "DeploymentDetailPageQuery",
    "operationKind": "query",
    "text": "query DeploymentDetailPageQuery(\n  $deploymentId: ID!\n) {\n  deployment(id: $deploymentId) {\n    id\n    metadata {\n      name\n      status\n      projectId\n    }\n    networkAccess {\n      openToPublic\n    }\n    currentRevision @since(version: \"26.4.3\") {\n      id\n    }\n    deployingRevision @since(version: \"26.4.3\") {\n      id\n    }\n    creator @since(version: \"26.4.3\") {\n      basicInfo {\n        email\n      }\n      id\n    }\n    ...DeploymentConfigurationSection_deployment\n    ...DeploymentReplicasTab_deployment\n    ...DeploymentAccessTokensTab_deployment\n    ...DeploymentAutoScalingTab_deployment\n  }\n}\n\nfragment DeploymentAccessTokensTab_deployment on ModelDeployment {\n  id\n}\n\nfragment DeploymentAutoScalingTab_deployment on ModelDeployment {\n  id\n  metadata {\n    status\n  }\n  creator @since(version: \"26.4.3\") {\n    basicInfo {\n      email\n    }\n    id\n  }\n}\n\nfragment DeploymentConfigurationSection_deployment on ModelDeployment {\n  id\n  ...DeploymentSettingModal_deployment\n  metadata {\n    name\n    projectId\n    domainName\n    status\n    resourceGroupName\n    projectV2 @since(version: \"26.4.3\") {\n      basicInfo {\n        name\n      }\n      id\n    }\n    ...DeploymentTagChips_metadata\n  }\n  networkAccess {\n    openToPublic\n    endpointUrl\n  }\n  replicaState {\n    desiredReplicaCount\n  }\n  currentRevision @since(version: \"26.4.3\") {\n    id\n    revisionNumber\n    ...DeploymentRevisionDetail_revision\n  }\n  deployingRevision @since(version: \"26.4.3\") {\n    id\n    revisionNumber\n    ...DeploymentRevisionDetail_revision\n  }\n  ...DeploymentRevisionHistoryTab_deployment\n}\n\nfragment DeploymentReplicasTab_deployment on ModelDeployment {\n  id\n}\n\nfragment DeploymentRevisionDetail_revision on ModelRevision {\n  id\n  revisionNumber\n  createdAt\n  clusterConfig {\n    mode\n    size\n  }\n  resourceSlots @since(version: \"26.4.2\") {\n    slotName\n    quantity\n  }\n  modelRuntimeConfig {\n    runtimeVariant {\n      name\n      id\n    }\n    environ {\n      entries {\n        name\n        value\n      }\n    }\n  }\n  modelMountConfig {\n    vfolderId\n    mountDestination\n    definitionPath\n    vfolder {\n      id\n      name\n    }\n  }\n  extraMounts {\n    vfolderId\n    mountDestination\n    mountPerm\n    vfolder {\n      id\n      name\n      ...FolderLink_vfolderNode\n    }\n  }\n  imageV2 @since(version: \"26.4.3\") {\n    id\n    identity {\n      canonicalName\n    }\n  }\n  modelDefinition {\n    models {\n      name\n      modelPath\n      service {\n        startCommand\n        port\n        healthCheck {\n          path\n          initialDelay\n          maxRetries\n          interval\n          maxWaitTime\n        }\n      }\n    }\n  }\n}\n\nfragment DeploymentRevisionHistoryTab_deployment on ModelDeployment {\n  id\n}\n\nfragment DeploymentSettingModal_deployment on ModelDeployment {\n  id\n  metadata {\n    name\n    tags\n    resourceGroupName\n  }\n  networkAccess {\n    openToPublic\n  }\n  replicaState {\n    desiredReplicaCount\n  }\n}\n\nfragment DeploymentTagChips_metadata on ModelDeploymentMetadata {\n  tags\n}\n\nfragment FolderLink_vfolderNode on VirtualFolderNode {\n  row_id\n  name\n}\n"
  }
};
})();

(node as any).hash = "34d6b01c2963997caff182213908d483";

export default node;
