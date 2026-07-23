/**
 * @generated SignedSource<<87878acdace08a50d610cc1e0d7ad878>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIActivateArtifactsModalArtifactsFragment$data = ReadonlyArray<{
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "BAIActivateArtifactsModalArtifactsFragment";
}>;
export type BAIActivateArtifactsModalArtifactsFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIActivateArtifactsModalArtifactsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIActivateArtifactsModalArtifactsFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIActivateArtifactsModalArtifactsFragment",
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
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "Artifact",
  "abstractKey": null
};

(node as any).hash = "65926d795590871433bf9800c7c6a065";

export default node;
