/**
 * @generated SignedSource<<ba2e0038e0d1ebd4602742e189e66a77>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactRevisionDownloadButtonFragment$data = ReadonlyArray<{
  readonly status: ArtifactStatus;
  readonly " $fragmentType": "BAIArtifactRevisionDownloadButtonFragment";
}>;
export type BAIArtifactRevisionDownloadButtonFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIArtifactRevisionDownloadButtonFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionDownloadButtonFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIArtifactRevisionDownloadButtonFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    }
  ],
  "type": "ArtifactRevision",
  "abstractKey": null
};

(node as any).hash = "e5b39e33c29dc38bc100766800075b10";

export default node;
