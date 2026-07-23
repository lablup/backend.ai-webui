/**
 * @generated SignedSource<<01bee93512b434b360780bfb4af497a4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIVirtualFolderNodeNotificationItemV2Fragment$data = {
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

(node as any).hash = "fa10614a1c6a63fb585a7384c9a20fb0";

export default node;
