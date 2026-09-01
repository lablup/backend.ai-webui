/**
 * @generated SignedSource<<85aef79f57b08d02241c1bf9f8ef63b4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIComputeSessionNodeNotificationItemFragment$data = {
  readonly id: string;
  readonly name: string | null | undefined;
  readonly status: string | null | undefined;
  readonly status_data: string | null | undefined;
  readonly status_info: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"SessionActionButtonsFragment" | "SessionStatusTagFragment">;
  readonly " $fragmentType": "BAIComputeSessionNodeNotificationItemFragment";
};
export type BAIComputeSessionNodeNotificationItemFragment$key = {
  readonly " $data"?: BAIComputeSessionNodeNotificationItemFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIComputeSessionNodeNotificationItemFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIComputeSessionNodeNotificationItemFragment",
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
      "name": "status",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status_info",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status_data",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SessionActionButtonsFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SessionStatusTagFragment"
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "072204200ff77273a5d4f68970569ab2";

export default node;
