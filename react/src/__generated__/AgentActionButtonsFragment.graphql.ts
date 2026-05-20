/**
 * @generated SignedSource<<6330ce33fc5811401cfdb391eba62950>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentActionButtonsFragment$data = {
  readonly " $fragmentSpreads": FragmentRefs<"AgentSettingModalFragment">;
  readonly " $fragmentType": "AgentActionButtonsFragment";
};
export type AgentActionButtonsFragment$key = {
  readonly " $data"?: AgentActionButtonsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AgentActionButtonsFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AgentActionButtonsFragment",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "AgentSettingModalFragment"
    }
  ],
  "type": "AgentNode",
  "abstractKey": null
};

(node as any).hash = "4d1cf046e347690661f3066dc0343f87";

export default node;
