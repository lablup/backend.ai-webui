/**
 * @generated SignedSource<<bc3395b20552edb63d2c3aae0cf3fcee>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type VFolderMountPermission = "NONE" | "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type InviteFolderSettingModalV2Fragment$data = {
  readonly accessControl: {
    readonly permission: VFolderMountPermission;
  };
  readonly id: string;
  readonly " $fragmentType": "InviteFolderSettingModalV2Fragment";
};
export type InviteFolderSettingModalV2Fragment$key = {
  readonly " $data"?: InviteFolderSettingModalV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"InviteFolderSettingModalV2Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "InviteFolderSettingModalV2Fragment",
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

(node as any).hash = "c2693747465a83340f42f5d4984629be";

export default node;
