/**
 * @generated SignedSource<<8e84c485b39c27dd0b9b16a944941b9d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ImportArtifactRevisionToFolderModalArtifactRevisionFragment$data = ReadonlyArray<{
  readonly fieldId: string;
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "fieldId",
      "storageKey": null
    }
  ],
  "type": "ArtifactRevision",
  "abstractKey": null
};

(node as any).hash = "c861ecf6447307347af2aee9efb8f8fa";

export default node;
