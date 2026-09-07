/**
 * @generated SignedSource<<7d74a133a634400752fe27658e85f563>>
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

(node as any).hash = "9fa9e2bd6d1e326e583494375f4a30f5";

export default node;
