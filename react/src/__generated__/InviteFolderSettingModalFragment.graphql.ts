/**
 * @generated SignedSource<<46f035fdaa1b5184d33e080d2de027e5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type VFolderMountPermission = "NONE" | "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type InviteFolderSettingModalFragment$data = {
  readonly accessControl: {
    readonly permission: VFolderMountPermission;
  };
  readonly id: string;
  readonly " $fragmentType": "InviteFolderSettingModalFragment";
};
export type InviteFolderSettingModalFragment$key = {
  readonly " $data"?: InviteFolderSettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"InviteFolderSettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "InviteFolderSettingModalFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
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

(node as any).hash = "0ea69771c4af66c08c3ed241b158fe2f";

export default node;
