/**
 * @generated SignedSource<<402d69f270e20d793b60f3f3bb6ed68d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type DeleteVFolderModalV2Fragment$data = ReadonlyArray<{
  readonly id: string;
  readonly metadata: {
    readonly name: string;
  };
  readonly permissions: ReadonlyArray<PermissionBit>;
  readonly " $fragmentType": "DeleteVFolderModalV2Fragment";
}>;
export type DeleteVFolderModalV2Fragment$key = ReadonlyArray<{
  readonly " $data"?: DeleteVFolderModalV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeleteVFolderModalV2Fragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "DeleteVFolderModalV2Fragment",
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
      "concreteType": "VFolderMetadataInfo",
      "kind": "LinkedField",
      "name": "metadata",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
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

(node as any).hash = "89f334c60190ca097a46824d3dee6dee";

export default node;
