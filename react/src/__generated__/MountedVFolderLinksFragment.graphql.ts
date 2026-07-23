/**
 * @generated SignedSource<<2e4644da7040cc3d805e4b08da776015>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MountedVFolderLinksFragment$data = {
  readonly row_id: string | null | undefined;
  readonly vfolder_nodes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"FolderLink_vfolderNode">;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"MountedVFolderLinksLegacyLazyFolderLinkFragment">;
  readonly " $fragmentType": "MountedVFolderLinksFragment";
};
export type MountedVFolderLinksFragment$key = {
  readonly " $data"?: MountedVFolderLinksFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"MountedVFolderLinksFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "MountedVFolderLinksFragment",
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
      "concreteType": "VirtualFolderConnection",
      "kind": "LinkedField",
      "name": "vfolder_nodes",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "VirtualFolderEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "VirtualFolderNode",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "FolderLink_vfolderNode"
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "MountedVFolderLinksLegacyLazyFolderLinkFragment"
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "f26bc04640693f4094c9a072011821b0";

export default node;
