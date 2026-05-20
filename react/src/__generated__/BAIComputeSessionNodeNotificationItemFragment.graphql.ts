/**
 * @generated SignedSource<<36ad7e2be58e7f012ee9b1091b27e0c5>>
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
  readonly row_id: string | null | undefined;
  readonly status: string | null | undefined;
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

(node as any).hash = "917e42f301a79107d0a4c8cac47d76c2";

export default node;
