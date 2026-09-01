/**
 * @generated SignedSource<<5d88f0018917b1f6f039dc84f01fe975>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type useVirtualFolderNodePathV2Fragment$data = {
  readonly id: string;
  readonly metadata: {
    readonly quotaScopeId: string | null | undefined;
  };
  readonly " $fragmentType": "useVirtualFolderNodePathV2Fragment";
};
export type useVirtualFolderNodePathV2Fragment$key = {
  readonly " $data"?: useVirtualFolderNodePathV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"useVirtualFolderNodePathV2Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useVirtualFolderNodePathV2Fragment",
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
          "name": "quotaScopeId",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "VFolder",
  "abstractKey": null
};

(node as any).hash = "98b54b5186f8575a7ae91b71cdf285a7";

export default node;
