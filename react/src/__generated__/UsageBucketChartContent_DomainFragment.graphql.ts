/**
 * @generated SignedSource<<e108c6f345be9b5232f2373f925d61b6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UsageBucketChartContent_DomainFragment$data = ReadonlyArray<{
  readonly domainName: string;
  readonly id: string;
  readonly resourceGroup: {
    readonly name: string;
  } | null | undefined;
  readonly " $fragmentType": "UsageBucketChartContent_DomainFragment";
}>;
export type UsageBucketChartContent_DomainFragment$key = ReadonlyArray<{
  readonly " $data"?: UsageBucketChartContent_DomainFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"UsageBucketChartContent_DomainFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "UsageBucketChartContent_DomainFragment",
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
  "type": "DomainFairShare",
  "abstractKey": null
};

(node as any).hash = "0aff7fab56bd8cfeec28bc2d3063d33c";

export default node;
