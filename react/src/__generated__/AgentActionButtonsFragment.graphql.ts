/**
 * @generated SignedSource<<c64121d94df0d2feb62183843a8ea2c1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentActionButtonsFragment$data = {
  readonly status: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"AgentLifeCycleControlModalFragment" | "AgentSettingModalFragment">;
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
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "AgentSettingModalFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "AgentLifeCycleControlModalFragment"
    }
  ],
  "type": "AgentNode",
  "abstractKey": null
};

(node as any).hash = "91839e2c961d0267044baf054740c45c";

export default node;
