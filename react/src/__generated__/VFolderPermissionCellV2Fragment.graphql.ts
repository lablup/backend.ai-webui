/**
 * @generated SignedSource<<884d010a7849d47a89b5442249b1eaeb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type VFolderMountPermission = "NONE" | "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type VFolderOwnershipType = "GROUP" | "USER" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type VFolderPermissionCellV2Fragment$data = {
  readonly accessControl: {
    readonly ownershipType: VFolderOwnershipType;
    readonly permission: VFolderMountPermission;
  };
  readonly ownership: {
    readonly userId: string | null | undefined;
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
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "ownershipType",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "VFolderOwnershipInfo",
      "kind": "LinkedField",
      "name": "ownership",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "userId",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "VFolder",
  "abstractKey": null
};

(node as any).hash = "0e6e8c6920fe77cd37cf63931a0a35cd";

export default node;
