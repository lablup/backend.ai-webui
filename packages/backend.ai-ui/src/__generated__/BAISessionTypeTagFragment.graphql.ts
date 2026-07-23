/**
 * @generated SignedSource<<f30476cecf9d09cdcb347513625bf0fd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAISessionTypeTagFragment$data = {
  readonly type: string | null | undefined;
  readonly " $fragmentType": "BAISessionTypeTagFragment";
};
export type BAISessionTypeTagFragment$key = {
  readonly " $data"?: BAISessionTypeTagFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAISessionTypeTagFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAISessionTypeTagFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "type",
      "storageKey": null
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "d80914098e3bb7b9a8831664533a4022";

export default node;
