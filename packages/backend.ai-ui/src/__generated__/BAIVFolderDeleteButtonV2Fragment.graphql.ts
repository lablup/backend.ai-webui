/**
 * @generated SignedSource<<a2a57557a388017f0821960f13a4c7ba>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIVFolderDeleteButtonV2Fragment$data = ReadonlyArray<{
  readonly id: string;
  readonly permissions: ReadonlyArray<PermissionBit>;
  readonly " $fragmentType": "BAIVFolderDeleteButtonV2Fragment";
}>;
export type BAIVFolderDeleteButtonV2Fragment$key = ReadonlyArray<{
  readonly " $data"?: BAIVFolderDeleteButtonV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIVFolderDeleteButtonV2Fragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIVFolderDeleteButtonV2Fragment",
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
      "name": "permissions",
      "storageKey": null
    }
  ],
  "type": "VFolder",
  "abstractKey": null
};

(node as any).hash = "547f843da415a3d9d78089d6a2851576";

export default node;
