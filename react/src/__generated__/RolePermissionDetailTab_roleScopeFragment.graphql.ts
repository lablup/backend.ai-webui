/**
 * @generated SignedSource<<11a3eabf256fff94a0dc095f9bafa664>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RolePermissionDetailTab_roleScopeFragment$data = {
  readonly scopeId: string;
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
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "scopeId",
      "storageKey": null
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

(node as any).hash = "7ef5e3fd56ac75ecabfb5e7e6e2a5972";

export default node;
