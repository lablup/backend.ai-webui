/**
 * @generated SignedSource<<6e9260bf20c64ece94ffc56338f1da11>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionMonitorItemFragment$data = {
  readonly created_at: string | null | undefined;
  readonly id: string;
  readonly name: string | null | undefined;
  readonly status: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"SessionUsageMonitorFragment">;
  readonly " $fragmentType": "SessionMonitorItemFragment";
};
export type SessionMonitorItemFragment$key = {
  readonly " $data"?: SessionMonitorItemFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionMonitorItemFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SessionMonitorItemFragment",
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
      "name": "name",
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
      "name": "created_at",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SessionUsageMonitorFragment"
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "977004e25e8ea600259407a6f9f35147";

export default node;
