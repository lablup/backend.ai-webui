/**
 * @generated SignedSource<<26dda7b9c176b2151ee36be5a9fd862a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VFolderDeployModalQuery$variables = Record<PropertyKey, never>;
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
};
export type VFolderDeployModalQuery = {
  response: VFolderDeployModalQuery$data;
  variables: VFolderDeployModalQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
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
  "name": "runtimeVariantId",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "VFolderDeployModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
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
                  (v1/*: any*/),
                  (v2/*: any*/),
                  (v3/*: any*/),
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
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "VFolderDeployModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
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
                  (v1/*: any*/),
                  (v2/*: any*/),
                  (v3/*: any*/),
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
                      (v1/*: any*/),
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
                          (v4/*: any*/)
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
                          (v2/*: any*/),
                          (v4/*: any*/)
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
                    "concreteType": "DeploymentRevisionPresetValueEntry",
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
                      (v4/*: any*/)
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
      }
    ]
  },
  "params": {
    "cacheID": "fbd7120fdff10d7210abb1c324493486",
    "id": null,
    "metadata": {},
    "name": "VFolderDeployModalQuery",
    "operationKind": "query",
    "text": "query VFolderDeployModalQuery {\n  deploymentRevisionPresets(orderBy: [{field: RANK, direction: \"ASC\"}]) {\n    edges {\n      node {\n        id\n        name\n        runtimeVariantId\n        ...DeploymentPresetDetailModalFragment\n      }\n    }\n  }\n}\n\nfragment DeploymentPresetDetailModalFragment on DeploymentRevisionPreset {\n  id\n  name\n  description\n  runtimeVariantId\n  runtimeVariant {\n    id\n    name\n  }\n  cluster {\n    clusterMode\n    clusterSize\n  }\n  execution {\n    imageId\n    startupCommand\n    bootstrapScript\n    environ {\n      key\n      value\n    }\n  }\n  resource {\n    resourceOpts {\n      name\n      value\n    }\n  }\n  resourceSlots {\n    slotName\n    quantity\n  }\n  deploymentDefaults {\n    openToPublic\n    replicaCount\n    revisionHistoryLimit\n    deploymentStrategy\n  }\n  presetValues @since(version: \"26.4.4rc9\") {\n    presetId\n    value\n  }\n  modelDefinition {\n    models {\n      name\n      service {\n        healthCheck {\n          enable @since(version: \"26.4.4rc7\")\n          interval\n          path\n          maxRetries\n          maxWaitTime\n          expectedStatusCode\n          initialDelay\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "28257fbdb782608acef6e45d698dac96";

export default node;
