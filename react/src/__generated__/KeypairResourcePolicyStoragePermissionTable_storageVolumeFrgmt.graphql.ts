/**
 * @generated SignedSource<<1c8ffb8d31f27a74516a3ae7ae6a9427>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type KeypairResourcePolicyStoragePermissionTable_storageVolumeFrgmt$data = {
  readonly id: string | null | undefined;
  readonly " $fragmentType": "KeypairResourcePolicyStoragePermissionTable_storageVolumeFrgmt";
};
export type KeypairResourcePolicyStoragePermissionTable_storageVolumeFrgmt$key = {
  readonly " $data"?: KeypairResourcePolicyStoragePermissionTable_storageVolumeFrgmt$data;
  readonly " $fragmentSpreads": FragmentRefs<"KeypairResourcePolicyStoragePermissionTable_storageVolumeFrgmt">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "KeypairResourcePolicyStoragePermissionTable_storageVolumeFrgmt",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "StorageVolume",
  "abstractKey": null
};

(node as any).hash = "acc7647774a9371bbebf062b7b4fc6e4";

export default node;
