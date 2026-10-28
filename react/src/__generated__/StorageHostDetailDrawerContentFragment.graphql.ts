/**
 * @generated SignedSource<<bef8478b717e09b0eaa3d879b9384c4f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StorageHostDetailDrawerContentFragment$data = {
  readonly capabilities: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly id: string | null | undefined;
  readonly path: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectFolderPermissionPanel_storageVolumeFrgmt" | "StorageHostResourcePanelFragment" | "StorageHostSettingsPanel_storageVolumeFrgmt" | "UserFolderPermissionPanelV2_storageVolumeFrgmt">;
  readonly " $fragmentType": "StorageHostDetailDrawerContentFragment";
};
export type StorageHostDetailDrawerContentFragment$key = {
  readonly " $data"?: StorageHostDetailDrawerContentFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"StorageHostDetailDrawerContentFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "StorageHostDetailDrawerContentFragment",
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
      "name": "path",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "capabilities",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "StorageHostResourcePanelFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "StorageHostSettingsPanel_storageVolumeFrgmt"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ProjectFolderPermissionPanel_storageVolumeFrgmt"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "UserFolderPermissionPanelV2_storageVolumeFrgmt"
    }
  ],
  "type": "StorageVolume",
  "abstractKey": null
};

(node as any).hash = "427dadd808909acc2598007882fad61f";

export default node;
