/**
 * @generated SignedSource<<4704e3e0ed44d07385a22c6ccb151950>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupFairShareTableFragment$data = ReadonlyArray<{
  readonly fairShareSpec: {
    readonly decayUnitDays: number;
    readonly defaultWeight: any;
    readonly halfLifeDays: number;
    readonly lookbackDays: number;
    readonly resourceWeights: ReadonlyArray<{
      readonly resourceType: string;
      readonly usesDefault: boolean;
      readonly weight: any;
    }>;
  } | null | undefined;
  readonly id: string;
  readonly name: string;
  readonly resourceInfo: {
    readonly capacity: {
      readonly entries: ReadonlyArray<{
        readonly quantity: any;
        readonly resourceType: string;
      }>;
    };
    readonly used: {
      readonly entries: ReadonlyArray<{
        readonly quantity: any;
        readonly resourceType: string;
      }>;
    };
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupFairShareSettingModalFragment">;
  readonly " $fragmentType": "ResourceGroupFairShareTableFragment";
}>;
export type ResourceGroupFairShareTableFragment$key = ReadonlyArray<{
  readonly " $data"?: ResourceGroupFairShareTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupFairShareTableFragment">;
}>;

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resourceType",
  "storageKey": null
},
v1 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ResourceSlotEntry",
    "kind": "LinkedField",
    "name": "entries",
    "plural": true,
    "selections": [
      (v0/*: any*/),
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
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "ResourceGroupFairShareTableFragment",
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
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "FairShareScalingGroupSpec",
      "kind": "LinkedField",
      "name": "fairShareSpec",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "halfLifeDays",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "lookbackDays",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "decayUnitDays",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "defaultWeight",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "ResourceWeightEntry",
          "kind": "LinkedField",
          "name": "resourceWeights",
          "plural": true,
          "selections": [
            (v0/*: any*/),
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
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ResourceInfo",
      "kind": "LinkedField",
      "name": "resourceInfo",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ResourceSlot",
          "kind": "LinkedField",
          "name": "capacity",
          "plural": false,
          "selections": (v1/*: any*/),
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "ResourceSlot",
          "kind": "LinkedField",
          "name": "used",
          "plural": false,
          "selections": (v1/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ResourceGroupFairShareSettingModalFragment"
    }
  ],
  "type": "ResourceGroup",
  "abstractKey": null
};
})();

(node as any).hash = "762edf76f21c209e71c57226aa515b77";

export default node;
