/**
 * @generated SignedSource<<29c9bcc18d65238ab72aa118a294a0ad>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VFolderPermissionCellFragment$data = {
  readonly permissions: ReadonlyArray<any | null | undefined> | null | undefined;
  readonly " $fragmentType": "VFolderPermissionCellFragment";
};
export type VFolderPermissionCellFragment$key = {
  readonly " $data"?: VFolderPermissionCellFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"VFolderPermissionCellFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "VFolderPermissionCellFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "permissions",
      "storageKey": null
    }
  ],
  "type": "VirtualFolderNode",
  "abstractKey": null
};

(node as any).hash = "e024a5b06a92efdfaa233397d02630d2";

export default node;
