/**
 * @generated SignedSource<<61390c28cdf46048b928ef7b7f98c312>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ImportArtifactRevisionToFolderModalArtifactRevisionFragment$data = ReadonlyArray<{
  readonly id: string;
  readonly " $fragmentType": "ImportArtifactRevisionToFolderModalArtifactRevisionFragment";
}>;
export type ImportArtifactRevisionToFolderModalArtifactRevisionFragment$key = ReadonlyArray<{
  readonly " $data"?: ImportArtifactRevisionToFolderModalArtifactRevisionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ImportArtifactRevisionToFolderModalArtifactRevisionFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "ImportArtifactRevisionToFolderModalArtifactRevisionFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      "action": "THROW"
    }
  ],
  "type": "ArtifactRevision",
  "abstractKey": null
};

(node as any).hash = "911b8e7ffb3a0042ecb970a90018b1e8";

export default node;
