/**
 * @generated SignedSource<<1265e393d94443933b27ddb7c07fb682>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VFolderPermissionToken_VFolder$data = {
  readonly permission: string | null | undefined;
  readonly " $fragmentType": "VFolderPermissionToken_VFolder";
};
export type VFolderPermissionToken_VFolder$key = {
  readonly " $data"?: VFolderPermissionToken_VFolder$data;
  readonly " $fragmentSpreads": FragmentRefs<"VFolderPermissionToken_VFolder">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "VFolderPermissionToken_VFolder",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "permission",
      "storageKey": null
    }
  ],
  "type": "VirtualFolder",
  "abstractKey": null
};

(node as any).hash = "5991c9081512a6c749aba40208a0431b";

export default node;
