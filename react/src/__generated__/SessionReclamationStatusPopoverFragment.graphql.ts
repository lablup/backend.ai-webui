/**
 * @generated SignedSource<<23d2d47c3f730a311a7f980aaabbff69>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionReclamationStatusPopoverFragment$data = {
  readonly id: string;
  readonly idle_checks: string | null | undefined;
  readonly " $fragmentType": "SessionReclamationStatusPopoverFragment";
};
export type SessionReclamationStatusPopoverFragment$key = {
  readonly " $data"?: SessionReclamationStatusPopoverFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionReclamationStatusPopoverFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SessionReclamationStatusPopoverFragment",
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

(node as any).hash = "d7a7bb56a5b623bd90c657125ecd162a";

export default node;
