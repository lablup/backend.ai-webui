/**
 * @generated SignedSource<<a219ed6100a5f80efa8a2364e8bacd82>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactStatusTagFragment$data = {
  readonly status: ArtifactStatus;
  readonly " $fragmentType": "BAIArtifactStatusTagFragment";
};
export type BAIArtifactStatusTagFragment$key = {
  readonly " $data"?: BAIArtifactStatusTagFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactStatusTagFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIArtifactStatusTagFragment",
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

(node as any).hash = "29b3236d7ab084a8bdfc11a513c7a5d3";

export default node;
