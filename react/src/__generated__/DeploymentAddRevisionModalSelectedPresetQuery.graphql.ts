/**
 * @generated SignedSource<<31015edd75c6d675606f44ecf84504c5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentAddRevisionModalSelectedPresetQuery$variables = {
  id: string;
};
export type DeploymentAddRevisionModalSelectedPresetQuery$data = {
  readonly deploymentRevisionPreset: {
    readonly cluster: {
      readonly clusterMode: string;
      readonly clusterSize: number;
    };
    readonly execution: {
      readonly environ: ReadonlyArray<{
        readonly key: string;
        readonly value: string;
      }>;
      readonly imageId: string | null | undefined;
    };
    readonly id: string;
    readonly image: {
      readonly id: string;
      readonly identity: {
        readonly architecture: string;
        readonly canonicalName: string;
      };
    } | null | undefined;
    readonly resource: {
      readonly resourceOpts: ReadonlyArray<{
        readonly name: string;
        readonly value: string;
      }>;
    };
    readonly resourceSlots: ReadonlyArray<{
      readonly quantity: any;
      readonly slotName: string;
    }> | null | undefined;
    readonly runtimeVariantId: string;
  } | null | undefined;
};
export type DeploymentAddRevisionModalSelectedPresetQuery = {
  response: DeploymentAddRevisionModalSelectedPresetQuery$data;
  variables: DeploymentAddRevisionModalSelectedPresetQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
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
  "name": "value",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "DeploymentRevisionPreset",
    "kind": "LinkedField",
    "name": "deploymentRevisionPreset",
    "plural": false,
    "selections": [
      (v1/*: any*/),
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
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
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
    "name": "DeploymentAddRevisionModalSelectedPresetQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentAddRevisionModalSelectedPresetQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "1b523f8b6328d6a99b6da08afe341484",
    "id": null,
    "metadata": {},
    "name": "DeploymentAddRevisionModalSelectedPresetQuery",
    "operationKind": "query",
    "text": "query DeploymentAddRevisionModalSelectedPresetQuery(\n  $id: UUID!\n) {\n  deploymentRevisionPreset(id: $id) {\n    id\n    runtimeVariantId\n    cluster {\n      clusterMode\n      clusterSize\n    }\n    execution {\n      imageId\n      environ {\n        key\n        value\n      }\n    }\n    image @since(version: \"26.4.4\") {\n      id\n      identity {\n        canonicalName\n        architecture\n      }\n    }\n    resource {\n      resourceOpts {\n        name\n        value\n      }\n    }\n    resourceSlots {\n      slotName\n      quantity\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "54c744fe0ec3f54a44f0617718898002";

export default node;
