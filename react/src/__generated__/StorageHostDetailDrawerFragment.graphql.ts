/**
 * @generated SignedSource<<624c8ab5338d98ac418b8a7c7a946674>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StorageHostDetailDrawerFragment$data = {
  readonly id: string | null | undefined;
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
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
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

(node as any).hash = "caea0fa239ef72a790234259ee47d950";

export default node;
