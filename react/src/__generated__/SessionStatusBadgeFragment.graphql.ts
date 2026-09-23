/**
 * @generated SignedSource<<583127f191a3305fd0b7ac8f95199538>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionStatusBadgeFragment$data = {
  readonly id: string;
  readonly queue_position: number | null | undefined;
  readonly status: string | null | undefined;
  readonly status_data: string | null | undefined;
  readonly status_info: string | null | undefined;
  readonly " $fragmentType": "SessionStatusBadgeFragment";
};
export type SessionStatusBadgeFragment$key = {
  readonly " $data"?: SessionStatusBadgeFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionStatusBadgeFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SessionStatusBadgeFragment",
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
      "name": "status",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status_info",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status_data",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "queue_position",
      "storageKey": null
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "158f1c8a13dc43d175a3d205693ed6b0";

export default node;
