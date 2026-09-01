/**
 * @generated SignedSource<<b8a50c17387f2a5fa1f54fa88e264648>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FolderExplorerHeaderV2Fragment$data = {
  readonly id: string;
  readonly unmanagedPath: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"EditableVFolderNameV2Fragment" | "FileBrowserButtonV2Fragment" | "SFTPServerButtonV2Fragment" | "VFolderNodeIdenticonV2Fragment">;
  readonly " $fragmentType": "FolderExplorerHeaderV2Fragment";
};
export type FolderExplorerHeaderV2Fragment$key = {
  readonly " $data"?: FolderExplorerHeaderV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"FolderExplorerHeaderV2Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FolderExplorerHeaderV2Fragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      "action": "THROW"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "unmanagedPath",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "VFolderNodeIdenticonV2Fragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "EditableVFolderNameV2Fragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "FileBrowserButtonV2Fragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SFTPServerButtonV2Fragment"
    }
  ],
  "type": "VFolder",
  "abstractKey": null
};

(node as any).hash = "13f439223c6b2cfde9de7a0b44d2d296";

export default node;
