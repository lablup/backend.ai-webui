/**
 * @generated SignedSource<<a4b01db56ff709531a24c0776e91cda4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionSlotCellFragment$data = {
  readonly id: string;
  readonly occupied_slots: string | null | undefined;
  readonly requested_slots: string | null | undefined;
  readonly status: string | null | undefined;
  readonly tag: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"useSessionNodeLiveStatSessionFragment">;
  readonly " $fragmentType": "SessionSlotCellFragment";
};
export type SessionSlotCellFragment$key = {
  readonly " $data"?: SessionSlotCellFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionSlotCellFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SessionSlotCellFragment",
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
      "name": "status",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "occupied_slots",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "requested_slots",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "tag",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "useSessionNodeLiveStatSessionFragment"
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "02d149e3b45c67f7738ddf713f4ce27a";

export default node;
