/**
 * @generated SignedSource<<c3aa16ec39c245dfce619457c85ef6f7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionMonitorUtilizationBarsFragment$data = {
  readonly occupied_slots: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"useSessionNodeLiveStatSessionFragment">;
  readonly " $fragmentType": "SessionMonitorUtilizationBarsFragment";
};
export type SessionMonitorUtilizationBarsFragment$key = {
  readonly " $data"?: SessionMonitorUtilizationBarsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionMonitorUtilizationBarsFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SessionMonitorUtilizationBarsFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "occupied_slots",
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

(node as any).hash = "c39e01ae278883be7b0ba1956819c601";

export default node;
