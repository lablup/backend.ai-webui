/**
 * @generated SignedSource<<3c7aae2afc3aca397d3ec3a8d71b0c0c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeleteVFolderModalFragment$data = ReadonlyArray<{
  readonly id: string;
  readonly name: string | null | undefined;
  readonly permissions: ReadonlyArray<any | null | undefined> | null | undefined;
  readonly " $fragmentType": "DeleteVFolderModalFragment";
}>;
export type DeleteVFolderModalFragment$key = ReadonlyArray<{
  readonly " $data"?: DeleteVFolderModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeleteVFolderModalFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "DeleteVFolderModalFragment",
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
    },
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

(node as any).hash = "17620add7874655d55796c224c26a478";

export default node;
