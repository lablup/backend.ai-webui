/**
 * @generated SignedSource<<9e3f4eb18a8d485a4e90592e0611445c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VFolderNameTitleNodeFragment$data = {
  readonly name: string | null | undefined;
  readonly " $fragmentType": "VFolderNameTitleNodeFragment";
};
export type VFolderNameTitleNodeFragment$key = {
  readonly " $data"?: VFolderNameTitleNodeFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"VFolderNameTitleNodeFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "VFolderNameTitleNodeFragment",
  "selections": [
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

(node as any).hash = "0601031289a33a9a13a254362a2ee1ab";

export default node;
