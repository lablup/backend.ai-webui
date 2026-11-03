/**
 * @generated SignedSource<<3c8c70ff173ab0c0d221c5608f47b64c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RestoreVFolderModalV2Fragment$data = ReadonlyArray<{
  readonly entityId: string;
  readonly id: string;
  readonly metadata: {
    readonly name: string;
  };
  readonly " $fragmentType": "RestoreVFolderModalV2Fragment";
}>;
export type RestoreVFolderModalV2Fragment$key = ReadonlyArray<{
  readonly " $data"?: RestoreVFolderModalV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RestoreVFolderModalV2Fragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "RestoreVFolderModalV2Fragment",
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
      "name": "entityId",
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

(node as any).hash = "90f09d6d6de8549dea993b83105db7c1";

export default node;
