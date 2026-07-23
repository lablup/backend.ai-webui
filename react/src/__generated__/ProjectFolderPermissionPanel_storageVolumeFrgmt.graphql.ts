/**
 * @generated SignedSource<<17ef44e8a8b5faba96d6bff348f28c46>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectFolderPermissionPanel_storageVolumeFrgmt$data = {
  readonly " $fragmentSpreads": FragmentRefs<"DomainStoragePermissionTable_storageVolumeFrgmt" | "ProjectStoragePermissionTable_storageVolumeFrgmt">;
  readonly " $fragmentType": "ProjectFolderPermissionPanel_storageVolumeFrgmt";
};
export type ProjectFolderPermissionPanel_storageVolumeFrgmt$key = {
  readonly " $data"?: ProjectFolderPermissionPanel_storageVolumeFrgmt$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectFolderPermissionPanel_storageVolumeFrgmt">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ProjectFolderPermissionPanel_storageVolumeFrgmt",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DomainStoragePermissionTable_storageVolumeFrgmt"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ProjectStoragePermissionTable_storageVolumeFrgmt"
    }
  ],
  "type": "StorageVolume",
  "abstractKey": null
};

(node as any).hash = "2978031b70d887eab424f64c3db8a0c1";

export default node;
