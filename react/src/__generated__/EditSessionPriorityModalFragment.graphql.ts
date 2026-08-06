/**
 * @generated SignedSource<<98ad332cd97747e03a54b5a1e48a33de>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EditSessionPriorityModalFragment$data = {
  readonly id: string;
  readonly name: string | null | undefined;
  readonly priority: number | null | undefined;
  readonly " $fragmentType": "EditSessionPriorityModalFragment";
} | null | undefined;
export type EditSessionPriorityModalFragment$key = {
  readonly " $data"?: EditSessionPriorityModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"EditSessionPriorityModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
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

(node as any).hash = "4c099e3263222bfe238710749386d065";

export default node;
