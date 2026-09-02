/**
 * @generated SignedSource<<64de2b2b012572f33a38e3e7e0e6876d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAISessionAgentIdsFragment$data = {
  readonly agent_ids: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly " $fragmentType": "BAISessionAgentIdsFragment";
};
export type BAISessionAgentIdsFragment$key = {
  readonly " $data"?: BAISessionAgentIdsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAISessionAgentIdsFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAISessionAgentIdsFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "agent_ids",
      "storageKey": null
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "42a06f8e2b4b445e08e0f94066e8ea58";

export default node;
