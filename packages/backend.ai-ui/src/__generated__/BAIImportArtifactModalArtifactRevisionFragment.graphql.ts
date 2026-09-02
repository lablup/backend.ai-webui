/**
 * @generated SignedSource<<8829057e40bae09b309b4d68a18b63c6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIImportArtifactModalArtifactRevisionFragment$data = ReadonlyArray<{
  readonly id: string;
  readonly size: any | null | undefined;
  readonly status: ArtifactStatus;
  readonly version: string;
  readonly " $fragmentType": "BAIImportArtifactModalArtifactRevisionFragment";
}>;
export type BAIImportArtifactModalArtifactRevisionFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIImportArtifactModalArtifactRevisionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIImportArtifactModalArtifactRevisionFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIImportArtifactModalArtifactRevisionFragment",
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

(node as any).hash = "be471319e927479366f2951cd59d48f3";

export default node;
