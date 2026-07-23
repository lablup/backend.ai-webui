/**
 * @generated SignedSource<<2fbfe42465aeb8368dbb5bdbf15bb0d5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RestoreVFolderModalFragment$data = ReadonlyArray<{
  readonly id: string;
  readonly name: string | null | undefined;
  readonly " $fragmentType": "RestoreVFolderModalFragment";
}>;
export type RestoreVFolderModalFragment$key = ReadonlyArray<{
  readonly " $data"?: RestoreVFolderModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RestoreVFolderModalFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "RestoreVFolderModalFragment",
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
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "VirtualFolderNode",
  "abstractKey": null
};

(node as any).hash = "e0d5b078f57714ba515aa55e0a1f7f3d";

export default node;
