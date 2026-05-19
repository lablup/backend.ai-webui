/**
 * @generated SignedSource<<721760bfe80bc9847bfc13852c1b5a15>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ContainerCommitModalFragment$data = {
  readonly id: string;
  readonly name: string | null | undefined;
  readonly row_id: string;
  readonly " $fragmentType": "ContainerCommitModalFragment";
} | null | undefined;
export type ContainerCommitModalFragment$key = {
  readonly " $data"?: ContainerCommitModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ContainerCommitModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ContainerCommitModalFragment",
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
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "row_id",
        "storageKey": null
      },
      "action": "NONE"
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "8bcd294de1ffd3f00f6ec0ed7177c304";

export default node;
