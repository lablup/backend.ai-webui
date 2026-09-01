/**
 * @generated SignedSource<<d47e7b7c13a6e76a262ae381ae9f6cc8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DomainStoragePermissionTable_storageVolumeFrgmt$data = {
  readonly id: string | null | undefined;
  readonly " $fragmentType": "DomainStoragePermissionTable_storageVolumeFrgmt";
};
export type DomainStoragePermissionTable_storageVolumeFrgmt$key = {
  readonly " $data"?: DomainStoragePermissionTable_storageVolumeFrgmt$data;
  readonly " $fragmentSpreads": FragmentRefs<"DomainStoragePermissionTable_storageVolumeFrgmt">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DomainStoragePermissionTable_storageVolumeFrgmt",
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

(node as any).hash = "165105e0f0d426d9230159744f65de2e";

export default node;
