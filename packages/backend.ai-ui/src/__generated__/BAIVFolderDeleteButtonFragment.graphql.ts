/**
 * @generated SignedSource<<74c594f72d5d06f67259bd15a597b4d5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIVFolderDeleteButtonFragment$data = ReadonlyArray<{
  readonly permissions: ReadonlyArray<any | null | undefined> | null | undefined;
  readonly " $fragmentType": "BAIVFolderDeleteButtonFragment";
}>;
export type BAIVFolderDeleteButtonFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIVFolderDeleteButtonFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIVFolderDeleteButtonFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIVFolderDeleteButtonFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "permissions",
      "storageKey": null
    }
  ],
  "type": "VirtualFolderNode",
  "abstractKey": null
};

(node as any).hash = "cb17a791cc786c6a04cd5573ab7b3494";

export default node;
