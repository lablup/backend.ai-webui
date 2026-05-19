/**
 * @generated SignedSource<<16ca1080d8cfe0e9f6c546cabc76d854>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentResourcesFragment$data = {
  readonly available_slots: string | null | undefined;
  readonly gpu_alloc_map: any | null | undefined;
  readonly live_stat: string | null | undefined;
  readonly occupied_slots: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"AgentDetailModalFragment">;
  readonly " $fragmentType": "AgentResourcesFragment";
};
export type AgentResourcesFragment$key = {
  readonly " $data"?: AgentResourcesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AgentResourcesFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AgentResourcesFragment",
  "selections": [
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
      "name": "available_slots",
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
      "name": "gpu_alloc_map",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "AgentDetailModalFragment"
    }
  ],
  "type": "AgentNode",
  "abstractKey": null
};

(node as any).hash = "e56a66828c2f15c1e8fb47068fd4d5ad";

export default node;
