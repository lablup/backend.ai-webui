/**
 * @generated SignedSource<<67497eb35af49cf584dcad555af4c567>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SFTPConnectionInfoModalFragment$data = {
  readonly row_id: string;
  readonly vfolder_mounts: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly " $fragmentType": "SFTPConnectionInfoModalFragment";
} | null | undefined;
export type SFTPConnectionInfoModalFragment$key = {
  readonly " $data"?: SFTPConnectionInfoModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SFTPConnectionInfoModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SFTPConnectionInfoModalFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "row_id",
        "storageKey": null
      },
      "action": "NONE"
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

(node as any).hash = "b4dd89107e1dc0034575c6ac952ce1b2";

export default node;
