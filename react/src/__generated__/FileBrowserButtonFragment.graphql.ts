/**
 * @generated SignedSource<<3f9532f21d448e4b20f3fd3269bc6c53>>
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
  readonly name: string | null | undefined;
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "VirtualFolderNode",
  "abstractKey": null
};

(node as any).hash = "593cdf98aae673545e15d0a63063671c";

export default node;
