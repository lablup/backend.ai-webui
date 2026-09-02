/**
 * @generated SignedSource<<000293cd112f9ad336297b195e521139>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UsageBucketChartContent_ProjectFragment$data = ReadonlyArray<{
  readonly domainName: string;
  readonly id: string;
  readonly projectId: string;
  readonly resourceGroup: {
    readonly name: string;
  } | null | undefined;
  readonly " $fragmentType": "UsageBucketChartContent_ProjectFragment";
}>;
export type UsageBucketChartContent_ProjectFragment$key = ReadonlyArray<{
  readonly " $data"?: UsageBucketChartContent_ProjectFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"UsageBucketChartContent_ProjectFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "UsageBucketChartContent_ProjectFragment",
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
  "type": "ProjectFairShare",
  "abstractKey": null
};

(node as any).hash = "0835c72f58b84be8c5077c8dc947668b";

export default node;
