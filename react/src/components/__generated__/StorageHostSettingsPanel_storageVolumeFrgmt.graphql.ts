/**
 * @generated SignedSource<<7acd4325686b832afcb8cccb2a539ff6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StorageHostSettingsPanel_storageVolumeFrgmt$data = {
  readonly capabilities: ReadonlyArray<string | null> | null;
  readonly id: string | null;
  readonly " $fragmentType": "StorageHostSettingsPanel_storageVolumeFrgmt";
};
export type StorageHostSettingsPanel_storageVolumeFrgmt$key = {
  readonly " $data"?: StorageHostSettingsPanel_storageVolumeFrgmt$data;
  readonly " $fragmentSpreads": FragmentRefs<"StorageHostSettingsPanel_storageVolumeFrgmt">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "StorageHostSettingsPanel_storageVolumeFrgmt",
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
      "kind": "ScalarField",
      "name": "capabilities",
      "storageKey": null
    }
  ],
  "type": "StorageVolume",
  "abstractKey": null
};

(node as any).hash = "2f9e5e6060806e6f9265e5cbbd325afe";

export default node;
