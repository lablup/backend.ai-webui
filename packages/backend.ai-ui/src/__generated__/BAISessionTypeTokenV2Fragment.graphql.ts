/**
 * @generated SignedSource<<ee95cceb0ce134ad1e4d47e688b85669>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type SessionV2Type = "BATCH" | "INFERENCE" | "INTERACTIVE" | "SYSTEM" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAISessionTypeTokenV2Fragment$data = {
  readonly sessionType: SessionV2Type;
  readonly " $fragmentType": "BAISessionTypeTokenV2Fragment";
};
export type BAISessionTypeTokenV2Fragment$key = {
  readonly " $data"?: BAISessionTypeTokenV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAISessionTypeTokenV2Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAISessionTypeTokenV2Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "sessionType",
      "storageKey": null
    }
  ],
  "type": "SessionV2MetadataInfo",
  "abstractKey": null
};

(node as any).hash = "9884ad3c204cae7903673f1ee2fd2bf5";

export default node;
