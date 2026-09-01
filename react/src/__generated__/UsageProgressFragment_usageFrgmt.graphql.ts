/**
 * @generated SignedSource<<64b946c238575abbfb5abd0712cd1432>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UsageProgressFragment_usageFrgmt$data = {
  readonly details: {
    readonly hard_limit_bytes: any | null | undefined;
    readonly usage_bytes: any | null | undefined;
  };
  readonly " $fragmentType": "UsageProgressFragment_usageFrgmt";
};
export type UsageProgressFragment_usageFrgmt$key = {
  readonly " $data"?: UsageProgressFragment_usageFrgmt$data;
  readonly " $fragmentSpreads": FragmentRefs<"UsageProgressFragment_usageFrgmt">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UsageProgressFragment_usageFrgmt",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "QuotaDetails",
      "kind": "LinkedField",
      "name": "details",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "usage_bytes",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "hard_limit_bytes",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "QuotaScope",
  "abstractKey": null
};

(node as any).hash = "1ba87b250f2a0161ecee7ba88d54c85c";

export default node;
