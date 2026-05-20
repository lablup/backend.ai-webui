/**
 * @generated SignedSource<<e78291f46be71fea16e1b5ca0a5beb89>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionReservationFragment$data = {
  readonly created_at: string | null | undefined;
  readonly id: string;
  readonly starts_at: string | null | undefined;
  readonly terminated_at: string | null | undefined;
  readonly " $fragmentType": "SessionReservationFragment";
};
export type SessionReservationFragment$key = {
  readonly " $data"?: SessionReservationFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionReservationFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SessionReservationFragment",
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
      "name": "created_at",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "starts_at",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "terminated_at",
      "storageKey": null
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "c0801fe0feb37a1bce71461255d0998f";

export default node;
