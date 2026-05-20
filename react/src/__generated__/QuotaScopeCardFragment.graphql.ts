/**
 * @generated SignedSource<<082ac61f2887c1000d2b7ca9d7cc03c4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type QuotaScopeCardFragment$data = {
  readonly details: {
    readonly hard_limit_bytes: any | null | undefined;
    readonly usage_bytes: any | null | undefined;
  };
  readonly id: string;
  readonly quota_scope_id: string;
  readonly storage_host_name: string;
  readonly " $fragmentSpreads": FragmentRefs<"QuotaSettingModalFragment">;
  readonly " $fragmentType": "QuotaScopeCardFragment";
};
export type QuotaScopeCardFragment$key = {
  readonly " $data"?: QuotaScopeCardFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"QuotaScopeCardFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "QuotaScopeCardFragment",
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
      "name": "quota_scope_id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "storage_host_name",
      "storageKey": null
    },
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
          "name": "hard_limit_bytes",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "usage_bytes",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "QuotaSettingModalFragment"
    }
  ],
  "type": "QuotaScope",
  "abstractKey": null
};

(node as any).hash = "78fe420c92ce5b9c8d5c133d1f9c389f";

export default node;
