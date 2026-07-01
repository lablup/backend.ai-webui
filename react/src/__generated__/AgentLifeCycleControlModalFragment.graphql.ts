/**
 * @generated SignedSource<<ed8e265fc74aaf62287f3c01112e98e1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentLifeCycleControlModalFragment$data = {
  readonly row_id: string | null | undefined;
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
      "name": "row_id",
      "storageKey": null
    }
  ],
  "type": "AgentNode",
  "abstractKey": null
};

(node as any).hash = "6006fa0f52cb07ef5f02cc9fd6e3bb5c";

export default node;
