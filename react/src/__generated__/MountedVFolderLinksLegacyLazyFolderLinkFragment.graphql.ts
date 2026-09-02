/**
 * @generated SignedSource<<047e171b462f4f1fbc82aab6804526dd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MountedVFolderLinksLegacyLazyFolderLinkFragment$data = {
  readonly row_id: string | null | undefined;
  readonly vfolder_mounts: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly " $fragmentType": "MountedVFolderLinksLegacyLazyFolderLinkFragment";
};
export type MountedVFolderLinksLegacyLazyFolderLinkFragment$key = {
  readonly " $data"?: MountedVFolderLinksLegacyLazyFolderLinkFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"MountedVFolderLinksLegacyLazyFolderLinkFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "MountedVFolderLinksLegacyLazyFolderLinkFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "row_id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "vfolder_mounts",
      "storageKey": null
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "72fda7ec47bcaa5e7fc83cbaabc822c6";

export default node;
