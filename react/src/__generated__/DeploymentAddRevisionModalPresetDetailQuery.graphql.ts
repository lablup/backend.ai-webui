/**
 * @generated SignedSource<<92b861309e9bef644771840ac7633bc5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentAddRevisionModalPresetDetailQuery$variables = {
  id: string;
};
export type DeploymentAddRevisionModalPresetDetailQuery$data = {
  readonly deploymentRevisionPreset: {
    readonly " $fragmentSpreads": FragmentRefs<"DeploymentPresetDetailModalFragment">;
  } | null | undefined;
};
export type DeploymentAddRevisionModalPresetDetailQuery = {
  response: DeploymentAddRevisionModalPresetDetailQuery$data;
  variables: DeploymentAddRevisionModalPresetDetailQuery$variables;
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
  "name": "value",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentAddRevisionModalPresetDetailQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeploymentRevisionPreset",
        "kind": "LinkedField",
        "name": "deploymentRevisionPreset",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "DeploymentPresetDetailModalFragment"
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
    "name": "DeploymentAddRevisionModalPresetDetailQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeploymentRevisionPreset",
        "kind": "LinkedField",
        "name": "deploymentRevisionPreset",
        "plural": false,
        "selections": [
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
                  (v3/*: any*/),
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "3cd5360d55a3a08852095eb16f44dfc3",
    "id": null,
    "metadata": {},
    "name": "DeploymentAddRevisionModalPresetDetailQuery",
    "operationKind": "query",
    "text": "query DeploymentAddRevisionModalPresetDetailQuery(\n  $id: UUID!\n) {\n  deploymentRevisionPreset(id: $id) {\n    ...DeploymentPresetDetailModalFragment\n    id\n  }\n}\n\nfragment DeploymentPresetDetailModalFragment on DeploymentRevisionPreset {\n  id\n  name\n  description\n  runtimeVariantId\n  runtimeVariant @since(version: \"26.4.3\") {\n    id\n    name\n  }\n  cluster {\n    clusterMode\n    clusterSize\n  }\n  execution {\n    imageId @since(version: \"26.4.4\")\n    startupCommand\n    bootstrapScript\n    environ {\n      key\n      value\n    }\n  }\n  resource {\n    resourceOpts {\n      name\n      value\n    }\n  }\n  resourceSlots @since(version: \"26.4.4\") {\n    slotName\n    quantity\n  }\n  deploymentDefaults {\n    openToPublic\n    replicaCount\n    revisionHistoryLimit\n    deploymentStrategy\n  }\n  presetValues {\n    presetId\n    value\n  }\n}\n"
  }
};
})();

(node as any).hash = "8f60ae6bcf0fa60919e80838391f66f9";

export default node;
