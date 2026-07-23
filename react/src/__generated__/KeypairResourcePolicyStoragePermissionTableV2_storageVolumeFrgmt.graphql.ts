/**
 * @generated SignedSource<<4544b43bf758c150d1eb2f752239f7ed>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type KeypairResourcePolicyStoragePermissionTableV2_storageVolumeFrgmt$data = {
  readonly id: string | null | undefined;
  readonly " $fragmentType": "KeypairResourcePolicyStoragePermissionTableV2_storageVolumeFrgmt";
};
export type KeypairResourcePolicyStoragePermissionTableV2_storageVolumeFrgmt$key = {
  readonly " $data"?: KeypairResourcePolicyStoragePermissionTableV2_storageVolumeFrgmt$data;
  readonly " $fragmentSpreads": FragmentRefs<"KeypairResourcePolicyStoragePermissionTableV2_storageVolumeFrgmt">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "KeypairResourcePolicyStoragePermissionTableV2_storageVolumeFrgmt",
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

(node as any).hash = "c1b78e109ac506dfcaf36ff7488afabc";

export default node;
