/**
 * @generated SignedSource<<5119579034ed2bf64fabb2bf26a7ab2c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type MountPermission = "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type VFolderAutoMountSettingModalFragment$data = {
  readonly entityId: string;
  readonly mountDestination: string;
  readonly mountPermission: MountPermission;
  readonly subpath: string;
  readonly " $fragmentType": "VFolderAutoMountSettingModalFragment";
};
export type VFolderAutoMountSettingModalFragment$key = {
  readonly " $data"?: VFolderAutoMountSettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"VFolderAutoMountSettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "VFolderAutoMountSettingModalFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "entityId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "mountDestination",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "subpath",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "mountPermission",
      "storageKey": null
    }
  ],
  "type": "VFolderAutoMount",
  "abstractKey": null
};

(node as any).hash = "9403e3e17e69c14494dc82a674bc5f22";

export default node;
