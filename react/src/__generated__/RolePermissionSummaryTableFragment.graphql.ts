/**
 * @generated SignedSource<<b9cb902181cf17eb2ddb622262156d5e>>
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
  readonly scopeType: string;
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
      "name": "scopeType",
      "storageKey": null
    }
  ],
  "type": "Role",
  "abstractKey": null
};

(node as any).hash = "168850c773668c75b11b1e20f2d170be";

export default node;
