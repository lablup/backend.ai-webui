/**
 * @generated SignedSource<<7be55abfdd5599a352e4960d6badf21e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ImportArtifactRevisionToFolderModalModelStoreProjectsFragment$data = ReadonlyArray<{
  readonly id: string | null | undefined;
  readonly name: string | null | undefined;
  readonly " $fragmentType": "ImportArtifactRevisionToFolderModalModelStoreProjectsFragment";
}>;
export type ImportArtifactRevisionToFolderModalModelStoreProjectsFragment$key = ReadonlyArray<{
  readonly " $data"?: ImportArtifactRevisionToFolderModalModelStoreProjectsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ImportArtifactRevisionToFolderModalModelStoreProjectsFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "ImportArtifactRevisionToFolderModalModelStoreProjectsFragment",
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
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "Group",
  "abstractKey": null
};

(node as any).hash = "03c2ef0be48adf59428cecc52d866468";

export default node;
