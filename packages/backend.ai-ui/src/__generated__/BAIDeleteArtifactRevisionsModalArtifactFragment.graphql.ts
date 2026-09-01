/**
 * @generated SignedSource<<7967acd8f0afc86d9d47fd1c157c63f9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIDeleteArtifactRevisionsModalArtifactFragment$data = {
  readonly id: string;
  readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactDescriptionsFragment">;
  readonly " $fragmentType": "BAIDeleteArtifactRevisionsModalArtifactFragment";
};
export type BAIDeleteArtifactRevisionsModalArtifactFragment$key = {
  readonly " $data"?: BAIDeleteArtifactRevisionsModalArtifactFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIDeleteArtifactRevisionsModalArtifactFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIDeleteArtifactRevisionsModalArtifactFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAIArtifactDescriptionsFragment"
    }
  ],
  "type": "Artifact",
  "abstractKey": null
};

(node as any).hash = "8eac061158289fcc677ac78d52d22410";

export default node;
