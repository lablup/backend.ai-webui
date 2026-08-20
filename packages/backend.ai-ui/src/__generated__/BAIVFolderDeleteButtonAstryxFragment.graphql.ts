/**
 * @generated SignedSource<<cb2e84e78bc105a5e55938c851474703>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIVFolderDeleteButtonAstryxFragment$data = ReadonlyArray<{
  readonly permissions: ReadonlyArray<any | null | undefined> | null | undefined;
  readonly " $fragmentType": "BAIVFolderDeleteButtonAstryxFragment";
}>;
export type BAIVFolderDeleteButtonAstryxFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIVFolderDeleteButtonAstryxFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIVFolderDeleteButtonAstryxFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIVFolderDeleteButtonAstryxFragment",
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

(node as any).hash = "df2091cfe9776d1bd4d2c13f1ecc4f14";

export default node;
