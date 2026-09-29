/**
 * @generated SignedSource<<77a5e860413ccc168fc6c3c8347b048b>>
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
  readonly " $fragmentSpreads": FragmentRefs<"AgentActionButtonsFragment" | "AgentComputePluginsFragment" | "AgentResourcesFragment" | "AgentStatusBadgeFragment">;
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
      "name": "AgentStatusBadgeFragment"
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

(node as any).hash = "becfd84532a1f08b22e067532616f046";

export default node;
