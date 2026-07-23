/**
 * @generated SignedSource<<c9757c439f84973d249ad0ff99396019>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UsageBucketChartContent_UserFragment$data = ReadonlyArray<{
  readonly domainName: string;
  readonly id: string;
  readonly projectId: string;
  readonly resourceGroup: {
    readonly name: string;
  } | null | undefined;
  readonly userUuid: string;
  readonly " $fragmentType": "UsageBucketChartContent_UserFragment";
}>;
export type UsageBucketChartContent_UserFragment$key = ReadonlyArray<{
  readonly " $data"?: UsageBucketChartContent_UserFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"UsageBucketChartContent_UserFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "UsageBucketChartContent_UserFragment",
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
      "concreteType": "ResourceGroup",
      "kind": "LinkedField",
      "name": "resourceGroup",
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
  "type": "UserFairShare",
  "abstractKey": null
};

(node as any).hash = "7de8368f8513bc7237dc4df90ab5474a";

export default node;
