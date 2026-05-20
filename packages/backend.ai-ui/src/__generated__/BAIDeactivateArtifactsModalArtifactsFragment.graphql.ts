/**
 * @generated SignedSource<<8dc5a9b661bfc9acd5de5dd304e5f389>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIDeactivateArtifactsModalArtifactsFragment$data = ReadonlyArray<{
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "BAIDeactivateArtifactsModalArtifactsFragment";
}>;
export type BAIDeactivateArtifactsModalArtifactsFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIDeactivateArtifactsModalArtifactsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIDeactivateArtifactsModalArtifactsFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIDeactivateArtifactsModalArtifactsFragment",
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

(node as any).hash = "26ee1b9a7472e661b724e54fd20b19a2";

export default node;
