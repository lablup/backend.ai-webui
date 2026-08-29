/**
 * @generated SignedSource<<abfeb1120aa138f27274746e7083af55>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type WebMCPAgentToolsFragment$data = ReadonlyArray<{
  readonly addr: string | null | undefined;
  readonly architecture: string | null | undefined;
  readonly available_slots: string | null | undefined;
  readonly first_contact: string | null | undefined;
  readonly id: string;
  readonly occupied_slots: string | null | undefined;
  readonly region: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly scaling_group: string | null | undefined;
  readonly schedulable: boolean | null | undefined;
  readonly status: string | null | undefined;
  readonly " $fragmentType": "WebMCPAgentToolsFragment";
}>;
export type WebMCPAgentToolsFragment$key = ReadonlyArray<{
  readonly " $data"?: WebMCPAgentToolsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"WebMCPAgentToolsFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "WebMCPAgentToolsFragment",
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
      "name": "schedulable",
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
    }
  ],
  "type": "AgentNode",
  "abstractKey": null
};

(node as any).hash = "bd0c6b0c0a275c1ec3c32cd862c6de3f";

export default node;
