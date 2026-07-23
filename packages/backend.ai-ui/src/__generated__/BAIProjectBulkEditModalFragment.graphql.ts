/**
 * @generated SignedSource<<2fa6214c01aa0b57764a48f48285c50a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIProjectBulkEditModalFragment$data = ReadonlyArray<{
  readonly name: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly " $fragmentType": "BAIProjectBulkEditModalFragment";
}>;
export type BAIProjectBulkEditModalFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIProjectBulkEditModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIProjectBulkEditModalFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIProjectBulkEditModalFragment",
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
      "name": "row_id",
      "storageKey": null
    }
  ],
  "type": "GroupNode",
  "abstractKey": null
};

(node as any).hash = "317d7350cbe767a8531fc765f9efe84b";

export default node;
