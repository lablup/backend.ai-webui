/**
 * @generated SignedSource<<5ae5727835c7048d04268f69a142bc30>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$data = ReadonlyArray<{
  readonly id: string;
  readonly size: any | null | undefined;
  readonly status: ArtifactStatus;
  readonly version: string;
  readonly " $fragmentType": "BAIDeleteArtifactRevisionsModalArtifactRevisionFragment";
}>;
export type BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIDeleteArtifactRevisionsModalArtifactRevisionFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIDeleteArtifactRevisionsModalArtifactRevisionFragment",
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
    }
  ],
  "type": "ArtifactRevision",
  "abstractKey": null
};

(node as any).hash = "26bb2a6744453c3301f6e2e94a0922c3";

export default node;
