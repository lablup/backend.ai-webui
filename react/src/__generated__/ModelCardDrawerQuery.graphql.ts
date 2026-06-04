/**
 * @generated SignedSource<<0b583b4ce3d68ab06a1a6110c191e1d7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModelCardDrawerQuery$variables = {
  id: string;
};
export type ModelCardDrawerQuery$data = {
  readonly modelCardV2: {
    readonly " $fragmentSpreads": FragmentRefs<"ModelCardDrawerFragment">;
  } | null | undefined;
};
export type ModelCardDrawerQuery = {
  response: ModelCardDrawerQuery$data;
  variables: ModelCardDrawerQuery$variables;
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
  "name": "description",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "quantity",
  "storageKey": null
},
v6 = {
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
    "name": "ModelCardDrawerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModelCardV2",
        "kind": "LinkedField",
        "name": "modelCardV2",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ModelCardDrawerFragment"
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
    "name": "ModelCardDrawerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModelCardV2",
        "kind": "LinkedField",
        "name": "modelCardV2",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelCardV2Metadata",
            "kind": "LinkedField",
            "name": "metadata",
            "plural": false,
            "selections": [
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
                "name": "author",
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
                "name": "modelVersion",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelCardV2ResourceSlotEntry",
            "kind": "LinkedField",
            "name": "minResource",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "resourceType",
                "storageKey": null
              },
              (v5/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "readme",
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
            "kind": "ScalarField",
            "name": "updatedAt",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "VFolder",
            "kind": "LinkedField",
            "name": "vfolder",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "VFolderMetadataInfo",
                "kind": "LinkedField",
                "name": "metadata",
                "plural": false,
                "selections": [
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": [
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
            "concreteType": "DeploymentRevisionPresetConnection",
            "kind": "LinkedField",
            "name": "availablePresets",
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
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "runtimeVariantId",
                        "storageKey": null
                      },
                      (v4/*: any*/),
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
                          (v5/*: any*/)
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
                          (v6/*: any*/)
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
            "storageKey": "availablePresets(orderBy:[{\"direction\":\"ASC\",\"field\":\"RANK\"}])"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "45a3bcd6feb2070e79e85c08cc1029fa",
    "id": null,
    "metadata": {},
    "name": "ModelCardDrawerQuery",
    "operationKind": "query",
    "text": "query ModelCardDrawerQuery(\n  $id: UUID!\n) {\n  modelCardV2(id: $id) {\n    ...ModelCardDrawerFragment\n    id\n  }\n}\n\nfragment DeploymentPresetDetailModalFragment on DeploymentRevisionPreset {\n  id\n  name\n  description\n  runtimeVariantId\n  runtimeVariant {\n    id\n    name\n  }\n  cluster {\n    clusterMode\n    clusterSize\n  }\n  execution {\n    imageId @since(version: \"26.4.4rc6\")\n    startupCommand\n    bootstrapScript\n    environ @since(version: \"26.4.4rc6\") {\n      key\n      value\n    }\n  }\n  resource {\n    resourceOpts {\n      name\n      value\n    }\n  }\n  resourceSlots @since(version: \"26.4.4rc6\") {\n    slotName\n    quantity\n  }\n  deploymentDefaults {\n    openToPublic\n    replicaCount\n    revisionHistoryLimit\n    deploymentStrategy\n  }\n  presetValues {\n    presetId\n    value\n  }\n}\n\nfragment ModelCardDeployModalFragment on ModelCardV2 {\n  id\n  availablePresets(orderBy: [{field: RANK, direction: \"ASC\"}]) {\n    edges {\n      node {\n        id\n        name\n        runtimeVariantId\n        ...DeploymentPresetDetailModalFragment\n      }\n    }\n  }\n}\n\nfragment ModelCardDrawerFragment on ModelCardV2 {\n  id\n  name\n  metadata {\n    title\n    author\n    description\n    task\n    category\n    architecture\n    framework\n    label\n    license\n    modelVersion\n  }\n  minResource {\n    resourceType\n    quantity\n  }\n  readme\n  createdAt\n  updatedAt\n  vfolder {\n    id\n    metadata {\n      name\n    }\n    ...VFolderNodeIdenticonV2Fragment\n  }\n  ...ModelCardDeployModalFragment\n}\n\nfragment VFolderNodeIdenticonV2Fragment on VFolder {\n  id\n}\n"
  }
};
})();

(node as any).hash = "aae8009299cc5bf23145d14d99a6db4e";

export default node;
