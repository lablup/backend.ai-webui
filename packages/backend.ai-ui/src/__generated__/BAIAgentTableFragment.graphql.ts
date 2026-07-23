/**
 * @generated SignedSource<<7207a333df491ea78c4096cbe2b26904>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIAgentTableFragment$data = ReadonlyArray<{
  readonly addr: string | null | undefined;
  readonly architecture: string | null | undefined;
  readonly available_slots: string | null | undefined;
  readonly compute_plugins: string | null | undefined;
  readonly first_contact: string | null | undefined;
  readonly id: string;
  readonly live_stat: string | null | undefined;
  readonly occupied_slots: string | null | undefined;
  readonly region: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly scaling_group: string | null | undefined;
  readonly schedulable: boolean | null | undefined;
  readonly status: string | null | undefined;
  readonly version: string | null | undefined;
  readonly " $fragmentType": "BAIAgentTableFragment";
}>;
export type BAIAgentTableFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIAgentTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIAgentTableFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIAgentTableFragment",
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
      "name": "row_id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "addr",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "region",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "architecture",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "first_contact",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "occupied_slots",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "available_slots",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "live_stat",
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
      "name": "scaling_group",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "compute_plugins",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "version",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "schedulable",
      "storageKey": null
    }
  ],
  "type": "AgentNode",
  "abstractKey": null
};

(node as any).hash = "663da12b3889cebd0348e97f8e6fb890";

export default node;
