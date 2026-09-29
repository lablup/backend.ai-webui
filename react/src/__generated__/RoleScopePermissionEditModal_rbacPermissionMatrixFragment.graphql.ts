/**
 * @generated SignedSource<<1ddd51fc1fb8d6cf0dabe6604c9f8c9f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type RoleScopePermissionEditModal_rbacPermissionMatrixFragment$data = ReadonlyArray<{
  readonly entities: ReadonlyArray<{
    readonly actions: ReadonlyArray<{
      readonly requiredPermission: PermissionBit;
    }>;
    readonly entityType: string;
  }>;
  readonly scopeType: string;
  readonly " $fragmentType": "RoleScopePermissionEditModal_rbacPermissionMatrixFragment";
}>;
export type RoleScopePermissionEditModal_rbacPermissionMatrixFragment$key = ReadonlyArray<{
  readonly " $data"?: RoleScopePermissionEditModal_rbacPermissionMatrixFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RoleScopePermissionEditModal_rbacPermissionMatrixFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "RoleScopePermissionEditModal_rbacPermissionMatrixFragment",
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
    }
  ],
  "type": "ScopeEntityOperationCombination",
  "abstractKey": null
};

(node as any).hash = "195f71eaf99d301ef239e854558eb318";

export default node;
