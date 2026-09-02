/**
 * @generated SignedSource<<0fd5fdf7d60fbffb874458df371add4c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserFairShareTableFragment$data = ReadonlyArray<{
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
  readonly projectId: string;
  readonly resourceGroupName: string;
  readonly spec: {
    readonly usesDefault: boolean;
    readonly weight: any;
  };
  readonly updatedAt: string;
  readonly user: {
    readonly basicInfo: {
      readonly email: string;
      readonly username: string | null | undefined;
    };
  } | null | undefined;
  readonly userUuid: string;
  readonly " $fragmentSpreads": FragmentRefs<"FairShareWeightSettingModal_UserFragment" | "UsageBucketModal_UserFragment">;
  readonly " $fragmentType": "UserFairShareTableFragment";
}>;
export type UserFairShareTableFragment$key = ReadonlyArray<{
  readonly " $data"?: UserFairShareTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserFairShareTableFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "UserFairShareTableFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "UserV2",
      "kind": "LinkedField",
      "name": "user",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "UserV2BasicInfo",
          "kind": "LinkedField",
          "name": "basicInfo",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "username",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "email",
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
      "kind": "ScalarField",
      "name": "userUuid",
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
      "name": "FairShareWeightSettingModal_UserFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "UsageBucketModal_UserFragment"
    }
  ],
  "type": "UserFairShare",
  "abstractKey": null
};

(node as any).hash = "80352f3a2b489834fad2868e20cb2380";

export default node;
