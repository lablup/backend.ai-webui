/**
 * @generated SignedSource<<87b7003a6687f6e1d49d78b2c186e5fe>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VFolderNodeIdenticonFragment$data = {
  readonly id: string;
  readonly " $fragmentType": "VFolderNodeIdenticonFragment";
};
export type VFolderNodeIdenticonFragment$key = {
  readonly " $data"?: VFolderNodeIdenticonFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"VFolderNodeIdenticonFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "VFolderNodeIdenticonFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "VirtualFolderNode",
  "abstractKey": null
};

(node as any).hash = "d78fd4251748b63aa2174c9dfc1a178e";

export default node;
