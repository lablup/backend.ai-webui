/**
 * @generated SignedSource<<b5dd519a14923c55f3a8fe2633580967>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type RolePermissionSummaryTable_rbacPermissionMatrixFragment$data = ReadonlyArray<{
  readonly entities: ReadonlyArray<{
    readonly actions: ReadonlyArray<{
      readonly requiredPermission: PermissionBit;
    }>;
    readonly entityType: string;
  }>;
  readonly scopeType: string;
  readonly " $fragmentType": "RolePermissionSummaryTable_rbacPermissionMatrixFragment";
}>;
export type RolePermissionSummaryTable_rbacPermissionMatrixFragment$key = ReadonlyArray<{
  readonly " $data"?: RolePermissionSummaryTable_rbacPermissionMatrixFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RolePermissionSummaryTable_rbacPermissionMatrixFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "RolePermissionSummaryTable_rbacPermissionMatrixFragment",
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

(node as any).hash = "94293d16b2e4ae654402bd8df8035972";

export default node;
