/**
 * @generated SignedSource<<df13e9f5c6f831de84b5b16152e8386e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type useResourceLimitAndRemainingFragment$data = {
  readonly name: string | null | undefined;
  readonly resource_allocation_limit_for_sessions: string | null | undefined;
  readonly " $fragmentType": "useResourceLimitAndRemainingFragment";
};
export type useResourceLimitAndRemainingFragment$key = {
  readonly " $data"?: useResourceLimitAndRemainingFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"useResourceLimitAndRemainingFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useResourceLimitAndRemainingFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "resource_allocation_limit_for_sessions",
      "storageKey": null
    }
  ],
  "type": "ScalingGroup",
  "abstractKey": null
};

(node as any).hash = "957262dfe5a79b28d0c1fb1d218f4452";

export default node;
