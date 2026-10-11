/**
 * @generated SignedSource<<2815d75ed9dea6a0ebd0c02a52263e68>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RoleSource = "CUSTOM" | "SYSTEM" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type RolePermissionSummaryTableFragment$data = {
  readonly id: string;
  readonly scopeType: string;
  readonly source: RoleSource;
  readonly " $fragmentType": "RolePermissionSummaryTableFragment";
};
export type RolePermissionSummaryTableFragment$key = {
  readonly " $data"?: RolePermissionSummaryTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RolePermissionSummaryTableFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RolePermissionSummaryTableFragment",
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
      "name": "source",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "scopeType",
      "storageKey": null
    }
  ],
  "type": "Role",
  "abstractKey": null
};

(node as any).hash = "6f637854c9d9433e9da1c028df65cfd0";

export default node;
