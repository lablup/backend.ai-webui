/**
 * @generated SignedSource<<5e893b38df2168bae022bfbe74f0c6b8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RoleScopePermissionEditModalFragment$data = {
  readonly id: string;
  readonly " $fragmentType": "RoleScopePermissionEditModalFragment";
};
export type RoleScopePermissionEditModalFragment$key = {
  readonly " $data"?: RoleScopePermissionEditModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RoleScopePermissionEditModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RoleScopePermissionEditModalFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "Role",
  "abstractKey": null
};

(node as any).hash = "25cd14475d3d7c965a45754a90b91115";

export default node;
