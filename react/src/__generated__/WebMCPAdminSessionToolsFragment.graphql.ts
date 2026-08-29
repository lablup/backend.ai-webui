/**
 * @generated SignedSource<<29639903f3e15833175937306f618119>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type WebMCPAdminSessionToolsFragment$data = ReadonlyArray<{
  readonly created_at: string | null | undefined;
  readonly id: string;
  readonly name: string | null | undefined;
  readonly project_id: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly scaling_group: string | null | undefined;
  readonly status: string | null | undefined;
  readonly type: string | null | undefined;
  readonly user_id: string | null | undefined;
  readonly " $fragmentType": "WebMCPAdminSessionToolsFragment";
}>;
export type WebMCPAdminSessionToolsFragment$key = ReadonlyArray<{
  readonly " $data"?: WebMCPAdminSessionToolsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"WebMCPAdminSessionToolsFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "WebMCPAdminSessionToolsFragment",
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
      "name": "status",
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
      "name": "project_id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "user_id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "created_at",
      "storageKey": null
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "f146799f4b376512cd5717734755a37a";

export default node;
