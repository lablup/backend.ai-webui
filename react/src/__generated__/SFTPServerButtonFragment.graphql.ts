/**
 * @generated SignedSource<<30d7cb43ebe175a48470de040eb0687e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SFTPServerButtonFragment$data = {
  readonly host: string | null | undefined;
  readonly id: string;
  readonly " $fragmentType": "SFTPServerButtonFragment";
};
export type SFTPServerButtonFragment$key = {
  readonly " $data"?: SFTPServerButtonFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SFTPServerButtonFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SFTPServerButtonFragment",
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
      "name": "host",
      "storageKey": null
    }
  ],
  "type": "VirtualFolderNode",
  "abstractKey": null
};

(node as any).hash = "f0283e142aedae2a21900b95ea4f306a";

export default node;
