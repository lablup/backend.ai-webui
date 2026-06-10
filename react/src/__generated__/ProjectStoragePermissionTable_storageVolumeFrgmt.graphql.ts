/**
 * @generated SignedSource<<eb7dd57320f3dec104882be87e82d819>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectStoragePermissionTable_storageVolumeFrgmt$data = {
  readonly id: string | null | undefined;
  readonly " $fragmentType": "ProjectStoragePermissionTable_storageVolumeFrgmt";
};
export type ProjectStoragePermissionTable_storageVolumeFrgmt$key = {
  readonly " $data"?: ProjectStoragePermissionTable_storageVolumeFrgmt$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectStoragePermissionTable_storageVolumeFrgmt">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ProjectStoragePermissionTable_storageVolumeFrgmt",
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

(node as any).hash = "3eaf901741fa9b84d3422ac55b6682d4";

export default node;
