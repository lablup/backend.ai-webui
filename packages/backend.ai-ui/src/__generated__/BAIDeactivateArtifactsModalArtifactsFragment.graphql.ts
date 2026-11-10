/**
 * @generated SignedSource<<bd0f95101229167313fa12e86ab3747a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIDeactivateArtifactsModalArtifactsFragment$data = ReadonlyArray<{
  readonly entityId: string;
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
      "name": "entityId",
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

(node as any).hash = "dc9ed8e2de13dae6ba39bd5450666daa";

export default node;
