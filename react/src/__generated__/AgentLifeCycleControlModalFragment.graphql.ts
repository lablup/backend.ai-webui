/**
 * @generated SignedSource<<7e2043ab902803c4782f30e879e33d9e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentLifeCycleControlModalFragment$data = {
  readonly id: string;
  readonly " $fragmentType": "AgentLifeCycleControlModalFragment";
};
export type AgentLifeCycleControlModalFragment$key = {
  readonly " $data"?: AgentLifeCycleControlModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AgentLifeCycleControlModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AgentLifeCycleControlModalFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "AgentNode",
  "abstractKey": null
};

(node as any).hash = "3be236b836a0598f33f171386a98b49f";

export default node;
