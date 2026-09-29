/**
 * @generated SignedSource<<08214db3bf49c5efff9a4e9705dac715>>
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
  readonly name: string | null | undefined;
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

(node as any).hash = "b7b88007575ef38c6241e355557e7130";

export default node;
