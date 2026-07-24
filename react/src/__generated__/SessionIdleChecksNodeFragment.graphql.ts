/**
 * @generated SignedSource<<1730d4f6383847bae535416b993c3a61>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionIdleChecksNodeFragment$data = {
  readonly id: string;
  readonly idle_checks: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"SessionReclamationStatusCellFragment">;
  readonly " $fragmentType": "SessionIdleChecksNodeFragment";
};
export type SessionIdleChecksNodeFragment$key = {
  readonly " $data"?: SessionIdleChecksNodeFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionIdleChecksNodeFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SessionIdleChecksNodeFragment",
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
      "name": "SessionReclamationStatusCellFragment"
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "cd0692b3021358f17c5abea99afd29d2";

export default node;
