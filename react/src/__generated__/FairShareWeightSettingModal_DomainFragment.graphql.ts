/**
 * @generated SignedSource<<2c36f4f949e9bd48487abb9bc209b584>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FairShareWeightSettingModal_DomainFragment$data = ReadonlyArray<{
  readonly domain: {
    readonly basicInfo: {
      readonly name: string;
    };
  } | null | undefined;
  readonly resourceGroup: {
    readonly name: string;
  } | null | undefined;
  readonly spec: {
    readonly weight: any;
  };
  readonly " $fragmentSpreads": FragmentRefs<"DomainResourceGroupAlertFragment">;
  readonly " $fragmentType": "FairShareWeightSettingModal_DomainFragment";
}>;
export type FairShareWeightSettingModal_DomainFragment$key = ReadonlyArray<{
  readonly " $data"?: FairShareWeightSettingModal_DomainFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"FairShareWeightSettingModal_DomainFragment">;
}>;

const node: ReaderFragment = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "FairShareWeightSettingModal_DomainFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ResourceGroup",
      "kind": "LinkedField",
      "name": "resourceGroup",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    },
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
          "selections": (v0/*: any*/),
          "storageKey": null
        }
      ],
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
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DomainResourceGroupAlertFragment"
    }
  ],
  "type": "DomainFairShare",
  "abstractKey": null
};
})();

(node as any).hash = "a5f09277a6d88b6d5f5fa7c79a3ce75d";

export default node;
