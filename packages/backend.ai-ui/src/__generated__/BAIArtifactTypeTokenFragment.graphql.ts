/**
 * @generated SignedSource<<df0708c0d48affe9cb037d6c6ca90a38>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ArtifactType = "IMAGE" | "MODEL" | "PACKAGE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactTypeTokenFragment$data = {
  readonly type: ArtifactType;
  readonly " $fragmentType": "BAIArtifactTypeTokenFragment";
};
export type BAIArtifactTypeTokenFragment$key = {
  readonly " $data"?: BAIArtifactTypeTokenFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactTypeTokenFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIArtifactTypeTokenFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "type",
      "storageKey": null
    }
  ],
  "type": "Artifact",
  "abstractKey": null
};

(node as any).hash = "744d1604072e5525504b35eb9fc9acd7";

export default node;
