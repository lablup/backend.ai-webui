/**
 * @generated SignedSource<<dd4f827ab4331fabda7f2f9fe26dbc9e>>
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
  readonly " $fragmentSpreads": FragmentRefs<"SessionMonitorUtilizationBarsFragment">;
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
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "2b529db47b0c97f788884c0eaffdced9";

export default node;
