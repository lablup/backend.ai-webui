/**
 * @generated SignedSource<<3bc8cc0e76dc6b081b2f06c4c88d3051>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FolderLink_vfolderNode$data = {
  readonly name: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly " $fragmentType": "FolderLink_vfolderNode";
};
export type FolderLink_vfolderNode$key = {
  readonly " $data"?: FolderLink_vfolderNode$data;
  readonly " $fragmentSpreads": FragmentRefs<"FolderLink_vfolderNode">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FolderLink_vfolderNode",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "row_id",
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

(node as any).hash = "a8ea258e8c3e20439b53af93ec37be13";

export default node;
