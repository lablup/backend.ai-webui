/**
 * @generated SignedSource<<e6e3d58b3cdf67ba6de59c01c4d58af7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIVirtualFolderNodeNotificationItemV2Fragment$data = {
  readonly entityId: string;
  readonly id: string;
  readonly metadata: {
    readonly name: string;
  };
  readonly " $fragmentType": "BAIVirtualFolderNodeNotificationItemV2Fragment";
};
export type BAIVirtualFolderNodeNotificationItemV2Fragment$key = {
  readonly " $data"?: BAIVirtualFolderNodeNotificationItemV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIVirtualFolderNodeNotificationItemV2Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIVirtualFolderNodeNotificationItemV2Fragment",
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

(node as any).hash = "4c0d28677ba601bb716303321454174d";

export default node;
