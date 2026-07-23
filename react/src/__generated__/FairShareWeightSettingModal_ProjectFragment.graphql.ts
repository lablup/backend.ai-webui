/**
 * @generated SignedSource<<97e0403589d25dc9db1fdf879b0cdb00>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FairShareWeightSettingModal_ProjectFragment$data = ReadonlyArray<{
  readonly domain: {
    readonly basicInfo: {
      readonly name: string;
    };
  } | null | undefined;
  readonly project: {
    readonly basicInfo: {
      readonly name: string;
    };
  } | null | undefined;
  readonly projectId: string;
  readonly resourceGroup: {
    readonly name: string;
  } | null | undefined;
  readonly spec: {
    readonly weight: any;
  };
  readonly " $fragmentSpreads": FragmentRefs<"ProjectResourceGroupAlertFragment">;
  readonly " $fragmentType": "FairShareWeightSettingModal_ProjectFragment";
}>;
export type FairShareWeightSettingModal_ProjectFragment$key = ReadonlyArray<{
  readonly " $data"?: FairShareWeightSettingModal_ProjectFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"FairShareWeightSettingModal_ProjectFragment">;
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
  "name": "FairShareWeightSettingModal_ProjectFragment",
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
          "selections": (v0/*: any*/),
          "storageKey": null
        }
      ],
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
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ProjectResourceGroupAlertFragment"
    }
  ],
  "type": "ProjectFairShare",
  "abstractKey": null
};
})();

(node as any).hash = "a3ccffb0b6ed735fcb3c9b137af63ab4";

export default node;
