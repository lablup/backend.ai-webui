/**
 * @generated SignedSource<<bd83766e627d16dbfb649a7a707af478>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserFolderPermissionPanelV2_storageVolumeFrgmt$data = {
  readonly " $fragmentSpreads": FragmentRefs<"KeypairResourcePolicyStoragePermissionTableV2_storageVolumeFrgmt">;
  readonly " $fragmentType": "UserFolderPermissionPanelV2_storageVolumeFrgmt";
};
export type UserFolderPermissionPanelV2_storageVolumeFrgmt$key = {
  readonly " $data"?: UserFolderPermissionPanelV2_storageVolumeFrgmt$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserFolderPermissionPanelV2_storageVolumeFrgmt">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserFolderPermissionPanelV2_storageVolumeFrgmt",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "KeypairResourcePolicyStoragePermissionTableV2_storageVolumeFrgmt"
    }
  ],
  "type": "StorageVolume",
  "abstractKey": null
};

(node as any).hash = "4df85c84dae29727b0f0f155ca8290d6";

export default node;
