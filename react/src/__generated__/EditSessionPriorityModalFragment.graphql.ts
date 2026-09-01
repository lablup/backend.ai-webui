/**
 * @generated SignedSource<<af7dcb3254316099b46e3def661e4369>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EditSessionPriorityModalFragment$data = ReadonlyArray<{
  readonly id: string;
  readonly name: string | null | undefined;
  readonly priority: number | null | undefined;
  readonly " $fragmentType": "EditSessionPriorityModalFragment";
} | null | undefined>;
export type EditSessionPriorityModalFragment$key = ReadonlyArray<{
  readonly " $data"?: EditSessionPriorityModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"EditSessionPriorityModalFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "EditSessionPriorityModalFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      "action": "NONE"
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
      "name": "priority",
      "storageKey": null
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "7367aed83bd274e19a480fa868def672";

export default node;
