/**
 * @generated SignedSource<<e3b9a5f5b81c1378573eccb9d430c421>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModifySessionModalFragment$data = ReadonlyArray<{
  readonly id: string;
  readonly name: string | null | undefined;
  readonly priority: number | null | undefined;
  readonly " $fragmentType": "ModifySessionModalFragment";
} | null | undefined>;
export type ModifySessionModalFragment$key = ReadonlyArray<{
  readonly " $data"?: ModifySessionModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ModifySessionModalFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "ModifySessionModalFragment",
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

(node as any).hash = "787d4a13a715b9706ba484631d141e28";

export default node;
