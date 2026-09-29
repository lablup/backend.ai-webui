/**
 * @generated SignedSource<<1ebe1fda4199e1b468f13bc2cced07a1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAISessionTypeTokenFragment$data = {
  readonly type: string | null | undefined;
  readonly " $fragmentType": "BAISessionTypeTokenFragment";
};
export type BAISessionTypeTokenFragment$key = {
  readonly " $data"?: BAISessionTypeTokenFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAISessionTypeTokenFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAISessionTypeTokenFragment",
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

(node as any).hash = "ad5858a78384baeaec4c29e369532a5b";

export default node;
