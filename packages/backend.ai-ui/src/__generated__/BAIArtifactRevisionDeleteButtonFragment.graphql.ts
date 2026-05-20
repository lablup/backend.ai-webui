/**
 * @generated SignedSource<<e34c678758c25098ceac5a79a31a83db>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactRevisionDeleteButtonFragment$data = ReadonlyArray<{
  readonly status: ArtifactStatus;
  readonly " $fragmentType": "BAIArtifactRevisionDeleteButtonFragment";
}>;
export type BAIArtifactRevisionDeleteButtonFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIArtifactRevisionDeleteButtonFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionDeleteButtonFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIArtifactRevisionDeleteButtonFragment",
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

(node as any).hash = "de15aa32192b0f0d63e3bd7f5f90d2b6";

export default node;
