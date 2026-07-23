/**
 * @generated SignedSource<<d310181c16674858c517ceed7eff4603>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type VFolderMountPermission = "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type VFolderPermissionCellV2Fragment$data = {
  readonly accessControl: {
    readonly permission: VFolderMountPermission;
  };
  readonly " $fragmentType": "VFolderPermissionCellV2Fragment";
};
export type VFolderPermissionCellV2Fragment$key = {
  readonly " $data"?: VFolderPermissionCellV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"VFolderPermissionCellV2Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "VFolderPermissionCellV2Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "VFolderAccessControlInfo",
      "kind": "LinkedField",
      "name": "accessControl",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "permission",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "VFolder",
  "abstractKey": null
};

(node as any).hash = "a517ea6cc8c2fc65f02d29454cd0a8c8";

export default node;
