/**
 * @generated SignedSource<<37757e5c6c069284ffa64434d32376c4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModelCloneModalVFolderFragment$data = {
  readonly host: string | null | undefined;
  readonly id: string;
  readonly name: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly " $fragmentType": "ModelCloneModalVFolderFragment";
};
export type ModelCloneModalVFolderFragment$key = {
  readonly " $data"?: ModelCloneModalVFolderFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ModelCloneModalVFolderFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ModelCloneModalVFolderFragment",
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
      "name": "row_id",
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
      "name": "host",
      "storageKey": null
    }
  ],
  "type": "VirtualFolderNode",
  "abstractKey": null
};

(node as any).hash = "1a71313aaf7e97eab3dcee44639ffe7a";

export default node;
