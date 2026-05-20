/**
 * @generated SignedSource<<6645400e001916be0858a0422843b7d4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionUsageMonitorFragment$data = {
  readonly occupied_slots: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"useSessionNodeLiveStatSessionFragment">;
  readonly " $fragmentType": "SessionUsageMonitorFragment";
};
export type SessionUsageMonitorFragment$key = {
  readonly " $data"?: SessionUsageMonitorFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionUsageMonitorFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SessionUsageMonitorFragment",
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

(node as any).hash = "126b19074b321cbdde92a7514e1f0897";

export default node;
