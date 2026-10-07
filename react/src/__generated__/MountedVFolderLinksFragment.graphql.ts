/**
 * @generated SignedSource<<d0960722f6bb282e21fb5a28f7b53d48>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MountedVFolderLinksFragment$data = {
  readonly vfolder_nodes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"FolderLink_vfolderNode">;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
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
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "e012814131219fd2c5e2ce219774286c";

export default node;
