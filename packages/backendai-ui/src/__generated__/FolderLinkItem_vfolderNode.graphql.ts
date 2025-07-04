/**
 * @generated SignedSource<<d161d7ef42c918b9da1186d60efabf52>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FolderLinkItem_vfolderNode$data = {
  readonly name: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly " $fragmentType": "FolderLinkItem_vfolderNode";
};
export type FolderLinkItem_vfolderNode$key = {
  readonly " $data"?: FolderLinkItem_vfolderNode$data;
  readonly " $fragmentSpreads": FragmentRefs<"FolderLinkItem_vfolderNode">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FolderLinkItem_vfolderNode",
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

(node as any).hash = "a61d832151461c053f8e9f098bb0b633";

export default node;
