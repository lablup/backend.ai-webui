/**
 * @generated SignedSource<<cb54c80649ad43aeb64eeb325bc71b72>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactRevisionTableArtifactRevisionFragment$data = ReadonlyArray<{
  readonly id: string;
  readonly size: any | null | undefined;
  readonly status: ArtifactStatus;
  readonly updatedAt: string | null | undefined;
  readonly version: string;
  readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionDeleteButtonFragment" | "BAIArtifactRevisionDownloadButtonFragment" | "BAIArtifactStatusBadgeFragment">;
  readonly " $fragmentType": "BAIArtifactRevisionTableArtifactRevisionFragment";
}>;
export type BAIArtifactRevisionTableArtifactRevisionFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIArtifactRevisionTableArtifactRevisionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionTableArtifactRevisionFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIArtifactRevisionTableArtifactRevisionFragment",
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
      "name": "version",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "size",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "updatedAt",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAIArtifactStatusBadgeFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAIArtifactRevisionDownloadButtonFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAIArtifactRevisionDeleteButtonFragment"
    }
  ],
  "type": "ArtifactRevision",
  "abstractKey": null
};

(node as any).hash = "4b886a8f1069332114e0162802fc049f";

export default node;
