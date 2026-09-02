/**
 * @generated SignedSource<<ef3bab9e575417bc4dff10d071b7e140>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupFairShareSettingModalFragment$data = {
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
  readonly name: string;
  readonly " $fragmentType": "ResourceGroupFairShareSettingModalFragment";
};
export type ResourceGroupFairShareSettingModalFragment$key = {
  readonly " $data"?: ResourceGroupFairShareSettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupFairShareSettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ResourceGroupFairShareSettingModalFragment",
  "selections": [
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
          "name": "decayUnitDays",
          "storageKey": null
        },
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
    }
  ],
  "type": "ResourceGroup",
  "abstractKey": null
};

(node as any).hash = "eecc9a374f99f2ab82abc8b4efd6927d";

export default node;
