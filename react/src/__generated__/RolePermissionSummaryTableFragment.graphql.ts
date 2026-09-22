/**
 * @generated SignedSource<<548ddac0c4cb30d4bab881f14945938c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RolePermissionSummaryTableFragment$data = {
  readonly id: string;
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
    }
  ],
  "type": "Role",
  "abstractKey": null
};

(node as any).hash = "6657468dcd8167411a574e178407772a";

export default node;
