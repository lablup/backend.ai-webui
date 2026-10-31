/**
 * @generated SignedSource<<afd55156db94a8890715ea7720aa4d07>>
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
        readonly entityId: string;
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
    "name": "limit",
    "value": 100
  },
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
  "name": "entityId",
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
v5 = {
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
        "storageKey": "deploymentRevisionPresets(limit:100,orderBy:[{\"direction\":\"ASC\",\"field\":\"RANK\"}])"
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
                      (v1/*: any*/),
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
                    "concreteType": "ImageV2",
                    "kind": "LinkedField",
                    "name": "image",
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
                    "concreteType": "PresetModelDefinition",
                    "kind": "LinkedField",
                    "name": "modelDefinition",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PresetModelConfig",
                        "kind": "LinkedField",
                        "name": "models",
                        "plural": true,
                        "selections": [
                          (v3/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "PresetModelServiceConfig",
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
        "storageKey": "deploymentRevisionPresets(limit:100,orderBy:[{\"direction\":\"ASC\",\"field\":\"RANK\"}])"
      }
    ]
  },
  "params": {
    "cacheID": "b4cf2b3b2d48cb666f90cc0f9b54116a",
    "id": null,
    "metadata": {},
    "name": "VFolderDeployModalQuery",
    "operationKind": "query",
    "text": "query VFolderDeployModalQuery {\n  deploymentRevisionPresets(orderBy: [{field: RANK, direction: \"ASC\"}], limit: 100) {\n    edges {\n      node {\n        id\n        entityId\n        name\n        runtimeVariantId\n        ...DeploymentPresetDetailModalFragment\n      }\n    }\n  }\n}\n\nfragment DeploymentPresetDetailModalFragment on DeploymentRevisionPreset {\n  id\n  entityId\n  name\n  description\n  runtimeVariantId\n  runtimeVariant {\n    id\n    name\n  }\n  cluster {\n    clusterMode\n    clusterSize\n  }\n  execution {\n    imageId\n    startupCommand\n    bootstrapScript\n    environ {\n      key\n      value\n    }\n  }\n  image {\n    id\n    identity {\n      canonicalName\n    }\n  }\n  resource {\n    resourceOpts {\n      name\n      value\n    }\n  }\n  resourceSlots {\n    slotName\n    quantity\n  }\n  deploymentDefaults {\n    openToPublic\n    replicaCount\n    revisionHistoryLimit\n    deploymentStrategy\n  }\n  presetValues {\n    presetId\n    value\n  }\n  modelDefinition {\n    models {\n      name\n      service {\n        healthCheck {\n          enable\n          interval\n          path\n          maxRetries\n          maxWaitTime\n          expectedStatusCode\n          initialDelay\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5d3a5c1bfbb783daaae685243682171c";

export default node;
