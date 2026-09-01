/**
 * @generated SignedSource<<eb4fc142ea17479b038cd6d674cbd5d4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeleteForeverVFolderModalV2Fragment$data = ReadonlyArray<{
  readonly id: string;
  readonly metadata: {
    readonly name: string;
  };
  readonly " $fragmentType": "DeleteForeverVFolderModalV2Fragment";
}>;
export type DeleteForeverVFolderModalV2Fragment$key = ReadonlyArray<{
  readonly " $data"?: DeleteForeverVFolderModalV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeleteForeverVFolderModalV2Fragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "DeleteForeverVFolderModalV2Fragment",
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
    }
  ],
  "type": "VFolder",
  "abstractKey": null
};

(node as any).hash = "af117d7a409739259841dcfce2d2a493";

export default node;
