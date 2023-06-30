/**
 * @generated SignedSource<<fb14c85296e90cfb16ab4a72f4008b2d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StorageHostProjectResourcePolicySettingModalFragment$data = {
  readonly created_at: any;
  readonly id: any;
  readonly max_vfolder_size: any | null;
  readonly name: string;
  readonly " $fragmentType": "StorageHostProjectResourcePolicySettingModalFragment";
};
export type StorageHostProjectResourcePolicySettingModalFragment$key = {
  readonly " $data"?: StorageHostProjectResourcePolicySettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"StorageHostProjectResourcePolicySettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "StorageHostProjectResourcePolicySettingModalFragment",
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
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "created_at",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_vfolder_size",
      "storageKey": null
    }
  ],
  "type": "ProjectResourcePolicy",
  "abstractKey": null
};

(node as any).hash = "1d64776f2b53f4dc9dc8d0cfb482ca52";

export default node;
