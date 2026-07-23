/**
 * @generated SignedSource<<aa6640e620a580bd3a7ae054e4e7ae75>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectFairShareTableFragment$data = ReadonlyArray<{
  readonly calculationSnapshot: {
    readonly averageDailyDecayedUsage: {
      readonly entries: ReadonlyArray<{
        readonly quantity: any;
        readonly resourceType: string;
      }>;
    } | null | undefined;
    readonly fairShareFactor: any;
  };
  readonly createdAt: string;
  readonly domainName: string;
  readonly id: string;
  readonly project: {
    readonly basicInfo: {
      readonly name: string;
    };
  } | null | undefined;
  readonly projectId: string;
  readonly resourceGroupName: string;
  readonly spec: {
    readonly usesDefault: boolean;
    readonly weight: any;
  };
  readonly updatedAt: string;
  readonly " $fragmentSpreads": FragmentRefs<"FairShareWeightSettingModal_ProjectFragment" | "ProjectResourceGroupWarningIconFragment" | "UsageBucketModal_ProjectFragment">;
  readonly " $fragmentType": "ProjectFairShareTableFragment";
}>;
export type ProjectFairShareTableFragment$key = ReadonlyArray<{
  readonly " $data"?: ProjectFairShareTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectFairShareTableFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "ProjectFairShareTableFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2",
      "kind": "LinkedField",
      "name": "project",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectBasicInfo",
          "kind": "LinkedField",
          "name": "basicInfo",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "name",
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
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "resourceGroupName",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "domainName",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "projectId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "FairShareSpec",
      "kind": "LinkedField",
      "name": "spec",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "weight",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "usesDefault",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "FairShareCalculationSnapshot",
      "kind": "LinkedField",
      "name": "calculationSnapshot",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "fairShareFactor",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "ResourceSlot",
          "kind": "LinkedField",
          "name": "averageDailyDecayedUsage",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "ResourceSlotEntry",
              "kind": "LinkedField",
              "name": "entries",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "resourceType",
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
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ProjectResourceGroupWarningIconFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "FairShareWeightSettingModal_ProjectFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "UsageBucketModal_ProjectFragment"
    }
  ],
  "type": "ProjectFairShare",
  "abstractKey": null
};

(node as any).hash = "02f75dcf0aeba0150e990a13b01ba3f3";

export default node;
