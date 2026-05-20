/**
 * @generated SignedSource<<44ace7bd2bcb98f028bc3b8f71e33e00>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentComputePluginsFragment$data = {
  readonly available_slots: string | null | undefined;
  readonly compute_plugins: string | null | undefined;
  readonly " $fragmentType": "AgentComputePluginsFragment";
};
export type AgentComputePluginsFragment$key = {
  readonly " $data"?: AgentComputePluginsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AgentComputePluginsFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AgentComputePluginsFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "compute_plugins",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "available_slots",
      "storageKey": null
    }
  ],
  "type": "AgentNode",
  "abstractKey": null
};

(node as any).hash = "52302cc31c6d768c7f65fd8870998b24";

export default node;
