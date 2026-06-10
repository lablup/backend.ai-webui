/**
 * @generated SignedSource<<ed1d10ea781bc474ee52fab32f0f8992>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserFolderPermissionPanel_storageVolumeFrgmt$data = {
  readonly " $fragmentSpreads": FragmentRefs<"KeypairResourcePolicyStoragePermissionTable_storageVolumeFrgmt">;
  readonly " $fragmentType": "UserFolderPermissionPanel_storageVolumeFrgmt";
};
export type UserFolderPermissionPanel_storageVolumeFrgmt$key = {
  readonly " $data"?: UserFolderPermissionPanel_storageVolumeFrgmt$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserFolderPermissionPanel_storageVolumeFrgmt">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserFolderPermissionPanel_storageVolumeFrgmt",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "KeypairResourcePolicyStoragePermissionTable_storageVolumeFrgmt"
    }
  ],
  "type": "StorageVolume",
  "abstractKey": null
};

(node as any).hash = "2d47f44e74258af30faaf8a1a6bfb335";

export default node;
