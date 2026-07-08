/**
 * @generated SignedSource<<ef0740eceb8ba8a5508e31d9769c0593>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectStoragePermissionTable_permissionFrgmt$data = {
  readonly vfolder_host_permission_list: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly " $fragmentType": "ProjectStoragePermissionTable_permissionFrgmt";
};
export type ProjectStoragePermissionTable_permissionFrgmt$key = {
  readonly " $data"?: ProjectStoragePermissionTable_permissionFrgmt$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectStoragePermissionTable_permissionFrgmt">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ProjectStoragePermissionTable_permissionFrgmt",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "vfolder_host_permission_list",
      "storageKey": null
    }
  ],
  "type": "PredefinedAtomicPermission",
  "abstractKey": null
};

(node as any).hash = "612dbef1be25d3e43cfc999c90666a63";

export default node;
