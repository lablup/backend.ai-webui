/**
 * @generated SignedSource<<8d07f63e22e1d48bec843b863ffd3570>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UsageBucketModal_UserFragment$data = ReadonlyArray<{
  readonly domain: {
    readonly basicInfo: {
      readonly name: string;
    };
  } | null | undefined;
  readonly id: string;
  readonly project: {
    readonly basicInfo: {
      readonly name: string;
    };
  } | null | undefined;
  readonly resourceGroup: {
    readonly name: string;
  } | null | undefined;
  readonly user: {
    readonly basicInfo: {
      readonly email: string;
    };
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"UsageBucketChartContent_UserFragment">;
  readonly " $fragmentType": "UsageBucketModal_UserFragment";
}>;
export type UsageBucketModal_UserFragment$key = ReadonlyArray<{
  readonly " $data"?: UsageBucketModal_UserFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"UsageBucketModal_UserFragment">;
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
  "name": "UsageBucketModal_UserFragment",
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
      "args": null,
      "kind": "FragmentSpread",
      "name": "UsageBucketChartContent_UserFragment"
    }
  ],
  "type": "UserFairShare",
  "abstractKey": null
};
})();

(node as any).hash = "9dd6c96aac2c341892669bc001d0c13c";

export default node;
