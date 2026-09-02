/**
 * @generated SignedSource<<fa09b1169ad4eaacc7fa8fa5779f59bf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentDetailDrawerContentFragment$data = {
  readonly addr: string | null | undefined;
  readonly first_contact: string | null | undefined;
  readonly id: string;
  readonly region: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly scaling_group: string | null | undefined;
  readonly schedulable: boolean | null | undefined;
  readonly status: string | null | undefined;
  readonly status_changed: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"AgentActionButtonsFragment" | "AgentComputePluginsFragment" | "AgentResourcesFragment" | "AgentStatusTagFragment">;
  readonly " $fragmentType": "AgentDetailDrawerContentFragment";
};
export type AgentDetailDrawerContentFragment$key = {
  readonly " $data"?: AgentDetailDrawerContentFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AgentDetailDrawerContentFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AgentDetailDrawerContentFragment",
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
      "name": "status",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status_changed",
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
      "name": "region",
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
      "args": null,
      "kind": "FragmentSpread",
      "name": "AgentStatusTagFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "AgentComputePluginsFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "AgentResourcesFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "AgentActionButtonsFragment"
    }
  ],
  "type": "AgentNode",
  "abstractKey": null
};

(node as any).hash = "6a91613e3113c7a03ad038ffec9bd55e";

export default node;
