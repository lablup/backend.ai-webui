/**
 * @generated SignedSource<<1475a5bb084a6a5507625ebf75efa36b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EditableVFolderNameFragment$data = {
  readonly group: string | null | undefined;
  readonly id: string;
  readonly name: string | null | undefined;
  readonly status: string | null | undefined;
  readonly user: string | null | undefined;
  readonly " $fragmentType": "EditableVFolderNameFragment";
};
export type EditableVFolderNameFragment$key = {
  readonly " $data"?: EditableVFolderNameFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"EditableVFolderNameFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "EditableVFolderNameFragment",
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "user",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "group",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    }
  ],
  "type": "VirtualFolderNode",
  "abstractKey": null
};

(node as any).hash = "6914dacaa3740d2cc571af8cd2a9f420";

export default node;
