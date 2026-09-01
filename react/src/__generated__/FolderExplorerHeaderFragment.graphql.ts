/**
 * @generated SignedSource<<e215233e80d0213346afb0bd2408171d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FolderExplorerHeaderFragment$data = {
  readonly id: string;
  readonly permission: string | null | undefined;
  readonly unmanaged_path: string | null | undefined;
  readonly user: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"EditableVFolderNameFragment" | "FileBrowserButtonFragment" | "SFTPServerButtonFragment" | "VFolderNameTitleNodeFragment" | "VFolderNodeIdenticonFragment">;
  readonly " $fragmentType": "FolderExplorerHeaderFragment";
};
export type FolderExplorerHeaderFragment$key = {
  readonly " $data"?: FolderExplorerHeaderFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"FolderExplorerHeaderFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FolderExplorerHeaderFragment",
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
      "name": "user",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "permission",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "unmanaged_path",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "VFolderNameTitleNodeFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "VFolderNodeIdenticonFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "EditableVFolderNameFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "FileBrowserButtonFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SFTPServerButtonFragment"
    }
  ],
  "type": "VirtualFolderNode",
  "abstractKey": null
};

(node as any).hash = "d706fdea0770af68839911b362d44c75";

export default node;
