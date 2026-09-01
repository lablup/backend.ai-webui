/**
 * @generated SignedSource<<e19aaff4c9e300a29559e3a8a7f0f517>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VFolderNodesFragment$data = ReadonlyArray<{
  readonly cloneable: boolean | null | undefined;
  readonly created_at: string | null | undefined;
  readonly cur_size: any | null | undefined;
  readonly group: string | null | undefined;
  readonly group_name: string | null | undefined;
  readonly host: string | null | undefined;
  readonly id: string;
  readonly last_used: string | null | undefined;
  readonly max_files: number | null | undefined;
  readonly max_size: any | null | undefined;
  readonly name: string | null | undefined;
  readonly num_files: number | null | undefined;
  readonly ownership_type: string | null | undefined;
  readonly permissions: ReadonlyArray<any | null | undefined> | null | undefined;
  readonly quota_scope_id: string | null | undefined;
  readonly status: string | null | undefined;
  readonly usage_mode: string | null | undefined;
  readonly user: string | null | undefined;
  readonly user_email: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"BAINodeNotificationItemFragment" | "SharedFolderPermissionInfoModalFragment" | "VFolderNodeIdenticonFragment" | "VFolderPermissionCellFragment">;
  readonly " $fragmentType": "VFolderNodesFragment";
} | null | undefined>;
export type VFolderNodesFragment$key = ReadonlyArray<{
  readonly " $data"?: VFolderNodesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"VFolderNodesFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "VFolderNodesFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      "action": "NONE"
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
      "name": "name",
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
      "name": "quota_scope_id",
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
      "name": "user",
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
      "name": "group",
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
      "name": "usage_mode",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_files",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_size",
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
      "name": "last_used",
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
      "name": "permissions",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "VFolderPermissionCellFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "VFolderNodeIdenticonFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SharedFolderPermissionInfoModalFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAINodeNotificationItemFragment"
    }
  ],
  "type": "VirtualFolderNode",
  "abstractKey": null
};

(node as any).hash = "dc2ac6bf24511b3dd1838fed1c1af7f5";

export default node;
