/**
 * @generated SignedSource<<5fc70138f278e65fd4f372847f54aa66>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StorageHostSettingsPanel_storageVolumeFrgmt$data = {
  readonly capabilities: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly id: string | null | undefined;
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
