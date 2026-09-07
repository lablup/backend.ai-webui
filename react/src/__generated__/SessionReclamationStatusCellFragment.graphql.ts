/**
 * @generated SignedSource<<4f263a3b79b3b9fa9dc5be2df4f61831>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionReclamationStatusCellFragment$data = {
  readonly id: string;
  readonly idle_checks: string | null | undefined;
  readonly " $fragmentType": "SessionReclamationStatusCellFragment";
};
export type SessionReclamationStatusCellFragment$key = {
  readonly " $data"?: SessionReclamationStatusCellFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionReclamationStatusCellFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SessionReclamationStatusCellFragment",
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
      "name": "idle_checks",
      "storageKey": null
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "cb4b45d32eea0ade95dbe28abf484574";

export default node;
