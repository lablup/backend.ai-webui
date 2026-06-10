/**
 * @generated SignedSource<<f32f32fdb29659c09ff5a63f8e3194b8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ClusterMode = "MULTI_NODE" | "SINGLE_NODE" | "%future added value";
export type MountPermission = "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type DeploymentRevisionDetail_revision$data = {
  readonly clusterConfig: {
    readonly mode: ClusterMode;
    readonly size: number;
  };
  readonly createdAt: string;
  readonly extraMounts: ReadonlyArray<{
    readonly mountDestination: string | null | undefined;
    readonly mountPerm: MountPermission;
    readonly vfolder: {
      readonly id: string;
      readonly name: string | null | undefined;
      readonly " $fragmentSpreads": FragmentRefs<"FolderLink_vfolderNode">;
    } | null | undefined;
    readonly vfolderId: string;
  }>;
  readonly id: string;
  readonly imageV2: {
    readonly id: string;
    readonly identity: {
      readonly architecture: string;
      readonly canonicalName: string;
    };
  } | null | undefined;
  readonly modelDefinition: {
    readonly models: ReadonlyArray<{
      readonly modelPath: string;
      readonly name: string;
      readonly service: {
        readonly healthCheck: {
          readonly expectedStatusCode: number;
          readonly initialDelay: number;
          readonly interval: number;
          readonly maxRetries: number;
          readonly maxWaitTime: number;
          readonly path: string;
        } | null | undefined;
        readonly port: number;
        readonly preStartActions: ReadonlyArray<{
          readonly action: string;
          readonly args: any;
        }>;
        readonly shell: string;
        readonly startCommand: ReadonlyArray<string> | null | undefined;
      } | null | undefined;
    }>;
  } | null | undefined;
  readonly modelMountConfig: {
    readonly definitionPath: string;
    readonly mountDestination: string;
    readonly vfolder: {
      readonly id: string;
      readonly name: string | null | undefined;
      readonly " $fragmentSpreads": FragmentRefs<"FolderLink_vfolderNode">;
    } | null | undefined;
    readonly vfolderId: string;
  } | null | undefined;
  readonly modelRuntimeConfig: {
    readonly environ: {
      readonly entries: ReadonlyArray<{
        readonly name: string;
        readonly value: string;
      }>;
    } | null | undefined;
    readonly inferenceRuntimeConfig: any | null | undefined;
    readonly runtimeVariant: {
      readonly name: string;
    } | null | undefined;
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
  readonly revisionNumber: number;
  readonly " $fragmentType": "DeploymentRevisionDetail_revision";
};
export type DeploymentRevisionDetail_revision$key = {
  readonly " $data"?: DeploymentRevisionDetail_revision$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentRevisionDetail_revision">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = [
  (v1/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "value",
    "storageKey": null
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "vfolderId",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountDestination",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "VirtualFolderNode",
  "kind": "LinkedField",
  "name": "vfolder",
  "plural": false,
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "FolderLink_vfolderNode"
    }
  ],
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentRevisionDetail_revision",
  "selections": [
    (v0/*: any*/),
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
              "selections": (v2/*: any*/),
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
              "selections": (v2/*: any*/),
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
        (v3/*: any*/),
        (v4/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "definitionPath",
          "storageKey": null
        },
        (v5/*: any*/)
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
        (v3/*: any*/),
        (v4/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "mountPerm",
          "storageKey": null
        },
        (v5/*: any*/)
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
        (v0/*: any*/),
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
            (v1/*: any*/),
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
};
})();

(node as any).hash = "bc669fc911f7565b73ca025a9cbedf70";

export default node;
