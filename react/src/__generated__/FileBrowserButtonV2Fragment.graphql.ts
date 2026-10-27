/**
 * @generated SignedSource<<635c01d9f4b81b3dde94b8618346f707>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FileBrowserButtonV2Fragment$data = {
  readonly entityId: string;
  readonly host: string;
  readonly id: string;
  readonly metadata: {
    readonly name: string;
  };
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
      "name": "entityId",
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

(node as any).hash = "56f325f1cdf5816d3810e60a69d45b53";

export default node;
