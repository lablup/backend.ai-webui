/**
 * @generated SignedSource<<65a207e9c392d2ddaee040400400305c>>
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
  readonly entityId: string;
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
      "name": "entityId",
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

(node as any).hash = "61ed60da55ba199d1e0188981d265402";

export default node;
