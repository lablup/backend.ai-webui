/**
 * @generated SignedSource<<4bd834ab30c4d29e9f81102d032174df>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EditableSessionPriorityFragment$data = {
  readonly id: string;
  readonly priority: number | null | undefined;
  readonly " $fragmentType": "EditableSessionPriorityFragment";
};
export type EditableSessionPriorityFragment$key = {
  readonly " $data"?: EditableSessionPriorityFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"EditableSessionPriorityFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "EditableSessionPriorityFragment",
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
      "name": "priority",
      "storageKey": null
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "f625688185890743ff1a564c64897849";

export default node;
