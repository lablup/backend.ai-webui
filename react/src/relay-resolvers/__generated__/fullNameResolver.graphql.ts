/**
 * @generated SignedSource<<fa8839e6629df3b1772bc8eb8c8ecbd0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fullNameResolver$data = {
  readonly id: string | null;
  readonly name: string | null;
  readonly " $fragmentType": "fullNameResolver";
};
export type fullNameResolver$key = {
  readonly " $data"?: fullNameResolver$data;
  readonly " $fragmentSpreads": FragmentRefs<"fullNameResolver">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fullNameResolver",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "ComputeSession",
  "abstractKey": null
};

(node as any).hash = "1f501546ed415320528855b53adbf7ab";

export default node;
