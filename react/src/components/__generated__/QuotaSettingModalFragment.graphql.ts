/**
 * @generated SignedSource<<a0240434683b5a62fd902be6578b6c8a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type QuotaSettingModalFragment$data = {
  readonly details: {
    readonly hard_limit_bytes: any | null;
  };
  readonly id: any;
  readonly quota_scope_id: string;
  readonly storage_host_name: string;
  readonly " $fragmentType": "QuotaSettingModalFragment";
};
export type QuotaSettingModalFragment$key = {
  readonly " $data"?: QuotaSettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"QuotaSettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "QuotaSettingModalFragment",
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
    }
  ],
  "type": "FolderQuota",
  "abstractKey": null
};

(node as any).hash = "780422846e9f306afd374b7d0f494dfd";

export default node;
