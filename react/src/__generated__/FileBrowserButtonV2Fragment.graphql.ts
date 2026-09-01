/**
 * @generated SignedSource<<c1a273a9c8a26da5c241f5bba57f58ac>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FileBrowserButtonV2Fragment$data = {
  readonly host: string;
  readonly id: string;
  readonly " $fragmentType": "FileBrowserButtonV2Fragment";
};
export type FileBrowserButtonV2Fragment$key = {
  readonly " $data"?: FileBrowserButtonV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"FileBrowserButtonV2Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FileBrowserButtonV2Fragment",
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
  "type": "VFolder",
  "abstractKey": null
};

(node as any).hash = "65ca6846b0f929a9264f2b0f6b2edd9b";

export default node;
