/**
 * @generated SignedSource<<5a6b40da83865189dcd34dc13a4f804f>>
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
  readonly " $fragmentSpreads": FragmentRefs<"SessionActionButtonsFragment" | "SessionStatusBadgeFragment">;
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
      "name": "SessionStatusBadgeFragment"
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "8d53c71903c9d2d640979e4ab2758dfe";

export default node;
