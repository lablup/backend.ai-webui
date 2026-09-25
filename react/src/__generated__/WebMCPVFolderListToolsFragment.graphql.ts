/**
 * @generated SignedSource<<b89d6fd6c1eca78a114c8f502616afd1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type WebMCPVFolderListToolsFragment$data = ReadonlyArray<{
  readonly cloneable: boolean | null | undefined;
  readonly created_at: string | null | undefined;
  readonly creator: string | null | undefined;
  readonly cur_size: any | null | undefined;
  readonly group_name: string | null | undefined;
  readonly host: string | null | undefined;
  readonly last_used: string | null | undefined;
  readonly name: string | null | undefined;
  readonly num_files: number | null | undefined;
  readonly ownership_type: string | null | undefined;
  readonly permission: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly status: string | null | undefined;
  readonly usage_mode: string | null | undefined;
  readonly user_email: string | null | undefined;
  readonly " $fragmentType": "WebMCPVFolderListToolsFragment";
}>;
export type WebMCPVFolderListToolsFragment$key = ReadonlyArray<{
  readonly " $data"?: WebMCPVFolderListToolsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"WebMCPVFolderListToolsFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "WebMCPVFolderListToolsFragment",
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
      "name": "host",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "permission",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "ownership_type",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "user_email",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "group_name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "creator",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "usage_mode",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "num_files",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "cur_size",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "cloneable",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "last_used",
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
  "type": "VirtualFolderNode",
  "abstractKey": null
};

(node as any).hash = "d6b90544823c0a32a677a06ade0512ff";

export default node;
