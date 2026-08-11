/**
 * @generated SignedSource<<c69992402dc2c5e2a6bc017a90a806cf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIVFolderDeleteButtonV2AstryxFragment$data = ReadonlyArray<{
  readonly id: string;
  readonly " $fragmentType": "BAIVFolderDeleteButtonV2AstryxFragment";
}>;
export type BAIVFolderDeleteButtonV2AstryxFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIVFolderDeleteButtonV2AstryxFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIVFolderDeleteButtonV2AstryxFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIVFolderDeleteButtonV2AstryxFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "VFolder",
  "abstractKey": null
};

(node as any).hash = "f004100387de9692de31e62b45267596";

export default node;
