/**
 * @generated SignedSource<<e0e76ced91358993c74a43fd95d2db3c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type QuotaScopeCardFragment$data = {
  readonly details: {
    readonly hard_limit_bytes: any | null;
  };
  readonly id: any;
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

(node as any).hash = "a676a5c2cd9f97cceb59361b769c88e8";

export default node;
