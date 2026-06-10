/**
 * @generated SignedSource<<2b5b92931bcdd529fcf5585ab52213c3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StorageHostDetailDrawerFragment$data = {
  readonly storageVolumeFrgmt: {
    readonly " $fragmentSpreads": FragmentRefs<"StorageHostDetailDrawerContentFragment">;
  };
  readonly " $fragmentType": "StorageHostDetailDrawerFragment";
};
export type StorageHostDetailDrawerFragment$key = {
  readonly " $data"?: StorageHostDetailDrawerFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"StorageHostDetailDrawerFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "StorageHostDetailDrawerFragment",
  "selections": [
    {
      "fragment": {
        "kind": "InlineFragment",
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "StorageHostDetailDrawerContentFragment"
          }
        ],
        "type": "StorageVolume",
        "abstractKey": null
      },
      "kind": "AliasedInlineFragmentSpread",
      "name": "storageVolumeFrgmt"
    }
  ],
  "type": "StorageVolume",
  "abstractKey": null
};

(node as any).hash = "451c99f37bf7181aa2407810280fab57";

export default node;
