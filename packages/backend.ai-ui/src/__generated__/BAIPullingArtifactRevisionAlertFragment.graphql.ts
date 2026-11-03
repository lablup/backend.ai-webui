/**
 * @generated SignedSource<<98fd0564b33491b71dfcd6ef6000a074>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIPullingArtifactRevisionAlertFragment$data = {
  readonly fieldId: string;
  readonly id: string;
  readonly status: ArtifactStatus;
  readonly version: string;
  readonly " $fragmentType": "BAIPullingArtifactRevisionAlertFragment";
};
export type BAIPullingArtifactRevisionAlertFragment$key = {
  readonly " $data"?: BAIPullingArtifactRevisionAlertFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIPullingArtifactRevisionAlertFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIPullingArtifactRevisionAlertFragment",
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
      "name": "fieldId",
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
      "name": "version",
      "storageKey": null
    }
  ],
  "type": "ArtifactRevision",
  "abstractKey": null
};

(node as any).hash = "e6966f472baffdb60ebb71b731174e9e";

export default node;
