/**
 * @generated SignedSource<<462af5f9df0e58aaa2ad869af29774cb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VFolderNodeDescriptionFragment$data = {
  readonly cloneable: boolean | null | undefined;
  readonly created_at: string | null | undefined;
  readonly creator: string | null | undefined;
  readonly cur_size: any | null | undefined;
  readonly group: string | null | undefined;
  readonly group_name: string | null | undefined;
  readonly host: string | null | undefined;
  readonly id: string;
  readonly last_used: string | null | undefined;
  readonly max_files: number | null | undefined;
  readonly max_size: any | null | undefined;
  readonly num_files: number | null | undefined;
  readonly ownership_type: string | null | undefined;
  readonly permission: string | null | undefined;
  readonly permissions: ReadonlyArray<any | null | undefined> | null | undefined;
  readonly quota_scope_id: string | null | undefined;
  readonly status: string | null | undefined;
  readonly unmanaged_path: string | null | undefined;
  readonly usage_mode: string | null | undefined;
  readonly user: string | null | undefined;
  readonly user_email: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"VFolderPermissionCellFragment" | "useVirtualFolderNodePathFragment">;
  readonly " $fragmentType": "VFolderNodeDescriptionFragment";
};
export type VFolderNodeDescriptionFragment$key = {
  readonly " $data"?: VFolderNodeDescriptionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"VFolderNodeDescriptionFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "VFolderNodeDescriptionFragment",
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
      "name": "status",
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
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "unmanaged_path",
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
      "name": "useVirtualFolderNodePathFragment"
    }
  ],
  "type": "VirtualFolderNode",
  "abstractKey": null
};

(node as any).hash = "f4ca4470ea635f85c8c346eed0a5fe8c";

export default node;
