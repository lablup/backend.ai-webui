/**
 * @generated SignedSource<<c34966cc6253a569bae07c5f4e3ccc94>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIProjectBulkEditModalFragment$data = ReadonlyArray<{
  readonly id: string;
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
      "name": "id",
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

(node as any).hash = "10772c6331209f8670097b9a3249fbbd";

export default node;
