/**
 * @generated SignedSource<<11dc9ef2b6463d6f48ddbcaeb7dbf151>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type DeploymentStrategyType = "BLUE_GREEN" | "ROLLING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type DeploymentPresetDetailModalFragment$data = {
  readonly cluster: {
    readonly clusterMode: string;
    readonly clusterSize: number;
  };
  readonly deploymentDefaults: {
    readonly deploymentStrategy: DeploymentStrategyType | null | undefined;
    readonly openToPublic: boolean | null | undefined;
    readonly replicaCount: number | null | undefined;
    readonly revisionHistoryLimit: number | null | undefined;
  };
  readonly description: string | null | undefined;
  readonly execution: {
    readonly bootstrapScript: string | null | undefined;
    readonly environ: ReadonlyArray<{
      readonly key: string;
      readonly value: string;
    }>;
    readonly imageId: string | null | undefined;
    readonly startupCommand: string | null | undefined;
  };
  readonly id: string;
  readonly name: string;
  readonly presetValues: ReadonlyArray<{
    readonly presetId: string;
    readonly value: string;
  }>;
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
  readonly runtimeVariant: {
    readonly id: string;
    readonly name: string;
  } | null | undefined;
  readonly runtimeVariantId: string;
  readonly " $fragmentType": "DeploymentPresetDetailModalFragment";
};
export type DeploymentPresetDetailModalFragment$key = {
  readonly " $data"?: DeploymentPresetDetailModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentPresetDetailModalFragment">;
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
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentPresetDetailModalFragment",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
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
            (v1/*: any*/),
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
        (v2/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "DeploymentRevisionPreset",
  "abstractKey": null
};
})();

(node as any).hash = "4f8625daea8479ae5039603774b9b973";

export default node;
