/**
 * @generated SignedSource<<35b2c1f742ff917702ec1e5bf7455c58>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type OperationType = "CREATE" | "GRANT_ALL" | "GRANT_HARD_DELETE" | "GRANT_READ" | "GRANT_SOFT_DELETE" | "GRANT_UPDATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type RoleScopePermissionEditModal_permissionsFragment$data = ReadonlyArray<{
  readonly entityType: string;
  readonly id: string;
  readonly operation: OperationType | null | undefined;
  readonly permission: PermissionBit;
  readonly scopeId: string | null | undefined;
  readonly " $fragmentType": "RoleScopePermissionEditModal_permissionsFragment";
}>;
export type RoleScopePermissionEditModal_permissionsFragment$key = ReadonlyArray<{
  readonly " $data"?: RoleScopePermissionEditModal_permissionsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RoleScopePermissionEditModal_permissionsFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "RoleScopePermissionEditModal_permissionsFragment",
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
      "name": "scopeId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "entityType",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "operation",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "permission",
      "storageKey": null
    }
  ],
  "type": "Permission",
  "abstractKey": null
};

(node as any).hash = "452f6a5b6e72ae449cd0d875a622829e";

export default node;
