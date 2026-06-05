/**
 * @generated SignedSource<<70fcaa48685ae57861069c9ffa4941c6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ClusterMode = "MULTI_NODE" | "SINGLE_NODE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type DeploymentAddRevisionModal_revisionSource$data = {
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
  readonly " $fragmentType": "DeploymentAddRevisionModal_revisionSource";
};
export type DeploymentAddRevisionModal_revisionSource$key = {
  readonly " $data"?: DeploymentAddRevisionModal_revisionSource$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentAddRevisionModal_revisionSource">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = [
  (v0/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "value",
    "storageKey": null
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "vfolderId",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mountDestination",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentAddRevisionModal_revisionSource",
  "selections": [
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
              "selections": (v1/*: any*/),
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
      "concreteType": "ExtraVFolderMountInfo",
      "kind": "LinkedField",
      "name": "extraMounts",
      "plural": true,
      "selections": [
        (v2/*: any*/),
        (v3/*: any*/)
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
          "kind": "ScalarField",
          "name": "runtimeVariantId",
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
            (v0/*: any*/)
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
              "selections": (v1/*: any*/),
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
        (v2/*: any*/),
        (v3/*: any*/),
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
            (v0/*: any*/),
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
    {
      "alias": null,
      "args": null,
      "concreteType": "ImageV2",
      "kind": "LinkedField",
      "name": "imageV2",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        },
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
    }
  ],
  "type": "ModelRevision",
  "abstractKey": null
};
})();

(node as any).hash = "d5d51918866d0b82f8843dc8acb580ee";

export default node;
