/**
 * @generated SignedSource<<b76ca3267cff275fdfdff6c9dcf3157c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VFolderDeployModalQuery$variables = {
  vfolderGlobalId: string;
};
export type VFolderDeployModalQuery$data = {
  readonly deploymentRevisionPresets: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string;
        readonly runtimeVariantId: string;
        readonly " $fragmentSpreads": FragmentRefs<"DeploymentPresetDetailModalFragment">;
      };
    }>;
  } | null | undefined;
  readonly vfolder_node: {
    readonly group: string | null | undefined;
    readonly group_name: string | null | undefined;
    readonly ownership_type: string | null | undefined;
  } | null | undefined;
};
export type VFolderDeployModalQuery = {
  response: VFolderDeployModalQuery$data;
  variables: VFolderDeployModalQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "vfolderGlobalId"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "ASC",
        "field": "RANK"
      }
    ]
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
  "name": "runtimeVariantId",
  "storageKey": null
},
v5 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "vfolderGlobalId"
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ownership_type",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "group",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "group_name",
  "storageKey": null
},
v9 = {
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
    "name": "VFolderDeployModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeploymentRevisionPresetConnection",
        "kind": "LinkedField",
        "name": "deploymentRevisionPresets",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DeploymentRevisionPresetEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "DeploymentRevisionPreset",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "DeploymentPresetDetailModalFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "deploymentRevisionPresets(orderBy:[{\"direction\":\"ASC\",\"field\":\"RANK\"}])"
      },
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "VirtualFolderNode",
        "kind": "LinkedField",
        "name": "vfolder_node",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/)
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
    "name": "VFolderDeployModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeploymentRevisionPresetConnection",
        "kind": "LinkedField",
        "name": "deploymentRevisionPresets",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DeploymentRevisionPresetEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "DeploymentRevisionPreset",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "description",
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
                      (v2/*: any*/),
                      (v3/*: any*/)
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
                          (v9/*: any*/)
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
                    "name": "image",
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
                          (v9/*: any*/)
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
                      (v9/*: any*/)
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
                            "concreteType": "ModelServiceConfig",
                            "kind": "LinkedField",
                            "name": "service",
                            "plural": false,
                            "selections": [
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
        "storageKey": "deploymentRevisionPresets(orderBy:[{\"direction\":\"ASC\",\"field\":\"RANK\"}])"
      },
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "VirtualFolderNode",
        "kind": "LinkedField",
        "name": "vfolder_node",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/),
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "751a09d7896e426072bc1f0438f7f92d",
    "id": null,
    "metadata": {},
    "name": "VFolderDeployModalQuery",
    "operationKind": "query",
    "text": "query VFolderDeployModalQuery(\n  $vfolderGlobalId: String!\n) {\n  deploymentRevisionPresets(orderBy: [{field: RANK, direction: \"ASC\"}]) {\n    edges {\n      node {\n        id\n        name\n        runtimeVariantId\n        ...DeploymentPresetDetailModalFragment\n      }\n    }\n  }\n  vfolder_node(id: $vfolderGlobalId) {\n    ownership_type\n    group\n    group_name\n    id\n  }\n}\n\nfragment DeploymentPresetDetailModalFragment on DeploymentRevisionPreset {\n  id\n  name\n  description\n  runtimeVariantId\n  runtimeVariant {\n    id\n    name\n  }\n  cluster {\n    clusterMode\n    clusterSize\n  }\n  execution {\n    imageId\n    startupCommand\n    bootstrapScript\n    environ {\n      key\n      value\n    }\n  }\n  image @since(version: \"26.4.4\") {\n    id\n    identity {\n      canonicalName\n    }\n  }\n  resource {\n    resourceOpts {\n      name\n      value\n    }\n  }\n  resourceSlots {\n    slotName\n    quantity\n  }\n  deploymentDefaults {\n    openToPublic\n    replicaCount\n    revisionHistoryLimit\n    deploymentStrategy\n  }\n  presetValues @since(version: \"26.4.4rc9\") {\n    presetId\n    value\n  }\n  modelDefinition {\n    models {\n      name\n      service {\n        healthCheck {\n          enable @since(version: \"26.4.4rc7\")\n          interval\n          path\n          maxRetries\n          maxWaitTime\n          expectedStatusCode\n          initialDelay\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1d876243e0514f1a8f7f8379dfdce54c";

export default node;
