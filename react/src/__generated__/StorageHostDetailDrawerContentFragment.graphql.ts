/**
 * @generated SignedSource<<494c319e72f52f14dd00023de16f5a4e>>
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
  readonly " $fragmentSpreads": FragmentRefs<"StorageHostResourcePanelFragment" | "StorageHostSettingsPanel_storageVolumeFrgmt">;
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
    }
  ],
  "type": "StorageVolume",
  "abstractKey": null
};

(node as any).hash = "72dc862f881ccfb0dc38c9db6c1899fc";

export default node;
