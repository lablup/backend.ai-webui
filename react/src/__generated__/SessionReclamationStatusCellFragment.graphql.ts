/**
 * @generated SignedSource<<d01eaa28760b8e27364be8dd0f6618de>>
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
  readonly " $fragmentSpreads": FragmentRefs<"SessionReclamationStatusPopoverFragment">;
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
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SessionReclamationStatusPopoverFragment"
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "11dbc905e99d3a8f481e20a5161572b5";

export default node;
