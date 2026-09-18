/**
 * @generated SignedSource<<2ed24231f7a1e401ef0481987d830ca7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactStatusBadgeFragment$data = {
  readonly status: ArtifactStatus;
  readonly " $fragmentType": "BAIArtifactStatusBadgeFragment";
};
export type BAIArtifactStatusBadgeFragment$key = {
  readonly " $data"?: BAIArtifactStatusBadgeFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactStatusBadgeFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIArtifactStatusBadgeFragment",
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

(node as any).hash = "51ab4c3c7b077c9d899b9f12305960b8";

export default node;
