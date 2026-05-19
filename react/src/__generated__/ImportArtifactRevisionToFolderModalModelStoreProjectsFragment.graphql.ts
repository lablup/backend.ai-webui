/**
 * @generated SignedSource<<eb1a6e4eca7032d64805aa666c2dfc9f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ImportArtifactRevisionToFolderModalModelStoreProjectsFragment$data = {
  readonly id: string | null | undefined;
  readonly name: string | null | undefined;
  readonly " $fragmentType": "ImportArtifactRevisionToFolderModalModelStoreProjectsFragment";
};
export type ImportArtifactRevisionToFolderModalModelStoreProjectsFragment$key = {
  readonly " $data"?: ImportArtifactRevisionToFolderModalModelStoreProjectsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ImportArtifactRevisionToFolderModalModelStoreProjectsFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
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

(node as any).hash = "55dc19bd0c05c3aaf314215595f0c8a0";

export default node;
