/**
 * @generated SignedSource<<b6695a06f9745b400535fb6a3ff21e98>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ImportArtifactRevisionToFolderButtonFragment$data = ReadonlyArray<{
  readonly status: ArtifactStatus;
  readonly " $fragmentType": "ImportArtifactRevisionToFolderButtonFragment";
}>;
export type ImportArtifactRevisionToFolderButtonFragment$key = ReadonlyArray<{
  readonly " $data"?: ImportArtifactRevisionToFolderButtonFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ImportArtifactRevisionToFolderButtonFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "ImportArtifactRevisionToFolderButtonFragment",
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

(node as any).hash = "fb4797e7e04df882a22890d1e13925c2";

export default node;
