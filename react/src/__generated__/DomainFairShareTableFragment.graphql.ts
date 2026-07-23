/**
 * @generated SignedSource<<73b8e42e293b620def02be6c34327daa>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DomainFairShareTableFragment$data = ReadonlyArray<{
  readonly calculationSnapshot: {
    readonly averageDailyDecayedUsage: {
      readonly entries: ReadonlyArray<{
        readonly quantity: any;
        readonly resourceType: string;
      }>;
    } | null | undefined;
    readonly fairShareFactor: any;
    readonly normalizedUsage: any;
  };
  readonly createdAt: string;
  readonly domain: {
    readonly basicInfo: {
      readonly name: string;
    };
  } | null | undefined;
  readonly domainName: string;
  readonly id: string;
  readonly resourceGroupName: string;
  readonly spec: {
    readonly usesDefault: boolean;
    readonly weight: any;
  };
  readonly updatedAt: string;
  readonly " $fragmentSpreads": FragmentRefs<"DomainResourceGroupWarningIconFragment" | "FairShareWeightSettingModal_DomainFragment" | "UsageBucketModal_DomainFragment">;
  readonly " $fragmentType": "DomainFairShareTableFragment";
}>;
export type DomainFairShareTableFragment$key = ReadonlyArray<{
  readonly " $data"?: DomainFairShareTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DomainFairShareTableFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "DomainFairShareTableFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "DomainV2",
      "kind": "LinkedField",
      "name": "domain",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "DomainBasicInfo",
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
          "kind": "ScalarField",
          "name": "normalizedUsage",
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
      "name": "DomainResourceGroupWarningIconFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "FairShareWeightSettingModal_DomainFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "UsageBucketModal_DomainFragment"
    }
  ],
  "type": "DomainFairShare",
  "abstractKey": null
};

(node as any).hash = "ffe2f53925773c94500f882a19442bcd";

export default node;
