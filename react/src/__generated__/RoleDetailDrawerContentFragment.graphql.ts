/**
 * @generated SignedSource<<9ba971b51400ba6af923376dedca4ed4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RoleSource = "CUSTOM" | "SYSTEM" | "%future added value";
export type RoleStatus = "ACTIVE" | "DELETED" | "INACTIVE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type RoleDetailDrawerContentFragment$data = {
  readonly createdAt: string;
  readonly deletedAt: string | null | undefined;
  readonly description: string | null | undefined;
  readonly id: string;
  readonly name: string;
  readonly source: RoleSource;
  readonly status: RoleStatus;
  readonly updatedAt: string;
  readonly " $fragmentSpreads": FragmentRefs<"CreatePermissionModal_roleScopeFragment" | "RoleAssignmentTab_roleScopeFragment">;
  readonly " $fragmentType": "RoleDetailDrawerContentFragment";
};
export type RoleDetailDrawerContentFragment$key = {
  readonly " $data"?: RoleDetailDrawerContentFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RoleDetailDrawerContentFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RoleDetailDrawerContentFragment",
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
      "name": "name",
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
      "name": "source",
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
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "updatedAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "deletedAt",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RoleAssignmentTab_roleScopeFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "CreatePermissionModal_roleScopeFragment"
    }
  ],
  "type": "Role",
  "abstractKey": null
};

(node as any).hash = "f93638d49b968651bae17711b8a7733c";

export default node;
