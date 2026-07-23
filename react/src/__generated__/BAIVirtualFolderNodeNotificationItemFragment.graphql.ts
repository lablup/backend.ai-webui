/**
 * @generated SignedSource<<bb6e8110d71ff31907ea04fcc5e59ce6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIVirtualFolderNodeNotificationItemFragment$data = {
  readonly id: string;
  readonly name: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly status: string | null | undefined;
  readonly " $fragmentType": "BAIVirtualFolderNodeNotificationItemFragment";
};
export type BAIVirtualFolderNodeNotificationItemFragment$key = {
  readonly " $data"?: BAIVirtualFolderNodeNotificationItemFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIVirtualFolderNodeNotificationItemFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIVirtualFolderNodeNotificationItemFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "row_id",
      "storageKey": null
    },
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
      "name": "status",
      "storageKey": null
    }
  ],
  "type": "VirtualFolderNode",
  "abstractKey": null
};

(node as any).hash = "64101abf53caeab3bc62cad094a96dc0";

export default node;
