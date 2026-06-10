/**
 * @generated SignedSource<<2ccabac94ded47572fcd26799ae56d31>>
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
  readonly " $fragmentSpreads": FragmentRefs<"ProjectFolderPermissionPanel_storageVolumeFrgmt" | "StorageHostResourcePanelFragment" | "StorageHostSettingsPanel_storageVolumeFrgmt" | "UserFolderPermissionPanelV2_storageVolumeFrgmt" | "UserFolderPermissionPanel_storageVolumeFrgmt">;
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
      "name": "UserFolderPermissionPanel_storageVolumeFrgmt"
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

(node as any).hash = "f9b7f28d4e665e3f3a23bab9a6f04e4b";

export default node;
