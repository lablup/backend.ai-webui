/**
 * @generated SignedSource<<40461de443312edfdb3e82becad2148c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UsageBucketModal_DomainFragment$data = ReadonlyArray<{
  readonly domain: {
    readonly basicInfo: {
      readonly name: string;
    };
  } | null | undefined;
  readonly id: string;
  readonly resourceGroup: {
    readonly name: string;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"UsageBucketChartContent_DomainFragment">;
  readonly " $fragmentType": "UsageBucketModal_DomainFragment";
}>;
export type UsageBucketModal_DomainFragment$key = ReadonlyArray<{
  readonly " $data"?: UsageBucketModal_DomainFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"UsageBucketModal_DomainFragment">;
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
  "name": "UsageBucketModal_DomainFragment",
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
      "concreteType": "ResourceGroup",
      "kind": "LinkedField",
      "name": "resourceGroup",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "UsageBucketChartContent_DomainFragment"
    }
  ],
  "type": "DomainFairShare",
  "abstractKey": null
};
})();

(node as any).hash = "d6e2ac14e5ba7f72d73fac4ecbb44f2c";

export default node;
