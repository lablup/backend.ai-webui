/**
 * @generated SignedSource<<17d91ac790dad5761788007e4fcd4e0b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type WebMCPSessionListToolsFragment$data = ReadonlyArray<{
  readonly agent_ids: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly created_at: string | null | undefined;
  readonly domain_name: string | null | undefined;
  readonly name: string | null | undefined;
  readonly owner: {
    readonly email: string | null | undefined;
  } | null | undefined;
  readonly project_id: string | null | undefined;
  readonly result: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly scaling_group: string | null | undefined;
  readonly status: string | null | undefined;
  readonly status_info: string | null | undefined;
  readonly terminated_at: string | null | undefined;
  readonly type: string | null | undefined;
  readonly " $fragmentType": "WebMCPSessionListToolsFragment";
}>;
export type WebMCPSessionListToolsFragment$key = ReadonlyArray<{
  readonly " $data"?: WebMCPSessionListToolsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"WebMCPSessionListToolsFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "WebMCPSessionListToolsFragment",
  "selections": [
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
      "name": "result",
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
      "name": "scaling_group",
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
      "name": "terminated_at",
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
      "name": "project_id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "agent_ids",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "UserNode",
      "kind": "LinkedField",
      "name": "owner",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "email",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "1f283a0ca00a5585004870d36475535d";

export default node;
