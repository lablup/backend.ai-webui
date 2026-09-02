/**
 * @generated SignedSource<<844b3016f6dc8d433abad29fe7785bf6>>
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
  readonly " $fragmentSpreads": FragmentRefs<"VFolderNodeIdenticonFragment">;
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
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "VFolderNodeIdenticonFragment"
    }
  ],
  "type": "VirtualFolderNode",
  "abstractKey": null
};

(node as any).hash = "fcdabede98521b5a4d2b25506908e356";

export default node;
