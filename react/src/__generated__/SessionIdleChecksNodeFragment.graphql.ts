/**
 * @generated SignedSource<<5a48d3f7c0db79185e24e2b973ff10d6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionIdleChecksNodeFragment$data = {
  readonly id: string;
  readonly idle_checks: string | null | undefined;
  readonly " $fragmentType": "SessionIdleChecksNodeFragment";
};
export type SessionIdleChecksNodeFragment$key = {
  readonly " $data"?: SessionIdleChecksNodeFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionIdleChecksNodeFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SessionIdleChecksNodeFragment",
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
      "name": "idle_checks",
      "storageKey": null
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "09a1dd685c8942ebb5c69e6dddaf6da0";

export default node;
