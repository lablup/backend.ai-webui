/**
 * @generated SignedSource<<bd9e310b9e5820218d070c75c17b6d77>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIVFolderDeleteButtonV2Fragment$data = ReadonlyArray<{
  readonly id: string;
  readonly " $fragmentType": "BAIVFolderDeleteButtonV2Fragment";
}>;
export type BAIVFolderDeleteButtonV2Fragment$key = ReadonlyArray<{
  readonly " $data"?: BAIVFolderDeleteButtonV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIVFolderDeleteButtonV2Fragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIVFolderDeleteButtonV2Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "VFolder",
  "abstractKey": null
};

(node as any).hash = "4d44e5f0482b6a1b21c4aac58aa7d9f2";

export default node;
