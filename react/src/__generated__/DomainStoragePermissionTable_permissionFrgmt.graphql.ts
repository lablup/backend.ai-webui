/**
 * @generated SignedSource<<073eb3cf9303f1c778e9707c3044632e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DomainStoragePermissionTable_permissionFrgmt$data = {
  readonly vfolder_host_permission_list: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly " $fragmentType": "DomainStoragePermissionTable_permissionFrgmt";
};
export type DomainStoragePermissionTable_permissionFrgmt$key = {
  readonly " $data"?: DomainStoragePermissionTable_permissionFrgmt$data;
  readonly " $fragmentSpreads": FragmentRefs<"DomainStoragePermissionTable_permissionFrgmt">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DomainStoragePermissionTable_permissionFrgmt",
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

(node as any).hash = "1edc3956f89e53224a120b9e88978b1c";

export default node;
