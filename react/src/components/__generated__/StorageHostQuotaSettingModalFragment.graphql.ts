/**
 * @generated SignedSource<<8a0f9c97255c7f9e8b8973eb9c32d00e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StorageHostQuotaSettingModalFragment$data = {
  readonly details: {
    readonly hard_limit_bytes: any | null;
  };
  readonly id: any;
  readonly quota_scope_id: string;
  readonly storage_host_name: string;
  readonly " $fragmentType": "StorageHostQuotaSettingModalFragment";
};
export type StorageHostQuotaSettingModalFragment$key = {
  readonly " $data"?: StorageHostQuotaSettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"StorageHostQuotaSettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "StorageHostQuotaSettingModalFragment",
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

(node as any).hash = "34406fabe4976fef79e1c993a68375d5";

export default node;
