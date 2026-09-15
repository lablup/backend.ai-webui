/**
 * @generated SignedSource<<fafdf4b4e6fd485c1b3f878a9761b78d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ScopedRolePermissionCard_rbacPermissionMatrixFragment$data = ReadonlyArray<{
  readonly entities: ReadonlyArray<{
    readonly actions: ReadonlyArray<{
      readonly requiredPermission: PermissionBit;
    }>;
    readonly entityType: string;
  }>;
  readonly scopeType: string;
  readonly " $fragmentSpreads": FragmentRefs<"RoleScopePermissionEditModal_rbacPermissionMatrixFragment">;
  readonly " $fragmentType": "ScopedRolePermissionCard_rbacPermissionMatrixFragment";
}>;
export type ScopedRolePermissionCard_rbacPermissionMatrixFragment$key = ReadonlyArray<{
  readonly " $data"?: ScopedRolePermissionCard_rbacPermissionMatrixFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ScopedRolePermissionCard_rbacPermissionMatrixFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "ScopedRolePermissionCard_rbacPermissionMatrixFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "scopeType",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "EntityActionInfo",
      "kind": "LinkedField",
      "name": "entities",
      "plural": true,
      "selections": [
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
          "concreteType": "OperationInfo",
          "kind": "LinkedField",
          "name": "actions",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "requiredPermission",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RoleScopePermissionEditModal_rbacPermissionMatrixFragment"
    }
  ],
  "type": "ScopeEntityOperationCombination",
  "abstractKey": null
};

(node as any).hash = "ee8d047dafbf283c89f24ec686552d48";

export default node;
