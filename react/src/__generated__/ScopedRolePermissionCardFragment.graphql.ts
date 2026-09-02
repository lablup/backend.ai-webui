/**
 * @generated SignedSource<<1871a4118915a5c74ceef13377973743>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ScopedRolePermissionCardFragment$data = {
  readonly id: string;
  readonly " $fragmentSpreads": FragmentRefs<"RoleScopePermissionEditModalFragment">;
  readonly " $fragmentType": "ScopedRolePermissionCardFragment";
};
export type ScopedRolePermissionCardFragment$key = {
  readonly " $data"?: ScopedRolePermissionCardFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ScopedRolePermissionCardFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ScopedRolePermissionCardFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RoleScopePermissionEditModalFragment"
    }
  ],
  "type": "Role",
  "abstractKey": null
};

(node as any).hash = "5d16c315cce80be8e7b6b09902e244a5";

export default node;
