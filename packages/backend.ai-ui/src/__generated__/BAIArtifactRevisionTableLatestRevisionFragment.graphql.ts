/**
 * @generated SignedSource<<c0a4a7894818c9a3d2d72a0cb290a80a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIArtifactRevisionTableLatestRevisionFragment$data = {
  readonly id: string;
  readonly " $fragmentType": "BAIArtifactRevisionTableLatestRevisionFragment";
};
export type BAIArtifactRevisionTableLatestRevisionFragment$key = {
  readonly " $data"?: BAIArtifactRevisionTableLatestRevisionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionTableLatestRevisionFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIArtifactRevisionTableLatestRevisionFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "ArtifactRevision",
  "abstractKey": null
};

(node as any).hash = "7598c47b813de8a7d1823fd229eeda60";

export default node;
