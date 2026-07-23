/**
 * @generated SignedSource<<aed62292557ed2085f1400aef2426716>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VFolderPermissionTag_VFolder$data = {
  readonly permission: string | null | undefined;
  readonly " $fragmentType": "VFolderPermissionTag_VFolder";
};
export type VFolderPermissionTag_VFolder$key = {
  readonly " $data"?: VFolderPermissionTag_VFolder$data;
  readonly " $fragmentSpreads": FragmentRefs<"VFolderPermissionTag_VFolder">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "VFolderPermissionTag_VFolder",
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

(node as any).hash = "d3b0f85629ac8c6f45ef363938f66067";

export default node;
