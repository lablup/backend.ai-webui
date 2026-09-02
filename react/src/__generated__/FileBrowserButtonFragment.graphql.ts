/**
 * @generated SignedSource<<3db6e9e415b4afc749f7aa3634f6cd29>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FileBrowserButtonFragment$data = {
  readonly host: string | null | undefined;
  readonly id: string;
  readonly " $fragmentType": "FileBrowserButtonFragment";
};
export type FileBrowserButtonFragment$key = {
  readonly " $data"?: FileBrowserButtonFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"FileBrowserButtonFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FileBrowserButtonFragment",
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
      "name": "host",
      "storageKey": null
    }
  ],
  "type": "VirtualFolderNode",
  "abstractKey": null
};

(node as any).hash = "b96df1a5289fd1330848207e43880ddd";

export default node;
