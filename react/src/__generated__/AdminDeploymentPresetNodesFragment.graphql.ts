/**
 * @generated SignedSource<<fccecc4ed5b6d1562f24f9a79b09cc94>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type DeploymentStrategyType = "BLUE_GREEN" | "ROLLING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type AdminDeploymentPresetNodesFragment$data = ReadonlyArray<{
  readonly cluster: {
    readonly clusterMode: string;
    readonly clusterSize: number;
  };
  readonly createdAt: string;
  readonly deploymentDefaults: {
    readonly deploymentStrategy: DeploymentStrategyType | null | undefined;
    readonly openToPublic: boolean | null | undefined;
    readonly replicaCount: number | null | undefined;
    readonly revisionHistoryLimit: number | null | undefined;
  };
  readonly description: string | null | undefined;
  readonly execution: {
    readonly imageId: string | null | undefined;
    readonly startupCommand: string | null | undefined;
  };
  readonly id: string;
  readonly name: string;
  readonly runtimeVariant: {
    readonly id: string;
    readonly name: string;
  } | null | undefined;
  readonly runtimeVariantId: string;
  readonly updatedAt: string | null | undefined;
  readonly " $fragmentType": "AdminDeploymentPresetNodesFragment";
} | null | undefined>;
export type AdminDeploymentPresetNodesFragment$key = ReadonlyArray<{
  readonly " $data"?: AdminDeploymentPresetNodesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AdminDeploymentPresetNodesFragment">;
}>;

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
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "AdminDeploymentPresetNodesFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": (v0/*: any*/),
      "action": "NONE"
    },
    {
      "kind": "RequiredField",
      "field": (v1/*: any*/),
      "action": "NONE"
    },
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
        (v0/*: any*/),
        (v1/*: any*/)
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
          "name": "replicaCount",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "deploymentStrategy",
          "storageKey": null
        },
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
          "name": "revisionHistoryLimit",
          "storageKey": null
        }
      ],
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
    }
  ],
  "type": "DeploymentRevisionPreset",
  "abstractKey": null
};
})();

(node as any).hash = "8f8684f1a6df397171415c6b094c22c1";

export default node;
