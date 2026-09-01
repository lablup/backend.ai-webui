/**
 * @generated SignedSource<<da418e2a5550a061acb71f88fca8eaba>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StorageHostResourcePanelFragment$data = {
  readonly backend: string | null | undefined;
  readonly capabilities: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly id: string | null | undefined;
  readonly path: string | null | undefined;
  readonly usage: string | null | undefined;
  readonly " $fragmentType": "StorageHostResourcePanelFragment";
};
export type StorageHostResourcePanelFragment$key = {
  readonly " $data"?: StorageHostResourcePanelFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"StorageHostResourcePanelFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "StorageHostResourcePanelFragment",
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
      "name": "backend",
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
      "name": "usage",
      "storageKey": null
    }
  ],
  "type": "StorageVolume",
  "abstractKey": null
};

(node as any).hash = "30a1b4101eeb2fae45385780dbc0ddcc";

export default node;
