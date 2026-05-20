/**
 * @generated SignedSource<<4af1c5fc566bb1c8b5c894efc70279f4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ArtifactType = "IMAGE" | "MODEL" | "PACKAGE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactTypeTagFragment$data = {
  readonly type: ArtifactType;
  readonly " $fragmentType": "BAIArtifactTypeTagFragment";
};
export type BAIArtifactTypeTagFragment$key = {
  readonly " $data"?: BAIArtifactTypeTagFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactTypeTagFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIArtifactTypeTagFragment",
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

(node as any).hash = "8dfa15dbbcc071df4635b038e17bdf52";

export default node;
