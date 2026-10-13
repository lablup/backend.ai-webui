/**
 * @generated SignedSource<<574a87e9aeaf607c03ea5f3a9eab629b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionMonitorItemFragment$data = {
  readonly created_at: string | null | undefined;
  readonly id: string;
  readonly name: string | null | undefined;
  readonly occupied_slots: string | null | undefined;
  readonly requested_slots: string | null | undefined;
  readonly status: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"SessionMonitorUtilizationBarsFragment" | "SessionStatusBadgeFragment">;
  readonly " $fragmentType": "SessionMonitorItemFragment";
};
export type SessionMonitorItemFragment$key = {
  readonly " $data"?: SessionMonitorItemFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionMonitorItemFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SessionMonitorItemFragment",
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
      "name": "created_at",
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
      "args": null,
      "kind": "FragmentSpread",
      "name": "SessionMonitorUtilizationBarsFragment"
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

(node as any).hash = "e60aea7c68939d9e13152719b5fda089";

export default node;
