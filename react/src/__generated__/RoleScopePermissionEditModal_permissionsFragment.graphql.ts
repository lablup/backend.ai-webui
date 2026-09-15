/**
 * @generated SignedSource<<7bdfa674f45f3a80c1e9235107236f3e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type OperationType = "CREATE" | "GRANT_ALL" | "GRANT_HARD_DELETE" | "GRANT_READ" | "GRANT_SOFT_DELETE" | "GRANT_UPDATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type RoleScopePermissionEditModal_permissionsFragment$data = ReadonlyArray<{
  readonly entityType: string;
  readonly id: string;
  readonly operation: OperationType;
  readonly scopeId: string;
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
    }
  ],
  "type": "Permission",
  "abstractKey": null
};

(node as any).hash = "cb3f7b3a7f29508663f442e9145ed467";

export default node;
