/**
 * @generated SignedSource<<5254c4d22e152308aad716d5f7306c54>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentsAstryxProbeQuery$variables = Record<PropertyKey, never>;
export type DeploymentsAstryxProbeQuery$data = {
  readonly revision: {
    readonly revisionDetail?: {
      readonly " $fragmentSpreads": FragmentRefs<"DeploymentRevisionDetail_revision">;
    } | null | undefined;
  } | null | undefined;
};
export type DeploymentsAstryxProbeQuery = {
  response: DeploymentsAstryxProbeQuery$data;
  variables: DeploymentsAstryxProbeQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "probe-revision"
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
  "name": "vfolderId",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountDestination",
  "storageKey": null
},
v7 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentsAstryxProbeQuery",
    "selections": [
      {
        "alias": "revision",
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "fragment": {
                  "kind": "InlineFragment",
                  "selections": [
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "DeploymentRevisionDetail_revision"
                    }
                  ],
                  "type": "ModelRevision",
                  "abstractKey": null
                },
                "kind": "AliasedInlineFragmentSpread",
                "name": "revisionDetail"
              }
            ],
            "type": "ModelRevision",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"probe-revision\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "DeploymentsAstryxProbeQuery",
    "selections": [
      {
        "alias": "revision",
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v1/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
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
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "key",
                                "storageKey": null
                              }
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
                  (v5/*: any*/),
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "definitionPath",
                    "storageKey": null
                  },
                  (v7/*: any*/)
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
                  (v5/*: any*/),
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "mountPerm",
                    "storageKey": null
                  },
                  (v7/*: any*/)
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
            "type": "ModelRevision",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"probe-revision\")"
      }
    ]
  },
  "params": {
    "cacheID": "bd4fb636467e6d0e7d56b60bdbcae7cd",
    "id": null,
    "metadata": {},
    "name": "DeploymentsAstryxProbeQuery",
    "operationKind": "query",
    "text": "query DeploymentsAstryxProbeQuery {\n  revision: node(id: \"probe-revision\") {\n    __typename\n    ... on ModelRevision {\n      ...DeploymentRevisionDetail_revision\n    }\n    id\n  }\n}\n\nfragment DeploymentRevisionDetail_revision on ModelRevision {\n  id\n  revisionNumber\n  createdAt\n  clusterConfig {\n    mode\n    size\n  }\n  resourceSlots @since(version: \"26.4.2\") {\n    slotName\n    quantity\n  }\n  resourceConfig {\n    resourceOpts {\n      entries {\n        name\n        value\n      }\n    }\n  }\n  modelRuntimeConfig {\n    runtimeVariant {\n      name\n      id\n    }\n    inferenceRuntimeConfig\n    environ {\n      entries {\n        name\n        value\n      }\n    }\n    runtimeVariantPresetValues @since(version: \"26.4.4rc9\") {\n      presetId\n      value\n      preset {\n        name\n        displayName\n        targetSpec {\n          key\n        }\n        id\n      }\n    }\n  }\n  modelMountConfig {\n    vfolderId\n    mountDestination\n    definitionPath\n    vfolder {\n      id\n      name\n      ...FolderLink_vfolderNode\n    }\n  }\n  extraMounts {\n    vfolderId\n    mountDestination\n    mountPerm\n    vfolder {\n      id\n      name\n      ...FolderLink_vfolderNode\n    }\n  }\n  imageV2 @since(version: \"26.4.3\") {\n    id\n    identity {\n      canonicalName\n      architecture\n    }\n  }\n  modelDefinition {\n    models {\n      name\n      modelPath\n      service {\n        startCommand\n        shell\n        port\n        preStartActions {\n          action\n          args\n        }\n        healthCheck {\n          path\n          initialDelay\n          maxRetries\n          interval\n          maxWaitTime\n          expectedStatusCode\n        }\n      }\n    }\n  }\n}\n\nfragment FolderLink_vfolderNode on VirtualFolderNode {\n  row_id\n  name\n  ...VFolderNodeIdenticonFragment\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n"
  }
};
})();

(node as any).hash = "dadc52f8413585c0a896f2eabe34fc57";

export default node;
