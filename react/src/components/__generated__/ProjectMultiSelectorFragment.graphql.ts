/**
 * @generated SignedSource<<a0b2f0c8620ffb0d5334880c4b7e74df>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectMultiSelectorFragment$data = {
  readonly id: any | null;
  readonly name: string | null;
  readonly " $fragmentType": "ProjectMultiSelectorFragment";
};
export type ProjectMultiSelectorFragment$key = {
  readonly " $data"?: ProjectMultiSelectorFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectMultiSelectorFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ProjectMultiSelectorFragment",
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
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "Group",
  "abstractKey": null
};

(node as any).hash = "59999529530e231c876dd1582dc217e6";

export default node;
