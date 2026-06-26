/**
 * @generated SignedSource<<5fe9033aa83b39e2aa744e5ec2ce37b9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type SessionV2Type = "BATCH" | "INFERENCE" | "INTERACTIVE" | "SYSTEM" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAISessionTypeTagV2Fragment$data = {
  readonly sessionType: SessionV2Type;
  readonly " $fragmentType": "BAISessionTypeTagV2Fragment";
};
export type BAISessionTypeTagV2Fragment$key = {
  readonly " $data"?: BAISessionTypeTagV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAISessionTypeTagV2Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAISessionTypeTagV2Fragment",
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

(node as any).hash = "b9a2cdd831c5dcdc398274bc5081c60b";

export default node;
