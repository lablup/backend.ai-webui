/**
 * @generated SignedSource<<4c849a8319f2fd5880075e756452be34>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentDetailModalFragment$data = {
  readonly available_slots: string | null | undefined;
  readonly id: string;
  readonly live_stat: string | null | undefined;
  readonly occupied_slots: string | null | undefined;
  readonly " $fragmentType": "AgentDetailModalFragment";
};
export type AgentDetailModalFragment$key = {
  readonly " $data"?: AgentDetailModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AgentDetailModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AgentDetailModalFragment",
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
      "name": "live_stat",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "available_slots",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "occupied_slots",
      "storageKey": null
    }
  ],
  "type": "AgentNode",
  "abstractKey": null
};

(node as any).hash = "499688fa3bf91b8f138603942eebb5cd";

export default node;
