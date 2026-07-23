/**
 * @generated SignedSource<<92a2e1525cdbceb5ce84c683439e15c0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIProjectTableFragment$data = ReadonlyArray<{
  readonly container_registry: string | null | undefined;
  readonly created_at: string | null | undefined;
  readonly description: string | null | undefined;
  readonly domain_name: string | null | undefined;
  readonly id: string;
  readonly integration_id: string | null | undefined;
  readonly is_active: boolean | null | undefined;
  readonly name: string | null | undefined;
  readonly resource_policy: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly scaling_groups: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly total_resource_slots: string | null | undefined;
  readonly type: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"BAIAllowedVfolderHostsWithPermissionFromGroupFragment">;
  readonly " $fragmentType": "BAIProjectTableFragment";
}>;
export type BAIProjectTableFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIProjectTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIProjectTableFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIProjectTableFragment",
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
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "domain_name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "description",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "is_active",
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
      "name": "total_resource_slots",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "integration_id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "resource_policy",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "type",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "container_registry",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "scaling_groups",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAIAllowedVfolderHostsWithPermissionFromGroupFragment"
    }
  ],
  "type": "GroupNode",
  "abstractKey": null
};

(node as any).hash = "3070a49b7c4a45559d4a93f1bde80b62";

export default node;
