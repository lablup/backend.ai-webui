/**
 * @generated SignedSource<<5228c36bb9cf4d871fc6017973442d7a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VFolderNodeIdenticonV2Fragment$data = {
  readonly id: string;
  readonly " $fragmentType": "VFolderNodeIdenticonV2Fragment";
};
export type VFolderNodeIdenticonV2Fragment$key = {
  readonly " $data"?: VFolderNodeIdenticonV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"VFolderNodeIdenticonV2Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "VFolderNodeIdenticonV2Fragment",
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

(node as any).hash = "eed0916f633b4f27f9770a3c1fa7fe86";

export default node;
