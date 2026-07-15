/**
 * @generated SignedSource<<49aca026c19390b4dd8f89fb47cfa3d2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RolePermissionDetailTab_roleScopeFragment$data = {
  readonly totalScopes: {
    readonly count: number;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"ScopedRolePermissionCardFragment">;
  readonly " $fragmentType": "RolePermissionDetailTab_roleScopeFragment";
};
export type RolePermissionDetailTab_roleScopeFragment$key = {
  readonly " $data"?: RolePermissionDetailTab_roleScopeFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RolePermissionDetailTab_roleScopeFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RolePermissionDetailTab_roleScopeFragment",
  "selections": [
    {
      "alias": "totalScopes",
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 1
        }
      ],
      "concreteType": "EntityConnection",
      "kind": "LinkedField",
      "name": "scopes",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "count",
          "storageKey": null
        }
      ],
      "storageKey": "scopes(first:1)"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ScopedRolePermissionCardFragment"
    }
  ],
  "type": "Role",
  "abstractKey": null
};

(node as any).hash = "7d771e3b5f52484dd7fa26bf5749f88d";

export default node;
